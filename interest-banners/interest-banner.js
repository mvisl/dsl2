import {backgroundSVG} from './interest-background.js';
import {templates} from './templates.js';
export {templates, backgroundSVG};
const baseURL=new URL('./',import.meta.url);
const clone=v=>JSON.parse(JSON.stringify(v));
const number=(n,f)=>Number.isFinite(Number(n))?Number(n):f;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const styleURL=new URL('./component.css',import.meta.url).href;
const fontURL=new URL('./assets/roboto-variable.ttf',import.meta.url).href;
// Register once at document scope: @font-face inside a shadow root is not portable.
export const fontReady = (async()=>{
 if(typeof FontFace==='undefined'||!document.fonts)return false;
 let face=[...document.fonts].find(f=>f.family==='InterestRoboto');
 if(!face){face=new FontFace('InterestRoboto',`url("${fontURL}")`,{weight:'100 900',display:'swap'});document.fonts.add(face);}
 await face.load();return true;
})();
fontReady.catch(()=>{}); // Keep the fallback usable; integrations can await fontReady for strict font QA.

export class InterestBanner extends HTMLElement {
 static observedAttributes=['template','shape','position','height','radius','background-only','hue','glow'];
 #config={}; #observer; #frame; #width=351;
 constructor(){super();this.attachShadow({mode:'open'});}
 connectedCallback(){this.#observer=new ResizeObserver(entries=>{this.#width=entries[0].contentRect.width;cancelAnimationFrame(this.#frame);this.#frame=requestAnimationFrame(()=>this.render());});this.#observer.observe(this);this.render();}
 disconnectedCallback(){this.#observer?.disconnect();cancelAnimationFrame(this.#frame);}
 attributeChangedCallback(){if(this.isConnected)this.render();}
 set config(value){this.#config=clone(value||{});if(this.isConnected)this.render();}
 get config(){return clone(this.#config);}
 get resolvedConfig(){const key=this.getAttribute('template')||this.#config.template||'earning';const t=templates.find(x=>x.key===key)||templates[2];return {...this.#config,template:t.key,shape:this.getAttribute('shape')||this.#config.shape||t.shape,position:number(this.getAttribute('position')??this.#config.position,t.position),height:number(this.getAttribute('height')??this.#config.height,122),radius:number(this.getAttribute('radius')??this.#config.radius,4),hue:number(this.getAttribute('hue')??this.#config.hue,0),glow:number(this.getAttribute('glow')??this.#config.glow,1),backgroundOnly:this.hasAttribute('background-only')||!!this.#config.backgroundOnly};}
 getSVG(){return backgroundSVG({...this.resolvedConfig,width:this.#width});}
 render(){
  const cfg=this.resolvedConfig,t=templates.find(x=>x.key===cfg.template),width=this.#width||351,height=Math.max(72,cfg.height);
  this.style.setProperty('--banner-height',height+'px');
  const s=Math.min(1,width/351)*(cfg.fontScale??1),vertical=height/122;
  const fieldStyles=f=>{const override=cfg.fields?.[f.key]||{};const size=override.size??(f.size===44?cfg.metricSize:null)??f.size;
   const alias=f.bindings?.fontSize?.[0];const variable=alias?'--dsl06-'+alias.replaceAll('/','-'):null;
   const cssSize=override.size!=null||cfg.metricSize!=null&&f.size===44?size+'px':variable?`var(${variable},${size}px)`:size+'px';
   const right=351-f.x-f.width;const pos=f.anchor==='right'?`right:${right*s}px`:`left:${f.x*s}px`;
   const colorAlias=f.bindings?.fills?.[0];
   const fallback=override.color??(f.size===44&&cfg.metricColor?cfg.metricColor:f.color);
   let color=override.color||f.size===44&&cfg.metricColor||!colorAlias||fallback.startsWith('linear-gradient')?fallback:`var(--dsl06-${colorAlias.replaceAll('/','-').toLowerCase()},${fallback})`;
   const gradient=color.startsWith('linear-gradient');
   return `${pos};top:${f.y*vertical}px;width:${f.width*s}px;min-height:${f.height*vertical}px;font-size:calc(${cssSize} * ${s});line-height:${f.line*vertical}px;font-weight:${f.weight};letter-spacing:${(f.tracking??0)*s}px;text-align:${f.align};opacity:${override.opacity??f.opacity};${gradient?`background:${color};background-clip:text;-webkit-background-clip:text;color:transparent`:`color:${color}`}`;
  };
  const nodes=t.fields.map(f=>{const o=cfg.fields?.[f.key]||{};if(o.hidden)return '';return f.icon?`<span class="field icon" data-field="${f.key}" style="${fieldStyles(f)}"><img alt="" src="${new URL('assets/'+f.icon+'.svg',baseURL)}"></span>`:`<span part="${f.key}" data-field="${f.key}" class="field" style="${fieldStyles(f)}">${escape(o.text??f.text)}</span>`;}).join('');
  const icons=t.icons.map((i,index)=>{
   const o=cfg.icons?.[index]||{};if(o.hidden)return '';
   const right=351-i.x-i.width,pos=i.anchor==='right'?`right:${right*s}px`:`left:${i.x*s}px`;
   const src=o.src||new URL('assets/'+(i.asset||i.name+(i.name==='crown-glow'?'.png':'.svg')),baseURL).href;
   return `<span class="art-icon" style="${pos};top:${i.y*vertical}px;width:${i.width*s}px;height:${i.height*vertical}px;opacity:${o.opacity??i.opacity??1};transform:rotate(${i.rotation??0}deg);transform-origin:top left"><img alt="" src="${escape(src)}"></span>`;
  }).join('');
  this.shadowRoot.innerHTML=`<link rel="stylesheet" href="${styleURL}"><style>:host{--interest-font:${escape(cfg.fontFamily||'InterestRoboto,Roboto,Arial,sans-serif')}} </style><div class="banner" part="banner" style="border-radius:${cfg.radius}px"><div class="background" aria-hidden="true">${backgroundSVG({...cfg,width,height})}</div>${cfg.backgroundOnly?'':`<div class="content" part="content">${nodes}${icons}<slot></slot></div>`}</div>`;
  this.dispatchEvent(new CustomEvent('banner-render',{detail:{width,height,edge:width*cfg.position/100,position:cfg.position},bubbles:true}));
 }
}
if(!customElements.get('interest-banner'))customElements.define('interest-banner',InterestBanner);
