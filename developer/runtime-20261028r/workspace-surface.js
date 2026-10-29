/** Developer host shows exactly Constructor + Questions (Inbox); owner review stays on the
 * separately entered Lab surface. The surface marker is navigation only, never auth. */
export function workspaceSurface({requested,entryTarget,url}){
 if(entryTarget?.review)return'lab';
 if(requested==='lab'||requested==='developer')return requested;
 return new URL(url).searchParams.get('surface')==='lab'?'lab':'developer';
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
