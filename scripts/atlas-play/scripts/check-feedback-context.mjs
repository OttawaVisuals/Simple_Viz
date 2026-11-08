import assert from 'node:assert/strict';
import {questionReport} from '../lib/feedback-context.ts';

const countries=[{id:'A',name:'Alpha',population:12345},{id:'B',name:'Beta',population:67890}];
const round={type:'compare',metric:'population',countries,answer:1};
const report=questionReport(round,'Which has more people?',['Difficulty: medium'],3,false,0,{},'World Bank · 2023');
assert.ok(report.context.includes('Question 3: Which has more people?'));
assert.ok(report.context.includes('Country: A — Alpha'));
assert.ok(report.context.includes('Country: B — Beta'));
assert.ok(report.context.includes('Answer checked: no'));
assert.ok(report.context.includes('Player input: {"selection":0}'));
assert.ok(!report.context.join(' ').includes('12345'));
assert.ok(!report.context.join(' ').includes('67890'));
countries[0].name='A different round';
assert.ok(report.context.includes('Country: A — Alpha'),'Report retains the original question after round changes');

const cityRound={type:'topfive',metric:'population',countries:[],cities:[{id:'city-1',name:'City One',country:'AAA'},{id:'city-2',name:'City Two',country:'BBB'},{id:'city-3',name:'City Three',country:'CCC'}]};
const cityReport=questionReport(cityRound,'Rank 3 cities',[],1,true,null,{cities:['city-3','city-1','city-2']},'UN · 2025');
assert.ok(cityReport.context.includes('City: city-1 — City One, AAA'));
assert.ok(cityReport.context.includes('Answer checked: yes'));
assert.ok(cityReport.context.some(value=>value.includes('"cities":["city-3","city-1","city-2"]')));
const ratio=questionReport({...round,type:'gap',options:[.5,1,2]},'A ÷ B',[],1,false,null,{choice:2},'Source');
assert.ok(ratio.context.includes('Displayed options: 0.5, 1, 2'));
const limited=questionReport(round,'x'.repeat(400),Array(40).fill('z'.repeat(400)),1,false,null,{},'Source');
assert.ok(limited.context.length<=20&&limited.context.every(value=>value.length<=200));
console.log('PASS question feedback: frozen country/city identities, player input, ratio options, context limits and hidden-solution exclusion.');
