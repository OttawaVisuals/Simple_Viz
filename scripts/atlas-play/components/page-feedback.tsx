import {useState,type FormEvent} from 'react';

const ratings=[['clear','Yes'],['almost','Almost'],['not-yet','Not yet']] as const;

function currentContext(){
 const context:string[]=[];
 const question=document.querySelector('.question-head h2')?.textContent?.trim();
 if(question)context.push('Question: '+question);
 document.querySelectorAll('select').forEach(select=>{
  const label=select.getAttribute('aria-label')||document.querySelector(`label[for="${select.id}"]`)?.textContent?.trim()||'Selection';
  const option=select.options[select.selectedIndex];
  if(option)context.push(label+': '+option.textContent?.trim());
 });
 return context.slice(0,20).map(value=>value.slice(0,200));
}

export function PageFeedback(){
 const [rating,setRating]=useState('');
 const [comment,setComment]=useState('');
 const [sending,setSending]=useState(false);
 const [status,setStatus]=useState('');
 const [failed,setFailed]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!rating||sending)return;
  if(location.protocol==='file:'){setStatus('Feedback can be sent from madeclear.ca.');return;}
  const form=new FormData(event.currentTarget);
  setSending(true);setFailed(false);setStatus('Sending…');
  try{
   const response=await fetch('/api/feedback',{
    method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},
    body:JSON.stringify({page:'atlas-play',rating,comment,website:String(form.get('website')||''),context:currentContext()})
   });
   if(!response.ok)throw new Error('Feedback request failed');
   setStatus('Thank you — your feedback is private.');setComment('');
  }catch{setFailed(true);setStatus('Could not send. Please try again, or email ');}
  finally{setSending(false);}
 }
 return <section className="page-feedback" data-feedback aria-labelledby="feedback-heading">
  <div className="feedback-head"><div><p className="feedback-kicker">Private feedback</p><h2 id="feedback-heading">Was this clear?</h2><p className="feedback-copy">Your response is private and helps improve this page.</p></div>
   <div className="feedback-choices" role="group" aria-label="Clarity rating">{ratings.map(([value,label])=><button key={value} className="feedback-choice" type="button" disabled={sending} aria-pressed={rating===value} onClick={()=>{setRating(value);setStatus('');setFailed(false);}}>{label}</button>)}</div>
  </div>
  {rating&&<form className="feedback-form" onSubmit={submit}>
   <label htmlFor="feedback-comment">What could be clearer? <span>Optional, 1,200 characters maximum.</span></label>
   <textarea id="feedback-comment" name="comment" maxLength={1200} value={comment} disabled={sending} onChange={event=>setComment(event.target.value)} placeholder="A confusing step, a possible mistake, or an idea…"/>
   <label className="feedback-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
   <div className="feedback-actions"><button className="feedback-send" type="submit" disabled={sending}>Send private feedback</button><span className="feedback-status" role="status" aria-live="polite">{status}{failed&&<a href="mailto:hello@madeclear.ca">hello@madeclear.ca</a>}</span></div>
  </form>}
 </section>;
}
