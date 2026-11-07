import type {Metric} from './game';
export type ReferencePoint={id:string;name:string;value:number};
export function referenceDomain(metric:Metric,points:ReferencePoint[],cityMinimum?:number):[number,number]{
 const maximum=Math.max(...points.map(p=>p.value));
 if(metric==='population')return [cityMinimum??1000000,Math.max((cityMinimum??1000000)+1,maximum)];
 if(metric==='life')return [0,100];
 if(['forest','renewable','internet','doctorates'].includes(metric))return [0,100];
 if(metric==='happiness')return [0,10];
 if(metric==='hdi')return [0,1];
 return [0,Math.max(1,maximum)];
}
export function scalePosition(value:number,domain:[number,number]){return Math.max(0,Math.min(1,(value-domain[0])/(domain[1]-domain[0])))}
export function zoomReferenceDomain(values:number[],full:[number,number]):[number,number]{
 const lo=Math.min(...values),hi=Math.max(...values),pad=Math.max((hi-lo)*.2,(full[1]-full[0])*.003);
 return [Math.max(Math.min(full[0],lo),lo-pad),Math.min(Math.max(full[1],hi),hi+pad)];
}
export function referenceBins(points:ReferencePoint[],domain:[number,number],count=24){
 const bins=Array.from({length:count},()=>0);
 for(const p of points)if(p.value>=domain[0]&&p.value<=domain[1])bins[Math.min(count-1,Math.floor(scalePosition(p.value,domain)*count))]++;
 return bins;
}
export function compactScaleValue(value:number,metric:Metric){
 const sign=value<0?'-':'',v=Math.abs(value);let text:string;
 if(v>=1e9)text=(v/1e9).toFixed(2).replace(/\.00$/,'')+'B';else if(v>=1e6)text=(v/1e6).toFixed(1).replace(/\.0$/,'')+'M';else if(v>=1000)text=(v/1000).toFixed(1).replace(/\.0$/,'')+'k';else text=v.toFixed(v<10?2:1).replace(/\.?0+$/,'');
 if(value===0)text='0';
 if(['forest','renewable','internet','doctorates'].includes(metric))text+='%';
 if(metric==='life')text+=' yrs';
 return sign+text;
}
