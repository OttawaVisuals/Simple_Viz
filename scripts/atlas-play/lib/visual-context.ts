import context from '../public/data/visual-context.json';
export type FuelRow={invalidSourceValues?:Record<string,number>;renewable:number|null;coal:number|null;gas:number|null;oil:number|null;nuclear:number|null;hydro:number|null;otherRenewable:number|null;reportedTotal:number|null;otherUnallocated:number|null};
export const visualContext=context as typeof context & {electricity:{countries:Record<string,FuelRow>;world:FuelRow}};
export const isHeightMetric=(metric:string):metric is 'heightMale'|'heightFemale'=>metric==='heightMale'||metric==='heightFemale';
export const fuelKeys=['hydro','otherRenewable','coal','gas','oil','nuclear','otherUnallocated'] as const;
export function percent(value:number|null|undefined){return value==null?'—':value.toFixed(1)+'%'}
