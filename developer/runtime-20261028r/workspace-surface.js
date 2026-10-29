/** Developer host shows exactly Constructor + Questions (Inbox); owner review stays on the
 * separately entered Lab surface. The surface marker is navigation only, never auth. */
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
 // Lab carries owner review/calibration inside its own frames and has no bottom switcher at all;
 // the inline style survives the host later setting nav.hidden=false after sign-in.
 if(surface!=='developer'){nav.hidden=true;nav.style.display='none';nav.setAttribute('aria-hidden','true');
  for(const button of nav.querySelectorAll('button,a')){button.hidden=true;button.style.display='none';button.tabIndex=-1}
  return}
 if(!nav.querySelector('[data-mode="inbox"]')){const b=doc.createElement('button');b.type='button';b.dataset.mode='inbox';nav.append(b)}
 for(const button of nav.querySelectorAll('button,a')){const mode=button.dataset.mode;
  if(mode==='constructor'){button.hidden=false;button.textContent='Конструктор'}
  else if(mode==='inbox'){button.hidden=false;button.textContent='Вопросы';button.title='Developer Inbox'}
  // Owner review, logout and any other legacy control stay out of the developer switcher;
  // the inline style survives host CSS that sets an explicit button display.
  else{button.hidden=true;button.style.display='none'}
 }
}
