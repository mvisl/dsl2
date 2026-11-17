/** Live tokens in memory; trusted browser reloads use an encrypted IndexedDB grant. */
import{createTrustedDeviceSession}from'./trusted-device-session.js';
export function createGitHubSession({window:win=globalThis.window,crypto=globalThis.crypto,bridgeOrigin,clock=()=>Date.now(),timeoutMs=180000,fetcher=globalThis.fetch,locks=globalThis.navigator?.locks,trustedDevice=createTrustedDeviceSession({bridgeOrigin,crypto,clock})}={}){
 const target=new URL(bridgeOrigin);if(target.protocol!=='https:'||target.origin!==bridgeOrigin)throw Error('Exact HTTPS auth bridge required');
 let session=null,active=null,cancelActive=null,epoch=0,remembered=false,refreshing=null;
 const dispose=()=>{epoch++;session=null;cancelActive?.();cancelActive=null;active=null};
 const clear=(ifRestored=false)=>{dispose();remembered=false;void trustedDevice.forget({ifRestored}).catch(()=>{})};
 async function restore(){const generation=epoch;const saved=await trustedDevice.restore().catch(()=>null);if(saved&&generation===epoch&&!active){session=saved;remembered=true}if(saved&&generation===epoch)await ensureToken();return identity()}
 function token(){if(!session)return null;if(session.expiresAt!==null&&session.expiresAt<=clock()){return null}return session.token}
 function identity(){return token()?{user:{...session.user},canWrite:session.canWrite}:null}
 async function ensureToken(){
  if(session&&(session.expiresAt===null||session.expiresAt>clock()+60000))return session.token;
  if(refreshing)return refreshing;
  const generation=epoch;
  const renew=async()=>{
   if(generation!==epoch)return null;
   // Re-read after the cross-tab lock: another tab may already have rotated the refresh token.
   const saved=await trustedDevice.restore().catch(()=>null);if(generation!==epoch)return null;
   if(saved)session=saved;
   if(session&&(session.expiresAt===null||session.expiresAt>clock()+60000))return session.token;
   if(!session?.pendingRenewal&&(!session?.refreshToken||!Number.isFinite(session.refreshExpiresAt)||session.refreshExpiresAt<=clock()))return token();
   const response=await fetcher(bridgeOrigin+'/refresh',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(session.pendingRenewal?{pendingRenewal:session.pendingRenewal}:{refreshToken:session.refreshToken}),redirect:'error',cache:'no-store',credentials:'omit'});
   if(generation!==epoch)return null;
   if(!response.ok){
    if(response.status===503){const recovery=await response.json().catch(()=>null);if(generation!==epoch)return null;
     if(typeof recovery?.pendingRenewal==='string'&&/^[-A-Za-z0-9_.]{1,12288}$/.test(recovery.pendingRenewal)&&Number.isFinite(recovery.pendingRenewalExpiresAt)&&recovery.pendingRenewalExpiresAt>clock()){
      const next={...session,pendingRenewal:recovery.pendingRenewal,pendingRenewalExpiresAt:recovery.pendingRenewalExpiresAt};const persisted=await trustedDevice.save(next,{replace:Boolean(saved)}).catch(()=>false);if(generation!==epoch)return null;if(saved&&!persisted){session=null;remembered=false;return null}session=next;remembered=persisted;
     }
    }
    if([401,403].includes(response.status))clear(true);throw Object.assign(Error('Не удалось продлить вход. Повторите загрузку.'),{status:response.status})}
   const value=await response.json();if(generation!==epoch)return null;
   if(typeof value.token!=='string'||!value.token||typeof value.refreshToken!=='string'||!value.refreshToken||!Number.isFinite(value.expiresAt)||value.expiresAt<=clock()||!Number.isFinite(value.refreshExpiresAt)||value.refreshExpiresAt<=clock()||value.repositoryId!==session.repositoryId||value.user?.id!==session.user.id||typeof value.user.login!=='string'||typeof value.canWrite!=='boolean')throw Error('Invalid renewed sign-in');
   const persisted=await trustedDevice.save(value,{replace:Boolean(saved)}).catch(()=>false);if(generation!==epoch)return null;if(saved&&!persisted){session=null;remembered=false;return null}session=value;remembered=persisted;return token();
  };
  const pending=locks?.request?locks.request('dsl2-auth-renew:'+bridgeOrigin,renew):renew();refreshing=pending;
  try{return await pending}finally{if(refreshing===pending)refreshing=null}
 }
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
    accepted=true;session={token:data.token,user:{id:data.user.id,login:data.user.login},repositoryId:data.repositoryId,canWrite:data.canWrite,expiresAt:data.expiresAt,...(typeof data.refreshToken==='string'&&/^[-A-Za-z0-9_.]{1,4096}$/.test(data.refreshToken)&&Number.isFinite(data.refreshExpiresAt)&&data.refreshExpiresAt>clock()?{refreshToken:data.refreshToken,refreshExpiresAt:data.refreshExpiresAt}:{})};const saved=await trustedDevice.save(session).catch(()=>false);if(generation===epoch){remembered=saved;finish(null,identity())}
   };
   const timer=win.setTimeout(()=>finish(Error('GitHub sign-in did not finish; your working copy is unchanged')),timeoutMs);
   cancelActive=()=>finish(Error('GitHub sign-in cancelled; your working copy is unchanged'));
   win.addEventListener('message',receive);
  });
  active=pending;try{return await pending}finally{if(active===pending)active=null}
 }
 return {login,restore,ensureToken,dispose,remembered:()=>remembered,getToken:token,logout:()=>clear(),identity,repository:()=>token()?{id:session.repositoryId}:null};
}
