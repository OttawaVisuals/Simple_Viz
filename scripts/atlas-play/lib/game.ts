import {generateLanguageRound,languageSource,formatSpeakers,type LanguageChallenge} from './languages.ts';
export type Metric='population'|'area'|'life'|'happiness'|'density'|'forest'|'renewable'|'internet'|'gdp'|'co2'|'hdi'|'heightMale'|'heightFemale'|'doctorates'|'mobileTraffic'|'fixedTraffic'|'internetTraffic'|'calories'|'alcohol'|'patents'|'cattle';
export type Kind='compare'|'insert'|'rank'|'topfive'|'gap'|'exception'|'pin'|'estimate'|'history'|'languages'|'flag'|'capital'|'whereis';
export type Difficulty='easy'|'medium'|'hard';
export type Random=()=>number;
export type Options={difficulty?:Difficulty;cityMinimum?:number;rng?:Random;mixed?:boolean};
export type Country={id:string;name:string;shape:string;population:number;area:number;life:number;happiness:number|null;happyLow:number|null;happyHigh:number|null;doctorateLow?:number|null;doctorateHigh?:number|null;location:[number,number];worldPath:string;projection:{cos:number;scale:number;left:number;top:number};borders:string[];region:string;history:[number,number][]}&Partial<Record<Exclude<Metric,'population'|'area'|'life'|'happiness'>,number|null>>;
export type City={id:string;name:string;country:string;countryName?:string;population:number;lon:number;lat:number;point?:[number,number];capital?:boolean;year?:number;unName?:string;rank?:number};
export type Source={label:string;unit?:string;source:string;year:string;url:string;definition:string;group?:string;coverage?:number;precision?:number};
export type Dataset={countries:Country[];cities:City[];globalCities:City[];citySource:Source;metrics:Record<Metric,Source>;sources:Source[];unavailableTopics?:unknown[];normalized?:boolean};
/** One multiple-choice option. `code` is an ISO3 country code when a flag should be drawn. */
export type Choice={id:string;label:string;code?:string;sub?:string};
export type Round={type:Kind;metric:Metric;countries:Country[];target?:Country;city?:City;cities?:City[];options?:number[];choices?:Choice[];answer?:number;difficulty?:Difficulty;gapScore?:number;cuts?:[number,number];tolerance?:number;mapWorld?:boolean;estimateRange?:{min:number;max:number;step:number};cityMinimum?:number;language?:LanguageChallenge};
export type ExtraAnswer={cities?:string[];ranking?:string[];choice?:number;estimate?:number;pin?:[number,number]};
export const modeNames:Record<Kind,string>={compare:'Compare',insert:'Closest',rank:'Rank',topfive:'World cities',gap:'Guess the gap',exception:'Odd one out',pin:'Pin the city',estimate:'Estimate',history:'Then vs now',languages:'Languages',flag:'Flags',capital:'Capitals',whereis:'City to country'};
export const choiceKinds:Kind[]=['flag','capital','whereis'];
export const shuffle=<T,>(arr:T[],rng:Random=Math.random):T[]=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/** Deterministic generator for the daily trail: same text, same sequence. */
export function seededRandom(text:string):Random{
 let h=1779033703^text.length;for(let i=0;i<text.length;i++){h=Math.imul(h^text.charCodeAt(i),3432918353);h=h<<13|h>>>19}
 let s=h>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
}
const ratioMetrics:Metric[]=['population','area','density','gdp','co2','mobileTraffic','fixedTraffic','internetTraffic','patents','cattle'];
const estimateMetrics:Metric[]=['life','happiness','forest','renewable','internet','hdi','heightMale','heightFemale','doctorates','calories','alcohol'];
/** How often a measure appears when the player has not chosen one. Familiar measures lead; the three traffic and two height series no longer crowd the mix. */
export const metricWeights:Record<Metric,number>={population:4,area:4,life:3,gdp:3,density:2,happiness:2,forest:2,internet:2,co2:2,hdi:2,renewable:2,alcohol:1.5,calories:1,cattle:1,patents:1,heightMale:.75,heightFemale:.75,doctorates:.5,mobileTraffic:.5,internetTraffic:.5,fixedTraffic:.25};
function weighted<T,>(items:T[],weight:(item:T)=>number,rng:Random):T{const total=items.reduce((n,i)=>n+weight(i),0);let at=rng()*total;for(const i of items){at-=weight(i);if(at<=0)return i}return items[items.length-1]}
const pickMetric=(metrics:Metric[],rng:Random)=>weighted(metrics,m=>metricWeights[m]??1,rng);
export function availableTypes(filter:Metric|'all'):Kind[]{if(filter==='all')return Object.keys(modeNames) as Kind[];return ['compare','insert','rank',...(ratioMetrics.includes(filter)?['gap']:[]),...(estimateMetrics.includes(filter)?['estimate']:[]),...(filter==='population'?['topfive','history']:[])] as Kind[]}
/** Styles that take a slot in a mixed run. "Then vs now" is a two-country pick like Compare, so it shares Compare's slot. */
export function trailTypes(filter:Metric|'all'):Kind[]{return availableTypes(filter).filter(t=>filter!=='all'||t!=='history')}
export function relativeGap(a:number,b:number){const denominator=Math.max(Math.abs(a),Math.abs(b));return denominator===0?0:Math.abs(a-b)/denominator}
const numericFormats=[0,1,2,3].map(d=>new Intl.NumberFormat("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}));
export function formatValue(v:number,m:Metric):string{
 const n=(digits:number)=>numericFormats[digits].format(v);
 if(m==='population')return v>=1e9?(v/1e9).toFixed(2)+' billion':v>=1e6?(v/1e6).toFixed(2)+' million':Math.round(v).toLocaleString('en-US');
 if(m==='area')return n(0)+' km²';if(m==='life')return n(1)+' yrs';if(m==='happiness')return n(3)+' / 10';
 if(['forest','renewable','internet','doctorates'].includes(m))return n(1)+'%';
 if(m==='density')return n(1)+' / km²';if(m==='gdp')return 'Int$ '+n(0);if(m==='co2')return n(2)+' t / person';if(m==='hdi')return n(3);
 if(m==='heightMale'||m==='heightFemale')return n(1)+' cm';if(m.includes('Traffic'))return n(1)+' GB / person';
 if(m==='calories')return n(0)+' kcal / day';if(m==='alcohol')return n(1)+' L / adult';if(m==='patents')return n(1)+' / million';if(m==='cattle')return n(2)+' cattle / person';return n(1)
}
export function separate(a:Country,b:Country,m:Metric){
 const x=a[m],y=b[m];if(x==null||y==null||!Number.isFinite(x)||!Number.isFinite(y)||x===y||formatValue(x,m)===formatValue(y,m))return false;
 if(m==='doctorates')return Math.abs(x-y)>=.1-1e-9&&a.doctorateLow!=null&&a.doctorateHigh!=null&&b.doctorateLow!=null&&b.doctorateHigh!=null&&(a.doctorateLow>b.doctorateHigh||b.doctorateLow>a.doctorateHigh);
 if(m==='happiness')return a.happyLow!==null&&a.happyHigh!==null&&b.happyLow!==null&&b.happyHigh!==null&&(a.happyLow>b.happyHigh||b.happyLow>a.happyHigh);
 const minimum=m==='life'?1:m==='heightMale'||m==='heightFemale'?2:m==='hdi'?.01:['forest','renewable','internet'].includes(m)?.5:m==='calories'?25:0;
 return Math.abs(x-y)>=minimum-1e-9
}
export const growth=(c:Country)=>((c.history.at(-1)![1]/c.history[0][1])-1)*100;

// ---- Display names and city pools ---------------------------------------------------------
// The UN file writes "Ar-Riyāḑ (Riyadh)" and "Iran (Islamic Republic of)". Players see the common
// English name; the UN spelling is kept in `unName` and in the downloadable data.
const cityNameFixes:Record<string,string>={'Helsinki (Helsingfors)':'Helsinki','Kyiv (Kiev)':'Kyiv','Halle (Saale)':'Halle',"Aden ('Adan)":'Aden','Berne (Bern)':'Bern','Coyah (Conacry)':'Conakry','Islāmābād':'Islamabad','Sri Jayawardenepura Kotte - Colombo':'Colombo'};
const countryNameFixes:Record<string,string>={HKG:'Hong Kong',MAC:'Macao',TWN:'Taiwan',PRK:'North Korea',LAO:'Laos',MDA:'Moldova',PSE:'Palestine',SYR:'Syria',XKX:'Kosovo',CAF:'Central African Republic',DOM:'Dominican Republic'};
export function displayCityName(name:string){if(cityNameFixes[name])return cityNameFixes[name];const m=name.match(/^.+ \((.+)\)$/);return m?m[1]:name}
/** Idempotent. Adds common names and each city's size rank within its country. */
export function normalizeDataset(data:Dataset):Dataset{
 if(data.normalized)return data;const names=new Map(data.countries.map(c=>[c.id,c.name])),byCountry=new Map<string,City[]>();
 for(const c of data.globalCities){c.unName=c.name;c.name=displayCityName(c.name);c.countryName=names.get(c.country)??countryNameFixes[c.country]??c.countryName;const list=byCountry.get(c.country)??[];list.push(c);byCountry.set(c.country,list)}
 for(const list of byCountry.values())list.sort((a,b)=>b.population-a.population).forEach((c,i)=>{c.rank=i+1});
 data.normalized=true;return data
}
const pools=new WeakMap<Dataset,Map<string,City[]>>();
/** Cities a question may use. Difficulty controls familiarity: easy keeps each country's largest city, plus capitals and megacities among its top three; medium the four largest per country; hard the ten largest. This also stops India and China (151 of the 511 cities above one million) from dominating. */
export function cityPool(data:Dataset,difficulty:Difficulty,minimum:number):City[]{
 normalizeDataset(data);const key=difficulty+':'+minimum;let cache=pools.get(data);if(!cache){cache=new Map();pools.set(data,cache)}let found=cache.get(key);if(found)return found;
 found=data.globalCities.filter(c=>c.population>=minimum&&(difficulty==='easy'?c.rank===1||(c.rank!<=3&&(c.capital||c.population>=5e6)):difficulty==='medium'?c.rank!<=4:c.rank!<=10));
 cache.set(key,found);return found
}
// Countries whose capital is contested, split between cities, or missing from the UN city file are not asked.
const capitalFixes:Record<string,string>={NLD:'Amsterdam',CHL:'Santiago',IND:'New Delhi',PAK:'Islamabad',MYS:'Kuala Lumpur'},noCapitalQuestion=['AUS','ZAF','BOL','TZA','CIV','LKA'];
export function capitalOf(data:Dataset,id:string):City|undefined{
 normalizeDataset(data);if(noCapitalQuestion.includes(id))return undefined;const flagged=data.globalCities.filter(c=>c.country===id&&c.capital);
 if(capitalFixes[id])return flagged.find(c=>c.name===capitalFixes[id]);return flagged.length===1?flagged[0]:undefined
}

/** Index of the anchor country whose value is nearest the hidden target's (by relative gap). */
export function closestIndex(r:Round){const t=Number(r.target![r.metric]);let best=0;r.countries.forEach((c,i)=>{if(relativeGap(Number(c[r.metric]),t)<relativeGap(Number(r.countries[best][r.metric]),t))best=i});return best}
function nearGaps(r:Round){const t=Number(r.target![r.metric]);return r.countries.map(c=>relativeGap(Number(c[r.metric]),t)).sort((a,b)=>a-b)}
function scoreRound(r:Round){
 if(r.type==='topfive'){const values=r.cities!.map(c=>c.population).sort((a,b)=>b-a);return Math.min(...values.slice(1).map((n,i)=>relativeGap(values[i],n)))}
 if(r.type==='history')return relativeGap(100+growth(r.countries[0]),100+growth(r.countries[1]));
 if(r.type==='insert'){const n=nearGaps(r);return n[1]-n[0]}
 const values=r.countries.map(c=>Number(c[r.metric])).sort((a,b)=>b-a);return Math.min(...values.slice(1).map((n,i)=>relativeGap(values[i],n)))
}
const banks=new WeakMap<Dataset,Map<string,{rounds:Round[];cuts:[number,number]}>>();
function bank(data:Dataset,m:Metric,type:Kind,minimum:number,difficulty:Difficulty){
 // City questions draw from a difficulty-specific pool; other banks are shared across difficulties.
 const key=`${m}:${type}:${minimum}`+(type==='topfive'?':'+difficulty:'');let cache=banks.get(data);if(!cache){cache=new Map();banks.set(data,cache)}let found=cache.get(key);if(found)return found;
 const pool=data.countries.filter(c=>c[m]!=null&&Number.isFinite(c[m]));const cityChoices=type==='topfive'?cityPool(data,difficulty,minimum):[];const rounds:Round[]=[];
 // Seeded calibration makes thresholds reproducible for the same data and controls.
 let seed=Array.from(key).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,17);const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const sample=<T,>(a:T[])=>a[Math.floor(random()*a.length)];
 for(let attempt=0;attempt<9000&&rounds.length<420;attempt++){
  if(type==='topfive'){
   const chosen:City[]=[];for(let tries=0;tries<80&&chosen.length<3;tries++){const c=sample(cityChoices);if(c&&!chosen.some(x=>x.country===c.country||relativeGap(x.population,c.population)<.03))chosen.push(c)}
   if(chosen.length===3)rounds.push({type,metric:'population',countries:[],cities:chosen,cityMinimum:minimum});continue;
  }
  if(type==='history'){const a=sample(pool),b=sample(pool);if(a.id!==b.id&&a.history.length===24&&b.history.length===24&&Math.abs(growth(a)-growth(b))>=2)rounds.push({type,metric:'population',countries:[a,b]});continue}
  const count=type==='compare'||type==='gap'?2:type==='rank'?3:5,chosen:Country[]=[];
  for(let tries=0;tries<100&&chosen.length<count;tries++){const c=sample(pool);if(c&&chosen.every(x=>x.id!==c.id&&separate(c,x,m)))chosen.push(c)}
  if(chosen.length!==count)continue;
  if(type==='insert'){const[target,...rest]=chosen,r:Round={type,metric:m,target,countries:rest.sort((a,b)=>Number(b[m])-Number(a[m]))},n=nearGaps(r);if(n[1]-n[0]>=.05&&n[1]>=n[0]*1.25)rounds.push(r)}
  else if(type==='gap'){
   chosen.sort((a,b)=>Number(b[m])-Number(a[m]));const ratio=Number(chosen[0][m])/Number(chosen[1][m]);if(!Number.isFinite(ratio)||ratio<1.15||ratio>100)continue;
   // The window of four offered ratios slides at random, so the right answer can be the smallest, the largest or in between.
   const scale=[1,1.2,1.5,2,3,5,10,20,30,50,100],closest=scale.reduce((best,n)=>Math.abs(n-ratio)<Math.abs(best-ratio)?n:best,1),start=Math.max(0,Math.min(scale.indexOf(closest)-Math.floor(random()*4),scale.length-4));
   const options=scale.slice(start,start+4);rounds.push({type,metric:m,countries:chosen,options,answer:options.indexOf(closest)})
  }else rounds.push({type,metric:m,countries:chosen});
 }
 if(rounds.length<12)throw new Error(`Insufficient comparable data: ${m}/${type}`);
 const scores=rounds.map(scoreRound).sort((a,b)=>a-b),cuts:[number,number]=type==='compare'&&ratioMetrics.includes(m)?[.25,.65]:[scores[Math.floor(scores.length/3)],scores[Math.floor(scores.length*2/3)]];
 found={rounds,cuts};cache.set(key,found);return found
}
export function roundDifficulty(score:number,cuts:[number,number]):Difficulty{return score<=cuts[0]?'hard':score>=cuts[1]?'easy':'medium'}
export function numericCalibration(data:Dataset,metric:Metric,type:Kind='compare',minimum=1e6){return bank(data,metric,type,minimum,'medium').cuts}

// ---- Border questions ---------------------------------------------------------------------
// Targets with clear, undisputed land borders and at least three neighbours among the quiz countries.
const borderTargets=['DEU','AUT','POL','ITA','BRA','ARG','THA','KEN','ZAF','FRA','CHE','CZE','HUN','ROU','SVN','BEL','LTU','LVA','FIN','NOR','COL','PER','BOL','TZA','COD','ZMB','MOZ','UGA','TUR','IRN','KAZ'];
function borderRound(data:Dataset,difficulty:Difficulty,rng:Random):Round{
 const quiz=(ids:string[])=>data.countries.filter(c=>ids.includes(c.id)),targets=data.countries.filter(c=>borderTargets.includes(c.id)&&quiz(c.borders).length>=3),target=shuffle(targets,rng)[0];
 const neighbours=shuffle(quiz(target.borders),rng).slice(0,3);
 // The exception is a nearby country that does not touch the target. Closer look-alikes are harder.
 const near=data.countries.filter(c=>c.id!==target.id&&!target.borders.includes(c.id)).map(c=>({c,d:distanceKm(target.location[0],target.location[1],c.location[0],c.location[1])})).sort((a,b)=>a.d-b.d).map(x=>x.c);
 const range=difficulty==='hard'?near.slice(0,3):difficulty==='medium'?near.slice(1,6):near.slice(5,13),distractor=shuffle(range,rng)[0],countries=shuffle([...neighbours,distractor],rng);
 return{type:'exception',metric:'area',countries,target,answer:countries.findIndex(c=>c.id===distractor.id),difficulty}
}
// ---- Flag, capital and city-to-country questions ------------------------------------------
function others(data:Dataset,target:Country,difficulty:Difficulty,rng:Random,count=3):Country[]{
 const rest=data.countries.filter(c=>c.id!==target.id),same=rest.filter(c=>c.region===target.region),other=rest.filter(c=>c.region!==target.region);
 const pool=difficulty==='hard'&&same.length>=count?same:difficulty==='easy'&&other.length>=count?other:rest;return shuffle(pool,rng).slice(0,count)
}
function flagRound(data:Dataset,difficulty:Difficulty,rng:Random):Round{
 const target=shuffle(data.countries,rng)[0],choices=shuffle([target,...others(data,target,difficulty,rng)],rng).map(c=>({id:c.id,label:c.name}));
 return{type:'flag',metric:'population',countries:[],target,choices,answer:choices.findIndex(c=>c.id===target.id),difficulty}
}
function capitalRound(data:Dataset,difficulty:Difficulty,rng:Random):Round{
 const eligible=data.countries.filter(c=>capitalOf(data,c.id)),target=shuffle(eligible,rng)[0],capital=capitalOf(data,target.id)!;
 // Harder versions offer the country's own large cities (Istanbul, not Ankara), the classic trap.
 const siblings=data.globalCities.filter(c=>c.country===target.id&&c.id!==capital.id&&!c.capital&&c.rank!<=4),want=difficulty==='hard'?3:difficulty==='medium'?1:0;
 const wrong:City[]=shuffle(siblings,rng).slice(0,want);
 for(const c of shuffle(others(data,target,difficulty==='easy'?'easy':'hard',rng,12),rng)){if(wrong.length>=3)break;const city=capitalOf(data,c.id);if(city)wrong.push(city)}
 const choices=shuffle([capital,...wrong],rng).map(c=>({id:c.id,label:c.name}));
 return{type:'capital',metric:'population',countries:[],target,city:capital,choices,answer:choices.findIndex(c=>c.id===capital.id),difficulty}
}
function whereRound(data:Dataset,difficulty:Difficulty,minimum:number,rng:Random):Round{
 const byId=new Map(data.countries.map(c=>[c.id,c])),fold=(s:string)=>s.toLowerCase();
 // Skip giveaways such as Mexico City or Guatemala City. Above easy, a country's largest city is skipped when it is also the capital.
 const pool=cityPool(data,difficulty,minimum).filter(c=>byId.has(c.country)&&!fold(c.name).includes(fold(byId.get(c.country)!.name))&&!(difficulty!=='easy'&&c.capital&&c.rank===1));
 const city=shuffle(pool,rng)[0],target=byId.get(city.country)!,choices=shuffle([target,...others(data,target,difficulty==='easy'?'medium':'hard',rng)],rng).map(c=>({id:c.id,label:c.name,code:c.id}));
 return{type:'whereis',metric:'population',countries:[],target,city,choices,answer:choices.findIndex(c=>c.id===target.id),difficulty,cityMinimum:minimum}
}

export function generateRound(data:Dataset,filter:Metric|'all',previous?:Kind,featured=false,forced?:Kind,options:Options={}):Round{
 normalizeDataset(data);
 const rng=options.rng??Math.random,difficulty=options.difficulty??'medium',cityMinimum=options.cityMinimum??1e6;let type=forced??shuffle(trailTypes(filter).filter(t=>t!==previous),rng)[0];
 const validMetrics=Object.keys(data.metrics).filter(k=>data.metrics[k as Metric].coverage!>=6) as Metric[];
 let metric:Metric=filter==='all'?pickMetric(validMetrics,rng):filter;
 if(type==='languages')return generateLanguageRound(data,difficulty,rng);
 if(featured)return{type:'insert',metric:'area',countries:['FRA','PRT','BEL','SVN'].map(id=>data.countries.find(c=>c.id===id)!).sort((a,b)=>b.area-a.area),target:data.countries.find(c=>c.id==='LTU')!,difficulty};
 if(type==='flag')return flagRound(data,difficulty,rng);
 if(type==='capital')return capitalRound(data,difficulty,rng);
 if(type==='whereis')return whereRound(data,difficulty,cityMinimum,rng);
 if(type==='pin')return{type,metric:'population',countries:[],city:shuffle(cityPool(data,difficulty,cityMinimum),rng)[0],difficulty,mapWorld:true,tolerance:difficulty==='easy'?700:difficulty==='medium'?350:150,cityMinimum};
 if(type==='exception')return borderRound(data,difficulty,rng);
 if(type==='estimate'){
  metric=filter!=='all'&&estimateMetrics.includes(filter)?filter:pickMetric(estimateMetrics,rng);const pool=data.countries.filter(c=>c[metric]!=null),country=shuffle(pool,rng)[0];
  const configs:Partial<Record<Metric,[number,number,number,number,number,number]>>={life:[40,90,.5,4,2,1],happiness:[0,10,.1,.6,.3,.2],forest:[0,100,1,15,8,3],renewable:[0,100,1,15,8,3],internet:[0,100,1,10,6,3],hdi:[0,1,.01,.1,.05,.02],heightMale:[140,200,.5,4,2,1],heightFemale:[130,190,.5,4,2,1],doctorates:[0,Math.ceil(Math.max(...pool.map(c=>Number(c.doctorates))))+1,.1,.6,.3,.1],calories:[1000,4500,50,500,250,100],alcohol:[0,20,.2,3,1.5,.5]};
  const[min,max,step,easy,medium,hard]=configs[metric]!;return{type,metric,countries:[country],difficulty,tolerance:difficulty==='easy'?easy:difficulty==='medium'?medium:hard,estimateRange:{min,max,step}}
 }
 // In a mixed run, one Compare slot in four becomes its historical variant.
 if(type==='compare'&&filter==='all'&&options.mixed&&rng()<.25)type='history';
 if(type==='topfive')metric='population';if(type==='history')metric='population';if(type==='gap'&&!ratioMetrics.includes(metric))metric=pickMetric(ratioMetrics,rng);
 const {rounds,cuts}=bank(data,metric,type,cityMinimum,difficulty);let eligible=rounds.filter(r=>roundDifficulty(scoreRound(r),cuts)===difficulty);
 if(!eligible.length){const target=difficulty==='hard'?cuts[0]:difficulty==='easy'?cuts[1]:(cuts[0]+cuts[1])/2;eligible=[...rounds].sort((a,b)=>Math.abs(scoreRound(a)-target)-Math.abs(scoreRound(b)-target)).slice(0,5)}
 const template=shuffle(eligible,rng)[0],r:Round={...template,countries:[...template.countries],cities:template.cities?shuffle(template.cities,rng):undefined,options:template.options?[...template.options]:undefined,difficulty:roundDifficulty(scoreRound(template),cuts),gapScore:scoreRound(template),cuts,cityMinimum};
 if(type==='compare'||type==='history')r.countries=shuffle(r.countries,rng);
 if(type==='rank'&&r.countries.every((c,i)=>i===0||Number(r.countries[i-1][metric])>Number(c[metric])))r.countries.reverse();
 if(type==='gap'){const correct=r.options![r.answer!];r.options=shuffle(r.options!,rng);r.answer=r.options.indexOf(correct)}
 return r
}
export function isCorrect(r:Round,selection:number|null,order:Country[]){if(r.type==='compare')return selection!==null&&Number(r.countries[selection]?.[r.metric])===Math.max(...r.countries.map(c=>Number(c[r.metric])));if(r.type==='insert')return selection===closestIndex(r);const sorted=[...r.countries].sort((a,b)=>Number(b[r.metric])-Number(a[r.metric]));return order.length===sorted.length&&order.every((c,i)=>c.id===sorted[i].id)}
export function distanceKm(lon1:number,lat1:number,lon2:number,lat2:number){const rad=Math.PI/180,a=Math.sin((lat2-lat1)*rad/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin((lon2-lon1)*rad/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,a)))}
export function pinDistance(r:Round,pin:[number,number]){if(r.mapWorld)return distanceKm(pin[0]/2-180,90-pin[1]/2,r.city!.lon,r.city!.lat);const p=r.countries[0].projection;return distanceKm((pin[0]-p.left)/p.scale/p.cos,-(pin[1]-p.top)/p.scale,r.city!.lon,r.city!.lat)}
export function cityPoint(c:City):[number,number]{return[(c.lon+180)*2,(90-c.lat)*2]}
const validChoice=(a:ExtraAnswer,count:number)=>Number.isInteger(a.choice)&&a.choice!>=0&&a.choice!<count;
export function canAnswer(r:Round,selection:number|null,a:ExtraAnswer){if(r.type==='languages')return validChoice(a,r.countries.length);if(choiceKinds.includes(r.type))return validChoice(a,r.choices!.length);if(r.type==='rank')return a.ranking?.length===r.countries.length&&new Set(a.ranking).size===r.countries.length&&a.ranking.every(id=>r.countries.some(c=>c.id===id));if(['compare','insert'].includes(r.type))return selection!==null;if(r.type==='topfive')return a.cities?.length===r.cities!.length&&new Set(a.cities).size===r.cities!.length&&a.cities.every(id=>r.cities!.some(c=>c.id===id));if(r.type==='pin')return !!a.pin;if(r.type==='estimate')return a.estimate!==undefined;return a.choice!==undefined}
export function grade(r:Round,selection:number|null,order:Country[],a:ExtraAnswer){if(r.type==='languages'||choiceKinds.includes(r.type))return canAnswer(r,null,a)&&a.choice===r.answer;if(r.type==='rank'){const right=[...r.countries].sort((a,b)=>Number(b[r.metric])-Number(a[r.metric]));return canAnswer(r,null,a)&&a.ranking!.every((id,i)=>id===right[i].id)}if(['compare','insert'].includes(r.type))return isCorrect(r,selection,order);if(r.type==='topfive'){const right=[...r.cities!].sort((a,b)=>b.population-a.population);return canAnswer(r,null,a)&&a.cities!.every((id,i)=>id===right[i].id)}if(r.type==='pin')return !!a.pin&&pinDistance(r,a.pin)<=(r.tolerance??100);if(r.type==='estimate')return a.estimate!==undefined&&Math.abs(a.estimate-Number(r.countries[0][r.metric]))<=(r.tolerance??(r.metric==='life'?2:.3))+1e-9;if(r.type==='history')return a.choice!==undefined&&growth(r.countries[a.choice])===Math.max(...r.countries.map(growth));return a.choice===r.answer}

// ---- Scoring ------------------------------------------------------------------------------
export type Result={fraction:number;correct:boolean};
/** How good an answer is, from 0 to 1. `correct` keeps the pass/fail meaning used for streaks and lives.
 * Pins and estimates earn more the closer they are, and still earn something up to three times the accepted range.
 * Podiums earn credit for each pair in the right order. An insertion one place off earns 0.4. */
export function scoreAnswer(r:Round,selection:number|null,order:Country[],a:ExtraAnswer):Result{
 if(!canAnswer(r,selection,a))return{fraction:0,correct:false};const correct=grade(r,selection,order,a);
 if(r.type==='rank'||r.type==='topfive'){
  const right=r.type==='rank'?[...r.countries].sort((x,y)=>Number(y[r.metric])-Number(x[r.metric])).map(c=>c.id):[...r.cities!].sort((x,y)=>y.population-x.population).map(c=>c.id),given=(r.type==='rank'?a.ranking:a.cities)!;
  let pairs=0;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(right.indexOf(given[i])<right.indexOf(given[j]))pairs++;return{fraction:[0,.2,.5,1][pairs],correct}
 }
 if(r.type==='pin')return{fraction:Math.max(0,1-pinDistance(r,a.pin!)/(3*(r.tolerance??100))),correct};
 if(r.type==='estimate')return{fraction:Math.max(0,1-Math.abs(a.estimate!-Number(r.countries[0][r.metric]))/(3*r.tolerance!)),correct};
 if(r.type==='insert'&&!correct){const t=Number(r.target![r.metric]),runnerUp=nearGaps(r)[1];return{fraction:selection!==null&&relativeGap(Number(r.countries[selection][r.metric]),t)===runnerUp?.4:0,correct}}
 return{fraction:correct?1:0,correct}
}
export const difficultyMultiplier:Record<Difficulty,number>={easy:1,medium:1.5,hard:2};
export type Award={base:number;streak:number;speed:number;total:number};
/** Points for one answer. Base is 100 × difficulty × closeness. A correct answer adds 10 per answer already in the streak (up to 50), and in timed play up to 50 for speed: full within 5 s, none after 25 s. */
export function awardPoints(result:Result,difficulty:Difficulty,streakBefore:number,seconds?:number):Award{
 const base=Math.round(100*difficultyMultiplier[difficulty]*result.fraction),streak=result.correct?Math.min(streakBefore,5)*10:0;
 const speed=result.correct&&seconds!==undefined?Math.round(50*Math.max(0,Math.min(1,(25-seconds)/20))):0;return{base,streak,speed,total:base+streak+speed}
}

export function roundSource(data:Dataset,r:Round):Source{
 if(r.type==='languages')return languageSource(r);if(r.type==='topfive')return data.citySource;if(r.type==='pin')return{...data.citySource,label:'Global city locations',unit:'coordinates'};
 if(r.type==='whereis')return{...data.citySource,label:'World cities',unit:undefined};
 if(r.type==='capital')return{...data.citySource,label:'Capital cities',unit:undefined,definition:'Capitals as flagged in the UN urban-area file. Countries with split or contested capitals are not asked.'};
 if(r.type==='flag')return{label:'National flags',source:'flag-icons · MIT licence',year:'Current flags',url:'https://github.com/lipis/flag-icons',definition:'National flags as drawn in the open flag-icons set, matched by ISO 3166 code.'};
 if(r.type==='history')return data.sources[1];if(r.type==='exception')return data.sources[2];return data.metrics[r.metric]
}
export function explanation(r:Round,a:ExtraAnswer){
 if(r.type==='flag')return `This is the flag of ${r.target!.name}.`;
 if(r.type==='capital'){const chosen=a.choice!==undefined?r.choices![a.choice]:undefined;return `${r.city!.name} is the capital of ${r.target!.name}.`+(chosen&&chosen.id!==r.city!.id?` ${chosen.label} is not.`:'')}
 if(r.type==='whereis')return `${r.city!.name} is in ${r.target!.name}. About ${formatValue(r.city!.population,'population')} people live in its urban area (UN, 2025).`;
 if(r.type==='languages'){const c=r.countries[r.answer!],v=r.language!.values[c.id];return `${c.name} has the most ${r.language!.name} speakers of these three: ${formatSpeakers(v.speakers)}. This counts everyone who can use the language, first or second. These are approximate CLDR estimates from mixed source years.`}
 if(r.type==='topfive'){const cs=[...r.cities!].sort((a,b)=>b.population-a.population);return `Correct order: ${cs.map(c=>c.name).join(', ')}. ${cs[0].name} has about ${(cs[0].population/cs[cs.length-1].population).toFixed(1)} times ${cs[cs.length-1].name}’s population. These are UN-defined urban areas in 2025.`}
 if(r.type==='exception')return `${r.countries[r.answer!].name} does not share a land border with ${r.target!.name}. The other three do.`;
 if(r.type==='pin')return `${r.city!.name}, ${r.city!.countryName}: your pin was ${Math.round(pinDistance(r,a.pin!))} km from the UN population-weighted urban centroid. Within ${r.tolerance??100} km counts as correct.`;
 if(r.type==='estimate')return `${r.countries[0].name}: ${formatValue(Number(r.countries[0][r.metric]),r.metric)}. Your estimate: ${formatValue(a.estimate!,r.metric)}.`;
 if(r.type==='history'){const cs=[...r.countries].sort((a,b)=>growth(b)-growth(a));return `${cs[0].name}: ${growth(cs[0]).toFixed(1)}% growth; ${cs[1].name}: ${growth(cs[1]).toFixed(1)}%. A difference of ${(growth(cs[0])-growth(cs[1])).toFixed(1)} percentage points from 2000 to 2023.`}
 const cs=[...r.countries,...(r.target?[r.target]:[])].sort((a,b)=>Number(b[r.metric])-Number(a[r.metric])),high=cs[0],low=cs.at(-1)!;
 if(r.type==='gap')return `${r.countries[0].name} has ${(Number(r.countries[0][r.metric])/Number(r.countries[1][r.metric])).toFixed(2)} times ${r.countries[1].name}’s value. ${r.options![r.answer!]}× was the closest offered ratio.`;
 if(r.metric==='life')return `${high.name} is ${(high.life-low.life).toFixed(1)} years higher in life expectancy than ${low.name}.`;
 return `${high.name}: ${formatValue(Number(high[r.metric]),r.metric)}. ${low.name}: ${formatValue(Number(low[r.metric]),r.metric)}.`
}
/** The right answer in a few words, for the end-of-run review. */
export function answerSummary(r:Round):string{
 const byMetric=()=>[...r.countries].sort((a,b)=>Number(b[r.metric])-Number(a[r.metric]));
 switch(r.type){
 case 'compare':return byMetric()[0].name;
 case 'history':return [...r.countries].sort((a,b)=>growth(b)-growth(a))[0].name;
 case 'insert':return `Closest to ${r.countries[closestIndex(r)].name}`
 case 'rank':return byMetric().map(c=>c.name).join(' › ');
 case 'topfive':return [...r.cities!].sort((a,b)=>b.population-a.population).map(c=>c.name).join(' › ');
 case 'gap':return `About ${r.options![r.answer!]}×`;
 case 'exception':case 'languages':return r.countries[r.answer!].name;
 case 'pin':return `${r.city!.name}, ${r.city!.countryName}`;
 case 'estimate':return formatValue(Number(r.countries[0][r.metric]),r.metric);
 case 'flag':case 'whereis':return r.target!.name;
 case 'capital':return r.city!.name;
 }
}

export function estimateTolerance(r:Round){const m=r.metric;const unit=['forest','renewable','internet','doctorates'].includes(m)?'percentage points':m==='life'?'years':m==='heightMale'||m==='heightFemale'?'cm':m==='calories'?'kcal/person/day':m==='alcohol'?'L pure alcohol/adult/year':'points';return `±${r.tolerance} ${unit}`}
