import {useRef,useState,type PointerEvent} from 'react';
import {CountryFlag} from './country-flag';
import {Check,X,Trophy,GripVertical} from 'lucide-react';
import {placeOnPodium} from '../lib/presentation';
import type {City,Round,ExtraAnswer} from '../lib/game';
type Drag={id:string;x:number;y:number;startX:number;startY:number;moved:boolean};
export function CityRanking({round,answer,onChange,answered,motion}:{round:Round;answer:ExtraAnswer;onChange:(a:ExtraAnswer)=>void;answered:boolean;motion:boolean}){
 const cities=round.cities!,correct=[...cities].sort((a,b)=>b.population-a.population),slots=Array.from({length:3},(_,i)=>answer.cities?.[i]??''),count=slots.filter(Boolean).length;
 const root=useRef<HTMLDivElement>(null),dragRef=useRef<Drag|null>(null),targetRef=useRef<number|null>(null),suppressClick=useRef(false);
 const[active,setActive]=useState<string|null>(null),[drag,setDrag]=useState<Drag|null>(null),[over,setOver]=useState<number|null>(null),[landed,setLanded]=useState<string|null>(null);
 const right=slots.filter((id,i)=>id===correct[i].id).length;
 function place(id:string,index:number){onChange({cities:placeOnPodium(slots,id,index)});setActive(null);setLanded(id)}
 function pointerProps(id:string){return {
 onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>{if(answered||e.button!==0)return;suppressClick.current=false;dragRef.current={id,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId)},
 onPointerMove:(e:PointerEvent<HTMLButtonElement>)=>{const prev=dragRef.current;if(!prev)return;const moved=prev.moved||Math.hypot(e.clientX-prev.startX,e.clientY-prev.startY)>5;if(!moved)return;const next={...prev,x:e.clientX,y:e.clientY,moved};dragRef.current=next;setDrag(next);const targets=[...root.current!.querySelectorAll<HTMLElement>('[data-podium-slot]')];const hit=targets.find(el=>{const r=el.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom});targetRef.current=hit?Number(hit.dataset.podiumSlot):null;setOver(targetRef.current)},
 onPointerUp:()=>{const d=dragRef.current;if(d?.moved){suppressClick.current=true;if(targetRef.current!==null)place(d.id,targetRef.current);else setActive(d.id)}dragRef.current=null;targetRef.current=null;setDrag(null);setOver(null)},
 onPointerCancel:()=>{dragRef.current=null;targetRef.current=null;setDrag(null);setOver(null)}
 }}
 function choose(id:string){if(suppressClick.current){suppressClick.current=false;return}setActive(v=>v===id?null:id)}
 function cityLabel(c:City){return <><CountryFlag code={c.country}/><strong>{c.name}</strong><small>{c.countryName}</small></>}
 return <div className="city-podium-game" ref={root}>
 <div className="inline-rank-result" role="status" aria-live="polite"><strong>{answered?(right===3?'Perfect podium!':`${right} of 3 in the right place`):active?`Place ${cities.find(c=>c.id===active)!.name}`:`${count} of 3 placed`}</strong><span>{answered?'Correct positions and populations are shown on the podium.':active?'Tap a podium position.':'Drag a city, or select one and tap a podium position.'}</span></div>
 <div className="population-podium" aria-label="Population podium, first is largest">
 {[1,0,2].map(index=>{const city=cities.find(c=>c.id===slots[index]),matches=city?.id===correct[index].id,actual=city?correct.findIndex(c=>c.id===city.id)+1:0;return <div key={index} className={`podium-place place-${index+1} ${over===index?'podium-over':''} ${active&&city?.id===active?'podium-picked':''} ${answered?(matches?'podium-right':'podium-wrong'):''}`} data-podium-slot={index}>
 <button type="button" className={`podium-city ${city&&landed===city.id&&motion?'podium-landed':''} ${drag&&city&&drag.id===city.id?'podium-lifted':''}`} disabled={answered} {...(city?pointerProps(city.id):{})} onClick={()=>{if(suppressClick.current){suppressClick.current=false;return}if(active)place(active,index);else if(city)choose(city.id)}} aria-label={answered?`${index+1}. ${city!.name}, ${matches?'correct':`belongs at position ${actual}`}`:active?`Place ${cities.find(c=>c.id===active)!.name} at position ${index+1}`:`${index+1}${index===0?'st':index===1?'nd':'rd'} place${city?', '+city.name:', empty'}${index===0?', largest population':''}`}>
 {city?cityLabel(city):<span className="podium-empty" aria-hidden="true">＋</span>}
 {answered&&city&&<span className="podium-feedback">{matches?<Check size={16}/>:<X size={16}/>}<span>{matches?'Correct':`Correct: #${actual}`}<small>{city.population.toLocaleString('en-US')} people</small></span></span>}
 </button><div className="podium-plinth"><b>{index+1}</b>{index===0&&<Trophy size={19}/>}<span>{index===0?'Largest':index===1?'Middle':'Smallest'}</span></div>
 </div>})}</div>
 {!answered&&count<3&&<div className="podium-city-bank" aria-label="Cities to place">{cities.filter(c=>!slots.includes(c.id)).map(c=><button type="button" className={`podium-bank-city ${active===c.id?'podium-picked':''} ${drag?.id===c.id?'podium-lifted':''}`} key={c.id} {...pointerProps(c.id)} onClick={()=>choose(c.id)} aria-pressed={active===c.id} aria-label={`Select ${c.name}, ${c.countryName}`}><GripVertical size={16}/><span>{cityLabel(c)}</span></button>)}</div>}
 {!answered&&count===3&&<p className="podium-adjust-note">Drag between positions to swap, or select a city then another position.</p>}
 {drag&&<div className="podium-drag-ghost" aria-hidden="true" style={{left:drag.x,top:drag.y}}>{cityLabel(cities.find(c=>c.id===drag.id)!)}</div>}
 </div>
}
