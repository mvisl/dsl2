/** Mirror the active Inbox only. Auth and private bytes never belong in this hint. */
export function createWorkspaceLocationMirror({privateBaseURL,getURL,replaceURL,
 initialMode='constructor',initialInboxPath='inbox/index.html'}={}){
 const base=new URL(privateBaseURL),modes=new Set(['constructor','questions','inbox']);
 if(base.username||base.password||base.search||base.hash||!base.pathname.endsWith('/')||
    typeof getURL!=='function'||typeof replaceURL!=='function')throw Error('Exact private base and URL adapters required');
 function requestID(path){
  const url=new URL(path,base);
  if(url.origin!==base.origin||url.username||url.password||url.hash||
     !['inbox/','inbox/index.html'].some(p=>url.pathname===base.pathname+p))throw Error('Exact Inbox entry required');
  const ids=url.searchParams.getAll('request');
  if(ids.length>1||ids.length&& !/^[-\w]{1,100}$/.test(ids[0]))throw Error('Exact Inbox request required');
  return ids[0]||null;
 }
 if(!modes.has(initialMode))throw Error('Unknown workspace mode');
 let mode=initialMode,id=requestID(initialInboxPath);
 function mirror(nextMode,nextID){
  const url=new URL(getURL());
  if(url.origin!==base.origin||url.username||url.password)throw Error('Same-origin workspace URL required');
  if(nextMode==='inbox'&&nextID)url.searchParams.set('inbox',nextID);
  else url.searchParams.delete('inbox');
  if(url.href!==getURL())replaceURL(url.href);
 }
 return {
  setMode(next){if(!modes.has(next))throw Error('Unknown workspace mode');mirror(next,id);mode=next;},
  inboxLocation(path){const next=requestID(path);if(mode==='inbox')mirror(mode,next);id=next;}
 };
}
