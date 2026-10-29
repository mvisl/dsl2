/** Public navigation hints contain source selectors only, never local drafts or auth. */
export function sourceEntryTarget(value,scope){
 try{
  const base=new URL(scope),url=new URL(value,base),root=base.pathname+'private/';
  if(url.origin!==base.origin||url.username||url.password||url.hash)return null;
  if(url.pathname===root+'index.html'&&!url.search)return{review:true,returnPath:'private/index.html'};
  if(['inbox/','inbox/index.html'].some(p=>url.pathname===root+p)){const values=url.searchParams.getAll('request');if(values.length!==1||!/^[-\w]{1,100}$/.test(values[0]))return null;return{inboxId:values[0],returnPath:'private/inbox/?request='+encodeURIComponent(values[0])}}
  if(!['editor/','editor/index.html','prototype/','prototype/index.html'].some(p=>url.pathname===root+p))return null;
  const query=new URLSearchParams();
  for(const name of ['screen','record','profile','optionsSheet','nativeTrades','f1Trades','map','view']){
   const values=url.searchParams.getAll(name);if(values.length>1)return null;
   if(values.length){if(!/^[-\w:;.]{1,160}$/.test(values[0]))return null;query.set(name,values[0])}
  }
  return {editorPath:'editor/'+(query.size?'?'+query:''),returnPath:url.pathname.slice(base.pathname.length)+(query.size?'?'+query:'')};
 }catch{return null}
}
