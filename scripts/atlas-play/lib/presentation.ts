import type {Metric,Round} from './game';
export type MapView=[number,number,number,number];
export function clampView(x:number,y:number,width:number):MapView{
 const w=Math.max(11.25,Math.min(720,width)),h=w/2;
 return [Math.max(0,Math.min(720-w,x)),Math.max(0,Math.min(360-h,y)),w,h];
}
export function zoomView(v:MapView,factor:number,anchor:[number,number]=[v[0]+v[2]/2,v[1]+v[3]/2]):MapView{
 const width=Math.max(11.25,Math.min(720,v[2]*factor)),ratio=width/v[2];
 return clampView(anchor[0]-(anchor[0]-v[0])*ratio,anchor[1]-(anchor[1]-v[1])*ratio,width);
}
export function fitMapBounds(box:{x:number;y:number;width:number;height:number}):MapView{
 const w=Math.max(18,box.width*1.2,box.height*2.4);
 return clampView(box.x+box.width/2-w/2,box.y+box.height/2-w/4,w);
}
const subjects:Record<Metric,string>={population:'population',area:'land area',life:'life expectancy',happiness:'life satisfaction',density:'population density',forest:'forest cover',renewable:'share of renewable electricity',internet:'internet use',gdp:'GDP per person (PPP)',co2:'CO₂ emissions per person',hdi:'Human Development Index',heightMale:'average male height at age 18',heightFemale:'average female height at age 18',doctorates:'share of adults with a doctorate',mobileTraffic:'mobile internet traffic per person',fixedTraffic:'fixed internet traffic per person',internetTraffic:'total internet traffic per person',calories:'food energy supply per person',alcohol:'alcohol consumption per adult',patents:'resident patent applications per million people',cattle:'cattle per person'};
export function questionTitle(r:Round):string{
 const subject=subjects[r.metric],name=r.countries[0]?.name;
 switch(r.type){
 case 'languages':return `Which country has the most people who can speak ${r.language!.name}?`;
 case 'flag':return 'Which country flies this flag?';
 case 'capital':return `What is the capital of ${r.target!.name}?`;
 case 'whereis':return `Which country is ${r.city!.name} in?`;
 case 'topfive':return 'Rank 3 cities by population.';
 case 'pin':return `Where is ${r.city!.name}, ${r.city!.countryName}?`;
 case 'exception':return `Which country does NOT border ${r.target!.name}?`;
 case 'history':return 'Whose population grew more between 2000 and 2023?';
 case 'gap':return `${subject[0].toUpperCase()+subject.slice(1)}: ${name} ÷ ${r.countries[1].name}?`;
 case 'insert':return `Where does ${r.target!.name} fit by ${subject}?`;
 case 'rank':return `Rank 3 countries by ${subject}.`;
 case 'compare':return `Which country has the higher ${subject}?`;
 case 'estimate':{
 const questions:Partial<Record<Metric,string>>={renewable:`What percentage of ${name}’s electricity comes from renewables?`,forest:`What percentage of ${name}’s land is forest?`,internet:`What percentage of people in ${name} use the internet?`,doctorates:`What percentage of adults aged 25–64 in ${name} have a doctorate?`,life:`What is life expectancy in ${name}?`,happiness:`How highly do people in ${name} rate their lives, out of 10?`,hdi:`What is ${name}’s Human Development Index?`,heightMale:`How tall are men in ${name}, on average at age 18?`,heightFemale:`How tall are women in ${name}, on average at age 18?`,calories:`How many food calories are available per person per day in ${name}?`,alcohol:`How many litres of pure alcohol are consumed per adult per year in ${name}?`};
 return questions[r.metric]??`What is ${name}’s ${subject}?`;
 }
 }
}

export function placeOnPodium(slots:string[],id:string,index:number):string[]{
 const next=Array.from({length:3},(_,i)=>slots[i]??'');
 const from=next.indexOf(id);if(from===index)return next;
 if(from>=0)next[from]=next[index];next[index]=id;return next;
}
