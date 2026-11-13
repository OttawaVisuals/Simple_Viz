import {languageMetadata,languageEntries} from "../lib/languages";
import {PageFeedback,type FeedbackHandle} from "../components/page-feedback";
import {QuizHelp} from "../components/quiz-help";
import {questionReport} from "../lib/feedback-context";
import {CountryRanking} from "../components/city-ranking";
import {questionTitle} from "../lib/presentation";
import {dataUrl,borderLicenseUrl,visualDataUrl,referenceDataUrl,languageDataUrl} from "../assets";
"use client";
import {useEffect,useState,useRef} from "react";
import {AnimatedNumber,useQuizMotion} from "../components/quiz-motion";
import {ExtraRound,RevealDetails,RevealFigure,extraHelp,isExtra} from "../components/extra-rounds";
import {Globe2,ArrowRight,ArrowDown,X,Check,GripVertical,MoveVertical,Layers3,BarChart3,ExternalLink,Activity,MapPin,ListOrdered,TrendingUp,SlidersHorizontal,Ratio,ScanSearch,Languages,Flag,Landmark,Building2,CalendarDays,Heart,Flame,Timer,Share2,RotateCcw,Home as HomeIcon,Minus} from "lucide-react";
import {closestIndex,generateRound,formatValue,scoreAnswer,awardPoints,canAnswer,roundSource,explanation,answerSummary,shuffle,availableTypes,trailTypes,modeNames,seededRandom,normalizeDataset,type Difficulty,type Kind,type ExtraAnswer,type Country,type Metric,type Round,type Dataset,type Result,type Award,type Random} from "../lib/game";
const icons={compare:BarChart3,insert:MoveVertical,rank:Layers3,topfive:ListOrdered,gap:Ratio,exception:ScanSearch,pin:MapPin,estimate:SlidersHorizontal,history:TrendingUp,languages:Languages,flag:Flag,capital:Landmark,whereis:Building2};
const labels:Record<Kind,string>={compare:"Head to head",insert:"Closest value",rank:"Podium",topfive:"City podium",gap:"Guess the gap",exception:"Odd one out",pin:"Pin the city",estimate:"Estimate",history:"Then vs now",languages:"Languages",flag:"Name the flag",capital:"Capital city",whereis:"City to country"};
type Mode="daily"|"classic"|"survival"|"practice";
type Screen="start"|"play"|"done";
type LogEntry={title:string;summary:string;kind:Kind;result:Result;award:Award};
type DailyRecord={date:string;points:number;correct:number;marks:string};
const RUN_LENGTH=10,LIVES=3,SITE="https://madeclear.ca/visualizations/atlas-play.html";
const modeLabels:Record<Mode,string>={daily:"Daily trail",classic:"Classic",survival:"Survival",practice:"Custom game"};
const read=(key:string)=>{try{return localStorage.getItem(key)}catch{return null}};
const write=(key:string,value:string)=>{try{localStorage.setItem(key,value)}catch{}};
function today(){const d=new Date(),pad=(n:number)=>String(n).padStart(2,"0");return{key:`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,label:d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}}
const markOf=(r:Result)=>r.correct?"full":r.fraction>0?"part":"miss";
function Shape({country,small=false}:{country:Country;small?:boolean}){return <svg className={small?"shape small":"shape"} viewBox="0 0 300 230" role="img" aria-label={`${country.name} outline`}><path d={country.shape}/></svg>}

export default function Home(){
 const [dark,setDark]=useState(()=>window.matchMedia("(prefers-color-scheme: dark)").matches);
 useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light"},[dark]);
 const root=useRef<HTMLDivElement>(null),feedback=useRef<FeedbackHandle>(null);
 const queue=useRef<Kind[]>([]),plan=useRef<Round[]>([]),startedAt=useRef(0);
 const[motion,setMotion]=useState(false);
 useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");setMotion(!media.matches&&read("atlas-motion")!=="off");const update=()=>{if(media.matches)setMotion(false)};media.addEventListener("change",update);return()=>media.removeEventListener("change",update)},[]);
 function toggleMotion(){setMotion(v=>{write("atlas-motion",v?"off":"on");return !v})}
 const[data,setData]=useState<Dataset|null>(null),[error,setError]=useState(false),[sources,setSources]=useState(false);
 // Settings chosen on the start screen.
 const[screen,setScreen]=useState<Screen>("start"),[mode,setMode]=useState<Mode>("classic"),[difficulty,setDifficulty]=useState<Difficulty>(()=>(read("atlas-difficulty") as Difficulty)||"medium"),[timed,setTimed]=useState(()=>read("atlas-timed")==="on");
 const[filter,setFilter]=useState<Metric|"all">("all"),[style,setStyle]=useState<Kind|"mixed">("mixed"),[cityMinimum,setCityMinimum]=useState(1000000);
 // The run in progress.
 const[round,setRound]=useState<Round|null>(null),[number,setNumber]=useState(1),[points,setPoints]=useState(0),[streak,setStreak]=useState(0),[bestStreak,setBestStreak]=useState(0),[lives,setLives]=useState(LIVES),[log,setLog]=useState<LogEntry[]>([]);
 const[selection,setSelection]=useState<number|null>(null),[order,setOrder]=useState<Country[]>([]),[extraAnswer,setExtraAnswer]=useState<ExtraAnswer>({}),[answered,setAnswered]=useState(false),[last,setLast]=useState<{result:Result;award:Award}|null>(null);
 const[records,setRecords]=useState<{daily:DailyRecord|null;classic:Record<Difficulty,number>;survival:number}>({daily:null,classic:{easy:0,medium:0,hard:0},survival:0}),[newBest,setNewBest]=useState(false),[copied,setCopied]=useState(false);
 const day=today();

 useEffect(()=>{fetch(dataUrl).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<Dataset>}).then(d=>setData(normalizeDataset(d))).catch(()=>setError(true));
  let daily:DailyRecord|null=null;try{daily=JSON.parse(read("atlas-daily")||"null")}catch{}
  setRecords({daily,classic:{easy:Number(read("atlas-best-classic-easy"))||0,medium:Number(read("atlas-best-classic-medium"))||0,hard:Number(read("atlas-best-classic-hard"))||0},survival:Number(read("atlas-best-survival"))||0})},[]);
 useEffect(()=>{if(!sources)return;const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setSources(false)};document.addEventListener("keydown",close);return()=>document.removeEventListener("keydown",close)},[sources]);

 const playedToday=records.daily?.date===day.key?records.daily:null;
 /** Difficulty of question n. The daily trail is always medium; Survival climbs. */
 function levelFor(m:Mode,n:number):Difficulty{return m==="daily"?"medium":m==="survival"?(n<=4?"easy":n<=9?"medium":"hard"):difficulty}
 function nextType(types:Kind[],previous:Kind|undefined,rng:Random):Kind{
  if(!queue.current.length)queue.current=shuffle(types,rng);
  if(queue.current[0]===previous&&queue.current.length>1)[queue.current[0],queue.current[1]]=[queue.current[1],queue.current[0]];
  return queue.current.shift()!
 }
 function makeRound(m:Mode,n:number,previous:Kind|undefined,rng:Random=Math.random):Round{
  const level=levelFor(m,n);
  if(m==="practice"){const type=style!=="mixed"?style:nextType(trailTypes(filter),previous,rng);return generateRound(data!,filter,previous,false,type,{difficulty:level,cityMinimum,rng,mixed:style==="mixed"})}
  // Every run opens with a familiar head-to-head, so the first question is never an obscure one.
  if(n===1)return generateRound(data!,rng()<.5?"population":"area",undefined,false,"compare",{difficulty:level,rng});
  return generateRound(data!,"all",previous,false,nextType(trailTypes("all"),previous,rng),{difficulty:level,rng,mixed:true})
 }
 function show(r:Round){setRound(r);setOrder(r.countries);setExtraAnswer({});setSelection(null);setAnswered(false);setLast(null);startedAt.current=performance.now()}
 function start(m:Mode){
  if(!data)return;queue.current=[];setMode(m);setNumber(1);setPoints(0);setStreak(0);setBestStreak(0);setLives(LIVES);setLog([]);setNewBest(false);setCopied(false);
  if(m==="daily"){const rng=seededRandom("atlas-daily-"+day.key);plan.current=[];let previous:Kind|undefined;for(let n=1;n<=RUN_LENGTH;n++){const r=makeRound(m,n,previous,rng);plan.current.push(r);previous=r.type}show(plan.current[0])}
  else show(makeRound(m,1,undefined));
  setScreen("play")
 }
 const ready=round?canAnswer(round,selection,extraAnswer):false,level=levelFor(mode,number),clock=timed&&mode!=="daily";
 function submit(){
  if(!round||answered||!ready)return;
  const result=scoreAnswer(round,selection,order,extraAnswer),award=awardPoints(result,level,streak,clock?(performance.now()-startedAt.current)/1000:undefined);
  setLast({result,award});setAnswered(true);setPoints(p=>p+award.total);const run=result.correct?streak+1:0;setStreak(run);setBestStreak(b=>Math.max(b,run));
  if(mode==="survival"&&!result.correct)setLives(l=>l-1);
  setLog(l=>[...l,{title:questionTitle(round),summary:answerSummary(round),kind:round.type,result,award}])
 }
 // Reveal as soon as the answer is complete: a tap, or the last item dropped. Pin and estimate keep the Check button because they can be adjusted.
 useEffect(()=>{if(round&&ready&&!answered&&round.type!=="pin"&&round.type!=="estimate")submit()},[round,ready,answered,selection,extraAnswer]);
 const over=mode==="survival"?lives<=0:number>=RUN_LENGTH;
 function finish(){
  const correct=log.filter(e=>e.result.correct).length;let best=false;
  if(mode==="daily"&&!playedToday){const record={date:day.key,points,correct,marks:log.map(e=>markOf(e.result)).join(",")};write("atlas-daily",JSON.stringify(record));setRecords(r=>({...r,daily:record}))}
  if(mode==="classic"&&points>records.classic[difficulty]){best=true;write("atlas-best-classic-"+difficulty,String(points));setRecords(r=>({...r,classic:{...r.classic,[difficulty]:points}}))}
  if(mode==="survival"&&points>records.survival){best=true;write("atlas-best-survival",String(points));setRecords(r=>({...r,survival:points}))}
  setNewBest(best);setScreen("done")
 }
 function next(){if(!answered)return;if(over){finish();return}const n=number+1;setNumber(n);show(mode==="daily"?plan.current[n-1]:makeRound(mode,n,round?.type))}
 // Enter checks the answer, then moves on. Ignored while a control that uses Enter has focus.
 useEffect(()=>{if(screen!=="play"||sources)return;const key=(e:KeyboardEvent)=>{if(e.key!=="Enter"||e.repeat)return;const t=e.target as HTMLElement;if(t.closest("button,a,input,select,textarea,summary,[role=application]"))return;if(answered)next();else submit()};document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)});
 useEffect(()=>{window.scrollTo({top:0,behavior:"instant"})},[round,screen]);
 // Bring the verdict into view above the sticky action bar.
 useEffect(()=>{if(!answered)return;const timer=setTimeout(()=>{const v=root.current?.querySelector<HTMLElement>(".verdict");if(!v)return;const box=v.getBoundingClientRect(),limit=window.innerHeight-90;if(box.bottom>limit||box.top<80)window.scrollBy({top:Math.min(box.top-90,box.bottom-limit),behavior:"instant"})},60);return()=>clearTimeout(timer)},[answered]);
 useQuizMotion(root,screen==="play"?round:null,answered,!!last?.result.correct,selection,order,screen==="done",motion);

 const meta=round&&data?roundSource(data,round):null,sorted=round?[...round.countries,...(round.target?[round.target]:[])].sort((a,b)=>Number(b[round.metric])-Number(a[round.metric])):[];
 const Icon=round?icons[round.type]:Globe2,correctIndex=round?.target&&round.type==="insert"?closestIndex(round):0;
 const correctCount=log.filter(e=>e.result.correct).length;
 const headline=!last?"":last.result.correct?(last.result.fraction>.999?["Spot on.","Right on the map.","Nailed it.","Exactly right."][number%4]:"Within range."):last.result.fraction>0?"Close.":"Not this time.";
 const shareText=()=>`Atlas Play · ${mode==="daily"?"Daily "+day.label:modeLabels[mode]}\n${points.toLocaleString("en-US")} pts · ${correctCount}/${log.length}\n${log.map(e=>({full:"🟩",part:"🟨",miss:"🟥"})[markOf(e.result)]).join("")}\n${SITE}`;
 async function share(){const text=shareText();try{await navigator.clipboard.writeText(text)}catch{const box=document.createElement("textarea");box.value=text;document.body.appendChild(box);box.select();try{document.execCommand("copy")}catch{}box.remove()}setCopied(true)}

 return <div className={`app screen-${screen}`} ref={root} data-motion={motion?"on":"off"}>
 <header className="header"><a href="../index.html" className="brand" aria-label="Back to Made clear" title="Back to Made clear"><span className="brand-icon"><Globe2 size={25}/></span>atlas<span className="brand-light">play</span><span className="beta">BETA</span></a><div className="header-actions"><button className="text-button theme-toggle" onClick={()=>setDark(v=>!v)} aria-label="Toggle color theme">{dark?"Light":"Dark"}</button><button className="motion-toggle" aria-pressed={motion} onClick={toggleMotion}><Activity size={14}/><span>Motion {motion?"on":"off"}</span><i/></button><button className="text-button" onClick={()=>setSources(true)}>The data <ExternalLink size={14}/></button></div></header>
 <main>
 {screen==="start"&&<section className="start" aria-label="Choose a game">
  <p className="start-kicker">A geography game</p>
  <h1>How well do you know <em>the world?</em></h1>
  <p className="start-sub">Flags, capitals, borders, cities and real statistics for {data?.countries.length??89} countries. Ten questions a run. The closer your answer, the more you score.</p>
  {error&&<p className="loading">The game data couldn’t load. <button className="text-button" onClick={()=>location.reload()}>Try again</button></p>}
  <div className="mode-cards">
   <button type="button" className="mode-card featured" disabled={!data} onClick={()=>start("daily")}><CalendarDays size={22} aria-hidden="true"/><strong>Daily trail</strong><span>{day.label}. The same ten questions for everyone.</span><em>{playedToday?`Played today · ${playedToday.points.toLocaleString("en-US")} pts. Replay for practice`:"Play today’s trail"} <ArrowRight size={15}/></em></button>
   <button type="button" className="mode-card" disabled={!data} onClick={()=>start("classic")}><Globe2 size={22} aria-hidden="true"/><strong>Classic</strong><span>Ten mixed questions at the difficulty you pick.</span><em>{records.classic[difficulty]?`Best ${records.classic[difficulty].toLocaleString("en-US")} pts`:"Play"} <ArrowRight size={15}/></em></button>
   <button type="button" className="mode-card" disabled={!data} onClick={()=>start("survival")}><Heart size={22} aria-hidden="true"/><strong>Survival</strong><span>Three lives. Questions get harder as you go.</span><em>{records.survival?`Best ${records.survival.toLocaleString("en-US")} pts`:"Play"} <ArrowRight size={15}/></em></button>
  </div>
  <div className="start-options">
   <div className="pill-group" role="group" aria-label="Difficulty for Classic"><span>Difficulty</span>{(["easy","medium","hard"] as Difficulty[]).map(d=><button type="button" key={d} className="pill" aria-pressed={difficulty===d} onClick={()=>{setDifficulty(d);write("atlas-difficulty",d)}}>{d[0].toUpperCase()+d.slice(1)}<small>×{({easy:"1",medium:"1.5",hard:"2"})[d]}</small></button>)}</div>
   <div className="pill-group" role="group" aria-label="Speed bonus"><span>Speed bonus</span><button type="button" className="pill" aria-pressed={timed} onClick={()=>{setTimed(v=>{write("atlas-timed",v?"off":"on");return !v})}}><Timer size={14} aria-hidden="true"/>{timed?"On":"Off"}</button></div>
  </div>
  <p className="start-note">Difficulty and the speed bonus apply to Classic and custom games. The daily trail is always medium and untimed, so scores compare.</p>
  <details className="custom-game"><summary>Custom game</summary>
   <div className="custom-grid">
    <label>Measure<select aria-label="Measure" value={filter} onChange={e=>{const value=e.target.value as Metric|"all";setFilter(value);if(style!=="mixed"&&value!=="all"&&!availableTypes(value).includes(style))setStyle("mixed")}}><option value="all">All measures</option>{data&&Array.from(new Set(Object.values(data.metrics).map(m=>m.group??"World"))).map(group=><optgroup key={group} label={group}>{Object.entries(data.metrics).filter(([,m])=>(m.group??"World")===group).map(([key,m])=><option key={key} value={key}>{m.label}{m.coverage!==data.countries.length?` · ${m.coverage} countries`:""}</option>)}</optgroup>)}</select></label>
    <label>Question style<select aria-label="Question style" value={style} onChange={e=>{const value=e.target.value as Kind|"mixed";setStyle(value);if(value!=="mixed"&&filter!=="all"&&!availableTypes(filter).includes(value))setFilter("all")}}><option value="mixed">Mixed</option>{Object.entries(modeNames).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label>
    <label>City pool<select aria-label="City population pool" value={cityMinimum} onChange={e=>setCityMinimum(Number(e.target.value))}><option value="1000000">1 million+ people</option><option value="100000">100,000+ people</option></select></label>
   </div>
   <button type="button" className="primary" disabled={!data} onClick={()=>start("practice")}>Start custom game <ArrowRight size={17}/></button>
  </details>
  <QuizHelp/>
 </section>}

 {screen==="play"&&round&&meta&&<div className="play-screen">
  <div className="hud" role="group" aria-label="Game status">
   <button type="button" className="hud-quit" aria-label="Quit to menu" title="Quit to menu" onClick={()=>setScreen("start")}><X size={18}/></button>
   <div className="hud-mode"><strong>{modeLabels[mode]}</strong><span>{mode==="survival"?`Question ${number}`:`${number} of ${RUN_LENGTH}`} · {level[0].toUpperCase()+level.slice(1)}</span></div>
   {mode==="survival"?<div className="hud-lives" role="img" aria-label={`${lives} of ${LIVES} lives left`}>{Array.from({length:LIVES},(_,i)=><Heart key={i} size={18} className={i<lives?"alive":"lost"}/>)}</div>
    :<div className="hud-dots" role="img" aria-label={`Question ${number} of ${RUN_LENGTH}. ${correctCount} correct so far.`}>{Array.from({length:RUN_LENGTH},(_,i)=><span key={i} className={log[i]?markOf(log[i].result):i===number-1?"current":""}/>)}</div>}
   <div className={`hud-streak ${streak>1?"on":""}`} aria-label={`Streak ${streak}`}><Flame size={16} aria-hidden="true"/>{streak}</div>
   <div className="hud-points" aria-label={`${points} points`}><AnimatedNumber value={points} motion={motion}/><small>pts</small></div>
   {clock&&<div className={`hud-timer ${answered?"stopped":""}`} key={number} aria-hidden="true"><i/></div>}
  </div>
  <section className={`game-card ${answered?(last?.result.correct?"is-correct":"is-revealed"):""}`} aria-label="Question">
  <div className="question-head"><div className="metric-label"><span className="kind-chip"><Icon size={15} aria-hidden="true"/>{labels[round.type]}</span>{meta.unit&&!isExtra(round)?<span>{meta.label} · {meta.unit}</span>:<span>{meta.label}</span>}</div><h2>{questionTitle(round)}</h2><p>{isExtra(round)?extraHelp(round):round.type==="compare"?"Pick the country with the higher value.":round.type==="insert"?"Each country shows its value. Which one is closest to the hidden country?":"Put the highest value in 1st place. Drag, or tap a country and then a step."}</p></div>
  <div className={`play-area round-${round.type}`}>
  {isExtra(round)&&<ExtraRound round={round} answer={extraAnswer} onChange={setExtraAnswer} answered={answered} motion={motion}/>}
  {round.type==="compare"&&<div className="compare-grid">{round.countries.map((c,i)=><button key={c.id} className={`country-choice ${selection===i?"selected":""} ${answered?(c.id===sorted[0].id?"correct":selection===i?"incorrect":"muted"):""}`} disabled={answered} onClick={()=>setSelection(i)}><span className="choice-number">0{i+1}<span>{c.id}</span></span><Shape country={c}/><span className="country-name">{c.name}</span>{answered?<><span className={`tile-verdict ${c.id===sorted[0].id?'verdict-right':selection===i?'verdict-wrong':'verdict-other'}`} role={selection===i?'status':undefined}>{c.id===sorted[0].id?<Check size={17}/>:selection===i?<X size={17}/>:null}{selection===i?(last?.result.correct?'Correct':'Incorrect'):c.id===sorted[0].id?'Correct answer':'Lower value'}{selection===i&&<small>Your choice</small>}</span><strong className="value-reveal">{formatValue(Number(c[round.metric]),round.metric)}</strong></>:<span className="choice-hint">Choose country <ArrowRight size={14}/></span>}</button>)}<span className="versus">or</span></div>}
  {round.type==="insert"&&<div className="closest-game"><div className="closest-target"><Shape country={round.target!}/><div><span className="eyebrow">HIDDEN COUNTRY</span><strong>{round.target!.name}</strong><span className="closest-value">{answered?formatValue(Number(round.target![round.metric]),round.metric):"?"}</span></div></div><div className="closest-grid">{round.countries.map((c,i)=><button key={c.id} className={`country-choice closest-option ${selection===i?"selected":""} ${answered?(i===correctIndex?"correct":selection===i?"incorrect":"muted"):""}`} disabled={answered} aria-pressed={selection===i} onClick={()=>setSelection(i)}><Shape country={c}/><span className="country-name">{c.name}</span><strong className="closest-value">{formatValue(Number(c[round.metric]),round.metric)}</strong>{answered&&i===correctIndex&&<span className="tile-verdict verdict-right"><Check size={17}/>Closest</span>}{answered&&selection===i&&i!==correctIndex&&<span className="tile-verdict verdict-wrong"><X size={17}/>Your choice</span>}</button>)}</div></div>}
  {round.type==="rank"&&<CountryRanking key={round.countries.map(c=>c.id).join('|')+round.metric} round={round} answer={extraAnswer} onChange={setExtraAnswer} answered={answered} motion={motion}/>}
  </div>
  {answered&&last&&last.result.correct&&motion&&<div className="celebration" aria-hidden="true">{Array.from({length:16},(_,i)=><i className="confetti-piece" key={i} style={{background:["#d77c48","#b3cb7d","#42664d","#e9c47a"][i%4]}}/>)}</div>}
  {answered&&last&&<div className={`verdict ${markOf(last.result)}`} role="status">
   <div className="verdict-main"><span className="verdict-icon" aria-hidden="true">{last.result.correct?<Check size={20}/>:last.result.fraction>0?<Minus size={20}/>:<X size={20}/>}</span><strong>{headline}</strong><span className="verdict-points">+{last.award.total}<small>pts</small></span></div>
   <p className="verdict-breakdown">{last.award.base} for the answer{last.award.streak?` · +${last.award.streak} streak`:""}{last.award.speed?` · +${last.award.speed} speed`:""}{mode==="survival"&&!last.result.correct?` · one life lost, ${lives} left`:""}</p>
   <p className="verdict-fact">{round.type==="insert"?`${round.target!.name} is closest to ${round.countries[correctIndex].name}. `:""}{explanation(round,extraAnswer)}</p>
   <RevealFigure round={round} answer={extraAnswer}/>
   <details className="see-data"><summary>See the data</summary><RevealDetails round={round} answer={extraAnswer} motion={motion} source={meta} onSources={()=>setSources(true)}/></details>
  </div>}
  <div className="game-actions"><span>{answered?(over?(mode==="survival"?"Out of lives.":"That was the last question."):`${meta.source} · ${meta.year}`):(round.type==="rank"||round.type==="topfive")&&!ready?`${(round.type==="rank"?extraAnswer.ranking:extraAnswer.cities)?.filter(Boolean).length??0} of 3 placed`:ready?"Ready when you are.":`${meta.source} · ${meta.year}`}</span>{answered?<button className="primary" onClick={next}>{over?"See results":"Next question"}<ArrowRight size={17}/></button>:<button className="primary" onClick={submit} disabled={!ready}>Check answer <ArrowRight size={17}/></button>}</div>
  <div className="question-report-action"><button type="button" className="text-button" onClick={()=>feedback.current?.report(questionReport(round,questionTitle(round),[`Game: ${modeLabels[mode]}`,`Difficulty: ${level}`,`City pool: ${mode==="practice"?cityMinimum:1000000}`,`Measure filter: ${mode==="practice"?filter:"all"}`,`Style: ${mode==="practice"?style:"mixed"}`],number,answered,selection,extraAnswer,`${meta.source} · ${meta.year}`))}>Report this question</button></div>
  </section>
 </div>}

 {screen==="done"&&<section className="done" aria-label="Results">
  <p className="start-kicker">{mode==="daily"?`Daily trail · ${day.label}`:modeLabels[mode]+(mode==="classic"?` · ${difficulty}`:"")}</p>
  <h2>{mode==="survival"?`You lasted ${log.length} question${log.length===1?"":"s"}.`:correctCount>=9?"A worldly performance.":correctCount>=6?"Solid ground.":correctCount>=3?"Your world just got bigger.":"So much left to discover."}</h2>
  <div className="big-score"><AnimatedNumber value={points} motion={motion}/><span> pts</span></div>
  <p className="done-line">{correctCount} of {log.length} correct · best streak {bestStreak}{newBest?" · new personal best":mode==="classic"&&records.classic[difficulty]?` · best ${records.classic[difficulty].toLocaleString("en-US")}`:mode==="survival"&&records.survival?` · best ${records.survival.toLocaleString("en-US")}`:""}</p>
  <div className="done-marks" role="img" aria-label="Result of each question">{log.map((e,i)=><span key={i} className={markOf(e.result)}/>)}</div>
  {mode==="daily"&&playedToday&&playedToday.points!==points&&<p className="start-note">Your first run today counts: {playedToday.points.toLocaleString("en-US")} pts. This one was practice.</p>}
  <div className="done-actions"><button type="button" className="primary" onClick={()=>start(mode==="daily"?"classic":mode)}><RotateCcw size={16}/>{mode==="daily"?"Play Classic":"Play again"}</button><button type="button" className="pill" onClick={share}><Share2 size={15}/>{copied?"Copied to clipboard":"Copy result"}</button><button type="button" className="pill" onClick={()=>setScreen("start")}><HomeIcon size={15}/>Menu</button></div>
  <h3>Question by question</h3>
  <ol className="review">{log.map((e,i)=>{const I=icons[e.kind];return <li key={i} className={markOf(e.result)}><span className="review-mark" aria-label={e.result.correct?"Correct":e.result.fraction>0?"Partly right":"Missed"}>{e.result.correct?<Check size={16}/>:e.result.fraction>0?<Minus size={16}/>:<X size={16}/>}</span><div><strong>{e.title}</strong><span><I size={13} aria-hidden="true"/>{e.summary}</span></div><b>+{e.award.total}</b></li>})}</ol>
 </section>}

 <PageFeedback ref={feedback}/>
 <footer><span><Globe2 size={14}/> Made for the curious.</span><nav aria-label="Page links"><a href="../about.html">About</a><a href="mailto:hello@madeclear.ca">Contact</a><a href="#page-feedback">Feedback</a><a href="../about.html#feedback-privacy">Privacy</a></nav><span>Real places. Real data.</span></footer></main>
 {sources&&<div className="modal-backdrop" onClick={()=>setSources(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="source-title" onClick={e=>e.stopPropagation()}><button autoFocus className="close" aria-label="Close sources" onClick={()=>setSources(false)}><X size={22}/></button><div className="eyebrow">BEHIND THE ATLAS</div><h2 id="source-title">Good questions need good data.</h2><p>Fixed snapshots; numerical questions use matched years, cohorts or periods. Language estimates use CLDR’s mixed underlying dates, labelled in the question. Missing values are excluded.</p><div className="difficulty-method"><h3>How scoring works</h3><p>Each answer earns 100 points × difficulty (easy ×1, medium ×1.5, hard ×2) × how close it was. Pins and estimates score more the closer they are, and still earn something up to three times the accepted range. Podiums earn credit for each pair in the right order; an insertion one place off earns 40%. Each correct answer in a row adds 10 points, up to 50. With the speed bonus on, a correct answer adds up to 50 more: full within 5 seconds, none after 25. The daily trail is always medium and untimed.</p><h3>How difficulty works</h3><p>Relative gap = |A − B| ÷ max(|A|, |B|). Wider gaps tend to be easier.</p><p>For population, area and other wide-range measures, two-country comparisons use hard at 25% gap or less, medium between 25% and 65%, and easy at 65% or more. For bounded measures and multi-item questions, we use the widest, middle and closest thirds of eligible sampled questions for that measure and style. Rankings use the closest adjacent pair; insertion uses the closest target–anchor pair. Historical growth rounds score the gap between population indices (2000 = 100), while answers compare percentage growth. Thresholds are reproducible for the same data, rather than calibrated from player results.</p><p>City questions use familiarity as well: easy keeps each country’s largest city plus capitals and megacities among its top three; medium uses the four largest per country; hard the ten largest. City rankings exclude gaps below 3% to avoid near ties in modelled populations. Estimates adjust their stated tolerance. Pins accept 700 / 350 / 150 km for easy / medium / hard. In border questions the exception is a nearby country that does not touch the target; harder questions use closer ones. Flag, capital and city-to-country questions draw wrong options from other regions on easy and from the same region on hard.</p><p>Language questions compare estimated functional users, including first and second languages, from CLDR 49. Underlying dates vary. The leader needs at least one million users. Winner–runner-up gaps below 15% are excluded; hard is 15–25%, medium above 25% and below 65%, easy at least 65%. These are gameplay guards, not confidence intervals.</p><p>Uncertain happiness comparisons, overlapping approximate doctorate intervals, and values tied after rounding are excluded. Height comparisons require a 2 cm gap; the exported data has no confidence intervals, so that rule does not establish statistical significance.</p><p>When no measure is chosen, familiar measures such as population, land area, life expectancy and GDP per person come up more often than specialised ones.</p></div>{data&&<div className="source-item"><a href={data.citySource.url} target="_blank" rel="noreferrer">{data.citySource.label} <ExternalLink size={13}/></a><small>{data.citySource.source} · {data.citySource.year}</small><p>{data.citySource.definition}</p><p>6,172 urban areas across 180 countries/areas; 511 above one million. Licensed CC BY 3.0 IGO. Each ranking uses three different UN country/area entries. City and country names are shown in their common English form; the UN spellings are in the data download. Capitals follow the UN file; countries with split or contested capitals are not asked.</p></div>}{data&&data.sources.map(m=><div className="source-item" key={m.label}><a href={m.url} target="_blank" rel="noreferrer">{m.label} <ExternalLink size={13}/></a><small>{m.source} · {m.year}</small><p>{m.definition}</p></div>)}{data&&Object.entries(data.metrics).map(([k,m])=><div className="source-item" key={k}><a href={m.url} target="_blank" rel="noreferrer">{m.label} <ExternalLink size={13}/></a><small>{m.source} · {m.year} · {m.coverage} countries</small><p>{m.definition}</p></div>)}<div className="source-item"><a href={languageMetadata.url} target="_blank" rel="noreferrer">Language-use estimates · Unicode CLDR 49 <ExternalLink size={13}/></a><small>{languageEntries.length} languages · mixed source years</small><p>{languageMetadata.definition}</p><details><summary>Unicode data licence</summary><pre className="language-license">{languageMetadata.licenseText}</pre></details></div><div className="source-item"><a href="https://github.com/lipis/flag-icons" target="_blank" rel="noreferrer">National flags · flag-icons <ExternalLink size={13}/></a><p>Open flag drawings under the MIT licence, matched by ISO 3166 code.</p></div><div className="source-item"><a href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Country outlines · Natural Earth <ExternalLink size={13}/></a><p>Public-domain, simplified 1:110m shapes. Main landmass shown, independently fitted to each frame; outlines do not show relative sizes or all territories. Crimea is not highlighted as part of either Russia or Ukraine.</p></div><p className="method-note">{data?.countries.length??89} countries for numerical comparisons, plus a worldwide UN city pool. Height uses the 1996 birth cohort, estimated at age 18 in 2014; it is not a current whole-population average. Time-use topics are excluded because the accessible table mixes national survey years. Snapshots refresh manually.</p><p className="data-downloads"><a href={dataUrl} download="atlas-play-data.json">Download data &amp; derived border lists</a> · <a href={visualDataUrl} download="atlas-play-visual-context.json">Visual context data &amp; sources</a> · <a href={referenceDataUrl} download="atlas-play-reference-scales.json">Reference scale data</a> · <a href={languageDataUrl} download="atlas-play-language-estimates.json">Language estimates &amp; licence</a> · <a href={borderLicenseUrl} download="border-license.txt">Border-data license</a></p></section></div>}
 </div>
}
