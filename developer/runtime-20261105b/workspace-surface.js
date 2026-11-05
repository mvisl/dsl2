/** Each admitted surface keeps its own Questions frame. Navigation never grants auth. */
export const LAB_SURFACE_HASH='#surface=lab';
export function workspaceSurface({requested,entryTarget,url}){
 if(entryTarget?.review)return'lab';
 if(requested==='lab'||requested==='developer')return requested;
 const current=new URL(url);return current.searchParams.get('surface')==='lab'||current.hash===LAB_SURFACE_HASH?'lab':'developer';
}
// The private worker binds frame entries to the root's creation URL with only consumed
// hints (returnTo, inbox, fragment) ignored, so a consumed entry may add no query field.
// The Lab reload marker therefore lives in the fragment, which HTTP referrers never carry.
export function consumedEntryURL(href,{surface,requestedSurface}={}){
 const consumed=new URL(href);consumed.searchParams.delete('returnTo');
 if(surface==='lab'&&!requestedSurface&&!consumed.hash&&consumed.searchParams.get('surface')!=='lab')consumed.hash=LAB_SURFACE_HASH;
 return consumed.href;
}
export function configureModeControls(nav,surface,doc=nav.ownerDocument){
 nav.dataset.surface=surface;
 const questionsMode=surface==='lab'?'questions':'inbox';
 if(!nav.querySelector('[data-mode="'+questionsMode+'"]')){const b=doc.createElement('button');b.type='button';b.dataset.mode=questionsMode;nav.append(b)}
 for(const button of nav.querySelectorAll('button,a')){const mode=button.dataset.mode;
  const visible=mode==='constructor'||mode===questionsMode;
  button.hidden=!visible;button.style.display=visible?'':'none';button.tabIndex=visible?0:-1;
  if(mode==='constructor')button.textContent='Конструктор';
  else if(mode===questionsMode){button.textContent='Вопросы';button.title=surface==='lab'?'Вопросы к владельцу':'Developer Inbox'}
 }
 // The host reveals this fixed bottom-right control only after successful private admission.
 // Lab switches to its existing owner-review frame; it never substitutes the submission form.
}
