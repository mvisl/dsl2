/** Nonfinancial preview identity beside (never inside) the sealed native recipe. */
const types=['fcil-wallet-collapsed-native-v1','fcil-wallet-cfd-native-v1','fcil-wallet-portfolio-entry-native-v1'];
export const isWalletPreviewRecipe=r=>r?.schemaVersion===2&&r.generation==='F2'&&r.context?.jurisdiction==='FCIL'&&types.includes(r.screenType);
export function validateWalletPreviewContext(value,recipe){
 if(value===undefined||value===null)return null;
 if(!isWalletPreviewRecipe(recipe)||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join()!=='depositContext,schemaVersion'||value.schemaVersion!==1||!['current28','historical11'].includes(value.depositContext))throw Error('Exact F2 FCIL Wallet Deposit preview context required');
 return{schemaVersion:1,depositContext:value.depositContext};
}
export function walletPreviewContextForSave(requested,recipe,parent){
 const next=validateWalletPreviewContext(requested,recipe);if(!parent)return next;
 const inherited=validateWalletPreviewContext(parent.previewContext,recipe);
 if(next&&JSON.stringify(next)!==JSON.stringify(inherited))throw Error('Variant must preserve recorded Deposit preview context; missing legacy context cannot be supplied by URL');
 return inherited;
}
export function walletPreviewContextForEditor({recipe,search='',parentRecord=null,localContext}={}){
 if(!isWalletPreviewRecipe(recipe))return null;
 const q=new URLSearchParams(search),values=q.getAll('depositContext');if(values.length>1||values.length&&!['current28','historical11'].includes(values[0]))throw Error('Exact Deposit preview selector required');
 const recorded=parentRecord?validateWalletPreviewContext(parentRecord.previewContext,recipe):validateWalletPreviewContext(localContext,recipe);
 if(parentRecord||recorded){if(values.length&&(!recorded||values[0]!==recorded.depositContext))throw Error('URL cannot override recorded or missing Deposit preview context');return recorded}
 const profiles={collapsed:types[0],cfd:types[1],portfolioEntry:types[2]};if(values.length&&(q.getAll('fcilWallet').length!==1||profiles[q.get('fcilWallet')]!==recipe.screenType))throw Error('Deposit context requires the exact Wallet source selector');
 return{schemaVersion:1,depositContext:values[0]??'current28'};
}
export function applyWalletPreviewSelector(search,recipe,previewContext){const q=new URLSearchParams(search);if(!isWalletPreviewRecipe(recipe))return q;
 const value=validateWalletPreviewContext(previewContext,recipe);q.delete('depositContext');if(value){q.set('fcilWallet',({[types[0]]:'collapsed',[types[1]]:'cfd',[types[2]]:'portfolioEntry'})[recipe.screenType]);q.set('depositContext',value.depositContext)}return q;}
