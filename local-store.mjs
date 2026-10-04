export const workspaceKey='sutluj-workspace-v1';
export const collections=['records','customers','vendors','invoices','payments','workOrders','journals','stockItems','stockMoves','employees','attendance','advances','payrolls','scrapSales','vendorPayments'];
// Added after the first release: workspaces saved earlier load with these as empty lists.
export const optionalCollections=['stockItems','stockMoves','employees','attendance','advances','payrolls','scrapSales','vendorPayments'];
export function validateWorkspace(value){
 const valid=k=>Array.isArray(value.data[k])&&value.data[k].every(r=>r&&typeof r==='object'&&typeof r.id==='string');
 if(value?.version!==1||typeof value.revision!=='string'||!value.data||!collections.every(k=>optionalCollections.includes(k)&&value.data[k]===undefined||valid(k)))throw Error('Local data could not be read. It has not been overwritten.');
 for(const k of optionalCollections)value.data[k]??=[];
 return value;
}
export function createLocalStore(storage){
 let revision=null,serialized=null,blocked=false;
 return {
  load(){try{const raw=storage.getItem(workspaceKey);if(!raw){revision=null;serialized=null;return null}const saved=validateWorkspace(JSON.parse(raw));revision=saved.revision;serialized=JSON.stringify(saved.data);return saved.data}catch{blocked=true;throw Error('Local data could not be read. It has not been overwritten.');}},
  save(data){if(blocked)throw Error('Local saving is blocked because existing data could not be read. Export a backup before closing.');
   const next=JSON.stringify(data);if(next===serialized)return;
   const raw=storage.getItem(workspaceKey),current=raw?validateWorkspace(JSON.parse(raw)):null;
   if((current?.revision||null)!==revision)throw Error('Another tab changed the local workspace. Export this tab’s backup before reloading to load the latest saved data.');
   const nextRevision=crypto.randomUUID();storage.setItem(workspaceKey,JSON.stringify({version:1,revision:nextRevision,savedAt:new Date().toISOString(),data}));revision=nextRevision;serialized=next;
  }
 };
}
