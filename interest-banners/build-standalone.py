"""Bundle the component into one local HTML file, with every resource embedded."""
from pathlib import Path
import base64,json,re
root=Path(__file__).resolve().parent
mime={'.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf','.css':'text/css'}
def data(path):
 p=root/path
 return 'data:'+mime[p.suffix]+';base64,'+base64.b64encode(p.read_bytes()).decode()
bg=(root/'interest-background.js').read_text().replace('export function','function')
tpl=(root/'templates.js').read_text().replace('export const','const')
js=(root/'interest-banner.js').read_text()
js=re.sub(r'^import .*?;\n|^export \{.*?\};\n','',js,flags=re.M)
js=js.replace('export class','class').replace('export const','const')
js=re.sub(r"new URL\('(\./[^']+)',import.meta.url\)\.href",lambda m:json.dumps(data(m[1])),js)
css=(root/'component.css').read_text()
js=js.replace('<link rel="stylesheet" href="${styleURL}">','<style>'+css+'</style>')
assert 'import.meta' not in js
bridge='''
const banner=document.querySelector('interest-banner');
window.InterestBannerBridge={
 configure(config){banner.config=config;return this.getState();},
 getState(){return {...banner.resolvedConfig,width:banner.getBoundingClientRect().width,height:122};},
 ready:fontReady
};
banner.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('interest-banner-activate',{detail:{template:banner.resolvedConfig.template}})));
fontReady.then(()=>window.dispatchEvent(new Event('interest-banner-ready'))).catch(()=>{});
'''
html='''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Interest banner · local component</title><style>html,body{margin:0;background:transparent;overflow:hidden}interest-banner{display:block;width:100%;height:122px}</style></head><body><interest-banner></interest-banner><script>'''+bg+'\n'+tpl+'\n'+js+'\n'+bridge+'</script></body></html>'
(root/'interest-banner.standalone.html').write_text(html)
print('Built fully local interest-banner.standalone.html')
