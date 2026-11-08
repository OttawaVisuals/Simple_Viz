import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {generateRound,grade,canAnswer,availableTypes,roundSource,explanation} from '../lib/game.ts';
import {languageEntries,languageMetadata,languageCoverage,formatSpeakers,languageDifficulty} from '../lib/languages.ts';
import {questionTitle} from '../lib/presentation.ts';
const data=JSON.parse(readFileSync('public/data/countries.json','utf8')),ids=new Set(data.countries.map(c=>c.id));
assert.equal(availableTypes('all').length,10);assert.ok(availableTypes('all').includes('languages'));assert.ok(!availableTypes('life').includes('languages'));assert.equal(languageEntries.length,18);assert.ok(languageMetadata.year.includes('mixed'));assert.ok(languageMetadata.licenseText.includes('UNICODE LICENSE V3'));
for(const l of languageEntries){assert.ok(l.countries.length>=3);assert.equal(new Set(l.countries.map(c=>c.id)).size,l.countries.length);for(const c of l.countries){assert.ok(ids.has(c.id));assert.ok(c.share>0&&c.share<=100);assert.ok(c.speakers>=100000);assert.ok(Math.abs(c.speakers-c.population*c.share/100)<1e-6)}}
const coverage=languageCoverage(data);assert.equal(new Set(Object.values(coverage).flat().map(l=>l.name)).size,18);
let checked=0;
for(const difficulty of ['easy','medium','hard'])for(let i=0;i<100;i++){
 const r=generateRound(data,'all',undefined,false,'languages',{difficulty});assert.equal(r.type,'languages');assert.equal(r.countries.length,3);assert.equal(new Set(r.countries.map(c=>c.id)).size,3);assert.equal(r.difficulty,difficulty);assert.ok(r.gapScore>=.15);assert.equal(languageDifficulty(r.gapScore),difficulty);assert.ok(questionTitle(r).includes(r.language.name));assert.ok(roundSource(data,r).source.includes('CLDR'));
 const values=r.countries.map(c=>r.language.values[c.id].speakers),max=Math.max(...values);assert.equal(values[r.answer],max);assert.equal(canAnswer(r,null,{}),false);assert.equal(canAnswer(r,null,{choice:3}),false);assert.equal(canAnswer(r,null,{choice:-1}),false);assert.ok(grade(r,null,[],{choice:r.answer}));assert.equal(grade(r,null,[],{choice:(r.answer+1)%3}),false);assert.ok(explanation(r,{choice:r.answer}).includes(formatSpeakers(max)));checked++;
}
console.log('PASS',checked,'language rounds: 18 sourced languages, 3 valid countries, all difficulty tiers, eligibility/precision guards, scoring and coverage.');
