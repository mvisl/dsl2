import {stagePrototypeCopy} from './prototype-copy-continuation.js';
const link=document.querySelector('a'),notice=document.querySelector('p');
try{
 if(link&&notice&&stagePrototypeCopy({search:location.search,local:localStorage,session:sessionStorage})){
  const next=new URL(link.href);next.searchParams.set('resumeCopy','1');link.href=next.href;
  notice.textContent='После входа откроется локальный черновик на этом устройстве.';
 }
}catch{/* Keep the existing explicit recovery notice. */}
