/** Public navigation hints contain source selectors only, never local drafts or auth. */
export function sourceEntryTarget(value,scope){
 try{
  const base=new URL(scope),url=new URL(value,base),root=base.pathname+'private/';
  if(url.origin!==base.origin||url.username||url.password||url.hash)return null;
  if(!['editor/','editor/index.html','prototype/','prototype/index.html'].some(p=>url.pathname===root+p))return null;
  const query=new URLSearchParams();
  for(const name of ['screen','profile','optionsSheet','nativeTrades','f1Trades','map','view']){
   const values=url.searchParams.getAll(name);if(values.length>1)return null;
   if(values.length){if(!/^[-\w:;.]{1,160}$/.test(values[0]))return null;query.set(name,values[0])}
  }
  return {editorPath:'editor/'+(query.size?'?'+query:''),returnPath:url.pathname.slice(base.pathname.length)+(query.size?'?'+query:'')};
 }catch{return null}
}
