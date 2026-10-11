// Cloud workspace sync with Supabase (table workspace_docs + function workspace_push, see supabase/workspace-sync.sql).
// Every record of every collection is one JSON document. The browser keeps the whole workspace in memory, as in
// local mode; after each change the differences are pushed with a version check, and changes made in other
// browsers are pulled every few seconds. A document changed in two places at once keeps the cloud copy and the
// app is told, so nothing is silently overwritten.
export const ORDER = '_order', SETTINGS = '_settings';
const key = (col, id) => col + '\u0000' + id;
const CHUNK = 200;

export function createCloudSync({url, key: apikey, collections, fetchImpl = (...a) => fetch(...a), auth, onAuth = () => {}, now = () => Date.now()}) {
  let session = auth || null;
  const known = new Map();           // col|id -> {version, json, deleted}
  let lastPull = null, busy = null;

  async function call(path, opts = {}, retry = true) {
    if (!session) throw Error('Sign in to the cloud first.');
    if (now() > session.expires_at - 60000) await refresh();
    const res = await fetchImpl(url + path, {...opts, headers: {apikey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', ...opts.headers}});
    const text = await res.text(); let body = null;
    try { body = text ? JSON.parse(text) : null } catch { throw Error('The cloud returned an unreadable response. Please retry.') }
    if (res.status === 401 && retry) { await refresh(); return call(path, opts, false) }
    if (!res.ok) {
      const msg = body?.error || body?.message || body?.msg || body?.error_description || `Cloud request failed (${res.status}).`;
      if (/workspace_docs|workspace_push/.test(msg) && /not find|does not exist|schema cache/i.test(msg)) throw Error('The cloud database is not set up yet. Run supabase/workspace-sync.sql in the Supabase SQL Editor, then sign in again.');
      throw Error(msg);
    }
    return body;
  }
  async function authRequest(grant, payload) {
    const res = await fetchImpl(`${url}/auth/v1/token?grant_type=${grant}`, {method: 'POST', headers: {apikey, 'Content-Type': 'application/json'}, body: JSON.stringify(payload)});
    const body = await res.json().catch(() => ({}));
    if (!res.ok) { const m = body.error_description || body.msg || body.message || ''; throw Error(/banned/i.test(m) ? 'This account has been disabled. Ask an Admin to enable it.' : /invalid login/i.test(m) ? 'Wrong email or password.' : m || 'Sign-in failed. Check the email and password.') }
    session = {access_token: body.access_token, refresh_token: body.refresh_token, expires_at: now() + body.expires_in * 1000, user: {id: body.user?.id, email: body.user?.email}};
    onAuth(session); return session;
  }
  let refreshing = null;
  function refresh() {
    if (!session?.refresh_token) return Promise.reject(Error('Your cloud sign-in expired. Sign in again.'));
    refreshing ||= authRequest('refresh_token', {refresh_token: session.refresh_token}).catch(e => { if (/expired|invalid|not found/i.test(e.message)) { session = null; onAuth(null) } throw e }).finally(() => refreshing = null);
    return refreshing;
  }

  const meta = new Map();            // col|id -> {by, at} for 'last changed by'
  const remember = row => { known.set(key(row.collection, row.id), {version: Number(row.version), json: row.deleted ? null : JSON.stringify(row.data), deleted: !!row.deleted}); if (row.updated_at) meta.set(key(row.collection, row.id), {by: row.updated_by || null, at: row.updated_at}); if (row.updated_at && (!lastPull || row.updated_at > lastPull)) lastPull = row.updated_at };

  async function fetchRows(filter) {
    const rows = [];
    for (let offset = 0; ; offset += 1000) {
      const batch = await call(`/rest/v1/workspace_docs?select=collection,id,data,deleted,version,updated_at,updated_by${filter}&order=updated_at.asc,collection.asc,id.asc&offset=${offset}&limit=1000`);
      rows.push(...batch); if (batch.length < 1000) return rows;
    }
  }
  // Arrange documents in their saved order (the _order document of each collection); ids not in it come first.
  function assemble(rows) {
    const docs = Object.fromEntries(collections.map(c => [c, new Map()])), order = {};
    let settings = null;
    for (const r of rows) {
      if (r.deleted) continue;
      if (r.collection === ORDER) order[r.id] = r.data.ids || [];
      else if (r.collection === SETTINGS) { if (r.id === 'company') settings = r.data }
      else if (docs[r.collection]) docs[r.collection].set(r.id, r.data);
    }
    const data = {};
    for (const c of collections) {
      const ids = order[c] || [], inOrder = new Set(ids), m = docs[c];
      data[c] = [...[...m.keys()].filter(id => !inOrder.has(id)).reverse(), ...ids.filter(id => m.has(id))].map(id => m.get(id));
    }
    return {data, company: settings};
  }

  // Everything that differs from the last synced state, as workspace_push changes.
  function diff(data, company) {
    const out = [], seen = new Set();
    const put = (col, id, value) => {
      const k = key(col, id), json = JSON.stringify(value), prev = known.get(k); seen.add(k);
      if (prev && !prev.deleted && prev.json === json) return;
      out.push({collection: col, id, data: value, deleted: false, base_version: prev ? prev.version : null, json});
    };
    for (const c of collections) {
      const list = data[c] || [];
      for (const doc of list) put(c, doc.id, doc);
      put(ORDER, c, {ids: list.map(d => d.id)});
    }
    if (company) put(SETTINGS, 'company', company);
    for (const [k, prev] of known) {
      if (seen.has(k) || prev.deleted) continue;
      const [col, id] = k.split('\u0000');
      if (col === SETTINGS || col === ORDER) continue;
      out.push({collection: col, id, data: {}, deleted: true, base_version: prev.version, json: null});
    }
    return out;
  }
  const pendingCount = (data, company) => diff(data, company).filter(c => c.collection !== ORDER).length;

  async function sendChanges(changes) {
    const conflicts = [];
    for (let i = 0; i < changes.length; i += CHUNK) {
      const part = changes.slice(i, i + CHUNK);
      const res = await call('/rest/v1/rpc/workspace_push', {method: 'POST', body: JSON.stringify({p_changes: part.map(({json, ...c}) => c)})});
      const sent = new Map(part.map(c => [key(c.collection, c.id), c]));
      for (const a of res.applied || []) { const c = sent.get(key(a.collection, a.id)); known.set(key(a.collection, a.id), {version: Number(a.version), json: c.deleted ? null : c.json, deleted: c.deleted}) }
      conflicts.push(...(res.conflicts || []));
    }
    return conflicts;
  }

  // Push local changes; then pull. Returns {data, company, changed, conflicts} where data/company are the
  // workspace to show (local edits plus remote changes; remote wins on conflict).
  async function syncNow(getState, {pull = true} = {}) {
    if (busy) return busy;
    busy = (async () => {
      let {data, company} = getState(), conflicts = 0, changed = false;
      const changes = diff(data, company);
      const lost = changes.length ? await sendChanges(changes.filter(c => c.collection !== ORDER).concat(changes.filter(c => c.collection === ORDER))) : [];
      conflicts += lost.filter(c => c.collection !== ORDER).length;
      if (!pull) return {data, company, changed: false, conflicts};
      // Pull everything changed since the last pull (with overlap for clock skew between transactions).
      const since = lastPull ? new Date(Date.parse(lastPull) - 10000).toISOString() : null;
      const rows = await fetchRows(since ? `&updated_at=gte.${encodeURIComponent(since)}` : '');
      const lostKeys = new Set(lost.map(c => key(c.collection, c.id)));
      // a refused change whose cloud copy is older than the pull window: fetch it directly
      for (const c of lost) if (!rows.some(r => r.collection === c.collection && r.id === c.id)) rows.push(...await fetchRows(`&collection=eq.${encodeURIComponent(c.collection)}&id=eq.${encodeURIComponent(c.id)}`));
      const fresh = rows.filter(r => { const k = key(r.collection, r.id), prev = known.get(k); return lostKeys.has(k) || !prev || Number(r.version) > prev.version });
      if (fresh.length) {
        ({data, company} = getState());
        const local = diff(data, company), dirty = new Set(local.filter(c => c.collection !== ORDER).map(c => key(c.collection, c.id)));
        data = Object.fromEntries(collections.map(c => [c, [...(data[c] || [])]]));
        for (const r of fresh) {
          const k = key(r.collection, r.id);
          if (dirty.has(k) && !lostKeys.has(k) && r.collection !== ORDER) conflicts++;
          remember(r);
          if (r.collection === SETTINGS) { if (r.id === 'company' && !r.deleted) company = r.data; changed = true; continue }
          if (r.collection === ORDER) {
            if (!data[r.id]) continue;
            const ids = r.data.ids || [], pos = new Map(ids.map((id, i) => [id, i]));
            // keep documents the cloud order does not know yet (just added here) in front
            data[r.id].sort((a, b) => (pos.has(a.id) ? pos.get(a.id) : -1) - (pos.has(b.id) ? pos.get(b.id) : -1));
            changed = true; continue;
          }
          const list = data[r.collection]; if (!list) continue;
          const i = list.findIndex(d => d.id === r.id);
          if (r.deleted) { if (i >= 0) list.splice(i, 1) }
          else if (i >= 0) list[i] = r.data; else list.unshift(r.data);
          changed = true;
        }
      }
      for (const r of rows) remember(r);
      return {data, company, changed, conflicts};
    })();
    try { return await busy } finally { busy = null }
  }

  return {
    get session() { return session },
    signIn: (email, password) => authRequest('password', {email, password}),
    async signOut() { try { await call('/auth/v1/logout?scope=local', {method: 'POST'}) } catch {} session = null; known.clear(); lastPull = null; onAuth(null) },
    // Full load: the workspace as stored in the cloud, and whether the cloud is still empty.
    async load() { known.clear(); lastPull = null; const rows = await fetchRows(''); rows.forEach(remember); const live = rows.filter(r => !r.deleted); return {...assemble(rows), empty: !live.some(r => r.collection !== ORDER && r.collection !== SETTINGS), hasSettings: live.some(r => r.collection === SETTINGS)} },
    syncNow, pendingCount, diff,
    // Who am I in the shared workspace? {active, role, modules, name, email, workspace_id} or null.
    me: () => call('/rest/v1/rpc/workspace_me', {method: 'POST', body: '{}'}),
    members: () => call('/rest/v1/workspace_members?select=user_id,email,name,role,modules,active,created_at,last_seen_at&order=name.asc,email.asc'),
    activity: () => call('/rest/v1/rpc/workspace_activity', {method: 'POST', body: '{}'}),
    // Admin user management (Edge Function manage-users).
    manageUsers: body => call('/functions/v1/manage-users', {method: 'POST', body: JSON.stringify(body)}),
    changedBy: (col, id) => meta.get(key(col, id)) || null,
    // The workspace exactly as last synced (used to undo edits a view-only account cannot save).
    snapshot() { const rows = [...known].filter(([, v]) => !v.deleted && v.json).map(([k, v]) => { const [collection, id] = k.split('\u0000'); return {collection, id, data: JSON.parse(v.json), deleted: false} }); return assemble(rows) },
    get busy() { return !!busy }
  };
}
