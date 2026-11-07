import {worldUrl} from "../assets";
"use client";
import {useEffect,useLayoutEffect,useRef,type RefObject} from "react";
import {animate,createScope,stagger} from "animejs";
import type {Country,Round} from "../lib/game";

export function AnimatedNumber({value,motion}:{value:number;motion:boolean}){
 const el=useRef<HTMLSpanElement>(null),previous=useRef(value);
 useEffect(()=>{
  const from=previous.current;previous.current=value;
  if(!el.current||!motion){if(el.current)el.current.textContent=String(value);return}
  const counter={value:from};
  const animation=animate(counter,{value,duration:650,ease:"out(4)",onUpdate:()=>{if(el.current)el.current.textContent=String(Math.round(counter.value))}});
  return()=>{animation.cancel()};
 },[value,motion]);
 return <span ref={el}>{value}</span>
}

export function useQuizMotion(root:RefObject<HTMLDivElement|null>,round:Round|null,answered:boolean,won:boolean,selection:number|null,order:Country[],finished:boolean,motion:boolean){
 const positions=useRef<Map<string,number>>(new Map());
 useEffect(()=>{
  if(!root.current||!motion)return;
  const scope=createScope({root}).add(()=>{
   animate(".intro-copy > *",{opacity:[0,1],y:[18,0],delay:stagger(85),duration:800,ease:"out(4)"});
   animate(".atlas-orb",{opacity:[0,1],scale:[.82,1],rotate:[-12,0],duration:1200,ease:"out(4)"});
  });return()=>scope.revert();
 },[motion,root]);
 useEffect(()=>{
  if(!root.current||!round||!motion||finished)return;
  const scope=createScope({root}).add(()=>{
   animate(".question-head > *",{opacity:[0,1],y:[12,0],duration:550,delay:stagger(50),ease:"out(4)"});
   animate(".country-choice,.target-country,.anchor-country,.rank-row,.city-option,.ratio-options .extra-option,.estimate-country,.pin-game",{opacity:[0,1],y:[20,0],delay:stagger(65,{start:100}),duration:650,ease:"out(4)"});
   root.current!.querySelectorAll<SVGPathElement>(".play-area .shape path").forEach((path,i)=>{
    const length=path.getTotalLength();
    animate(path,{strokeDasharray:[length,length],strokeDashoffset:[length,0],fillOpacity:[.12,1],delay:150+i*70,duration:1100,ease:"out(3)"});
   });
  });return()=>scope.revert();
 },[round,finished,motion,root]);
 useEffect(()=>{
  if(!root.current||!motion||selection===null||answered)return;
  const scope=createScope({root}).add(()=>{animate(".gap.selected,.country-choice.selected",{scale:[.97,1],duration:420,ease:"out(4)"})});
  return()=>scope.revert();
 },[selection,answered,motion,root]);
 useEffect(()=>{
  if(!root.current||!motion||!answered)return;
  const scope=createScope({root}).add(()=>{
   animate(".answer-panel",{opacity:[0,1],y:[18,0],duration:500,ease:"out(4)"});
   const bars=root.current!.querySelectorAll(".bar-track > div");if(bars.length)animate(bars,{scaleX:[0,1],delay:stagger(75,{start:150}),duration:850,ease:"out(4)"});
   root.current!.querySelectorAll<SVGPathElement>(".growth-line").forEach((path,i)=>{const n=path.getTotalLength();animate(path,{strokeDasharray:[n,n],strokeDashoffset:[n,0],delay:i*150,duration:1100,ease:"out(3)"})});
   if(won){
    animate(".score-main",{scale:[1.08,1],duration:550,ease:"out(4)"});
    root.current!.querySelectorAll<HTMLElement>(".confetti-piece").forEach((piece,i)=>animate(piece,{x:[0,(i-7.5)*24],y:[-20,80+(i%4)*35],rotate:[0,(i%2?1:-1)*(100+i*25)],opacity:[1,0],delay:i*12,duration:1250,ease:"out(3)"}));
   }
  });return()=>scope.revert();
 },[answered,won,motion,root]);
 useEffect(()=>{
  if(!root.current||!motion||!finished)return;
  const scope=createScope({root}).add(()=>{animate(".summary > *",{opacity:[0,1],y:[20,0],delay:stagger(80),duration:650,ease:"out(4)"})});
  return()=>scope.revert();
 },[finished,motion,root]);
 useLayoutEffect(()=>{
  if(!root.current||!motion||positions.current.size===0)return;
  const animations:Array<ReturnType<typeof animate>>=[];
  root.current.querySelectorAll<HTMLElement>(".rank-row").forEach(row=>{
   const old=positions.current.get(row.dataset.country!);if(old===undefined)return;
   const difference=old-row.getBoundingClientRect().top;
   if(difference)animations.push(animate(row,{y:[difference,0],duration:450,ease:"out(4)"}));
  });positions.current.clear();return()=>animations.forEach(a=>a.revert());
 },[order,motion,root]);
 return()=>{positions.current=new Map(Array.from(root.current?.querySelectorAll<HTMLElement>(".rank-row")??[]).map(row=>[row.dataset.country!,row.getBoundingClientRect().top]))};
}

export function AtlasOrb(){return <div className="atlas-orb" aria-hidden="true"><span className="orb-orbit"/><svg viewBox="0 0 200 200"><defs><radialGradient id="globe-fill" cx="35%" cy="28%" r="75%"><stop offset="0%" stopColor="#f0f5db"/><stop offset="65%" stopColor="#d1dfb9"/><stop offset="100%" stopColor="#9eb487"/></radialGradient><clipPath id="globe-clip"><circle cx="100" cy="100" r="73"/></clipPath></defs><circle cx="100" cy="100" r="89" fill="none" stroke="#9eae8c" strokeDasharray="1 6"/><circle cx="100" cy="100" r="73" fill="url(#globe-fill)"/><g clipPath="url(#globe-clip)"><image href={worldUrl} x="-66" y="17" width="330" height="165" opacity=".9"/><g fill="none" stroke="#638259" strokeWidth=".7" opacity=".38"><ellipse cx="100" cy="100" rx="35" ry="73"/><ellipse cx="100" cy="100" rx="62" ry="73"/><ellipse cx="100" cy="100" rx="73" ry="27"/><ellipse cx="100" cy="100" rx="73" ry="56"/><path d="M27 100h146M100 27v146"/></g></g><ellipse cx="100" cy="100" rx="86" ry="26" transform="rotate(-28 100 100)" fill="none" stroke="#72925f" strokeWidth="1"/><circle cx="170" cy="59" r="5" fill="#d47b48" stroke="#f6f5ed" strokeWidth="3"/><path d="M100 4v10M100 186v10M4 100h10M186 100h10" stroke="#9eae8c"/></svg><span className="orb-caption">54 COUNTRIES · 6,172 WORLD CITIES</span></div>}
