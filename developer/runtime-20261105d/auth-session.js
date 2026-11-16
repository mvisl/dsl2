/** Live tokens in memory; trusted browser reloads use an encrypted IndexedDB grant. */
import{createTrustedDeviceSession}from'./trusted-device-session.js';
export function createGitHubSession({window:win=globalThis.window,crypto=globalThis.crypto,bridgeOrigin,clock=()=>Date.now(),timeoutMs=180000,trustedDevice=createTrustedDeviceSession({bridgeOrigin,crypto})}={}){
 const target=new URL(bridgeOrigin);if(target.protocol!=='https:'||target.origin!==bridgeOrigin)throw Error('Exact HTTPS auth bridge required');
 let session=null,active=null,cancelActive=null,epoch=0,remembered=false;
 const dispose=()=>{epoch++;session=null;cancelActive?.();cancelActive=null;active=null};
 const clear=()=>{dispose();remembered=false;void trustedDevice.forget().catch(()=>{})};
 async function restore(){const generation=epoch;const saved=await trustedDevice.restore().catch(()=>null);if(saved&&generation===epoch&&!active){session=saved;remembered=true}return identity()}
 function token(){if(!session)return null;if(session.expiresAt!==null&&session.expiresAt<=clock()){clear();return null}return session.token}
 function identity(){return token()?{user:{...session.user},canWrite:session.canWrite}:null}
 async function login(){
  if(active)return active;
  const existing=identity();if(existing)return existing;
  epoch++;const bytes=crypto.getRandomValues(new Uint8Array(32));let raw='';for(const c of bytes)raw+=String.fromCharCode(c);
  const flow=btoa(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const popup=win.open(bridgeOrigin+'/start?flow='+flow,'_blank');
  if(!popup)throw Error('Allow the GitHub sign-in window and try again');
  const pending=new Promise((resolve,reject)=>{
   let completed=false;const generation=epoch;
   const finish=(error,value)=>{if(completed)return;completed=true;if(error&&generation===epoch){epoch++;session=null;remembered=false;void trustedDevice.forget().catch(()=>{})}cancelActive=null;win.clearTimeout(timer);win.removeEventListener('message',receive);try{popup.close()}catch{}error?reject(error):resolve(value)};
   let accepted=false;
   const receive=async event=>{
    if(completed||generation!==epoch||accepted||event.origin!==bridgeOrigin||event.source!==popup)return;
    const data=event.data;if(data?.type!=='dsl2-github-auth'||data.flow!==flow)return;
    if(typeof data.token!=='string'||!data.token||!Number.isSafeInteger(data.user?.id)||data.user.id<=0||typeof data.user.login!=='string'||!Number.isSafeInteger(data.repositoryId)||data.repositoryId<=0||typeof data.canWrite!=='boolean'||data.expiresAt!==null&&(!Number.isFinite(data.expiresAt)||data.expiresAt<=clock()))return;
    accepted=true;session={token:data.token,user:{id:data.user.id,login:data.user.login},repositoryId:data.repositoryId,canWrite:data.canWrite,expiresAt:data.expiresAt};const saved=await trustedDevice.save(session).catch(()=>false);if(generation===epoch){remembered=saved;finish(null,identity())}
   };
   const timer=win.setTimeout(()=>finish(Error('GitHub sign-in did not finish; your working copy is unchanged')),timeoutMs);
   cancelActive=()=>finish(Error('GitHub sign-in cancelled; your working copy is unchanged'));
   win.addEventListener('message',receive);
  });
  active=pending;try{return await pending}finally{if(active===pending)active=null}
 }
 return {login,restore,dispose,remembered:()=>remembered,getToken:token,logout:clear,identity,repository:()=>token()?{id:session.repositoryId}:null};
}
