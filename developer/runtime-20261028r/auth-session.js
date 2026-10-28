/** Browser session only: no localStorage, sessionStorage, URL token or analytics. */
export function createGitHubSession({window:win=globalThis.window,crypto=globalThis.crypto,bridgeOrigin,clock=()=>Date.now(),timeoutMs=180000}={}){
 const target=new URL(bridgeOrigin);if(target.protocol!=='https:'||target.origin!==bridgeOrigin)throw Error('Exact HTTPS auth bridge required');
 let session=null,active=null,cancelActive=null;
 const clear=()=>{session=null;cancelActive?.();cancelActive=null};
 function token(){if(!session)return null;if(session.expiresAt!==null&&session.expiresAt<=clock()){clear();return null}return session.token}
 function identity(){return token()?{user:{...session.user},canWrite:session.canWrite}:null}
 async function login(){
  if(active)return active;
  const existing=identity();if(existing)return existing;
  const bytes=crypto.getRandomValues(new Uint8Array(32));let raw='';for(const c of bytes)raw+=String.fromCharCode(c);
  const flow=btoa(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const popup=win.open(bridgeOrigin+'/start?flow='+flow,'_blank');
  if(!popup)throw Error('Allow the GitHub sign-in window and try again');
  const pending=new Promise((resolve,reject)=>{
   const finish=(error,value)=>{cancelActive=null;win.clearTimeout(timer);win.removeEventListener('message',receive);try{popup.close()}catch{}error?reject(error):resolve(value)};
   const receive=event=>{
    if(event.origin!==bridgeOrigin||event.source!==popup)return;
    const data=event.data;if(data?.type!=='dsl2-github-auth'||data.flow!==flow)return;
    if(typeof data.token!=='string'||!data.token||!Number.isSafeInteger(data.user?.id)||data.user.id<=0||typeof data.user.login!=='string'||!Number.isSafeInteger(data.repositoryId)||data.repositoryId<=0||typeof data.canWrite!=='boolean'||data.expiresAt!==null&&(!Number.isFinite(data.expiresAt)||data.expiresAt<=clock()))return;
    session={token:data.token,user:{id:data.user.id,login:data.user.login},repositoryId:data.repositoryId,canWrite:data.canWrite,expiresAt:data.expiresAt};finish(null,identity());
   };
   const timer=win.setTimeout(()=>finish(Error('GitHub sign-in did not finish; your working copy is unchanged')),timeoutMs);
   cancelActive=()=>finish(Error('GitHub sign-in cancelled; your working copy is unchanged'));
   win.addEventListener('message',receive);
  });
  active=pending;try{return await pending}finally{if(active===pending)active=null}
 }
 return {login,getToken:token,logout:clear,identity,repository:()=>token()?{id:session.repositoryId}:null};
}
