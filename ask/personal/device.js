import{guestBase64,guestProofMessage,publicGuestKey}from'./protocol.js';
const DB='dsl2-guest-conversations-v1',STORE='browser';
function database(indexedDB){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Не удалось сохранить доступ в браузере. Проверьте разрешение на хранение данных сайта.'));r.onblocked=()=>reject(Error('Закройте старую вкладку вопросника и повторите.'));});}
async function transaction(indexedDB,mode,work){const db=await database(indexedDB);try{return await new Promise((resolve,reject)=>{const t=db.transaction(STORE,mode);let value;const r=t.objectStore(STORE).get('device');r.onsuccess=()=>{try{value=work(r.result,t.objectStore(STORE));}catch(e){t.abort();reject(e);}};t.oncomplete=()=>resolve(value);t.onerror=()=>reject(Error('Не удалось сохранить доступ в браузере.'));t.onabort=()=>reject(Error('Сохранение доступа прервано.'));});}finally{db.close();}}
export function createGuestBrowser({indexedDB=globalThis.indexedDB,crypto=globalThis.crypto,fetcher=globalThis.fetch,endpoint='https://design-workspace-github-auth.mvisl1.workers.dev',clock=()=>Date.now()}={}){
 let pending;
 async function device(){
  if(!indexedDB||!crypto?.subtle)throw Error('Этот браузер не поддерживает сохранение защищённого доступа.');
  if(pending)return pending;
  pending=(async()=>{const current=await transaction(indexedDB,'readonly',v=>v);if(current)return current;const key=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);const candidate={id:crypto.randomUUID(),privateKey:key.privateKey,publicKey:publicGuestKey(await crypto.subtle.exportKey('jwk',key.publicKey)),grant:null};return transaction(indexedDB,'readwrite',(v,s)=>{if(v)return v;s.put(candidate,'device');return candidate;});})();try{return await pending;}finally{pending=null;}
 }
 async function request(path,method='GET',input){
  const d=await device(),body=input===undefined?'':JSON.stringify(input),timestamp=clock(),nonce=guestBase64(crypto.getRandomValues(new Uint8Array(24))),message=await guestProofMessage({method,path,body,timestamp,nonce},crypto),signature=guestBase64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},d.privateKey,new TextEncoder().encode(message)));
  const response=await fetcher(endpoint+path,{method,mode:'cors',credentials:'omit',cache:'no-store',headers:{...(method==='POST'?{'Content-Type':'application/json'}:{}),'X-Guest-Timestamp':String(timestamp),'X-Guest-Nonce':nonce,'X-Guest-Signature':signature,...(d.grant?{Authorization:'Bearer '+d.grant}:{})},...(method==='POST'?{body}:{})});
  let value;try{value=await response.json();}catch{throw Error('Сервер не подтвердил ответ. Текст сохранён в форме.');}if(!response.ok)throw Object.assign(Error(value.error||'Запрос не выполнен.'),{status:response.status});return value;
 }
 async function claim(invitation){const d=await device(),value=await request('/guest-conversations/claim','POST',{invitation,publicKey:d.publicKey});if(typeof value.grant!=='string'||value.remembered!==true)throw Error('Доступ не подтверждён.');await transaction(indexedDB,'readwrite',(v,s)=>{if(!v||v.id!==d.id)throw Error('Доступ в браузере изменился.');s.put({...v,grant:value.grant},'device');});return true;}
 return {device,claim,request,ready:async()=>Boolean((await device()).grant)};
}
