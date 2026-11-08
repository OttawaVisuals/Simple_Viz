import {forwardRef,useEffect,useImperativeHandle,useRef,useState,type FormEvent} from 'react';
import type {FeedbackReport} from '../lib/feedback-context';
export type FeedbackHandle={report:(value:FeedbackReport)=>void};

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

export const PageFeedback=forwardRef<FeedbackHandle>(function PageFeedback(_,ref){
 const section=useRef<HTMLElement>(null);
 const [report,setReport]=useState<FeedbackReport|null>(null);
 const [openCount,setOpenCount]=useState(0);
 const [rating,setRating]=useState('');
 const [comment,setComment]=useState('');
 const [sending,setSending]=useState(false);
 const [status,setStatus]=useState('');
 const [failed,setFailed]=useState(false);
 useImperativeHandle(ref,()=>({report(value){if(sending)return;setReport(value);setStatus('');setFailed(false);setOpenCount(count=>count+1);}}),[sending]);
 useEffect(()=>{if(!openCount)return;section.current?.scrollIntoView({behavior:'instant',block:'center'});section.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus({preventScroll:true});},[openCount]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(sending)return;
  if(!rating){setStatus('Choose a clarity rating before sending.');return;}
  if(location.protocol==='file:'){setStatus('Feedback can be sent from madeclear.ca.');return;}
  const form=new FormData(event.currentTarget);
  setSending(true);setFailed(false);setStatus('Sending…');
  try{
   const response=await fetch('/api/feedback',{
    method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},
    body:JSON.stringify({page:'atlas-play',rating,comment,website:String(form.get('website')||''),context:report?report.context:currentContext()})
   });
   if(!response.ok)throw new Error('Feedback request failed');
   setStatus('Thank you — your feedback is private.');setComment('');setReport(null);
  }catch{setFailed(true);setStatus('Could not send. Please try again, or email ');}
  finally{setSending(false);}
 }
 return <section id="page-feedback" ref={section} className="page-feedback" data-feedback aria-labelledby="feedback-heading">
  <div className="feedback-head"><div><p className="feedback-kicker">Private feedback</p><h2 id="feedback-heading">Was this clear?</h2><p className="feedback-copy">Your response is private and helps improve this page.</p></div>
   <div className="feedback-choices" role="group" aria-label="Clarity rating">{ratings.map(([value,label])=><button key={value} className="feedback-choice" type="button" disabled={sending} aria-pressed={rating===value} onClick={()=>{setRating(value);setStatus('');setFailed(false);}}>{label}</button>)}</div>
  </div>
  <p className="feedback-privacy">No reply address is collected. <a href="../about.html#feedback-privacy">How private feedback works</a>.</p>
  {(rating||report)&&<form className="feedback-form" onSubmit={submit}>
   {report&&<div className="feedback-report"><p role="status">Reporting: <strong>{report.title}</strong></p><p>The question and choices were captured when you opened this report.</p><button type="button" className="text-button" disabled={sending} onClick={()=>setReport(null)}>Cancel question report</button></div>}
   <label htmlFor="feedback-comment">What could be clearer? <span>Optional, 1,200 characters maximum.</span></label>
   <textarea id="feedback-comment" name="comment" maxLength={1200} value={comment} disabled={sending} onChange={event=>setComment(event.target.value)} placeholder="A confusing step, a possible mistake, or an idea…"/>
   <label className="feedback-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
   <div className="feedback-actions"><button className="feedback-send" type="submit" disabled={sending}>Send private feedback</button><span className="feedback-status" role="status" aria-live="polite">{status}{failed&&<a href="mailto:hello@madeclear.ca">hello@madeclear.ca</a>}</span></div>
  </form>}
 </section>;
});
