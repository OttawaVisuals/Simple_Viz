import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {generateRound,grade,canAnswer,availableTypes,modeNames,growth,pinDistance,cityPoint,relativeGap,numericCalibration,roundDifficulty,separate,formatValue} from '../lib/game.ts';
const data=JSON.parse(readFileSync('public/data/countries.json','utf8'));
assert.equal(Object.keys(data.metrics).length,21);assert.equal(data.globalCities.length,6172);assert.equal(data.globalCities.filter(c=>c.population>=1e6).length,511);
const c=id=>data.countries.find(c=>c.id===id),cuts=numericCalibration(data,'population');
assert.equal(roundDifficulty(relativeGap(c('USA').population,c('FIN').population),cuts),'easy');assert.equal(roundDifficulty(relativeGap(c('FRA').population,c('DEU').population),cuts),'hard');
let checked=0;
for(const metric of Object.keys(data.metrics))for(const type of availableTypes(metric).filter(t=>['compare','rank','insert','gap'].includes(t))){
 const scores={easy:[],medium:[],hard:[]};
 for(const difficulty of ['easy','medium','hard'])for(let i=0;i<8;i++){
  const r=generateRound(data,metric,undefined,false,type,{difficulty});assert.equal(r.metric,metric);assert.equal(r.difficulty,difficulty);assert.equal(roundDifficulty(r.gapScore,r.cuts),difficulty);scores[difficulty].push(r.gapScore);
  const all=[...r.countries,...(r.target?[r.target]:[])];assert.equal(new Set(all.map(c=>c.id)).size,all.length);for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++)assert.ok(separate(all[a],all[b],metric));
  let selection=null,a={},order=r.countries;
  if(type==='compare')selection=r.countries[0][metric]>r.countries[1][metric]?0:1;
  if(type==='rank'){assert.equal(r.countries.length,3);order=[...r.countries].sort((a,b)=>b[metric]-a[metric]);a={ranking:order.map(c=>c.id)};assert.equal(canAnswer(r,null,{}),false);assert.equal(canAnswer(r,null,{ranking:[order[0].id,order[0].id,order[1].id]}),false);assert.equal(grade(r,null,order,{ranking:[...a.ranking].reverse()}),false)}
  if(type==='insert')selection=r.countries.filter(c=>c[metric]>r.target[metric]).length;
  if(type==='gap'){a={choice:r.answer};const ratio=r.countries[0][metric]/r.countries[1][metric];assert.equal(r.options[r.answer],r.options.reduce((a,b)=>Math.abs(a-ratio)<Math.abs(b-ratio)?a:b))}
  assert.ok(grade(r,selection,order,a));checked++;
 }
 assert.ok(Math.min(...scores.easy)>=Math.max(...scores.hard),metric+'/'+type);
}
for(const difficulty of ['easy','medium','hard'])for(const cityMinimum of [1e5,1e6])for(let i=0;i<30;i++){
 const r=generateRound(data,'all',undefined,false,'topfive',{difficulty,cityMinimum});assert.equal(r.cities.length,3);assert.equal(new Set(r.cities.map(c=>c.country)).size,3);assert.ok(r.cities.every(c=>c.population>=cityMinimum&&c.countryName));assert.equal(r.difficulty,difficulty);
 assert.equal(canAnswer(r,null,{cities:['','','']}),false);assert.equal(canAnswer(r,null,{cities:[r.cities[0].id,r.cities[0].id,r.cities[1].id]}),false);
 const ids=[...r.cities].sort((a,b)=>b.population-a.population).map(c=>c.id);assert.ok(grade(r,null,[],{cities:ids}));assert.equal(grade(r,null,[],{cities:[...ids].reverse()}),false);
 const pin=generateRound(data,'all',undefined,false,'pin',{difficulty,cityMinimum});assert.ok(pinDistance(pin,cityPoint(pin.city))<1e-8);assert.ok(grade(pin,null,[],{pin:cityPoint(pin.city)}));assert.equal(pin.tolerance,difficulty==='easy'?700:difficulty==='medium'?350:150);checked+=2;
}
for(const m of Object.keys(data.metrics))if(availableTypes(m).includes('estimate'))for(const difficulty of ['easy','medium','hard']){
 const r=generateRound(data,m,undefined,false,'estimate',{difficulty}),value=r.countries[0][m];assert.ok(value>=r.estimateRange.min&&value<=r.estimateRange.max,m);assert.ok(grade(r,null,r.countries,{estimate:value}));assert.equal(canAnswer(r,null,{}),false);checked++;
}
for(const difficulty of ['easy','medium','hard'])for(let i=0;i<10;i++){const r=generateRound(data,'population',undefined,false,'history',{difficulty});let choice=growth(r.countries[0])>growth(r.countries[1])?0:1;assert.ok(grade(r,null,r.countries,{choice}));checked++}
assert.ok(data.countries.filter(c=>c.doctorates!=null).length===29);assert.equal(c('USA').doctorates,null);assert.ok(data.metrics.heightMale.year.includes('1996'));assert.ok(data.metrics.renewable.year==='2021');
console.log('PASS',checked,'rounds: all21measures, all9styles,3difficultytiers,2citypools, correct3-countrycitypodiums, pinprojection, grading and US/Finland vsFrance/Germany ordering.');console.log('Population pair cutoffs:',cuts.map(n=>(n*100).toFixed(1)+'%').join(', '));
