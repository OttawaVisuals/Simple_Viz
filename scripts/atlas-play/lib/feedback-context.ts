import type {Round,ExtraAnswer} from './game';
export type FeedbackReport={title:string;context:string[]};
/** Capture the displayed challenge and player's input, without the hidden solution. */
export function questionReport(round:Round,title:string,settings:string[],number:number,answered:boolean,selection:number|null,answer:ExtraAnswer,source:string):FeedbackReport{
 const context=['Feedback type: Question report',`Question ${number}: ${title}`,`Style: ${round.type}; measure: ${round.metric}`,`Source: ${source}`,...settings,
  ...(round.language?[`Language: ${round.language.code} — ${round.language.name}`,`Definition: estimated functional first- and second-language users; CLDR 49; mixed source years`]:[]),
  ...round.countries.map(country=>`Country: ${country.id} — ${country.name}`),
  ...(round.target?[`Target: ${round.target.id} — ${round.target.name}`]:[]),
  ...(round.cities||[]).map(city=>`City: ${city.id} — ${city.name}, ${city.country}`),
  ...(round.city?[`Target city: ${round.city.id} — ${round.city.name}, ${round.city.country}`]:[]),
  ...(round.options?[`Displayed options: ${round.options.join(', ')}`]:[]),
  ...(round.choices?[`Displayed choices: ${round.choices.map(c=>c.label).join(', ')}`]:[]),
  `Answer checked: ${answered?'yes':'no'}`,`Player input: ${JSON.stringify({selection,...answer})}`];
 return {title,context:context.slice(0,20).map(value=>value.slice(0,200))};
}
