import {useState} from 'react';
import {CountryFlag} from './country-flag';
import {Check,X,ArrowDown,MoveVertical} from 'lucide-react';
import type {City,Round,ExtraAnswer} from '../lib/game';
export function CityRanking({round,answer,onChange,answered,motion}:{round:Round;answer:ExtraAnswer;onChange:(a:ExtraAnswer)=>void;answered:boolean;motion:boolean}){
 const cities=round.cities!,correct=[...cities].sort((a,b)=>b.population-a.population),selected=(answer.cities??[]).map(id=>cities.find(c=>c.id===id)!);
 const next=cities.find(c=>!answer.cities?.includes(c.id));
 const[lastPlaced,setLastPlaced]=useState<string|null>(null);
 const right=selected.filter((c,i)=>c.id===correct[i].id).length;
 function place(index:number){if(!next||answered)return;const order=[...(answer.cities??[])];order.splice(index,0,next.id);setLastPlaced(next.id);onChange({cities:order})}
 function move(c:City){if(answered)return;setLastPlaced(null);onChange({cities:(answer.cities??[]).filter(id=>id!==c.id)})}
 function row(c:City,index:number){const matches=c.id===correct[index].id,rank=correct.findIndex(x=>x.id===c.id)+1;return <button type="button" key={c.id} className={`sortable-row placed-city-row ${lastPlaced===c.id&&motion?'just-placed':''} ${answered?'is-checked':''}`} disabled={answered} aria-label={answered?`${index+1}. ${c.name}, ${matches?'correct position':`belongs at position ${rank}`}, ${c.population.toLocaleString('en-US')} people`:`Move ${c.name} to another position`} onClick={()=>move(c)}>
 <span className="sort-position">{index+1}</span><span className="rank-city-name"><CountryFlag code={c.country}/><span><strong>{c.name}</strong><small>{c.countryName}</small></span></span>
 {answered?<span className={`slot-feedback ${matches?'slot-right':'slot-wrong'}`}>{matches?<Check size={17}/>:<X size={17}/>}<span>{matches?'Correct position':`Belongs at #${rank}`}<small>{c.population.toLocaleString('en-US')} people</small></span></span>:<span className="place-move-hint"><MoveVertical size={14}/>Move</span>}
 </button>}
 return <div className={`city-game ${answered?'cities-checked':''}`}>
 <div className="inline-rank-result placement-status" role="status" aria-live="polite">{answered?<><strong>{right===5?'Perfect order!':`${right} of 5 in the right place`}</strong><span>Correct positions and populations are shown below.</span></>:<><strong>{selected.length} of 5 placed</strong><span>{next?`Place ${next.name} in the ranking.`:'All five placed. Move any city to adjust, or check your answer.'}</span></>}</div>
 <div className={`city-placement ${next&&!answered?'has-next':''}`}>
 {next&&!answered&&<section className="next-city-card" key={next.id} aria-label="City to place"><span className="placement-eyebrow">PLACE THIS CITY</span><CountryFlag code={next.country}/><strong>{next.name}</strong><span>{next.countryName}</span><small>Choose a gap in the ranking.</small></section>}
 <div className="placement-ladder" aria-label="Your city ranking"><div className="ranking-instruction">LARGEST POPULATION <ArrowDown size={12}/></div>
 {Array.from({length:selected.length+1},(_,i)=><div key={i} className="placement-step">
 {next&&!answered&&<button className={`city-placement-gap ${!selected.length?'first-placement':''}`} onClick={()=>place(i)} aria-label={`Place ${next.name} ${!selected.length?'first in the ranking':i===0?'above '+selected[0].name:i===selected.length?'below '+selected[i-1].name:'between '+selected[i-1].name+' and '+selected[i].name}`}><span>＋</span>{!selected.length?'Start ranking here':'Place here'}</button>}
 {i<selected.length&&row(selected[i],i)}
 </div>)}
 <div className="ranking-instruction placement-bottom">SMALLEST POPULATION</div>
 </div></div>
 </div>
}
