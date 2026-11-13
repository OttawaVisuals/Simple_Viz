import sourceJson from '../public/data/languages.json' with {type:'json'};
import type {Dataset,Difficulty,Round,Source,Random} from './game.ts';
export type LanguageValues={speakers:number;share:number;population:number};
export type LanguageChallenge={code:string;name:string;values:Record<string,LanguageValues>};
type LanguageEntry={code:string;name:string;countries:({id:string}&LanguageValues)[]};
export const languageMetadata=sourceJson.source;
export const languageEntries=sourceJson.languages as LanguageEntry[];
const compact=new Intl.NumberFormat('en-US',{notation:'compact',maximumSignificantDigits:2});
export function formatSpeakers(value:number){return '≈'+compact.format(value)}
export function languageDifficulty(gap:number):Difficulty{return gap<=.25?'hard':gap>=.65?'easy':'medium'}
type Candidate={ids:string[];gap:number};
type Bank=Record<Difficulty,{language:LanguageEntry;candidates:Candidate[]}[]>;
const cache=new WeakMap<Dataset,Bank>();
function languageBank(data:Dataset):Bank{
 const saved=cache.get(data);if(saved)return saved;
 const bank:Bank={easy:[],medium:[],hard:[]},ids=new Set(data.countries.map(c=>c.id));
 for(const language of languageEntries){const entries=language.countries.filter(c=>ids.has(c.id)),groups:Record<Difficulty,Candidate[]>={easy:[],medium:[],hard:[]};
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++)for(let k=j+1;k<entries.length;k++){
  const cs=[entries[i],entries[j],entries[k]],ordered=[...cs].sort((a,b)=>b.speakers-a.speakers),gap=(ordered[0].speakers-ordered[1].speakers)/ordered[0].speakers;
  // The leader needs at least a million speakers, so rounds are not decided between three small communities.
  if(gap<.15||ordered[0].speakers<1e6||formatSpeakers(ordered[0].speakers)===formatSpeakers(ordered[1].speakers))continue;
  groups[languageDifficulty(gap)].push({ids:cs.map(c=>c.id),gap});
 }
 for(const difficulty of ['easy','medium','hard'] as Difficulty[])if(groups[difficulty].length)bank[difficulty].push({language,candidates:groups[difficulty]});
 }
 for(const difficulty of ['easy','medium','hard'] as Difficulty[])if(!bank[difficulty].length)throw new Error(`No usable language challenges for ${difficulty}`);
 cache.set(data,bank);return bank;
}
export function languageCoverage(data:Dataset){const b=languageBank(data);return Object.fromEntries(Object.entries(b).map(([tier,groups])=>[tier,groups.map(g=>({name:g.language.name,questions:g.candidates.length}))]))}
export function generateLanguageRound(data:Dataset,difficulty:Difficulty,rng:Random=Math.random):Round{
 const choices=languageBank(data)[difficulty],group=choices[Math.floor(rng()*choices.length)],candidate=group.candidates[Math.floor(rng()*group.candidates.length)];
 const countries=candidate.ids.map(id=>data.countries.find(c=>c.id===id)!);
 for(let i=countries.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[countries[i],countries[j]]=[countries[j],countries[i]]}
 const values=Object.fromEntries(group.language.countries.filter(c=>candidate.ids.includes(c.id)).map(c=>[c.id,{speakers:c.speakers,share:c.share,population:c.population}]));
 const highest=Math.max(...countries.map(c=>values[c.id].speakers));
 return {type:'languages',metric:'population',countries,answer:countries.findIndex(c=>values[c.id].speakers===highest),difficulty,gapScore:candidate.gap,language:{code:group.language.code,name:group.language.name,values}};
}
export function languageSource(round:Round):Source{
 const entry=languageEntries.find(l=>l.code===round.language!.code)!;
 return {...languageMetadata,label:`${round.language!.name} language-use estimates`,coverage:entry.countries.length};
}
