import {useEffect,useState} from 'react';
import {Users,Heart,TreePine,Wifi,Coins,Factory,Ruler,Database,GraduationCap,Utensils,Globe2,Building2,Smile,Beer,Lightbulb,ZoomIn,RotateCcw} from 'lucide-react';
import datasetJson from '../public/data/countries.json';
import globalJson from '../public/data/reference-scales.json';
import {CountryFlag} from './country-flag';
import {referenceDomain,scalePosition,zoomReferenceDomain,referenceBins,compactScaleValue,type ReferencePoint} from '../lib/reference-scales';
import {formatValue,type Dataset,type Round,type Metric} from '../lib/game';
function CattleIcon({size=15}:{size?:number}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M7 7Q2 7 3 3L8 5M17 7Q22 7 21 3L16 5M6 8 8 19Q12 23 16 19L18 8Q12 4 6 8ZM8 15Q12 12 16 15M9 9v2M15 9v2M10 17h.1M14 17h.1"/></svg>}
const dataset=datasetJson as unknown as Dataset;
const globals=globalJson.metrics as Record<string,{year:string;source:string;url:string;world:number;places:ReferencePoint[];definition:string}>;
const icons={population:Users,area:Globe2,life:Heart,happiness:Smile,density:Users,forest:TreePine,renewable:Lightbulb,internet:Wifi,gdp:Coins,co2:Factory,hdi:GraduationCap,heightMale:Ruler,heightFemale:Ruler,doctorates:GraduationCap,mobileTraffic:Database,fixedTraffic:Database,internetTraffic:Database,calories:Utensils,alcohol:Beer,patents:Lightbulb,cattle:CattleIcon};
export function PositionScale({round:r,motion}:{round:Round;motion:boolean}){
 const[zoomed,setZoomed]=useState(false),[shown,setShown]=useState(!motion);
 useEffect(()=>{setShown(true)},[]);
 if(['pin','exception','history','languages'].includes(r.type))return null;
 const isCity=r.type==='topfive',metric=r.metric;
 const places=isCity?r.cities!.map(c=>({id:c.id,name:c.name,value:c.population,flag:c.country,countryName:c.countryName})): [...r.countries,...(r.target?[r.target]:[])].map(c=>({id:c.id,name:c.name,value:Number(c[metric]),flag:c.id,countryName:undefined}));
 const global=isCity?undefined:globals[metric];
 const reference:ReferencePoint[]=isCity?dataset.globalCities.filter(c=>c.population>=(r.cityMinimum??1e6)).map(c=>({id:c.id,name:c.name,value:c.population})):global?global.places:dataset.countries.filter(c=>c[metric]!=null&&Number.isFinite(c[metric])).map(c=>({id:c.id,name:c.name,value:Number(c[metric])}));
 if(!places.length||!reference.length)return null;
 const full=referenceDomain(metric,reference,isCity?r.cityMinimum??1e6:undefined),domain=zoomed?zoomReferenceDomain(places.map(p=>p.value),full):full;
 const bins=referenceBins(reference,domain),maxBin=Math.max(1,...bins),highest=reference.reduce((a,b)=>a.value>b.value?a:b),below=reference.filter(p=>p.value<domain[0]).length;
 const meta=isCity?dataset.citySource:dataset.metrics[metric],Icon=isCity?Building2:icons[metric];
 const world=metric==='life'?global?.world:undefined;
 const worldVisible=world!=null&&world>=domain[0]&&world<=domain[1];
 const pool=isCity?'UN urban areas':global?'countries / economies':'quiz countries';
 return <section className="position-scale" aria-label="Position on the full reference scale"><div className="context-heading"><h3><Icon size={20}/>Where do these values sit?</h3><span>{meta.label}{meta.unit?` · ${meta.unit}`:""} · {global?.year??meta.year}</span></div>
 <div className="position-scale-tools"><span>{zoomed?'Zoomed view':'Full range'} · linear scale</span><button onClick={()=>setZoomed(v=>!v)}>{zoomed?<RotateCcw size={12}/>:<ZoomIn size={12}/ >}{zoomed?'Full range':'Zoom to these places'}</button></div>
 <div className="position-grid position-axis-row"><span className="position-axis-note">{reference.length.toLocaleString('en-US')} {pool}{zoomed&&<small>{bins.reduce((a,b)=>a+b,0)} in this view</small>}</span><div className="position-axis"><div><span>{compactScaleValue(domain[0],metric)}</span><span>{compactScaleValue((domain[0]+domain[1])/2,metric)}</span><span>{compactScaleValue(domain[1],metric)}</span></div><svg viewBox="0 0 600 34" preserveAspectRatio="none" role="img" aria-label="Distribution of available reference places across the shown range">{bins.map((count,i)=><rect key={i} x={i*25+1} y={33-count/maxBin*30} width="23" height={count/maxBin*30} className="reference-bin"><title>{count} places: {compactScaleValue(domain[0]+i/24*(domain[1]-domain[0]),metric)} to {compactScaleValue(domain[0]+(i+1)/24*(domain[1]-domain[0]),metric)}</title></rect>)}</svg></div></div>
 {places.map((p,i)=><div key={p.id} className={`position-grid position-place position-colour-${i%5}`}><div className="position-place-label"><CountryFlag code={p.flag}/><span>{p.name}{p.countryName&&<small>{p.countryName}</small>}<b>{formatValue(p.value,metric)}</b>{p.value<domain[0]&&<small>Below shown range</small>}</span></div><div className="position-track">{worldVisible&&<i className="position-world-line" style={{left:scalePosition(world!,domain)*100+'%'}} title={`World life expectancy: ${formatValue(world!,metric)}`}/>}<span className="position-pin" data-place={p.id} data-position={scalePosition(p.value,domain)} style={{left:(shown?scalePosition(p.value,domain)*100:0)+'%'}}><Icon size={15}/></span></div></div>)}
 {world!=null&&<p className="position-benchmark"><Heart size={13}/>World life expectancy: <b>{formatValue(world,metric)}</b>{worldVisible?' · dashed marker':''}</p>}
 <p className="context-footnote">Highest in the reference data: <b>{highest.name} · {formatValue(highest.value,metric)}</b>. Grey bars count places in each interval; markers show this question. {below>0?`${below} reference places fall below the shown range. `:''}{!global&&!isCity?'This reference pool covers the quiz countries, not the whole world. ':''}{isCity?'City sizes use UN urban-area boundaries, not municipal boundaries.':''}{metric==='life'?' Life expectancy at birth is not maximum lifespan.':''}</p>
 <details className="context-sources"><summary>Scale data &amp; method</summary><p>{isCity?dataset.citySource.definition:global?.definition??meta.definition} Reference maximum is the highest available observation in this snapshot. All positions use a linear scale; zoom changes the displayed range, not the values. {metric==='population'&&!isCity?'Country population starts at one million; smaller countries sit at the left edge and are labelled below range.':''}</p><a href={global?.url??meta.url} target="_blank" rel="noreferrer">{global?.source??meta.source} ↗</a></details>
 </section>
}
