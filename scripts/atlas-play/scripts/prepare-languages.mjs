import {readFile,writeFile} from 'node:fs/promises';
import codes from 'i18n-iso-countries';
const data=JSON.parse(await readFile('data/raw/language-territoryInfo.json','utf8')),territories=data.supplemental.territoryInfo,quiz=JSON.parse(await readFile('public/data/countries.json','utf8'));
const names={en:'English',fr:'French',es:'Spanish',pt:'Portuguese',de:'German',ar:'Arabic',ru:'Russian',it:'Italian',nl:'Dutch',hi:'Hindi',ur:'Urdu',bn:'Bengali',ta:'Tamil',tr:'Turkish',pl:'Polish',ja:'Japanese',ko:'Korean',sv:'Swedish'};
const languages=[];
for(const [code,name] of Object.entries(names)){
 const countries=[];
 for(const country of quiz.countries){const iso2=codes.alpha3ToAlpha2(country.id),t=territories[iso2],l=t?.languagePopulation?.[code];if(!l)continue;const population=Number(t._population),share=Number(l._populationPercent),speakers=population*share/100;if(!(population>0&&share>0&&share<=100&&speakers>=100000))continue;countries.push({id:country.id,population,share,speakers})}
 if(countries.length>=3)languages.push({code,name,countries});
}
const licenseText=await readFile('data/raw/language-license.txt','utf8');
const result={source:{label:'Estimated functional language users',unit:'estimated people',source:'Unicode CLDR 49',year:'CLDR 49 snapshot · mixed source years',url:'https://unicode.org/reports/tr35/tr35-info.html#Territory_Language_Information',definition:'Approximate functional users, including first- and second-language users, as defined for CLDR locale support. Not native-speaker-only counts or a test of complete fluency. Derived from CLDR territory population × language population share; dates vary between source observations. Unlisted languages are missing, never zero. Questions use the covered quiz countries and entries with at least 100,000 estimated users; this is not worldwide coverage. Counts are displayed approximately and close comparisons are excluded.',dataUrl:'https://raw.githubusercontent.com/unicode-org/cldr-json/49.0.0/cldr-json/cldr-core/supplemental/territoryInfo.json',limitationsUrl:'https://cldr.unicode.org/index/requesting-additionsupdates-to-cldr-languagepopulation-data',snapshot:'2026-11-08',license:'Unicode-3.0',licenseText},languages};
await writeFile('public/data/languages.json',JSON.stringify(result,null,2)+'\n');await writeFile('public/data/language-license.txt',licenseText);
console.log(languages.map(l=>l.name+': '+l.countries.length).join('\n'));
