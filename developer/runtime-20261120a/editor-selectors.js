/** The one exact, bounded editor selector contract shared by sign-in continuation (entry-target), one-use
 * child entries (scoped-editor-links → private-mount → worker private-ui-entry) and the workspace host.
 * github/private-worker.js is a classic worker and mirrors these lists; a test keeps them equal. */
export const DEPOSIT_CONTEXTS=Object.freeze(['current28','historical11']);
// FCIL Wallet editor profiles, exactly the private FCIL_WALLET_TYPES keys the editor accepts.
export const FCIL_WALLET_PROFILES=Object.freeze(['collapsed','cfd','portfolioEntry']);
/** Native editor selectors exactly as prototype/routes.js editorSourceURL emits them. The editor validates each value. */
export const EDITOR_NATIVE_SELECTORS=Object.freeze(['historicalMore','accountBenefits','depositSeven','optionsSheet','outcomeScreen','marketsList','metatrader','reports','internalTransfer','historicalWallet','instrumentSearch','about','onboarding','calendar','news','notificationSettings','welcomeBonus','productInbox','personalDetails','settingsProfile','depositTier','accountHistory','depositWarning','paymentOverlay','recurringDraft','withdrawalDraft','depositExtended','depositDraft','markets','notifications','currentPayments','fcilPayments','fcilWallet','wallet','nativeTrades','f1Trades','originalActive']);
export const EDITOR_SELECTORS=Object.freeze(['screen','workingCopy','profile',...EDITOR_NATIVE_SELECTORS,'depositContext']);
export const EDITOR_SELECTOR_VALUE=/^[-\w:;.]{1,160}$/;
/** Canonical editor query or null. Exactly one source: a saved record ID (screen), a local working copy
 * (workingCopy, with its exact saved parent as screen; the editor verifies that parent), or one native
 * selector. A native selector may sit beside a working copy (the editor's own persisted URL); beside a
 * bare record only fcilWallet (the editor then requires that exact type) or the legacy optionsSheet.
 * profile only beside a record; depositContext only beside fcilWallet. Names in `drop` are discarded and
 * never carried; with dropUnknown every unknown name is discarded (the editor's own reported location).
 * Otherwise any unknown name, duplicate, malformed value or incompatible combination refuses the whole set. */
export function exactEditorSelectors(params,{drop=[],dropUnknown=false,allowEmpty=false}={}){
 for(const name of params.keys())if(!EDITOR_SELECTORS.includes(name)&&!dropUnknown&&!drop.includes(name))return null;
 const query=new URLSearchParams();
 for(const name of EDITOR_SELECTORS){const values=params.getAll(name);if(values.length>1)return null;if(values.length){if(!EDITOR_SELECTOR_VALUE.test(values[0]))return null;query.set(name,values[0])}}
 if(!query.size)return allowEmpty?query:null;
 const natives=EDITOR_NATIVE_SELECTORS.filter(name=>query.has(name));if(natives.length>1)return null;
 const native=natives[0],record=query.has('screen'),copy=query.has('workingCopy');
 if(!native&&!record&&!copy)return null;
 if(query.has('originalActive')&&(!['F1','F2'].includes(query.get('originalActive'))||query.has('profile')))return null;
 if(query.has('fcilWallet')&&!FCIL_WALLET_PROFILES.includes(query.get('fcilWallet')))return null;
 if(query.has('depositContext')&&(native!=='fcilWallet'||!DEPOSIT_CONTEXTS.includes(query.get('depositContext'))))return null;
 if(query.has('profile')&&!record)return null;
 if(native&&record&&!copy&&!['fcilWallet','optionsSheet','originalActive'].includes(native))return null;
 return query;
}
