/** Encrypted origin-local grant. Non-exportable key; atomic generation checks prevent stale writes. */
const DB='dsl2-trusted-device-v1',STORE='credentials';
function browserStore(indexedDB){
 if(!indexedDB)return null;let opening;
 const open=()=>opening??=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Trusted device storage is blocked'))});
 const op=async(mode,run)=>{const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode),s=tx.objectStore(STORE);let result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Trusted device transaction aborted'));run(s,v=>{result=v})})};
 return{get:key=>op('readonly',(s,done)=>{s.get(key).onsuccess=e=>done(e.target.result)}),remove:keys=>op('readwrite',s=>{for(const key of keys)s.delete(key)}),key:(name,proposed)=>op('readwrite',(s,done)=>{s.get(name).onsuccess=e=>{const existing=e.target.result;if(existing)done(existing);else{s.add(proposed,name);done(proposed)}}}),
  saveIfCurrent:(keyName,keyId,grantName,value)=>op('readwrite',(s,done)=>{s.get(keyName).onsuccess=e=>{if(e.target.result?.id!==keyId){done(false);return}s.put(value,grantName);done(true)}}),
  prune:(name,id)=>op('readwrite',s=>{s.get(name).onsuccess=e=>{if(e.target.result?.id===id)s.delete(name)}}),
  current:(keyName,keyId,grantName,grantId)=>op('readonly',(s,done)=>{s.get(keyName).onsuccess=e=>{if(e.target.result?.id!==keyId){done(false);return}s.get(grantName).onsuccess=e=>done(e.target.result?.id===grantId)}})};
}
export function createTrustedDeviceSession({bridgeOrigin,crypto=globalThis.crypto,indexedDB=globalThis.indexedDB,store=browserStore(indexedDB),clock=()=>Date.now()}={}){
 const url=new URL(bridgeOrigin);if(url.protocol!=='https:'||url.origin!==bridgeOrigin)throw Error('Exact trusted auth bridge required');
 const name='grant:'+bridgeOrigin,keyName='key:'+bridgeOrigin;let generation=0,tail=Promise.resolve();
 const serial=work=>{const result=tail.then(work,work);tail=result.catch(()=>{});return result};
 const valid=v=>v&&typeof v.token==='string'&&v.token.length>0&&v.token.length<=4096&&Number.isSafeInteger(v.user?.id)&&v.user.id>0&&typeof v.user.login==='string'&&Number.isSafeInteger(v.repositoryId)&&v.repositoryId>0&&typeof v.canWrite==='boolean'&&(v.expiresAt===null||Number.isFinite(v.expiresAt)&&v.expiresAt>clock());
 const validKey=v=>v&&typeof v.id==='string'&&v.key?.type==='secret'&&!v.key.extractable&&v.key.algorithm?.name==='AES-GCM'&&v.key.algorithm.length===256;
 const aad=(keyId,id)=>new TextEncoder().encode('dsl2-trusted-device-v1\n'+bridgeOrigin+'\n'+keyId+'\n'+id);
 return{available:Boolean(store&&crypto?.subtle),
  save(value){const epoch=generation;return serial(async()=>{if(!store||!valid(value)||epoch!==generation)return false;const proposed={id:crypto.randomUUID(),key:await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt'])},k=await store.key(keyName,proposed);if(!validKey(k))throw Error('Invalid trusted device key');const id=crypto.randomUUID(),iv=crypto.getRandomValues(new Uint8Array(12)),bytes=new TextEncoder().encode(JSON.stringify(value));let cipher;try{cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(k.id,id)},k.key,bytes))}finally{bytes.fill(0)}if(epoch!==generation)return false;const stored=await store.saveIfCurrent(keyName,k.id,name,{schemaVersion:1,id,keyId:k.id,iv,cipher});return stored&&epoch===generation})},
  restore(){const epoch=generation;return serial(async()=>{if(!store)return null;const row=await store.get(name);if(!row)return null;try{const k=await store.get(keyName);if(row.schemaVersion!==1||typeof row.id!=='string'||!validKey(k)||row.keyId!==k.id||!(row.iv instanceof Uint8Array)||row.iv.length!==12||!(row.cipher instanceof Uint8Array)||row.cipher.length>20000)throw Error('Invalid encrypted login');const raw=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:row.iv,additionalData:aad(k.id,row.id)},k.key,row.cipher));let value;try{value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw))}finally{raw.fill(0)}if(epoch!==generation)return null;if(!valid(value))throw Error('Expired saved login');if(!await store.current(keyName,k.id,name,row.id))return null;return value}catch{await store.prune(name,row.id).catch(()=>{});return null}})},
  forget(){generation++;return serial(async()=>{if(store)await store.remove([name,keyName])})}
 };
}
