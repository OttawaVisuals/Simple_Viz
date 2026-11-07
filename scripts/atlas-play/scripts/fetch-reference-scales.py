"""Reference distribution for 2023 population/life; filters out World Bank aggregates."""
import json,pathlib,urllib.request,concurrent.futures
root=pathlib.Path('.');cache=root/'data/raw';cache.mkdir(parents=True,exist_ok=True)
urls={'countries':'https://api.worldbank.org/v2/country?format=json&per_page=400','population':'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&date=2023&per_page=400','life':'https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&date=2023&per_page=400'}
def fetch(item):
 k,url=item;p=cache/f'scale-{k}.json'
 if not p.exists():
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AtlasPlay/1.0'}),timeout=90) as r:p.write_bytes(r.read())
 return k,json.loads(p.read_text(encoding='utf8'))[1]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:raw=dict(ex.map(fetch,urls.items()))
allowed={r['id']:r['name'] for r in raw['countries'] if r['region']['id']!='NA'};base=json.loads((root/'public/data/countries.json').read_text(encoding='utf8'));out={'snapshot':'2026-11-07','metrics':{}}
for key in ['population','life']:
 rows=[{'id':r['countryiso3code'],'name':allowed[r['countryiso3code']],'value':float(r['value'])} for r in raw[key] if r['countryiso3code'] in allowed and r['value'] is not None and r['date']=='2023']
 lookup={r['id']:r['value'] for r in rows};mismatches=[c['id'] for c in base['countries'] if c[key] is not None and (c['id'] not in lookup or abs(c[key]-lookup[c['id']])>1e-6)]
 if mismatches:raise ValueError(f'{key}: source revisions do not match quiz snapshot: {mismatches}')
 out['metrics'][key]={'year':'2023','source':'World Bank · World Development Indicators','url':'https://data.worldbank.org/indicator/'+('SP.POP.TOTL' if key=='population' else 'SP.DYN.LE00.IN'),'world':next(r['value'] for r in raw[key] if r['countryiso3code']=='WLD'),'places':rows,'definition':'Countries and economies with a non-missing 2023 observation; regional/income aggregates excluded using World Bank country metadata. World is the published WLD aggregate, not an unweighted country average.'}
 print(key,len(rows),'highest',max(rows,key=lambda r:r['value']))
(root/'public/data/reference-scales.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
