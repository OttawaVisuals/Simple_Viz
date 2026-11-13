import {Check,X,MapPin} from 'lucide-react';
import {CountryFlag} from './country-flag';
import type {Round,ExtraAnswer} from '../lib/game';
/** Four-option questions: name the flag, pick the capital, place a city in its country. */
export function ChoiceRound({round:r,answer:a,onChange,answered}:{round:Round;answer:ExtraAnswer;onChange:(a:ExtraAnswer)=>void;answered:boolean}){
 return <div className={`choice-game choice-${r.type}`}>
  {r.type==='flag'&&<div className="flag-card" role="img" aria-label="Flag to identify"><CountryFlag code={r.target!.id}/></div>}
  {r.type==='capital'&&<div className="choice-subject"><svg className="shape" viewBox="0 0 300 230" role="img" aria-label={`${r.target!.name} outline`}><path d={r.target!.shape}/></svg><strong><CountryFlag code={r.target!.id}/>{r.target!.name}</strong></div>}
  {r.type==='whereis'&&<div className="choice-subject city-subject"><MapPin size={26} aria-hidden="true"/><strong>{r.city!.name}</strong></div>}
  <div className="choice-options">{r.choices!.map((c,i)=>{
   const correct=i===r.answer,chosen=a.choice===i,flag=c.code??(r.type==='flag'&&answered?c.id:undefined);
   return <button type="button" key={c.id} className={`choice-option ${chosen?'selected':''} ${answered?(correct?'correct':chosen?'incorrect':'muted'):''}`} disabled={answered} aria-pressed={chosen} onClick={()=>onChange({choice:i})}>
    <span className="choice-key" aria-hidden="true">{i+1}</span>{flag&&<CountryFlag code={flag}/>}<span className="choice-label">{c.label}</span>
    {answered&&(correct?<span className="choice-mark verdict-right"><Check size={18}/>{chosen?'Correct':'Answer'}</span>:chosen?<span className="choice-mark verdict-wrong"><X size={18}/>Your pick</span>:null)}
   </button>})}</div>
 </div>
}
