/** Validate persisted component-copy references at the same immutable record head. */
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
function nodes(recipe){if(recipe?.schemaVersion===1)return recipe.items||[];const walk=n=>[n,...(n.children||[]).flatMap(walk)];return(recipe?.regions||[]).flatMap(r=>(r.children||[]).flatMap(walk))}
export async function validateCopyProvenance(recipe,records,{validateSource}={}){
 const byId=new Map(records.map(r=>[r.id,r])),checked=new Map();
 for(const node of nodes(recipe))for(const value of [node,node.item].filter(Boolean)){
  const ref=value.sourceRef;if(ref===undefined)continue;
  if(!plain(ref)||Object.keys(ref).sort().join()!=='sourceItemId,sourceScreenId'||['sourceScreenId','sourceItemId'].some(k=>typeof ref[k]!=='string'||!ref[k].trim()||ref[k].length>100))throw Error('Exact component copy provenance required');
  const source=byId.get(ref.sourceScreenId),original=source&&nodes(source.recipe).find(n=>n.id===ref.sourceItemId),kind=value.kind||value.componentId;
  if(source?.recipe?.schemaVersion===2&&['active-trade','active-trade-v2','pending-trade','closed-trade'].includes(kind))throw Error('Native source-to-stack projection authority is not connected');
  if(!original||![original.kind||original.componentId,original.item?.kind].includes(kind))throw Error('Component copy source does not exist or is incompatible');
  if(!checked.has(source.id)){if(typeof validateSource!=='function')throw Error('Copy source validation unavailable');checked.set(source.id,Promise.resolve(validateSource(structuredClone(source.recipe))))}
  await checked.get(source.id);
 }
 return recipe;
}
