import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import countryCodes from 'i18n-iso-countries';
const dir=path.dirname(fileURLToPath(import.meta.url));
const dataset=JSON.parse(await readFile(path.join(dir,'public/data/countries.json'),'utf8'));
const flags={};
for(const code of new Set(dataset.globalCities.map(c=>c.country))){
 const alpha2=code==='XKX'?'XK':countryCodes.alpha3ToAlpha2(code);
 if(!alpha2)throw new Error(`Missing ISO mapping for ${code}`);
 flags[code]='data:image/svg+xml;base64,'+Buffer.from(await readFile(path.join(dir,'node_modules/flag-icons/flags/4x3',alpha2.toLowerCase()+'.svg'))).toString('base64');
}
const flagLicense=await readFile(path.join(dir,'node_modules/flag-icons/LICENSE'),'utf8');
const result=await build({absWorkingDir:dir,entryPoints:['entry.tsx'],plugins:[{name:'inline-country-flags',setup(b){b.onResolve({filter:/^atlas-flags$/},()=>({path:'atlas-flags',namespace:'flags'}));b.onLoad({filter:/.*/,namespace:'flags'},()=>({contents:'export default '+JSON.stringify(flags),loader:'js'}));}}],bundle:true,minify:true,write:false,format:'iife',platform:'browser',target:['es2022'],jsx:'automatic',loader:{'.svg':'dataurl','.txt':'text'},define:{'process.env.NODE_ENV':'"production"'},legalComments:'inline'});
let css=await readFile(path.join(dir,'app/globals.css'),'utf8')+'\n'+await readFile(path.join(dir,'app/atlas-theme.css'),'utf8')+'\n'+await readFile(path.join(dir,'app/game-ui.css'),'utf8');
css=css.split('\n').filter(line=>!line.startsWith('@import')).join('\n').replaceAll("'DM Sans',Arial,sans-serif","system-ui,Arial,sans-serif").replaceAll("'Libre Caslon Display',Georgia,serif","Georgia,'Iowan Old Style',serif");
// Preserve the light palette, and transform literal colours for a dark blue theme.
const colors=[...new Set(css.match(/#[0-9a-fA-F]{3,8}\b/g)||[])];
function dark(hex){let v=hex.slice(1);if(v.length===3||v.length===4)v=[...v].map(c=>c+c).join('');const rgb=[0,2,4].map(i=>parseInt(v.slice(i,i+2),16)/255);const max=Math.max(...rgb),min=Math.min(...rgb),light=(max+min)/2;let h=0,s=0;if(max!==min){const d=max-min;s=d/(1-Math.abs(2*light-1));h=max===rgb[0]?((rgb[1]-rgb[2])/d+6)%6:max===rgb[1]?(rgb[2]-rgb[0])/d+2:(rgb[0]-rgb[1])/d+4;h*=60;}if(light>.8){h=220;s=.2;}const l=(.90-.78*light)*100;return `hsl(${h.toFixed(1)} ${(s*100).toFixed(1)}% ${l.toFixed(1)}%${v.length===8?' / '+(parseInt(v.slice(6),16)/255).toFixed(3):''})`;}
const ids=new Map(colors.map((c,i)=>[c,`--atlas-color-${i}`]));
css=css.replace(/#[0-9a-fA-F]{3,8}\b/g,c=>`var(${ids.get(c)})`);
const light=`:root{${colors.map(c=>`${ids.get(c)}:${c}`).join(';')}}`;
const night=`:root[data-theme="dark"]{color-scheme:dark;${colors.map(c=>`${ids.get(c)}:${dark(c)}`).join(';')}}`;
css=css.replaceAll("url('/world.svg')",`url("data:image/svg+xml;base64,${Buffer.from(await readFile(path.join(dir,'public/world.svg'))).toString('base64')}")`);
// Explicit night-atlas tokens keep paper, ink and feedback contrast predictable.
css+=`:root[data-theme="dark"]{--paper:#192638;--ink:#eee3cd;--muted:#c4b99f;--line:#596271;--green:#e3ad84;--orange:#efa277;--atlas-sheet:#213044;--atlas-wash:#2c3c50;--atlas-selected:#493f3a;--atlas-map:#a99370;--atlas-map-ink:#dfca9f;--atlas-success:#b6cf9d;--atlas-success-wash:#293d39;--atlas-error:#efb09b;--atlas-error-wash:#483637}:root[data-theme="dark"] .primary{color:#192638}:root[data-theme="dark"] .primary:hover:not(:disabled){color:#192638}`;
const code=result.outputFiles[0].text.replaceAll('</script','<\\/script');
const html=`<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Atlas Play — Made clear</title>
<meta name="description" content="A geography game: flags, capitals, borders, cities and real statistics for 89 countries. Daily trail, Classic and Survival modes, scored on how close you get.">
<link rel="canonical" href="https://madeclear.ca/visualizations/atlas-play.html">
<meta property="og:title" content="Atlas Play — Made clear">
<meta property="og:description" content="How well do you know the world? A geography game with a daily trail and thirteen question styles.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://madeclear.ca/visualizations/atlas-play.html">
<link rel="icon" href="../assets/brand/favicon.svg">
<style>${light}${night}${css}</style>
<div id="root"></div>
<noscript>Atlas Play needs JavaScript to run its interactive questions.</noscript>
<script>/*! Flag icons: ${flagLicense.replaceAll("*/","* /")} */
${code}</script>
</html>`;
const output=path.resolve(dir,'../../visualizations/atlas-play.html');await mkdir(path.dirname(output),{recursive:true});await writeFile(output,html);
console.log(`Built ${output} (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MB). Self-contained quiz; optional feedback uses /api/feedback.`);
