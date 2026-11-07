import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const c=JSON.parse(readFileSync('public/data/visual-context.json','utf8')),quiz=JSON.parse(readFileSync('public/data/countries.json','utf8'));
assert.equal(c.electricity.year,quiz.metrics.renewable.year);
assert.ok(c.electricity.world.renewable>0&&c.electricity.world.renewable<100);
for(const country of quiz.countries){const row=c.electricity.countries[country.id];if(country.renewable!=null)assert.ok(Math.abs(row.renewable-country.renewable)<1e-8);for(const key of ['renewable','hydro','otherRenewable','coal','gas','oil','nuclear'])if(row[key]!=null)assert.ok(row[key]>=0&&row[key]<=100);const components=['hydro','otherRenewable','coal','gas','oil','nuclear'].map(k=>row[k]);if(components.every(n=>n!=null)){const total=components.reduce((a,b)=>a+b,0);assert.ok(Math.abs(row.reportedTotal-total)<1e-8);if(total<=100)assert.ok(Math.abs(total+row.otherUnallocated-100)<1e-8);else assert.equal(row.otherUnallocated,null)}else{assert.equal(row.reportedTotal,null);assert.equal(row.otherUnallocated,null)}}
assert.equal(c.electricity.countries.VEN.otherRenewable,null);assert.ok(c.electricity.countries.VEN.invalidSourceValues.otherRenewable<0);assert.equal(c.electricity.countries.VEN.otherUnallocated,null);
assert.ok(c.electricity.countries.THA.reportedTotal>100);assert.equal(c.electricity.countries.THA.otherUnallocated,null);
assert.ok(Math.abs(c.height.world.heightMale-171.28035)<1e-8);assert.ok(Math.abs(c.height.world.heightFemale-159.49168)<1e-8);assert.ok(c.height.year.includes('1996'));assert.equal(c.height.animals.length,4);assert.ok(c.height.animals.every(a=>a.cm>0&&a.url.startsWith('https://')&&a.definition&&a.basis));
console.log('PASS visual data: electricity same year/values, source totals/residuals, over-100 reporting, cohort world means and sourced animal markers.');
