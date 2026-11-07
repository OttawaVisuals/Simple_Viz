import {CountryFlag} from './country-flag';
import {SortableRanking} from './sortable-ranking';
import {Check,X} from 'lucide-react';
import type {City,Round,ExtraAnswer} from '../lib/game';
export function CityRanking({round,answer,onChange,answered,motion}:{round:Round;answer:ExtraAnswer;onChange:(a:ExtraAnswer)=>void;answered:boolean;motion:boolean}){
 const cities=round.cities!,correct=[...cities].sort((a,b)=>b.population-a.population),selected=(answer.cities??[]).map(id=>cities.find(c=>c.id===id)!);
 const right=selected.filter((c,i)=>c.id===correct[i].id).length;
 function card(c:City,index:number){const matches=c.id===correct[index].id,rank=correct.findIndex(x=>x.id===c.id)+1;return <><div className="rank-city-name"><CountryFlag code={c.country}/><span><strong>{c.name}</strong><small>{c.countryName}</small></span></div>{answered&&<div className={`slot-feedback ${matches?'slot-right':'slot-wrong'}`}>{matches?<Check size={17}/>:<X size={17}/>}<span>{matches?'Correct position':`Belongs at #${rank}`}<small>{c.population.toLocaleString('en-US')} people</small></span></div>}</>}
 return <div className={`city-game ${answered?'cities-checked':''}`}>
 <div className="ranking-instruction">LARGEST POPULATION <span>↓</span> SMALLEST</div>
 <div className="inline-rank-result" role="status" aria-live="polite">{answered?<><strong>{right===5?'Perfect order!':`${right} of 5 in the right place`}</strong><span>Each city’s result is shown below.</span></>:<><strong>Set your ranking</strong><span>Drag the handles or use the arrows to change the order.</span></>}</div>
 <SortableRanking items={selected} onOrder={items=>onChange({cities:items.map(c=>c.id)})} renderItem={card} disabled={answered} motion={motion} label="Your city ranking"/>

 </div>
}
