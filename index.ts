// GR Synergy Ventures · user management (Supabase Edge Function "manage-users").
// Only an active Admin of a workspace can call it. Creates staff accounts with a password, changes their
// name / role / modules / active state, and resets passwords. Uses the project's secret key, which never
// leaves Supabase. Deployed with verify_jwt = false: the caller's session is checked here with auth.getUser.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const ROLES = ['admin', 'manager', 'staff', 'viewer'];
const MODULES = ['sales', 'workorders', 'procurement', 'inventory', 'accounts', 'hr'];
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const fail = (status: number, message: string) => reply(status, { error: message });

function secretKey() {
  try { const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'); if (keys.default) return keys.default; } catch { /* fall back */ }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
}
const cleanModules = (m: unknown) => Array.isArray(m) ? [...new Set(m.filter((x) => MODULES.includes(String(x))).map(String))] : [];
const cleanName = (n: unknown) => String(n ?? '').trim().slice(0, 120);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return fail(405, 'Use POST.');
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), { auth: { persistSession: false, autoRefreshToken: false } });
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return fail(401, 'Sign in first.');
  const { data: who, error: whoError } = await admin.auth.getUser(token);
  if (whoError || !who?.user) return fail(401, 'Your sign-in has expired. Sign in again.');
  const { data: me, error: meError } = await admin.from('workspace_members').select('*').eq('user_id', who.user.id).eq('active', true).maybeSingle();
  if (meError) return fail(500, 'The server could not check your access (' + meError.message + '). Ask the developer to check the database permissions.');
  if (!me || me.role !== 'admin') return fail(403, 'Only an Admin can manage users.');
  const ws = me.workspace_id;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(400, 'Send a JSON body.'); }

  const activeAdmins = async () => {
    const { data } = await admin.from('workspace_members').select('user_id').eq('workspace_id', ws).eq('role', 'admin').eq('active', true);
    return (data || []).map((r) => r.user_id);
  };
  const memberOf = async (userId: string) => {
    const { data } = await admin.from('workspace_members').select('*').eq('workspace_id', ws).eq('user_id', userId).maybeSingle();
    return data;
  };

  try {
    if (body.action === 'create') {
      const email = String(body.email || '').trim().toLowerCase(), password = String(body.password || ''), name = cleanName(body.name);
      const role = String(body.role || 'staff'), modules = cleanModules(body.modules);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, 'Enter a valid email address.');
      if (password.length < 8) return fail(400, 'Use a password of at least 8 characters.');
      if (!name) return fail(400, 'Enter the person\'s name.');
      if (!ROLES.includes(role)) return fail(400, 'Choose a role.');
      const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
      if (created.error) {
        if (/already|registered|exists/i.test(created.error.message)) return fail(409, 'An account with this email already exists in this project.');
        return fail(400, created.error.message);
      }
      const user = created.data.user!;
      const { error } = await admin.from('workspace_members').insert({ workspace_id: ws, user_id: user.id, email, name, role, modules });
      if (error) { await admin.auth.admin.deleteUser(user.id); return fail(400, error.message.includes('one_workspace') ? 'This person already belongs to another workspace.' : error.message); }
      return reply(200, { ok: true, user_id: user.id });
    }

    if (body.action === 'update') {
      const userId = String(body.user_id || ''), target = await memberOf(userId);
      if (!target) return fail(404, 'User not found in this workspace.');
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.name !== undefined) { const n = cleanName(body.name); if (!n) return fail(400, 'Enter the person\'s name.'); patch.name = n; }
      if (body.role !== undefined) { if (!ROLES.includes(String(body.role))) return fail(400, 'Choose a role.'); patch.role = String(body.role); }
      if (body.modules !== undefined) patch.modules = cleanModules(body.modules);
      if (body.active !== undefined) patch.active = !!body.active;
      const losesAdmin = target.role === 'admin' && target.active && ((patch.role && patch.role !== 'admin') || patch.active === false);
      if (losesAdmin && (await activeAdmins()).length <= 1) return fail(400, 'Keep at least one active Admin. Make someone else Admin first.');
      if (userId === who.user.id && patch.active === false) return fail(400, 'You cannot disable your own account.');
      const { error } = await admin.from('workspace_members').update(patch).eq('workspace_id', ws).eq('user_id', userId);
      if (error) return fail(400, error.message);
      if (patch.active !== undefined && patch.active !== target.active) {
        const banned = await admin.auth.admin.updateUserById(userId, { ban_duration: patch.active ? 'none' : '876000h' });
        if (banned.error) return fail(400, banned.error.message);
      }
      if (patch.name) await admin.auth.admin.updateUserById(userId, { user_metadata: { name: patch.name } });
      return reply(200, { ok: true });
    }

    if (body.action === 'password') {
      const userId = String(body.user_id || ''), password = String(body.password || '');
      if (!(await memberOf(userId))) return fail(404, 'User not found in this workspace.');
      if (password.length < 8) return fail(400, 'Use a password of at least 8 characters.');
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) return fail(400, error.message);
      return reply(200, { ok: true });
    }

    return fail(400, 'Unknown action.');
  } catch (e) {
    return fail(500, e instanceof Error ? e.message : 'Something went wrong.');
  }
});
