/** Load a fixed sealed source group once, only when a member is actually needed. */
export function createDeferredSource({transport,paths,load,getToken}={}){
 if(typeof transport?.readSource!=='function'||!(paths instanceof Set)||!paths.size||paths.size>20||typeof load!=='function'||typeof getToken!=='function')throw Error('Explicit deferred source group required');
 let pending=null,files=null,closed=false;const controller=new AbortController();
 const live=()=>{if(closed||!getToken())throw Object.assign(Error('GitHub sign-in required'),{status:401})};
 function close(){closed=true;controller.abort();files?.clear();files=null;pending=null}
 async function readSource(path,options){
  live();if(!paths.has(path))return transport.readSource(path,options);
  if(!pending)pending=(async()=>{const result=await load({signal:controller.signal});live();if(!(result instanceof Map)||result.size!==paths.size||[...paths].some(p=>!(result.get(p) instanceof Uint8Array)))throw Error('Exact deferred source closure required');files=result;return result})().catch(error=>{pending=null;throw error});
  const result=await pending;live();return{path,bytes:result.get(path)};
 }
 return{...transport,readSource,closeDeferred:close};
}
