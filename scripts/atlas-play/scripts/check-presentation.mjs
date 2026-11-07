import assert from 'node:assert/strict';
import {clampView,zoomView,fitMapBounds,questionTitle} from '../lib/presentation.ts';
const world=[0,0,720,360];
assert.deepEqual(zoomView(world,.5),[180,90,360,180]);
assert.deepEqual(zoomView([180,90,360,180],2),world);
const cursor=[400,120],before=[180,90,360,180],after=zoomView(before,.5,cursor);
assert.equal((cursor[0]-before[0])/before[2],(cursor[0]-after[0])/after[2]);
assert.equal((cursor[1]-before[1])/before[3],(cursor[1]-after[1])/after[3]);
assert.deepEqual(clampView(-90,900,1),[0,354.375,11.25,5.625]);
const europe={x:375,y:65,width:25,height:25};const fit=fitMapBounds(europe);
assert.ok(fit[2]<100);assert.ok(fit[0]<=europe.x&&fit[1]<=europe.y);assert.ok(fit[0]+fit[2]>=europe.x+europe.width&&fit[1]+fit[3]>=europe.y+europe.height);
for(const box of [{x:0,y:0,width:720,height:360},{x:719,y:359,width:0,height:0},{x:0,y:0,width:0,height:0}]){const v=fitMapBounds(box);assert.ok(v[0]<=box.x&&v[1]<=box.y);assert.ok(v[0]+v[2]>=box.x+box.width&&v[1]+v[3]>=box.y+box.height)}
const base={type:'estimate',metric:'renewable',countries:[{name:'Norway'}]};assert.equal(questionTitle(base),'What percentage of Norway’s electricity comes from renewables?');
for(const metric of ['life','happiness','forest','renewable','internet','hdi','heightMale','heightFemale','doctorates','calories','alcohol']){const title=questionTitle({...base,metric});assert.ok(title.includes('Norway')&&title.endsWith('?'));assert.ok(!title.includes('Make an estimate'))}
assert.equal(questionTitle({type:'exception',countries:[],target:{name:'Austria'}}),'Which country does NOT border Austria?');
console.log('PASS presentation: zoom anchoring, limits, regional fit, edge points and explicit estimate questions.');
