import {PositionScale} from "./position-scale";
import {useEffect,useRef,useState} from 'react';
import {animate} from 'animejs';
import {visualContext,isHeightMetric,fuelKeys,percent,type FuelRow} from '../lib/visual-context';
import type {Country,Round} from '../lib/game';
const fuelLabels={hydro:'Hydro',otherRenewable:'Other renewables',coal:'Coal',gas:'Gas',oil:'Oil',nuclear:'Nuclear',otherUnallocated:'Other / unallocated'};
function RenewableBar({name,row}:{name:string;row:FuelRow}){return <div className="electricity-bar-row"><div><strong>{name}</strong><span>{percent(row.renewable)} renewable</span></div>{row.renewable!=null?<div className="electricity-share-bar" role="img" aria-label={`${name}: ${percent(row.renewable)} renewable electricity; ${percent(100-row.renewable)} non-renewable`}><span style={{width:row.renewable+'%'}}/><i style={{width:(100-row.renewable)+'%'}}/></div>:<p>No matching renewable-share observation.</p>}</div>}
export function ElectricityContext({country}:{country:Country}){
 const data=visualContext.electricity,row=data.countries[country.id],world=data.world;
 if(!row)return <p>No matching electricity breakdown for this country.</p>;
 const gap=row.renewable==null||world.renewable==null?null:row.renewable-world.renewable;
 return <div className="electricity-context"><div className="context-heading"><h3>Where does the electricity come from?</h3><span>2021 · % of electricity output</span></div>
 <RenewableBar name={country.name} row={row}/><RenewableBar name="World" row={world}/>
 <div className="electricity-bar-legend"><span><i/>Renewables</span><span><i/>Non-renewables</span></div>
 {gap!=null&&<p className="context-key-fact">{country.name} is <strong>{Math.abs(gap).toFixed(1)} percentage points {gap>=0?'above':'below'}</strong> the world renewable share.</p>}
 <table className="fuel-table"><caption>Electricity mix by source</caption><thead><tr><th scope="col">Source</th><th scope="col">{country.name}</th><th scope="col">World</th></tr></thead><tbody>{fuelKeys.map(key=><tr key={key}><th scope="row"><i className={`fuel-dot fuel-${key}`}/>{fuelLabels[key]}</th><td><div className="fuel-value"><i className={`fuel-cell-bar fuel-${key}`} style={{width:Math.min(100,row[key]??0)+'%'}}/><span>{percent(row[key])}</span></div></td><td><div className="fuel-value"><i className={`fuel-cell-bar fuel-${key}`} style={{width:Math.min(100,world[key]??0)+'%'}}/><span>{percent(world[key])}</span></div></td></tr>)}<tr className="fuel-total"><th scope="row">Reported sum (excl. remainder)</th><td>{percent(row.reportedTotal)}</td><td>{percent(world.reportedTotal)}</td></tr></tbody></table>
 {row.reportedTotal!=null&&row.reportedTotal>100.05&&<p className="context-data-gap">{country.name}’s separately reported components total {percent(row.reportedTotal)}. They are shown as reported, without rescaling to 100%.</p>}
 {row.invalidSourceValues&&Object.keys(row.invalidSourceValues).length>0&&<p className="context-data-gap">Some source components for {country.name} have negative or over-100 shares. Those invalid components are omitted and shown as —, not replaced with zero.</p>}
 <p className="context-footnote">Non-hydro renewables are grouped in this source. “Other / unallocated” is a derived positive remainder, not an identified fuel. — means unavailable. Separately reported series and rounding can prevent an exact total.</p>
 <details className="context-sources"><summary>Sources &amp; definitions</summary><p>{data.definition}</p>{Object.entries(data.sources).map(([key,url])=><a key={key} href={url} target="_blank" rel="noreferrer">{key==='renewable'?'Renewable share':fuelLabels[key as keyof typeof fuelLabels]??key} · World Bank ↗</a>)}</details></div>
}
function Human(){return <g className="human-silhouette"><circle cx="0" cy="8" r="8"/><path d="M-8 20Q-14 20-17 30L-23 55Q-25 61-20 62Q-17 63-15 58L-10 40-10 60-14 94Q-15 100-9 100Q-5 100-5 95L0 67 5 95Q5 100 10 100Q15 100 14 94L10 60 10 40 15 58Q17 63 21 62Q25 61 23 55L17 30Q14 20 8 20Z"/></g>}
function Animal({type}:{type:string}){
 if(type==='dog')return <g><path d="M-35 13Q-10-6 22 0L28-18 44-23 53-13 66-10 63 1 48 6 37 28 33 95 23 100 17 95 15 42-18 42-23 96-32 100-36 95-30 35-43 29-53 5-49 1-36 17Z"/><path d="M38-16 35-3 44-7" fill="var(--paper)" opacity=".3"/></g>;
 if(type==='penguin')return <g><path d="M-13 24Q-22 2 0 0Q19 2 15 23Q30 55 20 85L24 99 3 100 0 94-7 100-23 98-18 85Q-29 52-13 24Z"/><ellipse cx="0" cy="58" rx="14" ry="28" fill="var(--paper)" opacity=".7"/><path d="M12 10 27 16 13 20Z" fill="var(--orange)"/><path d="M-17 40-30 68-23 70-10 48Z"/></g>;
 if(type==='horse')return <g><path d="M-37 3Q-12-3 15 0L27-36 35-47 42-41 50-43 66-24 60-16 44-22 37-7 30 30 26 97 17 100 12 96 14 43-12 43-21 97-30 100-35 96-24 33-40 30-45 65-50 65-51 25Q-52 8-37 3Z"/></g>;
 return <g><path d="M-37 4Q-18-7 10 0Q26-7 34 7L43 18 45 73Q45 90 32 94L25 89 32 83 35 30 29 35 22 51 21 97 10 100 4 97 4 58-13 60-15 97-28 100-36 97-32 47-42 38-47 68-50 67-49 30Q-50 11-37 4Z"/><ellipse cx="18" cy="26" rx="13" ry="24" fill="var(--paper)" opacity=".25"/></g>;
}
export function HeightScale({value,metric,actual,motion=true}:{value:number;metric:'heightMale'|'heightFemale';actual?:number;motion?:boolean}){
 const world=visualContext.height.world[metric],target=actual??value,display=useRef(target),[height,setHeight]=useState(target);
 useEffect(()=>{if(!motion){display.current=target;setHeight(target);return}const counter={height:display.current};const animation=animate(counter,{height:target,duration:240,ease:'out(3)',onUpdate:()=>{display.current=counter.height;setHeight(counter.height)}});return()=>animation.cancel()},[target,motion]);
 const baseline=240,unit=.62,animals=visualContext.height.animals,positions=[192,320,448,576];
 return <div className="height-scale" data-target-height={target}><div className="height-world-label"><i/>World mean · {metric==='heightMale'?'men':'women'} <b>{world.toFixed(1)} cm</b></div>
 <svg viewBox="0 0 640 265" role="img" aria-label={`${actual==null?'Your estimate':'Source height'}: ${target.toFixed(1)} centimetres. World mean for the same sex and 1996 birth cohort: ${world.toFixed(1)} centimetres. Animal reference heights are illustrative.`}>
 {[0,50,100,150,200,250,300,350].map(cm=><g key={cm}><line x1="32" x2="625" y1={baseline-cm*unit} y2={baseline-cm*unit} className="height-grid"/><text x="24" y={baseline-cm*unit+3} textAnchor="end" className="height-tick">{cm}</text></g>)}
 <text x="14" y="13" className="height-tick">cm</text>
 <line x1="33" x2="625" y1={baseline-world*unit} y2={baseline-world*unit} className="height-world-line"/>
 {actual!=null&&<line x1="42" x2="110" y1={baseline-value*unit} y2={baseline-value*unit} className="height-estimate-line"><title>Your estimate: {value.toFixed(1)} cm</title></line>}
 <g transform={`translate(64 ${baseline-height*unit}) scale(${height*unit/100})`} data-rendered-height={height}><Human/></g>
 {animals.map((a,i)=><g key={a.key}><g className={`animal-silhouette animal-${a.key}`} transform={`translate(${positions[i]} ${baseline-a.cm*unit}) scale(${a.cm*unit/100*(a.key==='elephant'?.64:1)} ${a.cm*unit/100})`}><Animal type={a.key}/></g><line x1={positions[i]-15} x2={positions[i]+15} y1={baseline-a.cm*unit} y2={baseline-a.cm*unit} className="animal-height-mark"/></g>)}
 <line x1="32" x2="625" y1={baseline} y2={baseline} className="height-ground"/>
 </svg>
 <div className="height-reference-labels"><span><b>{actual==null?'Your estimate':'Source value'}</b>{target.toFixed(1)} cm</span>{animals.map(a=><span key={a.key}><b>{a.label}</b>≈{Math.round(a.cm)} cm<small>{a.basis}</small></span>)}</div>
 <p className="context-footnote">Human heights: 1996 birth cohort, age 18 in 2014. Animal sizes are illustrative references; shoulder/withers heights differ from standing height. {actual!=null?'Orange tick: your estimate.':''}</p>
 <details className="context-sources"><summary>Scale notes &amp; sources</summary><p>{visualContext.height.definition}</p><a href={visualContext.height.sources[metric]} target="_blank" rel="noreferrer">World mean · NCD-RisC / Our World in Data ↗</a>{animals.map(a=><p key={a.key}><a href={a.url} target="_blank" rel="noreferrer">{a.label} ↗</a> — {a.definition}</p>)}</details>
 </div>
}
export function MetricVisualContext({round,motion}:{round:Round;motion:boolean}){
 const countries=[...round.countries,...(round.target?[round.target]:[])],isHeight=isHeightMetric(round.metric);
 const[selected,setSelected]=useState(countries[0]?.id),country=countries.find(c=>c.id===selected)??countries[0];
 if(['pin','exception','history','languages','flag','capital','whereis'].includes(round.type))return null;
 if(round.metric!=='renewable'&&!isHeight)return <section className="metric-visual-context"><PositionScale round={round} motion={motion}/></section>;
 if(!country||(isHeight&&round.type==='estimate'))return null;
 return <section className="metric-visual-context" aria-label="Visual answer context">{countries.length>1&&<div className="context-country-tabs" aria-label="Choose country for visual context">{countries.map(c=><button key={c.id} aria-pressed={c.id===country.id} onClick={()=>setSelected(c.id)}>{c.name}</button>)}</div>}{round.metric==='renewable'?<ElectricityContext country={country}/>:isHeightMetric(round.metric)&&<><div className="context-heading"><h3>{country.name} in perspective</h3><span>{Number(country[round.metric]).toFixed(1)} cm · source height</span></div><HeightScale value={Number(country[round.metric])} actual={Number(country[round.metric])} metric={round.metric} motion={motion}/></>}</section>
}
