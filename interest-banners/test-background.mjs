import assert from 'node:assert/strict';
import {backgroundSVG} from './interest-background.js';
for(const shape of ['arrow','slash']){
 for(const width of [240,296,351,406,744,1200,4096]){
  const svg=backgroundSVG({shape,width,position:73.2,height:122});
  const edge=Number(svg.match(/data-edge-x="([^"]+)"/)[1]);
  assert(Math.abs(edge/width-.732)<1e-10,'percentage anchor must survive resize');
  assert.match(svg,/scale\(1\)" style="filter:hue-rotate/,'moving artwork must not stretch with width');
  assert(!svg.includes('<image'),'background must contain no raster images');
  assert(svg.includes('continuation'),'wide viewport continuation must be present');
 }
 const svg=backgroundSVG({shape,width:500,height:244,position:50});
 assert.match(svg,/scale\(2\)" style="filter:hue-rotate/,'height scales geometry uniformly');
}
assert.match(backgroundSVG({width:10000,height:10000,position:500}),/width="4096" height="1024"/);
assert.notEqual(backgroundSVG(),backgroundSVG(),'SVG identifiers must be unique across instances');
console.log('PASS: percentage anchors, fixed aspect ratio, bounds, vector-only output, unique IDs, wide continuation');
