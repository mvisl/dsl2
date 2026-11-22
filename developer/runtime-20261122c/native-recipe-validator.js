/** Validate content-only native recipes against a pinned source contract capsule. */
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const canonical=v=>Array.isArray(v)?v.map(canonical):plain(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const keys=(a,b)=>plain(a)&&plain(b)&&same(Object.keys(a).sort(),Object.keys(b).sort());
export function validateNativeRecipe(value,authority){
 const profile=plain(value?.context)&&authority?.profiles?.[value.context.nativeProfile];
 if(!plain(profile)||!plain(profile.recipe)||!Array.isArray(profile.owners))throw Error('Exact native source profile required');
 const base=profile.recipe,owners=new Map(profile.owners.map(owner=>[owner.id,owner]));
 if(!keys(value,base)||['schemaVersion','generation','kind','screenType','width','height','context'].some(k=>!same(value[k],base[k]))||!Array.isArray(value.regions)||value.regions.length!==3)throw Error('Exact native source, context and viewport required');
 for(let i=0;i<3;i++){
  const region=value.regions[i],reference=base.regions[i];
  if(!keys(region,reference)||region.id!==reference.id||!Array.isArray(region.children)||region.children.length!==reference.children.length)throw Error('Exact native regions and owner order required');
  for(let j=0;j<reference.children.length;j++){
   const node=region.children[j],expected=reference.children[j],owner=owners.get(expected.id);
   if(!owner||!keys(node,expected)||['id','componentId','sourceNodeId'].some(k=>node[k]!==expected[k])||!keys(node.props,expected.props))throw Error('Exact native owner identity required');
   for(const[key,property]of Object.entries(owner.properties)){
    const text=node.props[key];
    if(property.type==='BOOLEAN'){if(typeof text!=='boolean')throw Error('Native Boolean property required')}
    else if(['VARIANT','INSTANCE_SWAP'].includes(property.type)){if(!property.allowedValues?.includes(text))throw Error('Reviewed native enum required')}
    else if(typeof text!=='string'||Array.from(text).length>500||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)||Array.from(text).some(c=>c.length===1&&c.charCodeAt(0)>=0xd800&&c.charCodeAt(0)<=0xdfff))throw Error('Valid native source text required');
   }
  }
 }
 return structuredClone(value);
}
