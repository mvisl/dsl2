/** A bounded, source-pinned immutable asset group fetched only on first use.
 * load must return a Map of full repository paths to raw bytes; no partial group is admitted.
 */
export function createDeferredMapAssets({transport,pins,load,getToken,admit,crypto=globalThis.crypto}={}){
 if(typeof transport?.readSource!=='function'||!pins||typeof pins!=='object'||Array.isArray(pins)||typeof load!=='function'||typeof getToken!=='function'||typeof admit!=='function'||!crypto?.subtle)throw Error('Explicit verified asset group required');
 const entries=Object.entries(pins),paths=new Map(entries),valid=p=>!p.startsWith('review-workspace/calibration-protected/')&&/^review-workspace\/(?:[-\w.]+\/)*assets\/[-\w.]+$/.test(p)&&!p.split('/').some(x=>x==='.'||x==='..');
 if(!entries.length||entries.length>512||entries.some(([p,v])=>!valid(p)||!Number.isSafeInteger(v?.bytes)||v.bytes<0||v.bytes>8000000||!/^[a-f0-9]{64}$/.test(v?.sha256||''))||entries.reduce((n,[,v])=>n+v.bytes,0)>16000000)throw Error('Bounded exact asset seals required');
 let closed=false,pending=null,files=null;const controller=new AbortController();
 const live=()=>{if(closed||!getToken())throw Object.assign(Error('GitHub sign-in required'),{status:401})};
 async function readSource(p,options){
  live();if(!paths.has(p))return transport.readSource(p,options);
  if(!pending)pending=(async()=>{let candidate;try{candidate=await load({signal:controller.signal});live();if(!(candidate instanceof Map)||candidate.size!==paths.size||[...candidate].some(([p,b])=>!paths.has(p)||!(b instanceof Uint8Array)))throw Error('Exact asset closure required');
   for(const [name,bytes] of candidate){const pin=paths.get(name);if(bytes.length!==pin.bytes)throw Error('Asset length mismatch');const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');live();if(digest!==pin.sha256)throw Error('Asset seal mismatch');}
   live();admit(candidate);files=candidate;return candidate;
  }catch(error){if(candidate instanceof Map&&candidate!==files){for(const bytes of candidate.values())if(bytes instanceof Uint8Array)bytes.fill(0);candidate.clear()}throw error}})().catch(error=>{pending=null;throw error});
  const result=await pending;live();return{path:p,bytes:result.get(p).slice()};
 }
 return {...transport,readSource,closeMapAssets(){closed=true;controller.abort();files?.clear();files=null;pending=null}};
}
