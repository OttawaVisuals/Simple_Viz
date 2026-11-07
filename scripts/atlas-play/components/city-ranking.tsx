import {useRef,useState,type PointerEvent} from 'react';
import {CountryFlag} from './country-flag';
import {Check,X,Trophy,GripVertical} from 'lucide-react';
import {placeOnPodium} from '../lib/presentation';
import {formatValue,type Round,type ExtraAnswer} from '../lib/game';
type Drag={id:string;x:number;y:number;startX:number;startY:number;moved:boolean};
type PodiumItem={id:string;name:string;country:string;countryName?:string;shape?:string;valueLabel:string};
type RankingProps={round:Round;answer:ExtraAnswer;onChange:(a:ExtraAnswer)=>void;answered:boolean;motion:boolean};
export function CityRanking({round,answer,onChange,answered,motion}:RankingProps){
 const items=round.cities!.map(c=>({...c,valueLabel:c.population.toLocaleString('en-US')+' people'})),correctIds=[...round.cities!].sort((a,b)=>b.population-a.population).map(c=>c.id);
 return <RankingPodium items={items} correctIds={correctIds} slots={answer.cities??[]} onSlots={cities=>onChange({cities})} answered={answered} motion={motion} noun="city" measure="Population" extremes={['Largest','Middle','Smallest']}/>;
}
export function CountryRanking({round,answer,onChange,answered,motion}:RankingProps){
 const items=round.countries.map(c=>({id:c.id,name:c.name,country:c.id,shape:c.shape,valueLabel:formatValue(Number(c[round.metric]),round.metric)})),correctIds=[...round.countries].sort((a,b)=>Number(b[round.metric])-Number(a[round.metric])).map(c=>c.id);
 return <RankingPodium items={items} correctIds={correctIds} slots={answer.ranking??[]} onSlots={ranking=>onChange({ranking})} answered={answered} motion={motion} noun="country" measure="Country ranking" extremes={['Highest','Middle','Lowest']}/>;
}
function RankingPodium({items:cities,correctIds,slots:given,onSlots,answered,motion,noun,measure,extremes}:{items:PodiumItem[];correctIds:string[];slots:string[];onSlots:(slots:string[])=>void;answered:boolean;motion:boolean;noun:string;measure:string;extremes:[string,string,string]}){
 const slots=Array.from({length:3},(_,i)=>given[i]??''),count=slots.filter(Boolean).length;
 const root=useRef<HTMLDivElement>(null),dragRef=useRef<Drag|null>(null),targetRef=useRef<number|null>(null),suppressClick=useRef(false);
 const[active,setActive]=useState<string|null>(null),[drag,setDrag]=useState<Drag|null>(null),[over,setOver]=useState<number|null>(null),[landed,setLanded]=useState<string|null>(null);
 const right=slots.filter((id,i)=>id===correctIds[i]).length;
 function place(id:string,index:number){onSlots(placeOnPodium(slots,id,index));setActive(null);setLanded(id)}
 function pointerProps(id:string){return {
 onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>{if(answered||e.button!==0)return;suppressClick.current=false;dragRef.current={id,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId)},
 onPointerMove:(e:PointerEvent<HTMLButtonElement>)=>{const prev=dragRef.current;if(!prev)return;const moved=prev.moved||Math.hypot(e.clientX-prev.startX,e.clientY-prev.startY)>5;if(!moved)return;const next={...prev,x:e.clientX,y:e.clientY,moved};dragRef.current=next;setDrag(next);const targets=[...root.current!.querySelectorAll<HTMLElement>('[data-podium-slot]')];const hit=targets.find(el=>{const r=el.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});targetRef.current=hit?Number(hit.dataset.podiumSlot):null;setOver(targetRef.current)},
 onPointerUp:()=>{const d=dragRef.current;if(d?.moved){suppressClick.current=true;if(targetRef.current!==null)place(d.id,targetRef.current);else setActive(d.id)}dragRef.current=null;targetRef.current=null;setDrag(null);setOver(null)},
 onPointerCancel:()=>{dragRef.current=null;targetRef.current=null;setDrag(null);setOver(null)}
 }}
 function choose(id:string){if(suppressClick.current){suppressClick.current=false;return}setActive(v=>v===id?null:id)}
 function cityLabel(c:PodiumItem){return <><CountryFlag code={c.country}/>{c.shape&&<svg className="podium-outline" viewBox="0 0 300 230" role="img" aria-label={`${c.name} outline`}><path d={c.shape}/></svg>}<strong>{c.name}</strong>{c.countryName&&<small>{c.countryName}</small>}</>}
 return <div className="city-podium-game" ref={root}>
 <div className="inline-rank-result" role="status" aria-live="polite"><strong>{answered?(right===3?'Perfect podium!':`${right} of 3 in the right place`):active?`Place ${cities.find(c=>c.id===active)!.name}`:`${count} of 3 placed`}</strong><span>{answered?'Correct positions and values are shown on the podium.':active?'Tap a podium position.':`Drag a ${noun}, or select one and tap a podium position.`}</span></div>
 <div className="population-podium" aria-label={`${measure} podium, first is ${extremes[0].toLowerCase()}`}>
 {[1,0,2].map(index=>{const city=cities.find(c=>c.id===slots[index]),matches=city?.id===correctIds[index],actual=city?correctIds.indexOf(city.id)+1:0;return <div key={index} className={`podium-place place-${index+1} ${over===index?'podium-over':''} ${active&&city?.id===active?'podium-picked':''} ${answered?(matches?'podium-right':'podium-wrong'):''}`} data-podium-slot={index}>
 <button type="button" className={`podium-city ${city&&landed===city.id&&motion?'podium-landed':''} ${drag&&city&&drag.id===city.id?'podium-lifted':''}`} disabled={answered} {...(city?pointerProps(city.id):{})} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return}if(active)place(active,index);else if(city)choose(city.id)}} aria-label={answered?`${index+1}. ${city!.name}, ${matches?'correct':`belongs at position ${actual}`}`:active?`Place ${cities.find(c=>c.id===active)!.name} at position ${index+1}`:`${index+1}${index===0?'st':index===1?'nd':'rd'} place${city?', '+city.name:', empty'}${index===0?', '+extremes[0].toLowerCase()+' value':''}`}>
 {city?cityLabel(city):<span className="podium-empty" aria-hidden="true">＋</span>}
 {answered&&city&&<span className="podium-feedback">{matches?<Check size={16}/>:<X size={16}/>}<span>{matches?'Correct':`Correct: #${actual}`}<small>{city.valueLabel}</small></span></span>}
 </button><div className="podium-plinth"><b>{index+1}</b>{index===0&&<Trophy size={19}/>}<span>{extremes[index]}</span></div>
 </div>})}</div>
 {!answered&&count<3&&<div className="podium-city-bank" aria-label={`${noun==='city'?'Cities':'Countries'} to place`}>{cities.filter(c=>!slots.includes(c.id)).map(c=><button type="button" className={`podium-bank-city ${active===c.id?'podium-picked':''} ${drag?.id===c.id?'podium-lifted':''}`} key={c.id} {...pointerProps(c.id)} onClick={()=>choose(c.id)} aria-pressed={active===c.id} aria-label={`Select ${c.name}${c.countryName?', '+c.countryName:''}`}><GripVertical size={16}/><span>{cityLabel(c)}</span></button>)}</div>}
 {!answered&&count===3&&<p className="podium-adjust-note">Drag between positions to swap, or select a card then another position.</p>}
 {drag&&<div className="podium-drag-ghost" aria-hidden="true" style={{left:drag.x,top:drag.y}}>{cityLabel(cities.find(c=>c.id===drag.id)!)}</div>}
 </div>
}
