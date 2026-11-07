import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {animate} from 'animejs';
import {GripVertical,ArrowUp,ArrowDown} from 'lucide-react';
type Item={id:string};
export function SortableRanking<T extends Item>({items,onOrder,renderItem,disabled=false,motion=true,label}:{items:T[];onOrder:(items:T[])=>void;renderItem:(item:T,index:number)=>ReactNode;disabled?:boolean;motion?:boolean;label:string}){
 const list=useRef<HTMLDivElement>(null),current=useRef(items);current.current=items;
 const [drag,setDrag]=useState<{id:string;x:number;y:number;width:number;height:number;dx:number;dy:number}|null>(null);
 const active=useRef<typeof drag>(null),original=useRef<T[]>([]),positions=useRef(new Map<string,number>());
 function reorder(from:number,to:number){if(from===to||to<0||to>=current.current.length)return;positions.current=new Map([...list.current!.querySelectorAll<HTMLElement>('[data-sort-id]')].map(el=>[el.dataset.sortId!,el.getBoundingClientRect().top]));const next=[...current.current];next.splice(to,0,next.splice(from,1)[0]);current.current=next;onOrder(next)}
 useLayoutEffect(()=>{if(!motion){positions.current.clear();return}const animations:ReturnType<typeof animate>[]=[];list.current?.querySelectorAll<HTMLElement>('[data-sort-id]').forEach(el=>{const before=positions.current.get(el.dataset.sortId!);if(before!==undefined){const delta=before-el.getBoundingClientRect().top;if(delta)animations.push(animate(el,{translateY:[delta,0],duration:220,ease:'out(3)'}))}});positions.current.clear();return()=>animations.forEach(a=>a.revert())},[items,motion]);
 return <div className="sortable-ranking" ref={list} aria-label={label}>
 {items.map((item,index)=><div key={item.id} data-sort-id={item.id} className={`sortable-row ${drag?.id===item.id?'is-lifted':''} ${disabled?'is-checked':''}`}>
 <span className="sort-position">{index+1}</span>
 {!disabled&&<button className="sort-handle" aria-label={`Drag position ${index+1} to reorder`} onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();const row=e.currentTarget.closest('[data-sort-id]')!.getBoundingClientRect();const next={id:item.id,x:row.left,y:row.top,width:row.width,height:row.height,dx:e.clientX-row.left,dy:e.clientY-row.top};original.current=[...current.current];active.current=next;setDrag(next);e.currentTarget.setPointerCapture(e.pointerId)}}
 onPointerMove={e=>{if(!active.current)return;const next={...active.current,x:e.clientX-active.current.dx,y:e.clientY-active.current.dy};active.current=next;setDrag(next);const rows=[...list.current!.querySelectorAll<HTMLElement>('[data-sort-id]')];const target=rows.findIndex(row=>{const top=list.current!.getBoundingClientRect().top+row.offsetTop;return e.clientY>=top&&e.clientY<=top+row.offsetHeight});const from=current.current.findIndex(i=>i.id===next.id);if(target>=0)reorder(from,target);if(e.clientY<70)window.scrollBy(0,-12);else if(e.clientY>window.innerHeight-70)window.scrollBy(0,12)}}
 onPointerUp={()=>{active.current=null;setDrag(null)}} onPointerCancel={()=>{active.current=null;setDrag(null);onOrder(original.current)}}><GripVertical size={20}/></button>}
 <div className="sort-content">{renderItem(item,index)}</div>
 {!disabled&&<span className="sort-arrows"><button aria-label={`Move position ${index+1} up`} disabled={index===0} onClick={()=>reorder(index,index-1)}><ArrowUp size={15}/></button><button aria-label={`Move position ${index+1} down`} disabled={index===items.length-1} onClick={()=>reorder(index,index+1)}><ArrowDown size={15}/></button></span>}
 </div>)}
 {drag&&<div className="sort-ghost" aria-hidden="true" style={{left:drag.x,top:drag.y,width:drag.width,minHeight:drag.height}}><GripVertical size={20}/><div className="sort-content">{renderItem(items.find(i=>i.id===drag.id)!,items.findIndex(i=>i.id===drag.id))}</div></div>}
 <span className="sr-only" role="status" aria-live="polite">{drag?`Moving position ${items.findIndex(i=>i.id===drag.id)+1}`:''}</span>
 </div>
}
