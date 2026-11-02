import{DEPOSIT_CONTEXTS,FCIL_WALLET_PROFILES,exactEditorSelectors}from'./editor-selectors.js';
/** Public navigation hints contain source selectors only, never auth. */
// Prototype Deposit context: exactly the values prototype/app.js accepts. A present but ambiguous or
// unknown value refuses the target instead of letting the prototype default to 28.
export{DEPOSIT_CONTEXTS,FCIL_WALLET_PROFILES};
export function sourceEntryTarget(value,scope){
 try{
  const base=new URL(scope),url=new URL(value,base),root=base.pathname+'private/';
  if(url.origin!==base.origin||url.username||url.password||url.hash)return null;
  if(url.pathname===root+'index.html'){if(url.search&&!['?reviewMode=calibration','?reviewMode=calibration&calibrationQA=1'].includes(url.search))return null;return{review:true,reviewPath:'index.html'+url.search,returnPath:'private/index.html'+url.search}};
  if(['inbox/','inbox/index.html'].some(p=>url.pathname===root+p)){const values=url.searchParams.getAll('request');if(values.length!==1||!/^[-\w]{1,100}$/.test(values[0]))return null;return{inboxId:values[0],returnPath:'private/inbox/?request='+encodeURIComponent(values[0])}}
  // Direct editor: the exact shared selector contract (record ID, local copy with its exact parent, or one
  // native selector, with fcilWallet/depositContext only as the editor accepts them). A stale _mount is
  // discarded; any other unknown name, duplicate or incompatible set refuses the target. Never stripped
  // to the bare editor, which is only the target of a bare editor link.
  if(['editor/','editor/index.html'].some(p=>url.pathname===root+p)){
   const query=exactEditorSelectors(url.searchParams,{drop:['_mount'],allowEmpty:true});if(!query)return null;
   const search=query.size?'?'+query:'';return {editorPath:'editor/'+search,returnPath:url.pathname.slice(base.pathname.length)+search};
  }
  if(!['prototype/','prototype/index.html'].some(p=>url.pathname===root+p))return null;
  const query=new URLSearchParams();
  for(const name of ['screen','record','profile','optionsSheet','nativeTrades','f1Trades','map','view']){
   const values=url.searchParams.getAll(name);if(values.length>1)return null;
   if(values.length){if(!/^[-\w:;.]{1,160}$/.test(values[0]))return null;query.set(name,values[0])}
  }
  const returnQuery=new URLSearchParams(query);
  const contexts=url.searchParams.getAll('depositContext');if(contexts.length>1||contexts.length&&!DEPOSIT_CONTEXTS.includes(contexts[0]))return null;
  if(contexts.length)returnQuery.set('depositContext',contexts[0]);
  return {editorPath:'editor/'+(query.size?'?'+query:''),returnPath:url.pathname.slice(base.pathname.length)+(returnQuery.size?'?'+returnQuery:'')};
 }catch{return null}
}
/** Mount-relative prototype entry for a consumed target, or null for any other target. */
export function prototypeEntryPath(target){return target?.returnPath?.startsWith('private/prototype/')?target.returnPath.slice('private/'.length):null}
