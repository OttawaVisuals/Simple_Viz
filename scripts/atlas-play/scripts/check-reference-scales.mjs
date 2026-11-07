import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {referenceDomain,scalePosition,zoomReferenceDomain,referenceBins,compactScaleValue} from '../lib/reference-scales.ts';
import {questionTitle} from '../lib/presentation.ts';
const data=JSON.parse(readFileSync('public/data/countries.json','utf8')),refs=JSON.parse(readFileSync('public/data/reference-scales.json','utf8'));
for(const metric of ['population','life']){
 const r=refs.metrics[metric];assert.equal(r.year,data.metrics[metric].year);assert.ok(r.places.length>200);assert.ok(!r.places.some(p=>p.id==='WLD'));
 for(const c of data.countries)if(c[metric]!=null)assert.ok(Math.abs(r.places.find(p=>p.id===c.id).value-c[metric])<1e-6);
 const domain=referenceDomain(metric,r.places);assert.ok(domain[1]>domain[0]);assert.equal(referenceBins(r.places,domain).reduce((a,b)=>a+b,0),r.places.filter(p=>p.value>=domain[0]&&p.value<=domain[1]).length);
 const values=[r.places[0].value,r.places[1].value],zoom=zoomReferenceDomain(values,domain);assert.ok(zoom[0]<=Math.min(...values)&&zoom[1]>=Math.max(...values));
}
const pop=refs.metrics.population.places,max=Math.max(...pop.map(p=>p.value)),domain=referenceDomain('population',pop);
assert.equal(domain[0],1e6);assert.equal(domain[1],max);assert.equal(scalePosition(max,domain),1);assert.equal(scalePosition(500000,domain),0);assert.equal(scalePosition((domain[0]+domain[1])/2,domain),.5);
assert.equal(compactScaleValue(1000000,'population'),'1M');assert.equal(compactScaleValue(100,'life'),'100 yrs');assert.equal(compactScaleValue(0,'hdi'),'0');assert.deepEqual(referenceDomain('life',refs.metrics.life.places),[0,100]);
assert.equal(questionTitle({type:'gap',metric:'cattle',countries:[{name:'Denmark'},{name:'South Korea'}]}),'Cattle per person: Denmark ÷ South Korea?');
const html=readFileSync('../../visualizations/atlas-play.html','utf8');assert.ok(!/\.gap\{/.test(html));assert.ok(html.includes('.insert-gap{'));assert.ok(html.includes('round-'));
console.log('PASS reference scales: matching years/values, global aggregates excluded, linear positions/bin counts, zoom bounds, below-range handling and ratio selector isolation.');
