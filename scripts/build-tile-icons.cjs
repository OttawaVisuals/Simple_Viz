/* Wave geometry tile artwork. Run `node scripts/build-tile-icons.cjs` to embed
 * the library in both catalogues. Published pages remain fully self-contained.
 * Icons are illustrative: no displayed distance, timing, or area is a measurement. */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const attr = values => Object.entries(values).map(([k,v]) => ` ${k}="${String(v).replaceAll('"','&quot;')}"`).join('');
const tag = (name, values) => `<${name}${attr(values)}/>`;
const p = (d, cls='', extra={}) => tag('path',{d,...(cls?{class:cls}:{}),...extra});
const c = (cx,cy,r,cls='',extra={}) => tag('circle',{cx,cy,r,...(cls?{class:cls}:{}),...extra});
const e = (cx,cy,rx,ry,cls='',extra={}) => tag('ellipse',{cx,cy,rx,ry,...(cls?{class:cls}:{}),...extra});
const rect = (x,y,width,height,cls='',extra={}) => tag('rect',{x,y,width,height,rx:1.5,...(cls?{class:cls}:{}),...extra});
const g = (body,cls='',extra={}) => `<g${attr({...cls?{class:cls}:{},...extra})}>${body}</g>`;
const soft = (cx,cy,r) => c(cx,cy,r,'wi-soft');
const globe = (x,y,r) => soft(x,y,r)+c(x,y,r)+p(`M${x-r*.91} ${y-r*.38}q${r*.91} ${-r*.48} ${r*1.82} 0M${x-r*.91} ${y+r*.38}q${r*.91} ${r*.48} ${r*1.82} 0M${x} ${y-r}q${-r*.76} ${r} 0 ${r*2}M${x} ${y-r}q${r*.76} ${r} 0 ${r*2}`,'wi-fine');
const arrow = (x,y,dx,dy,cls='wi-accent') => {const n=Math.hypot(dx,dy),ux=dx/n,uy=dy/n;const endX=x+dx,endY=y+dy;return p(`M${x} ${y}l${dx} ${dy}m${-ux*4-uy*3} ${-uy*4+ux*3}l${ux*4+uy*3} ${uy*4-ux*3}l${-ux*4+uy*3} ${-uy*4-ux*3}`,cls);};
const motion = (body,type='slide',style='') => g(body,`wi-motion wi-${type}`,{style});
const draw = (d,style='') => p(d,'wi-accent wi-motion wi-draw',{pathLength:1,style});
const particle = (d,r=2,style='') => c(0,0,r,'wi-dot wi-motion wi-path',{style:`offset-path:path('${d}');${style}`});
const wave = (x,y,w=8,h=7,cls='wi-accent') => p(`M${x} ${y}q${w} ${-h} ${w*2} 0t${w*2} 0t${w*2} 0`,cls);
const gear = (x,y,r) => c(x,y,r)+c(x,y,r*.7,'wi-fine')+p(`M${x-r} ${y}h${r*2}M${x} ${y-r}v${r*2}M${x-r*.7} ${y-r*.7}l${r*1.4} ${r*1.4}M${x-r*.7} ${y+r*.7}l${r*1.4} ${-r*1.4}`,'wi-fine');
const pizza = (x,y,r) => soft(x,y,r)+c(x,y,r)+c(x,y,r*.84,'wi-fine')+
 [0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3;return p(`M${x} ${y}l${(Math.sin(a)*r*.84).toFixed(2)} ${(-Math.cos(a)*r*.84).toFixed(2)}`,'wi-fine');}).join('')+
 [[-.35,-.45],[.45,-.13],[-.2,.5]].map(([dx,dy])=>c(x+dx*r,y+dy*r,r*.07,'wi-dot')).join('');
const cup = (x,y) => p(`M${x} ${y}h22v20q-11 6-22 0ZM${x+22} ${y+3}h4q8 6 0 12h-4`)+e(x+11,y,11,3,'wi-fine')+rect(x+1,y+9,20,9,'wi-soft');
const axes = () => p('M15 10v43h92','wi-fine');
const icons = {};

// Approved directions, redrawn in the catalogue's 120 x 64 coordinate system.
icons['earth-moon-race'] = globe(24,32,13)+p('M39 32h50','wi-fine')+
 [0,-1.13,-2.26].map(delay=>motion(p('M39 23q6 9 0 18','wi-accent'),'wave',`--delay:${delay}s;--dx:53px`)).join('')+
 c(97,32,7,'wi-surface')+p('M97.5 25a7 7 0 0 0 0 14','wi-fine');
icons['gravity-lab'] = motion(globe(26,32,13),'slide','--dx:2px;--duration:3.4s')+
 motion(globe(98,32,7.5),'slide','--dx:-6px;--duration:3.4s')+p('M43 32h42','wi-fine',{ 'stroke-dasharray':'1 3'})+
 motion(arrow(45,32,12,0)+arrow(81,32,-12,0),'breathe','--duration:3.4s');
icons['well-depth'] = p('M42 16v32q12 5 24 0V16M31 16h8M69 16h8')+e(54,16,12,3)+e(54,48,12,3,'wi-soft')+
 p('M42 48q12-5 24 0','wi-accent wi-fine')+p('M54 23v17','wi-fine',{'stroke-dasharray':'1 3'})+
 e(54,48,10,3,'wi-accent wi-motion wi-splash',{style:'transform-origin:54px 48px'})+
 p('M48 46q6-5 12 0','wi-accent wi-motion wi-echo')+p('M48 46q6-5 12 0','wi-accent wi-motion wi-echo2')+
 c(54,16,1.7,'wi-dot wi-motion wi-stone')+p('M82 18v29M79 18h6M79 47h6M81 25h3M81 32h3M81 39h3','wi-fine');

icons['atlas-play'] = globe(36,32,21)+motion(g(p('M76 23c0-10 17-10 17 0 0 7-8 6-8 15','wi-accent')+c(85,44,1.5,'wi-dot')),'slide','--dy:-2px');
icons['horizon-distance'] = p('M8 57Q59 3 111 57')+p('M20 47l-6-14')+c(14,30,2,'wi-dot')+p('M14 33L66 35','wi-accent')+
 draw('M14 33L66 35')+c(66,35,2,'wi-dot')+p('M23 51q30-19 59 0','wi-fine');
icons['pizza-area'] = motion(pizza(29,32,23),'spin','transform-origin:29px 32px;--duration:20s')+
 p('M59 28h9M59 35h9','wi-fine')+
 motion(pizza(88,19,13),'spin','transform-origin:88px 19px;--duration:20s')+motion(pizza(94,47,13),'spin','transform-origin:94px 47px;--duration:20s');
icons['lightning-distance'] = p('M13 28c-8-7 0-17 10-14 5-12 22-8 22 3 12-3 16 14 5 16H15')+
 motion(p('M33 29l-7 12h7l-4 12 17-18h-9l4-6Z','wi-accent wi-tint'),'flash')+
 [0,-1.13,-2.26].map(delay=>motion(p('M61 22q12 10 0 20','wi-accent'),'wave',`--dx:39px;--delay:${delay}s`)).join('');
const car = (x,y) => p(`M${x} ${y}l5-8h17l7 8h4v7H${x}ZM${x+9} ${y-7}v7h16`)+c(x+7,y+7,3)+c(x+26,y+7,3);
icons['braking-distance'] = motion(car(8,16),'slide','--dx:5px')+motion(car(8,43),'slide','--dx:20px')+
 draw('M49 22h12')+draw('M49 49h48')+p('M49 18v8M61 18v8M49 45v8M97 45v8','wi-fine');
icons['shelf-sag'] = p('M12 30l-5 11h10ZM108 30l-5 11h10Z')+p('M12 27h96','wi-fine',{'stroke-dasharray':'2 4'})+
 motion(p('M12 30q48 16 96 0','wi-accent'),'stretch','transform-origin:60px 30px;--sy:1.25')+
 motion(rect(52,23,16,12,'wi-soft')+rect(52,23,16,12)+arrow(60,37,0,12),'slide','--dy:2px');
icons['basic-functions'] = axes()+draw('M19 46L100 17')+draw('M20 46Q60 1 101 46','--delay:-1.1s')+
 draw('M20 33q10-17 20 0t20 0t20 0t20 0','--delay:-2.2s');
icons['egg-boiling-time'] = p('M60 8c13 0 23 18 23 30 0 13-10 20-23 20S37 51 37 38c0-12 10-30 23-30Z')+
 e(60,39,13,11,'wi-soft')+motion(e(60,39,10,8,'wi-accent'),'stretch','transform-origin:60px 39px;--sx:1.18;--sy:1.18')+
 [44,60,76].map((x,i)=>motion(p(`M${x} 16q-4-3 0-7`,'wi-accent wi-fine'),'rise',`--dy:-5px;--delay:${-i*.8}s`)).join('');
icons['planet-light-delay'] = soft(20,32,11)+c(20,32,9)+p('M20 16v-4M20 48v4M4 32H0M36 32h4M9 21l-3-3M31 43l3 3M9 43l-3 3M31 21l3-3','wi-fine')+
 p('M36 32h58','wi-fine')+globe(101,32,9)+c(91,23,9,'wi-fine',{'stroke-dasharray':'2 3'})+
 particle('M36 32H91',2)+arrow(92,15,8,7,'wi-fine');
icons['keplers-third-law'] = soft(47,32,6)+c(47,32,5,'wi-dot')+e(56,32,29,17)+e(62,32,49,26,'wi-fine')+
 particle('M85 32A29 17 0 1 1 27 32A29 17 0 1 1 85 32Z',2.6,'--duration:3.4s')+
 particle('M111 32A49 26 0 1 1 13 32A49 26 0 1 1 111 32Z',3,'--duration:7.5s');
icons['mass-energy'] = p('M12 24l18-10 18 10v22L30 56 12 46ZM12 24l18 10 18-10M30 34v22')+
 p('M12 24l18 10v22L12 46Z','wi-soft')+arrow(55,34,14,0,'wi-fine')+
 soft(91,32,12)+c(91,32,7)+motion(p('M91 13V8M91 51v5M72 32h-5M110 32h5M77 18l-4-4M105 46l4 4M77 46l-4 4M105 18l4-4','wi-accent'),'breathe');
icons['eratosthenes-shadow'] = p('M9 54Q60 18 111 54')+p('M21 48q38-19 76 0','wi-fine')+
 p('M39 39V21M82 41l5-18')+p('M39 39h15M82 41l12 3','wi-accent')+
 [20,46,72,98].map(x=>motion(p(`M${x} 8l10 15`,'wi-accent'),'slide','--dy:3px;--dx:2px')).join('');
icons['time-dilation'] = p('M15 14h29M15 50h29M72 14h32M72 50h32')+p('M29 16v32M76 48l12-32 12 32','wi-accent wi-fine',{'stroke-dasharray':'1 3'})+
 c(0,0,2,'wi-dot wi-motion wi-path',{style:"offset-path:path('M29 48V16');animation-direction:alternate;--duration:1.2s"})+
 particle('M76 48L88 16L100 48',2,'--duration:2.6s')+arrow(76,7,24,0,'wi-fine');
icons['constant-acceleration'] = axes()+p('M18 49C48 49 58 31 71 19S92 11 105 10','wi-accent wi-fine',{'stroke-dasharray':'2 3'})+
 particle('M18 49C48 49 58 31 71 19S92 11 105 10',3.2)+p('M19 8h88','wi-fine')+
 arrow(92,29,14,0,'wi-accent');
icons['fan-laws'] = c(32,32,23)+soft(32,32,18)+c(32,32,3,'wi-dot')+
 motion(p('M32 29c2-13 14-18 17-11 0 7-7 13-14 14M35 32c13 2 18 14 11 17-7 0-13-7-14-14M32 35c-2 13-14 18-17 11 0-7 7-13 14-14M29 32c-13-2-18-14-11-17 7 0 13 7 14 14','wi-accent'),'spin','transform-origin:32px 32px;--duration:4s')+
 [18,32,46].map((y,i)=>motion(arrow(64,y,16+i*10,0),'slide',`--dx:3px;--delay:${-i*.3}s`)).join('');
icons['heat-pump-magic'] = p('M73 30l17-15 17 15M77 28v25h26V28')+wave(80,42,3,3)+
 rect(9,30,35,23)+p('M14 37h9M14 43h9','wi-fine')+c(33,41,7,'wi-fine')+
 motion(p('M33 35v12M27 41h12','wi-accent'),'spin','transform-origin:33px 41px;--duration:4s')+
 motion(p('M16 21q-3-3 0-6M28 21q-3-3 0-6','wi-accent'),'rise','--dy:-4px')+
 [0,-1.7].map(delay=>motion(p('M50 33q6 8 0 16','wi-accent'),'wave',`--dx:19px;--delay:${delay}s`)).join('');
icons['dew-point-window'] = p('M14 22l22-13 22 13M19 20v33h34V20')+rect(30,28,13,17,'wi-soft')+rect(30,28,13,17)+p('M36.5 28v17M30 36h13','wi-fine')+
 [72,88,104].map((x,i)=>motion(p(`M${x} 24c-5 7-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12Z`,'wi-accent wi-tint'),'stretch',`transform-origin:${x}px 36px;--sx:1.1;--sy:1.1;--delay:${-i*.7}s`)).join('');
icons['straw-hose-flow'] = p('M15 16h16v36H15Z')+rect(16,34,14,17,'wi-soft')+p('M23 39V10h16','wi-accent')+
 p('M53 42c10 0 5-27 18-27s5 31 19 31h17')+p('M53 38c10 0 5-27 18-27s5 31 19 31h17','wi-fine')+
 particle('M53 40C63 40 58 13 71 13S76 44 90 44H107',1.7)+particle('M23 39V10H39',1.7,'--duration:6s');
icons['reynolds-number'] = p('M9 16h102M9 48h102')+rect(9,17,102,30,'wi-soft')+p('M12 32h40','wi-accent')+
 p('M52 32c8-17 13 17 22 0s12 17 21 0 10 9 15 0','wi-accent')+
 particle('M12 32H52C60 15 65 49 74 32S86 49 95 32S105 41 110 32',1.6)+p('M12 23h35M12 41h35','wi-fine');
icons['microwave-chocolate'] = rect(9,15,36,32)+rect(14,20,22,20,'wi-soft')+rect(14,20,22,20,'wi-fine')+c(40,23,1.5)+p('M38 32h4M38 37h4','wi-fine')+
 wave(51,31,4,8)+rect(83,24,28,22)+p('M97 24v22M83 35h28','wi-fine')+
 [90,104].map(x=>motion(e(x,35,4,3,'wi-soft')+e(x,35,3,2,'wi-accent'),'stretch',`transform-origin:${x}px 35px;--sx:1.35;--sy:1.35`)).join('');
icons['cosmic-scale'] = p('M13 33h94M16 27v12M31 29v8M47 27v12M63 29v8M80 27v12M103 29v8','wi-fine')+
 motion(soft(60,33,12)+c(60,33,5,'wi-accent'),'stretch','transform-origin:60px 33px;--sx:1.2;--sy:1.2')+
 c(20,13,1.5,'wi-dot')+globe(100,13,8)+arrow(44,51,-17,0)+arrow(76,51,17,0);
const potatoPath='M18 49C38 8 75 10 101 49';
icons['potato-trajectory'] = p('M9 52h83M109 52h3','wi-fine')+e(101,52,8,2.5,'wi-accent')+
 p(potatoPath,'wi-fine',{'stroke-dasharray':'1 3'})+particle(potatoPath,2.5)+p('M15 47l14-16M15 47h15','wi-fine');

// Draft catalogue: the same geometric vocabulary, with motion specific to each idea.
icons['bike-gears'] = p('M29 15h61M29 49h61','wi-fine')+
 motion(gear(29,32,17),'spin','transform-origin:29px 32px;--duration:5s')+
 motion(gear(90,32,10),'spin','transform-origin:90px 32px;--duration:2.9s')+c(29,32,3,'wi-dot')+c(90,32,2,'wi-dot');
icons['compound-interest'] = axes()+p('M22 49V40h12v9M42 49V32h12v17M62 49V23h12v26M82 49V10h12v39','wi-soft')+
 draw('M21 43C51 42 78 31 99 10')+particle('M21 43C51 42 78 31 99 10',2);
icons['mpg-trap'] = rect(15,13,22,37)+rect(19,17,14,11,'wi-soft')+rect(19,17,14,11,'wi-fine')+p('M37 23h7v18q7 8 10 0V21l-6-7M12 51h29')+
 motion(arrow(64,23,34,0),'slide','--dx:3px')+motion(arrow(64,43,17,0),'slide','--dx:3px')+p('M64 17v12M64 37v12','wi-fine');
icons['binary-hex'] = [0,1,2,3].map((i)=>rect(12+i*12,19,9,13,'wi-soft')+rect(12+i*12,19,9,13,'wi-fine')+
 motion(c(16.5+i*12,25.5,1.6,'wi-dot'),'breathe',`--delay:${-i*.7}s`)).join('')+
 p('M16 38v5h36v-5','wi-fine')+arrow(65,32,12,0,'wi-fine')+rect(88,22,20,20)+motion(p('M93 37V27h9M93 32h7','wi-accent'),'breathe');
icons['birthday-paradox'] = Array.from({length:12},(_,i)=>{const x=19+(i%6)*16,y=16+Math.floor(i/6)*26;const match=i===2||i===9;return c(x,y,3,match?'wi-dot':'')+p(`M${x-5} ${y+12}q0-7 5-7t5 7`,'wi-fine');}).join('')+
 motion(p('M51 16Q78 16 67 42','wi-accent',{'stroke-dasharray':'2 3'}),'breathe');
icons['decibels'] = p('M12 26h9l11-9v30l-11-9h-9Z')+soft(26,32,10)+
 [0,-1.13,-2.26].map(delay=>motion(p('M43 20q12 12 0 24','wi-accent'),'wave',`--dx:51px;--delay:${delay}s`)).join('');
icons['materials-arrangement'] = [0,1,2].map(row=>[0,1,2].map(col=>{const x=20+col*12,y=19+row*12;return c(x,y,2,'wi-dot')+p(`M${x} ${y}h${col<2?12:0}M${x} ${y}v${row<2?12:0}`,'wi-fine');}).join('')).join('')+
 p('M60 12v40','wi-fine')+[[77,20],[95,16],[84,34],[103,31],[75,47],[98,47]].map(([x,y],i)=>motion(c(x,y,2,'wi-dot'),'slide',`--dx:${i%2?1:-1}px;--dy:1px;--delay:${-i*.4}s`)).join('');
icons['double-slit'] = p('M47 9v15M47 29v6M47 40v15M105 9v46')+
 [18,31,44].map((y,i)=>motion(p(`M14 ${y}h20`,'wi-accent'),'slide',`--dx:7px;--delay:${-i*.4}s`)).join('')+
 [0,-1.7].map(delay=>motion(p('M54 20q12 6 0 12M54 33q12 6 0 12','wi-accent'),'wave',`--dx:40px;--delay:${delay}s`)).join('')+
 p('M108 17v5M108 28v8M108 43v5','wi-accent');
icons['hot-car-flush'] = car(39,29)+p('M14 17h25M83 17h23','wi-fine')+
 [15,30,45].map((y,i)=>motion(arrow(7,y,23,0),'slide',`--dx:4px;--delay:${-i*.5}s`)).join('')+
 [15,30,45].map((y,i)=>motion(wave(83,y,3,3),'slide',`--dx:5px;--delay:${-i*.5}s`)).join('');
icons['night-sky-ice'] = p('M10 43h100M27 44v9h66v-9')+rect(28,44,64,8,'wi-soft')+
 c(94,14,7)+p('M96 7a7 7 0 0 0 0 14','wi-fine')+p('M22 10v6M19 13h6M62 7v4M60 9h4','wi-fine')+
 [37,53,69].map((x,i)=>motion(arrow(x,35,0,-13),'rise',`--dy:-4px;--delay:${-i*.6}s`)).join('');
icons['thermal-comfort-pmv'] = p('M14 50V12h92v38M14 50h92')+rect(22,18,16,22,'wi-soft')+rect(22,18,16,22,'wi-fine')+
 c(64,22,4)+p('M64 27v14M56 34l8-7 8 7M64 41l-7 9M64 41l7 9')+
 [0,-1.7].map(delay=>motion(p('M77 24q7 8 0 16','wi-accent'),'wave',`--dx:17px;--delay:${delay}s`)).join('');
icons['snells-law'] = rect(10,32,100,23,'wi-soft')+p('M10 32h100M60 9v46','wi-fine',{'stroke-dasharray':'2 3'})+
 p('M27 9L60 32L74 55','wi-accent')+particle('M27 9L60 32L74 55',1.8)+p('M56 22q-5 1-7 4M61 43q4 0 5-2','wi-fine');
const rocket = () => p('M46 36c0-15 7-25 14-29 7 4 14 14 14 29l-6 11H52ZM46 32l-7 10v9l13-5M74 32l7 10v9l-13-5')+c(60,24,4,'wi-accent')+rect(53,35,14,9,'wi-soft');
icons['rocket-equation'] = rocket()+[54,60,66].map((x,i)=>motion(p(`M${x} 49v7`,'wi-accent'),'rise',`--dy:5px;--delay:${-i*.7}s`)).join('');
icons['grid-voltage'] = p('M34 9l-18 46M34 9l18 46M22 39h24M26 28h16M30 18h8M12 20h44M15 30h38M13 20v5M54 20v5')+
 p('M56 20Q76 28 106 20M53 30Q76 38 106 30','wi-fine')+particle('M56 20Q76 28 106 20',1.7)+particle('M53 30Q76 38 106 30',1.7,'--delay:-1.7s');
icons['earth-temperature'] = globe(60,33,18)+
 [0,-1.7].map(delay=>motion(arrow(13,23,18,0),'slide',`--dx:5px;--delay:${delay}s`)).join('')+
 motion(wave(83,28,3,4)+wave(83,40,3,4),'slide','--dx:6px')+c(12,23,5,'wi-soft');
icons['earth-black-hole'] = globe(28,32,18)+arrow(55,32,14,0,'wi-fine')+
 motion(e(93,32,18,9,'wi-accent')+e(93,32,12,17,'wi-fine'),'spin','transform-origin:93px 32px;--duration:12s')+c(93,32,4,'wi-dot');
icons['bayes-theorem'] = Array.from({length:16},(_,i)=>c(16+(i%4)*9,18+Math.floor(i/4)*9,2,i===5?'wi-dot':'wi-fine')).join('')+
 arrow(57,32,13,0,'wi-fine')+c(91,32,17)+soft(91,32,17)+motion(p('M83 32l5 5 12-13','wi-accent'),'breathe');
icons['square-wave'] = axes()+p('M18 43V20h21v23h21V20h21v23h20','wi-fine')+
 draw('M18 43c5 0 5-29 10-29s5 9 11 9 5-6 10-6 6 32 11 32 6-31 11-31 5 5 10 5 5-7 10-7 6 27 10 27');
icons['escape-velocity'] = globe(26,41,15)+p('M36 31Q64 1 105 12','wi-fine',{'stroke-dasharray':'2 3'})+
 particle('M36 31Q64 1 105 12',2.3)+p('M36 31Q61 11 66 35','wi-accent wi-fine')+
 particle('M36 31Q61 11 66 35',1.5,'--delay:-1.7s');
icons['half-life'] = Array.from({length:20},(_,i)=>{const x=17+(i%5)*7,y=18+Math.floor(i/5)*9;return c(x,y,1.8,i<10?'wi-dot':'wi-fine');}).join('')+
 arrow(57,32,10,0,'wi-fine')+Array.from({length:10},(_,i)=>motion(c(80+(i%3)*10,16+Math.floor(i/3)*9,2,'wi-dot'),'breathe',`--delay:${-i*.24}s`)).join('');
icons['doppler-shift'] = motion(c(51,32,4,'wi-dot')+soft(51,32,8),'slide','--dx:7px')+
 [16,29,43].map((r,i)=>motion(e(51+i*4,32,r,r*.6,'wi-accent'),'breathe',`--delay:${-i*.6}s`)).join('')+arrow(90,32,14,0,'wi-fine');
icons['starlight-spectrum'] = c(24,23,11)+soft(24,23,11)+p('M24 7v-4M8 23H4M40 23h4M24 39v4','wi-fine')+
 particle('M39 23H106',1.7)+rect(48,39,59,11,'wi-soft')+
 [55,67,83,97].map((x,i)=>motion(p(`M${x} 40v9`,'wi-accent'),'breathe',`--delay:${-i*.4}s`)).join('');
icons['newtons-cannonball'] = globe(57,34,16)+e(57,34,39,24,'wi-fine')+
 particle('M57 10A39 24 0 1 1 18 34A39 24 0 0 1 57 10Z',2.2)+p('M53 17v-7h8','wi-accent');
icons['coriolis-effect'] = e(58,34,42,20)+p('M16 34h84M58 14v40','wi-fine')+
 p('M23 36Q54 9 93 27','wi-accent')+particle('M23 36Q54 9 93 27',2)+arrow(45,59,23,0,'wi-fine');
icons['mission-trajectories'] = c(39,32,4,'wi-dot')+soft(39,32,8)+e(39,32,19,13,'wi-fine')+e(39,32,34,23,'wi-fine')+
 p('M45 27C74 1 57 55 91 38Q103 32 112 10','wi-accent')+particle('M45 27C74 1 57 55 91 38Q103 32 112 10',2.2)+c(87,36,5);
icons['capillary-rise'] = p('M20 28v26h80V28M50 9v40M70 9v40')+rect(21,37,78,16,'wi-soft')+
 p('M21 37h28M71 37h28M50 21q10 6 20 0','wi-accent')+p('M51 22q9 5 18 0v29H51Z','wi-soft')+
 particle('M60 48V26',1.5)+arrow(84,33,0,-13,'wi-accent');
icons['pendulum-period'] = p('M27 9h66')+p('M60 10v38','wi-fine',{'stroke-dasharray':'2 3'})+
 motion(p('M60 10v37')+soft(60,49,7)+c(60,49,5,'wi-accent'),'swing','transform-origin:60px 10px;--duration:3.4s')+
 p('M31 43q29 22 58 0','wi-fine');
icons['terminal-velocity'] = p('M37 21Q60-1 83 21ZM37 21l17 20M83 21L66 41M60 9v32')+
 c(60,44,3)+p('M60 47v7M55 50l5-3 5 3')+soft(60,17,9)+
 [24,95].map(x=>motion(p(`M${x} 49v-9M${x-3} 43l3-3 3 3`,'wi-accent'),'rise','--dy:-5px')).join('');
icons['ocean-salt'] = wave(10,27,16,3)+wave(10,35,16,3)+rect(12,38,96,16,'wi-soft')+
 [28,45,64,83,99].map((x,i)=>motion(rect(x,45,3,3,'wi-accent'),'slide',`--dy:2px;--dx:${i%2?2:-2}px;--delay:${-i*.6}s`)).join('')+
 p('M21 14h78','wi-fine');
icons['ten-metre-ceiling'] = p('M27 23v31h40V23M42 44V10h12v34')+rect(28,40,38,13,'wi-soft')+
 p('M43 24h10v26H43Z','wi-soft')+p('M43 23h10','wi-accent')+arrow(85,45,0,-29)+p('M78 11h15','wi-fine')+
 particle('M48 48V25',1.6);
icons['coffee-cooling'] = cup(35,29)+p('M29 55h39','wi-fine')+
 [42,50,58].map((x,i)=>motion(p(`M${x} 22q-3-3 0-6`,'wi-accent'),'rise',`--dy:-5px;--delay:${-i*.7}s`)).join('')+
 p('M84 13h16v17H84ZM85 17h14','wi-fine')+motion(c(92,36,1.7,'wi-dot'),'drip','--dy:11px');
icons['resonance'] = p('M16 9h88M32 9v10l-5 4 10 5-10 5 10 5-5 4v4')+
 motion(rect(24,43,16,12,'wi-soft')+rect(24,43,16,12),'slide','--dy:3px')+
 wave(52,32,8,14)+particle('M52 32Q60 18 68 32T84 32T100 32',1.8);
icons['guitar-string'] = p('M12 20v24M108 20v24M12 32h96','wi-fine')+
 motion(p('M12 32Q36 9 60 32T108 32','wi-accent'),'stretch','transform-origin:60px 32px;--sx:1;--sy:-1;--duration:1.8s')+
 c(12,32,2)+c(108,32,2);
icons['slinky-drop'] = p('M45 9h30')+
 motion(p('M60 10c-22 0-22 6 0 6s22 6 0 6-22 6 0 6 22 6 0 6-22 6 0 6 22 6 0 6-22 6 0 6','wi-accent'),'stretch','transform-origin:60px 52px;--sx:1;--sy:.65')+
 p('M42 56h36','wi-fine',{'stroke-dasharray':'2 3'});
icons['sky-blue'] = c(17,32,7)+soft(17,32,7)+p('M26 32h30','wi-fine')+c(61,32,3)+
 [15,32,49].map((y,i)=>{const d=`M64 32L104 ${y}`;return p(d,'wi-accent wi-fine')+particle(d,1.5,`--delay:${-i*.8}s`);}).join('');
icons['ship-buoyancy'] = motion(p('M27 31h66L82 46H40ZM48 31V17h23v14M55 17v-6h9v6')+p('M33 34h54L81 43H41Z','wi-soft'),'slide','--dy:2px')+
 wave(11,45,16,3)+arrow(61,55,0,-15)+p('M45 25h19','wi-fine');
icons['animal-biomass'] = p('M13 53h94','wi-fine')+
 [[20,18],[43,31],[66,43],[89,12]].map(([x,h],i)=>rect(x,53-h,12,h,'wi-soft')+
 motion(p(`M${x} 53v${-h}h12v${h}`,'wi-accent'),'stretch',`transform-origin:${x}px 53px;--sy:.92;--sx:1;--delay:${-i*.4}s`)).join('');
const bouncePath='M15 12Q25 12 33 51Q43 12 55 51Q65 29 77 51Q86 39 97 51';
icons['bounce-restitution'] = p('M10 54h99','wi-fine')+p(bouncePath,'wi-accent wi-fine')+particle(bouncePath,2.5);
icons['what-is-vacuum'] = p('M14 14v38h34V14M74 14v38h33V14M48 43h26v9H48')+
 rect(15,34,32,17,'wi-soft')+rect(75,26,31,25,'wi-soft')+p('M15 34h32M75 26h31','wi-accent')+
 [[24,22],[38,27],[28,29],[89,19]].map(([x,y],i)=>motion(c(x,y,1.4,'wi-dot'),'slide',`--dx:1px;--dy:-1px;--delay:${-i*.5}s`)).join('')+
 arrow(55,39,12,0);

const css = `
  /* BEGIN WAVE GEOMETRY ICONS — generated by scripts/build-tile-icons.cjs.
     Thin outlines + soft category fills. Motion illustrates mechanisms, not measurements. */
  .tile-icon{fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}
  .tile-icon .wi-fine{stroke-width:1;opacity:.45}
  .tile-icon .wi-accent{stroke:var(--accent)}
  .tile-icon .wi-soft{fill:var(--accent);fill-opacity:.13;stroke:none}
  .tile-icon .wi-tint{fill:var(--accent);fill-opacity:.13}
  .tile-icon .wi-dot{fill:var(--accent);stroke:none}
  .tile-icon .wi-surface{fill:var(--cat-bg,var(--bg))}
  .tile-icon .wi-motion{--duration:3.4s;--delay:0s;--dx:0px;--dy:0px;--sx:1;--sy:1}
  .tile-icon .wi-path{offset-distance:50%;offset-rotate:0deg}
  .tile-icon .wi-wave{transform:translateX(calc(var(--dx) * .5))}
  .tile-icon .wi-stone{transform:translateY(14px)}
  .tile-icon .wi-echo{transform:translateY(-18px)}
  .tile-icon .wi-echo2{transform:translateY(-9px);opacity:.6}
  .tile-icon .wi-splash{opacity:.4}
  .tile-icon .wi-draw{stroke-dasharray:1;stroke-dashoffset:0}
  .icon-motion-toggle{border:0;border-bottom:1px solid var(--line2);background:none;color:var(--muted2);padding:3px 0;font:12px ui-monospace,monospace;cursor:pointer}
  .icon-motion-toggle:hover{color:var(--accent);border-color:var(--accent)}
  @media(prefers-reduced-motion:no-preference){
    .tile-icon .wi-motion{animation-duration:var(--duration);animation-delay:var(--delay);animation-iteration-count:infinite;animation-timing-function:linear;animation-play-state:paused}
    .icon-playing .wi-motion{animation-play-state:running}
    .tile-icon .wi-slide{animation-name:wi-slide;animation-timing-function:ease-in-out}
    .tile-icon .wi-spin{animation-name:wi-spin}
    .tile-icon .wi-stretch{animation-name:wi-stretch;animation-timing-function:ease-in-out}
    .tile-icon .wi-breathe{animation-name:wi-breathe;animation-timing-function:ease-in-out}
    .tile-icon .wi-wave{animation-name:wi-wave}
    .tile-icon .wi-path{animation-name:wi-path}
    .tile-icon .wi-draw{animation-name:wi-draw}
    .tile-icon .wi-rise{animation-name:wi-rise}
    .tile-icon .wi-drip{animation-name:wi-drip}
    .tile-icon .wi-flash{animation-name:wi-flash}
    .tile-icon .wi-swing{animation-name:wi-swing;animation-timing-function:ease-in-out}
    .tile-icon .wi-stone{animation-name:wi-stone}
    .tile-icon .wi-splash{animation-name:wi-splash}
    .tile-icon .wi-echo{animation-name:wi-echo}
    .tile-icon .wi-echo2{animation-name:wi-echo2}
    /* Unseen and user-paused icons retain a meaningful static drawing. */
    :is(.tile,.atlas-spotlight):not(.icon-playing) .wi-motion{animation-name:none}
  }
  @keyframes wi-slide{0%,100%{transform:translate(0,0)}65%,80%{transform:translate(var(--dx),var(--dy))}}
  @keyframes wi-spin{to{transform:rotate(360deg)}}
  @keyframes wi-stretch{0%,100%{transform:scale(1)}50%{transform:scale(var(--sx),var(--sy))}}
  @keyframes wi-breathe{0%,100%{opacity:.35}60%{opacity:1}}
  @keyframes wi-wave{0%{transform:translate(0,0);opacity:0}12%{opacity:.8}80%{opacity:.8}100%{transform:translate(var(--dx),var(--dy));opacity:0}}
  @keyframes wi-path{from{offset-distance:0%}to{offset-distance:100%}}
  @keyframes wi-draw{0%,8%{stroke-dashoffset:1;opacity:.3}75%,90%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:.3}}
  @keyframes wi-rise{0%{transform:translate(0,0);opacity:0}25%{opacity:.8}100%{transform:translate(var(--dx),var(--dy));opacity:0}}
  @keyframes wi-drip{0%,15%{transform:translateY(0);opacity:0}25%{opacity:1}80%{transform:translateY(var(--dy));opacity:1}100%{transform:translateY(var(--dy));opacity:0}}
  @keyframes wi-flash{0%,12%{opacity:.25}18%,28%{opacity:1}35%,100%{opacity:.25}}
  @keyframes wi-swing{0%,100%{transform:rotate(-25deg)}50%{transform:rotate(25deg)}}
  @keyframes wi-stone{0%,8%{transform:translateY(0);opacity:1}20%{transform:translateY(1.5px);opacity:1}32%{transform:translateY(7px);opacity:1}44%{transform:translateY(17px);opacity:1}56%{transform:translateY(30px);opacity:1}58%,94%{transform:translateY(32px);opacity:0}100%{transform:translateY(0);opacity:1}}
  @keyframes wi-splash{0%,55%{transform:scale(.1);opacity:0}58%{opacity:.85}80%,100%{transform:scale(1);opacity:0}}
  @keyframes wi-echo{0%,57%{transform:translateY(0);opacity:0}60%{opacity:.8}83%{transform:translateY(-28px);opacity:.8}88%,100%{transform:translateY(-32px);opacity:0}}
  @keyframes wi-echo2{0%,63%{transform:translateY(0);opacity:0}66%{opacity:.55}89%{transform:translateY(-28px);opacity:.55}94%,100%{transform:translateY(-32px);opacity:0}}
  @media print{.tile-icon .wi-motion{animation:none!important}.icon-motion-toggle{display:none}}
  /* END WAVE GEOMETRY ICONS */
`;

const runtime = `
  // BEGIN WAVE GEOMETRY RUNTIME — generated by scripts/build-tile-icons.cjs.
  var iconCards = Array.prototype.slice.call(document.querySelectorAll('.tile[href^="visualizations/"],.atlas-spotlight[href^="visualizations/"]'));
  var SVG_NS = 'http://www.w3.org/2000/svg';
  iconCards.forEach(function(card){
    var slug = card.getAttribute('href').split('/').pop().replace(/\\.html$/, '');
    if(!ICONS[slug]) return;
    var icon = document.createElementNS(SVG_NS, 'svg');
    icon.setAttribute('class', 'tile-icon');
    icon.setAttribute('viewBox', '0 0 120 64');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');
    icon.setAttribute('preserveAspectRatio', 'xMinYMid meet');
    icon.innerHTML = ICONS[slug];
    card.insertBefore(icon, card.firstChild);
  });
  var iconReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var iconMotionPaused = false;
  try{ iconMotionPaused = localStorage.getItem('tile-icons-paused') === 'true'; }catch(e){}
  var visibleIconCards = new Set();
  var iconToggle = document.getElementById('iconMotionToggle');
  function refreshIconMotion(){
    var animate = !iconMotionPaused && !iconReducedMotion.matches && !document.hidden;
    iconCards.forEach(function(card){ card.classList.toggle('icon-playing', animate && visibleIconCards.has(card)); });
    if(iconToggle){
      iconToggle.hidden = iconReducedMotion.matches;
      iconToggle.textContent = iconMotionPaused ? 'Play icons' : 'Pause icons';
      iconToggle.setAttribute('aria-pressed', String(iconMotionPaused));
    }
  }
  if('IntersectionObserver' in window){
    var iconObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) visibleIconCards.add(entry.target);
        else visibleIconCards.delete(entry.target);
      });
      refreshIconMotion();
    }, {threshold:0.1});
    iconCards.forEach(function(card){ iconObserver.observe(card); });
  }
  if(iconToggle) iconToggle.addEventListener('click', function(){
    iconMotionPaused = !iconMotionPaused;
    try{ localStorage.setItem('tile-icons-paused', String(iconMotionPaused)); }catch(e){}
    refreshIconMotion();
  });
  iconReducedMotion.addEventListener('change', refreshIconMotion);
  document.addEventListener('visibilitychange', refreshIconMotion);
  refreshIconMotion();
  // END WAVE GEOMETRY RUNTIME
`;

function embed(filename){
  const file = path.join(root,filename);
  let html = fs.readFileSync(file,'utf8');
  const slugs = [...new Set([...html.matchAll(/<a class="(?:tile(?: [^"]*)?|atlas-spotlight)"[^>]*href="visualizations\/([^"/]+)\.html"/g)].map(m=>m[1]))];
  for(const slug of slugs) if(!icons[slug]) throw Error(`${filename}: missing artwork for ${slug}`);
  // Remove superseded sprites and hover-only animation systems on the first run.
  html = html.replace(/  <svg class="icon-sprite"[\s\S]*?<\/svg>\s*/, '');
  html = html.replace(/  \/\* Animated icons \(the featured five\)[\s\S]*?(?=  \/\* Description tooltip)/, '');
  html = html.replace(/^  \.tile-icon use[^\n]*\n|^  \.icon-sprite[^\n]*\n/gm,'');
  html = html.replaceAll('shared icon sprite','inline tile artwork');
  if(html.includes('/* BEGIN WAVE GEOMETRY ICONS')){
    html = html.replace(/\n\s*\/\* BEGIN WAVE GEOMETRY ICONS[\s\S]*?\/\* END WAVE GEOMETRY ICONS \*\/\s*(?=<\/style>)/,()=>css+'\n');
  }else{
    html = html.replace('</style>',css+'\n</style>');
  }
  // The markers make regeneration idempotent. Only include artwork this page uses.
  const definitions = '  // BEGIN WAVE GEOMETRY ARTWORK\n  var ICONS = '+JSON.stringify(Object.fromEntries(slugs.map(slug=>[slug,icons[slug]])),null,2)+';\n  // END WAVE GEOMETRY ARTWORK\n';
  if(html.includes('// BEGIN WAVE GEOMETRY ARTWORK')){
    html = html.replace(/  \/\/ BEGIN WAVE GEOMETRY ARTWORK[\s\S]*?  \/\/ END WAVE GEOMETRY RUNTIME\n/,()=>definitions+runtime);
  }else{
    html = html.replace(/  \/\/ Tile icons\. Each is inline SVG[\s\S]*?(?=  var search =)/,()=>definitions+runtime+'\n');
    if(!html.includes('// BEGIN WAVE GEOMETRY ARTWORK')){
      html = html.replace(/  var SVG_NS = [\s\S]*?(?=  var search =)/,()=>definitions+runtime+'\n');
    }
  }
  if(!html.includes('id="iconMotionToggle"')) html=html.replace(/(<span class="results-count" id="resultsCount")/, '<button class="icon-motion-toggle" id="iconMotionToggle" type="button" aria-pressed="false">Pause icons</button>\n      $1');
  if(!html.includes('// BEGIN WAVE GEOMETRY RUNTIME')) throw Error(`${filename}: runtime insertion failed`);
  fs.writeFileSync(file,html);
  console.log(`${filename}: ${slugs.length} unique animated icons`);
}

if(require.main===module) ['index.html','unreviewed.html'].forEach(embed);
module.exports = {icons,css,runtime};
