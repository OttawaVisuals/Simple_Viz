import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {closestIndex,generateRound,grade,canAnswer,availableTypes,trailTypes,modeNames,growth,pinDistance,cityPoint,relativeGap,numericCalibration,roundDifficulty,separate,formatValue,scoreAnswer,awardPoints,seededRandom,cityPool,capitalOf,answerSummary,explanation,roundSource,metricWeights,normalizeDataset} from '../lib/game.ts';
import {questionTitle} from '../lib/presentation.ts';
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
  if(type==='insert'){const gaps=r.countries.map(c=>Math.abs(c[metric]-r.target[metric])/Math.max(Math.abs(c[metric]),Math.abs(r.target[metric]))),s=[...gaps].sort((a,b)=>a-b);assert.ok(s[1]-s[0]>=.05);selection=gaps.indexOf(s[0]);assert.equal(selection,closestIndex(r))}
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
assert.ok(data.countries.filter(c=>c.doctorates!=null).length===30);assert.equal(c('USA').doctorates,null);assert.ok(data.metrics.heightMale.year.includes('1996'));assert.ok(data.metrics.renewable.year==='2021');
console.log('PASS',checked,'rounds: all21measures, base9styles + language checks,3difficultytiers,2citypools, correct3-countrycitypodiums, pinprojection, grading and US/Finland vsFrance/Germany ordering.');console.log('Population pair cutoffs:',cuts.map(n=>(n*100).toFixed(1)+'%').join(', '));

// ---- 13 Nov 2026: wider country set, fair ratio options, new styles, graded scoring ----
assert.equal(data.countries.length,89);const regions={};for(const x of data.countries)regions[x.region]=(regions[x.region]||0)+1;assert.ok(regions.Europe/89<.35&&regions.Africa>=15&&regions.Asia>=20);
assert.equal(Object.keys(modeNames).length,13);assert.equal(trailTypes('all').length,12);assert.ok(!trailTypes('all').includes('history'));
for(const m of Object.keys(data.metrics))assert.ok(metricWeights[m]>0,m);
// Ratio questions: the right answer must not sit in a predictable place among the four options.
const places={};for(let i=0;i<400;i++){const r=generateRound(data,'all',undefined,false,'gap',{difficulty:'medium'}),sorted=[...r.options].sort((a,b)=>a-b),k=sorted.indexOf(r.options[r.answer]);places[k]=(places[k]||0)+1;assert.equal(new Set(r.options).size,4)}
assert.equal(Object.keys(places).length,4);assert.ok(Math.max(...Object.values(places))<400*.5,'ratio answer position is predictable: '+JSON.stringify(places));
// Familiar measures appear more often than niche ones.
const mix={};for(let i=0;i<3000;i++){const r=generateRound(data,'all',undefined,false,'compare',{difficulty:'medium'});mix[r.metric]=(mix[r.metric]||0)+1}
assert.ok(mix.population+mix.area>3*(mix.mobileTraffic+mix.fixedTraffic+mix.internetTraffic));
// Borders: the exception never touches the target, the other three do.
for(const difficulty of ['easy','medium','hard'])for(let i=0;i<60;i++){const r=generateRound(data,'all',undefined,false,'exception',{difficulty});assert.equal(r.countries.length,4);assert.equal(new Set(r.countries.map(x=>x.id)).size,4);r.countries.forEach((x,k)=>assert.equal(r.target.borders.includes(x.id),k!==r.answer));assert.ok(grade(r,null,[],{choice:r.answer}));checked++}
// City pools: names are common English names, and no country floods the pool.
normalizeDataset(data);assert.ok(data.globalCities.every(x=>!/\(/.test(x.name)&&!/\(|, /.test(x.countryName)));assert.ok(data.globalCities.some(x=>x.name==='Riyadh'&&x.unName.includes('Riyāḑ')));
for(const difficulty of ['easy','medium','hard']){const pool=cityPool(data,difficulty,1e6),per={};for(const x of pool)per[x.country]=(per[x.country]||0)+1;assert.ok(pool.length>=60,difficulty+pool.length);assert.ok(Math.max(...Object.values(per))<=(difficulty==='hard'?10:4),difficulty)}
// Flag, capital and city-to-country questions.
for(const type of ['flag','capital','whereis'])for(const difficulty of ['easy','medium','hard'])for(let i=0;i<60;i++){
 const r=generateRound(data,'all',undefined,false,type,{difficulty});assert.equal(r.choices.length,4);assert.equal(new Set(r.choices.map(x=>x.id)).size,4);assert.equal(new Set(r.choices.map(x=>x.label)).size,4);
 assert.equal(canAnswer(r,null,{}),false);assert.equal(canAnswer(r,null,{choice:4}),false);assert.ok(grade(r,null,[],{choice:r.answer}));assert.equal(grade(r,null,[],{choice:(r.answer+1)%4}),false);
 if(type==='flag')assert.equal(r.choices[r.answer].id,r.target.id);
 if(type==='capital'){assert.equal(r.choices[r.answer].id,capitalOf(data,r.target.id).id);assert.equal(r.city.country,r.target.id)}
 if(type==='whereis'){assert.equal(r.city.country,r.target.id);assert.equal(r.choices[r.answer].id,r.target.id);assert.ok(!r.city.name.toLowerCase().includes(r.target.name.toLowerCase()))}
 assert.ok(questionTitle(r).endsWith('?'));assert.ok(answerSummary(r));assert.ok(explanation(r,{choice:r.answer}));assert.ok(roundSource(data,r).url.startsWith('https://'));checked++;
}
assert.equal(capitalOf(data,'TUR').name,'Ankara');assert.equal(capitalOf(data,'IND').name,'New Delhi');assert.equal(capitalOf(data,'ZAF'),undefined);
// Graded scoring.
{const r=generateRound(data,'population',undefined,false,'rank',{difficulty:'easy'}),right=[...r.countries].sort((a,b)=>b.population-a.population).map(x=>x.id);
 assert.deepEqual(scoreAnswer(r,null,[],{ranking:right}),{fraction:1,correct:true});assert.equal(scoreAnswer(r,null,[],{ranking:[right[1],right[0],right[2]]}).fraction,.5);assert.equal(scoreAnswer(r,null,[],{ranking:[...right].reverse()}).fraction,0);assert.equal(scoreAnswer(r,null,[],{}).fraction,0);
 const pin=generateRound(data,'all',undefined,false,'pin',{difficulty:'medium'}),p=cityPoint(pin.city);assert.ok(scoreAnswer(pin,null,[],{pin:p}).fraction>.999999);const far=scoreAnswer(pin,null,[],{pin:[p[0],Math.max(0,p[1]-12)]});assert.ok(far.fraction<1&&!far.correct||far.correct);
 const e=generateRound(data,'life',undefined,false,'estimate',{difficulty:'medium'}),v=e.countries[0].life;assert.equal(scoreAnswer(e,null,[],{estimate:v}).fraction,1);const near=scoreAnswer(e,null,[],{estimate:v+e.tolerance*2});assert.ok(!near.correct&&near.fraction>0&&near.fraction<.5);assert.equal(scoreAnswer(e,null,[],{estimate:v+e.tolerance*4}).fraction,0);
 const ins=generateRound(data,'area',undefined,false,'insert',{difficulty:'easy'}),spot=closestIndex(ins);assert.equal(scoreAnswer(ins,spot,[],{}).fraction,1);const other=ins.countries.map((_,i)=>i).filter(i=>i!==spot).map(i=>({i,g:Math.abs(ins.countries[i].area-ins.target.area)/Math.max(ins.countries[i].area,ins.target.area)})).sort((a,b)=>a.g-b.g);assert.equal(scoreAnswer(ins,other[0].i,[],{}).fraction,.4);assert.equal(scoreAnswer(ins,other[2].i,[],{}).fraction,0);
 assert.deepEqual(awardPoints({fraction:1,correct:true},'hard',3,5),{base:200,streak:30,speed:50,total:280});assert.deepEqual(awardPoints({fraction:.5,correct:false},'medium',9,1),{base:75,streak:0,speed:0,total:75});assert.equal(awardPoints({fraction:1,correct:true},'easy',0).total,100);assert.equal(awardPoints({fraction:1,correct:true},'easy',0,30).speed,0)}
// Daily trail: the same seed gives the same ten questions.
const daily=seed=>{const rng=seededRandom(seed);return trailTypes('all').slice(0,10).map(type=>{const r=generateRound(data,'all',undefined,false,type,{difficulty:'medium',rng,mixed:true});return questionTitle(r)+'|'+answerSummary(r)+'|'+(r.countries||[]).map(x=>x.id).join(',')+(r.choices||[]).map(x=>x.id).join(',')}).join('\n')};
assert.equal(daily('2026-11-13'),daily('2026-11-13'));assert.notEqual(daily('2026-11-13'),daily('2026-11-14'));
console.log('PASS',checked,'rounds incl. 89 countries, fair ratio options, weighted measures, border exceptions, flags/capitals/city-to-country, graded scoring and seeded daily trails.');
