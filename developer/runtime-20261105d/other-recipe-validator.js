/** Owner Save validation for sources without a native contract profile (screen-writer sends every
 * recipe with context.nativeProfile to its native authority instead). It uses the editor's own source
 * dispatcher (editor/source-loaders.js) and the same strict runtime.validate, context and entry: a
 * missing context is refused and nothing falls back to another source. */
export function createOtherRecipeValidator({loadModules,familyOptions={}}={}){
 if(typeof loadModules!=='function')throw Error('Source modules required');
 const runtimes=new Map();
 return async recipe=>{
  const{loadPreviewRuntime,requiresCompleteRuntime,createSourceLoaders}=await loadModules();
  const type=recipe?.schemaVersion===2&&typeof recipe.screenType==='string'?recipe.screenType:null;
  // familyOptions only injects family runtimes in tests; production passes none.
  const load=selected=>{if(!runtimes.has(selected))runtimes.set(selected,createSourceLoaders(loadPreviewRuntime,{families:familyOptions})(selected?{selectedSource:selected}:{}).catch(error=>{runtimes.delete(selected);throw error}));return runtimes.get(selected)};
  let runtime=await load(type);if(requiresCompleteRuntime(recipe,runtime))runtime=await load(null);
  if(type&&!runtime.contexts?.[type])throw Error(runtime.errors?.[type]||'Requested source unavailable.');
  // Save diagnostics: a refusal by the strict validator is the validation stage, not runtime loading.
  let validated;try{validated=runtime.validate(recipe)}catch(error){if(error&&typeof error==='object')try{Object.defineProperty(error,'saveStage',{value:'validation',configurable:true})}catch{}throw error}
  const entry=validated.schemaVersion===2?runtime.contextFor(validated).entry:null;
  return{recipe:validated,sourceURL:entry?'https://www.figma.com/design/'+entry.fileKey+'/?node-id='+entry.nodeId.replace(':','-'):null};
 };
}
