export type Metric='population'|'area'|'life'|'happiness'|'density'|'forest'|'renewable'|'internet'|'gdp'|'co2'|'hdi'|'heightMale'|'heightFemale'|'doctorates'|'mobileTraffic'|'fixedTraffic'|'internetTraffic'|'calories'|'alcohol'|'patents'|'cattle';
export type Kind='compare'|'insert'|'rank'|'topfive'|'gap'|'exception'|'pin'|'estimate'|'history';
export type Difficulty='easy'|'medium'|'hard';
export type Options={difficulty?:Difficulty;cityMinimum?:number};
export type Country={id:string;name:string;shape:string;population:number;area:number;life:number;happiness:number|null;happyLow:number|null;happyHigh:number|null;doctorateLow?:number|null;doctorateHigh?:number|null;location:[number,number];worldPath:string;projection:{cos:number;scale:number;left:number;top:number};borders:string[];region:string;history:[number,number][]}&Partial<Record<Exclude<Metric,'population'|'area'|'life'|'happiness'>,number|null>>;
export type City={id:string;name:string;country:string;countryName?:string;population:number;lon:number;lat:number;point?:[number,number];capital?:boolean;year?:number};
export type Source={label:string;unit?:string;source:string;year:string;url:string;definition:string;group?:string;coverage?:number;precision?:number};
export type Dataset={countries:Country[];cities:City[];globalCities:City[];citySource:Source;metrics:Record<Metric,Source>;sources:Source[];unavailableTopics?:unknown[]};
export type Round={type:Kind;metric:Metric;countries:Country[];target?:Country;city?:City;cities?:City[];options?:number[];answer?:number;difficulty?:Difficulty;gapScore?:number;cuts?:[number,number];tolerance?:number;mapWorld?:boolean;estimateRange?:{min:number;max:number;step:number};cityMinimum?:number};
export type ExtraAnswer={cities?:string[];choice?:number;estimate?:number;pin?:[number,number]};
export const modeNames:Record<Kind,string>={compare:'Compare',insert:'Insert',rank:'Rank',topfive:'World cities',gap:'Guess the gap',exception:'Odd one out',pin:'Pin the city',estimate:'Estimate',history:'Then vs now'};
export const shuffle=<T,>(arr:T[]):T[]=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const ratioMetrics:Metric[]=['population','area','density','gdp','co2','mobileTraffic','fixedTraffic','internetTraffic','patents','cattle'];
const estimateMetrics:Metric[]=['life','happiness','forest','renewable','internet','hdi','heightMale','heightFemale','doctorates','calories','alcohol'];
export function availableTypes(filter:Metric|'all'):Kind[]{if(filter==='all')return Object.keys(modeNames) as Kind[];return ['compare','insert','rank',...(ratioMetrics.includes(filter)?['gap']:[]),...(estimateMetrics.includes(filter)?['estimate']:[]),...(filter==='population'?['topfive','history']:[])] as Kind[]}
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
function scoreRound(r:Round){
 if(r.type==='topfive'){const values=r.cities!.map(c=>c.population).sort((a,b)=>b-a);return Math.min(...values.slice(1).map((n,i)=>relativeGap(values[i],n)))}
 if(r.type==='history')return relativeGap(100+growth(r.countries[0]),100+growth(r.countries[1]));
 if(r.type==='insert')return Math.min(...r.countries.map(c=>relativeGap(Number(c[r.metric]),Number(r.target![r.metric]))));
 const values=r.countries.map(c=>Number(c[r.metric])).sort((a,b)=>b-a);return Math.min(...values.slice(1).map((n,i)=>relativeGap(values[i],n)))
}
const banks=new WeakMap<Dataset,Map<string,{rounds:Round[];cuts:[number,number]}>>();
function bank(data:Dataset,m:Metric,type:Kind,minimum:number){
 const key=`${m}:${type}:${minimum}`;let cache=banks.get(data);if(!cache){cache=new Map();banks.set(data,cache)}let found=cache.get(key);if(found)return found;
 const pool=data.countries.filter(c=>c[m]!=null&&Number.isFinite(c[m]));const cityPool=data.globalCities?.filter(c=>c.population>=minimum)??[];const rounds:Round[]=[];
 // Seeded calibration makes thresholds reproducible for the same data and controls.
 let seed=Array.from(key).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,17);const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const sample=<T,>(a:T[])=>a[Math.floor(random()*a.length)];
 for(let attempt=0;attempt<9000&&rounds.length<420;attempt++){
  if(type==='topfive'){
   const chosen:City[]=[];for(let tries=0;tries<80&&chosen.length<5;tries++){const c=sample(cityPool);if(c&&!chosen.some(x=>x.country===c.country||relativeGap(x.population,c.population)<.03))chosen.push(c)}
   if(chosen.length===5)rounds.push({type,metric:'population',countries:[],cities:chosen,cityMinimum:minimum});continue;
  }
  if(type==='history'){const a=sample(pool),b=sample(pool);if(a.id!==b.id&&a.history.length===24&&b.history.length===24&&Math.abs(growth(a)-growth(b))>=2)rounds.push({type,metric:'population',countries:[a,b]});continue}
  const count=type==='compare'||type==='gap'?2:type==='rank'?4:5,chosen:Country[]=[];
  for(let tries=0;tries<100&&chosen.length<count;tries++){const c=sample(pool);if(c&&chosen.every(x=>x.id!==c.id&&separate(c,x,m)))chosen.push(c)}
  if(chosen.length!==count)continue;
  if(type==='insert'){const[target,...rest]=chosen;rounds.push({type,metric:m,target,countries:rest.sort((a,b)=>Number(b[m])-Number(a[m]))})}
  else if(type==='gap'){
   chosen.sort((a,b)=>Number(b[m])-Number(a[m]));const ratio=Number(chosen[0][m])/Number(chosen[1][m]);if(!Number.isFinite(ratio)||ratio<1.15||ratio>100)continue;
   const scale=[1,1.2,1.5,2,3,5,10,20,30,50,100],closest=scale.reduce((best,n)=>Math.abs(n-ratio)<Math.abs(best-ratio)?n:best,1),start=Math.max(0,Math.min(scale.indexOf(closest)-1,scale.length-4));
   const options=scale.slice(start,start+4);rounds.push({type,metric:m,countries:chosen,options,answer:options.indexOf(closest)})
  }else rounds.push({type,metric:m,countries:chosen});
 }
 if(rounds.length<12)throw new Error(`Insufficient comparable data: ${m}/${type}`);
 const scores=rounds.map(scoreRound).sort((a,b)=>a-b),cuts:[number,number]=type==='compare'&&ratioMetrics.includes(m)?[.25,.65]:[scores[Math.floor(scores.length/3)],scores[Math.floor(scores.length*2/3)]];
 found={rounds,cuts};cache.set(key,found);return found
}
export function roundDifficulty(score:number,cuts:[number,number]):Difficulty{return score<=cuts[0]?'hard':score>=cuts[1]?'easy':'medium'}
export function numericCalibration(data:Dataset,metric:Metric,type:Kind='compare',minimum=1e6){return bank(data,metric,type,minimum).cuts}
export function generateRound(data:Dataset,filter:Metric|'all',previous?:Kind,featured=false,forced?:Kind,options:Options={}):Round{
 const difficulty=options.difficulty??'medium',cityMinimum=options.cityMinimum??1e6,type=forced??shuffle(availableTypes(filter).filter(t=>t!==previous))[0];
 const validMetrics=Object.keys(data.metrics).filter(k=>data.metrics[k as Metric].coverage!>=6) as Metric[];
 let metric:Metric=filter==='all'?shuffle(validMetrics)[0]:filter;
 if(featured)return{type:'insert',metric:'area',countries:['FRA','PRT','BEL','SVN'].map(id=>data.countries.find(c=>c.id===id)!).sort((a,b)=>b.area-a.area),target:data.countries.find(c=>c.id==='LTU')!,difficulty};
 if(type==='pin')return{type,metric:'population',countries:[],city:shuffle(data.globalCities.filter(c=>c.population>=cityMinimum))[0],difficulty,mapWorld:true,tolerance:difficulty==='easy'?700:difficulty==='medium'?350:150,cityMinimum};
 if(type==='exception'){
  const targets=data.countries.filter(c=>['DEU','AUT','POL','ITA','BRA','ARG','THA','KEN','ZAF'].includes(c.id)&&data.countries.filter(b=>c.borders.includes(b.id)).length>=3),target=shuffle(targets)[0];
  const neighbors=shuffle(data.countries.filter(c=>target.borders.includes(c.id))).slice(0,3),distractor=shuffle(data.countries.filter(c=>c.region===target.region&&c.id!==target.id&&!target.borders.includes(c.id)))[0],countries=shuffle([...neighbors,distractor]);
  return{type,metric:'area',countries,target,answer:countries.findIndex(c=>c.id===distractor.id)}
 }
 if(type==='estimate'){
  metric=filter!=='all'&&estimateMetrics.includes(filter)?filter:shuffle(estimateMetrics)[0];const pool=data.countries.filter(c=>c[metric]!=null),country=shuffle(pool)[0];
  const configs:Partial<Record<Metric,[number,number,number,number,number,number]>>={life:[40,90,.5,4,2,1],happiness:[0,10,.1,.6,.3,.2],forest:[0,100,1,15,8,3],renewable:[0,100,1,15,8,3],internet:[0,100,1,15,8,3],hdi:[0,1,.01,.1,.05,.02],heightMale:[140,200,.5,4,2,1],heightFemale:[130,190,.5,4,2,1],doctorates:[0,Math.ceil(Math.max(...pool.map(c=>Number(c.doctorates))))+1,.1,.6,.3,.1],calories:[1000,4500,50,500,250,100],alcohol:[0,20,.2,3,1.5,.5]};
  const[min,max,step,easy,medium,hard]=configs[metric]!;return{type,metric,countries:[country],difficulty,tolerance:difficulty==='easy'?easy:difficulty==='medium'?medium:hard,estimateRange:{min,max,step}}
 }
 if(type==='topfive')metric='population';if(type==='history')metric='population';if(type==='gap'&&!ratioMetrics.includes(metric))metric=shuffle(ratioMetrics)[0];
 const {rounds,cuts}=bank(data,metric,type,cityMinimum);let eligible=rounds.filter(r=>roundDifficulty(scoreRound(r),cuts)===difficulty);
 if(!eligible.length){const target=difficulty==='hard'?cuts[0]:difficulty==='easy'?cuts[1]:(cuts[0]+cuts[1])/2;eligible=[...rounds].sort((a,b)=>Math.abs(scoreRound(a)-target)-Math.abs(scoreRound(b)-target)).slice(0,5)}
 const template=shuffle(eligible)[0],r:Round={...template,countries:[...template.countries],cities:template.cities?shuffle(template.cities):undefined,options:template.options?[...template.options]:undefined,difficulty:roundDifficulty(scoreRound(template),cuts),gapScore:scoreRound(template),cuts,cityMinimum};
 if(type==='rank'&&r.countries.every((c,i)=>i===0||Number(r.countries[i-1][metric])>Number(c[metric])))r.countries.reverse();
 if(type==='gap'){const correct=r.options![r.answer!];r.options=shuffle(r.options!);r.answer=r.options.indexOf(correct)}
 return r
}
export function isCorrect(r:Round,selection:number|null,order:Country[]){if(r.type==='compare')return selection!==null&&Number(r.countries[selection]?.[r.metric])===Math.max(...r.countries.map(c=>Number(c[r.metric])));if(r.type==='insert')return selection===r.countries.filter(c=>Number(c[r.metric])>Number(r.target![r.metric])).length;const sorted=[...r.countries].sort((a,b)=>Number(b[r.metric])-Number(a[r.metric]));return order.length===sorted.length&&order.every((c,i)=>c.id===sorted[i].id)}
export function distanceKm(lon1:number,lat1:number,lon2:number,lat2:number){const rad=Math.PI/180,a=Math.sin((lat2-lat1)*rad/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin((lon2-lon1)*rad/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,a)))}
export function pinDistance(r:Round,pin:[number,number]){if(r.mapWorld)return distanceKm(pin[0]/2-180,90-pin[1]/2,r.city!.lon,r.city!.lat);const p=r.countries[0].projection;return distanceKm((pin[0]-p.left)/p.scale/p.cos,-(pin[1]-p.top)/p.scale,r.city!.lon,r.city!.lat)}
export function cityPoint(c:City):[number,number]{return[(c.lon+180)*2,(90-c.lat)*2]}
export function canAnswer(r:Round,selection:number|null,a:ExtraAnswer){if(r.type==='rank')return true;if(['compare','insert'].includes(r.type))return selection!==null;if(r.type==='topfive')return a.cities?.length===5;if(r.type==='pin')return !!a.pin;if(r.type==='estimate')return a.estimate!==undefined;return a.choice!==undefined}
export function grade(r:Round,selection:number|null,order:Country[],a:ExtraAnswer){if(['compare','insert','rank'].includes(r.type))return isCorrect(r,selection,order);if(r.type==='topfive'){const right=[...r.cities!].sort((a,b)=>b.population-a.population);return a.cities?.length===5&&a.cities.every((id,i)=>id===right[i].id)}if(r.type==='pin')return !!a.pin&&pinDistance(r,a.pin)<=(r.tolerance??100);if(r.type==='estimate')return a.estimate!==undefined&&Math.abs(a.estimate-Number(r.countries[0][r.metric]))<=(r.tolerance??(r.metric==='life'?2:.3))+1e-9;if(r.type==='history')return a.choice!==undefined&&growth(r.countries[a.choice])===Math.max(...r.countries.map(growth));return a.choice===r.answer}
export function roundSource(data:Dataset,r:Round):Source{if(r.type==='topfive')return data.citySource;if(r.type==='pin')return{...data.citySource,label:'Global city locations',unit:'coordinates'};if(r.type==='history')return data.sources[1];if(r.type==='exception')return data.sources[2];return data.metrics[r.metric]}
export function explanation(r:Round,a:ExtraAnswer){
 if(r.type==='topfive'){const cs=[...r.cities!].sort((a,b)=>b.population-a.population);return `Correct order: ${cs.map(c=>c.name).join(', ')}. ${cs[0].name} has about ${(cs[0].population/cs[4].population).toFixed(1)} times ${cs[4].name}’s population. These are UN-defined urban areas in 2025.`}
 if(r.type==='exception')return `${r.countries[r.answer!].name} does not share a land border with ${r.target!.name}. The other three do.`;
 if(r.type==='pin')return `${r.city!.name}, ${r.city!.countryName}: your pin was ${Math.round(pinDistance(r,a.pin!))} km from the UN population-weighted urban centroid. Within ${r.tolerance??100} km counts as correct.`;
 if(r.type==='estimate')return `${r.countries[0].name}: ${formatValue(Number(r.countries[0][r.metric]),r.metric)}. Your estimate: ${formatValue(a.estimate!,r.metric)}.`;
 if(r.type==='history'){const cs=[...r.countries].sort((a,b)=>growth(b)-growth(a));return `${cs[0].name}: ${growth(cs[0]).toFixed(1)}% growth; ${cs[1].name}: ${growth(cs[1]).toFixed(1)}%. A difference of ${(growth(cs[0])-growth(cs[1])).toFixed(1)} percentage points from 2000 to 2023.`}
 const cs=[...r.countries,...(r.target?[r.target]:[])].sort((a,b)=>Number(b[r.metric])-Number(a[r.metric])),high=cs[0],low=cs.at(-1)!;
 if(r.type==='gap')return `${high.name} has ${(Number(high[r.metric])/Number(low[r.metric])).toFixed(2)} times ${low.name}’s value. ${r.options![r.answer!]}× was the closest offered ratio.`;
 if(r.metric==='life')return `${high.name} is ${(high.life-low.life).toFixed(1)} years higher in life expectancy than ${low.name}.`;
 return `${high.name}: ${formatValue(Number(high[r.metric]),r.metric)}. ${low.name}: ${formatValue(Number(low[r.metric]),r.metric)}.`
}

export function estimateTolerance(r:Round){const m=r.metric;const unit=['forest','renewable','internet','doctorates'].includes(m)?'percentage points':m==='life'?'years':m==='heightMale'||m==='heightFemale'?'cm':m==='calories'?'kcal/person/day':m==='alcohol'?'L pure alcohol/adult/year':'points';return `±${r.tolerance} ${unit}`}

