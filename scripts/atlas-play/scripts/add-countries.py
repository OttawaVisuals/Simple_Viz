"""Additive country expansion (13 Nov 2026).

Appends countries to public/data/countries.json without touching the existing
records. Uses the same sources, reference years and derivations as the original
prepare-*.py scripts. Population and life expectancy come from the cached
reference-scale snapshot so they match reference-scales.json exactly. Other
series are fetched for the new countries only and cached under data/raw/add-*.
Each fetched series is cross-checked against existing countries; differences
are printed so upstream revisions are visible. Missing values stay null.

Run from scripts/atlas-play:  python -X utf8 scripts/add-countries.py
Then: prepare-visual-context.py, prepare-languages.mjs, npm test, npm run build.
"""
import json,csv,math,zipfile,pathlib,urllib.request,io,unicodedata,xml.etree.ElementTree as E
root=pathlib.Path('.');raw=root/'data/raw';raw.mkdir(parents=True,exist_ok=True)
NEW={'PAK':'Pakistan','BGD':'Bangladesh','IRN':'Iran','IRQ':'Iraq','KAZ':'Kazakhstan','UZB':'Uzbekistan','NPL':'Nepal','LKA':'Sri Lanka','ARE':'United Arab Emirates','MNG':'Mongolia','KHM':'Cambodia','JOR':'Jordan',
 'DZA':'Algeria','COD':'DR Congo','TZA':'Tanzania','GHA':'Ghana','AGO':'Angola','UGA':'Uganda','CMR':'Cameroon','SEN':'Senegal','CIV':'Côte d’Ivoire','TUN':'Tunisia','MDG':'Madagascar','MOZ':'Mozambique','ZMB':'Zambia',
 'RUS':'Russia','UKR':'Ukraine','HUN':'Hungary','ECU':'Ecuador','BOL':'Bolivia','CUB':'Cuba','GTM':'Guatemala','URY':'Uruguay','PNG':'Papua New Guinea','FJI':'Fiji'}
HAPPY_ALIAS={'IRN':['Iran'],'COD':['DR Congo','Congo (Kinshasa)','Democratic Republic of the Congo'],'CIV':["Côte d'Ivoire",'Côte d’Ivoire','Ivory Coast'],'RUS':['Russia','Russian Federation'],'ARE':['United Arab Emirates'],'TZA':['Tanzania']}
p=root/'public/data/countries.json';d=json.loads(p.read_text(encoding='utf8'))
d['countries']=[c for c in d['countries'] if c['id'] not in NEW];old={c['id']:c for c in d['countries']}
def fetch(name,url):
 f=raw/('add-'+name)
 if not f.exists():
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (educational geography quiz)'}),timeout=180) as r:f.write_bytes(r.read())
 return f
def wb(name,code,date):
 rows=json.loads(fetch(name+'.json',f'https://api.worldbank.org/v2/country/all/indicator/{code}?format=json&date={date}&per_page=20000').read_text(encoding='utf8'))[1]
 return [r for r in rows if r['value'] is not None]
def wbyear(name,code,year):return {r['countryiso3code']:float(r['value']) for r in wb(name,code,year) if r['date']==str(year)}
def cached(name,year='2023'):return {r['countryiso3code']:float(r['value']) for r in json.loads((raw/name).read_text(encoding='utf8'))[1] if r['value'] is not None and r['date']==year}
def owid(name,slug,year=2023):
 text=fetch(name+'.csv',f'https://ourworldindata.org/grapher/{slug}.csv').read_text(encoding='utf8')
 out={}
 for r in csv.DictReader(io.StringIO(text)):
  vals=list(r.values())  # Entity, Code, Year, value[, OWID region]
  if r.get('Year')==str(year) and r.get('Code') and vals[3] not in ('',None):out[r['Code']]=float(vals[3])
 return out
def check(key,values,tolerance=1e-6):
 bad=[(i,c.get(key),values.get(i)) for i,c in old.items() if c.get(key) is not None and (values.get(i) is None or abs(values[i]-c[key])>tolerance*max(1,abs(c[key])))]
 print(f'  {key}: {len(old)-len(bad)}/{len(old)} existing countries match the fetched series'+(f'; differs: {bad[:4]}' if bad else ''))
 return not bad
population=cached('scale-population.json');life=cached('scale-life.json');check('population',population);check('life',life)
area=wbyear('area','AG.LND.TOTL.K2',2023);check('area',area)
series={'forest':wbyear('forest','AG.LND.FRST.ZS',2023),'renewable':cached('context-renewable.json','2021'),'internet':wbyear('internet','IT.NET.USER.ZS',2023),'gdp':wbyear('gdp','NY.GDP.PCAP.PP.CD',2023),'alcohol':wbyear('alcohol','SH.ALC.PCAP.LI',2020)}
patents=wbyear('patents','IP.PAT.RESD',2023);series['patents']={i:v/population[i]*1e6 for i,v in patents.items() if i in population}
co2text=fetch('co2.csv','https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv').read_text(encoding='utf8')
series['co2']={r['iso_code']:float(r['co2_per_capita']) for r in csv.DictReader(io.StringIO(co2text)) if r['year']=='2023' and r['iso_code'] and r['co2_per_capita']}
series['hdi']=owid('hdi','human-development-index');series['calories']=owid('calories','daily-per-capita-caloric-supply')
cattle=owid('cattle','cattle-livestock-count-heads');series['cattle']={i:v/population[i] for i,v in cattle.items() if i in population}
series['density']={i:population[i]/area[i] for i in area if i in population and area[i]}
unusual=json.load(open('data/new-unusual.json',encoding='utf8'));errors={}
for m in unusual['metrics']:
 series[m['key']]={i:float(v) for i,v in m['values'].items() if v is not None}
 if m['key']=='doctorates':errors=m.get('standardErrors',{})
heights=json.load(open('data/new-cities-height.json',encoding='utf8'))['heights']
for key in ['heightMale','heightFemale']:series[key]={i:r[key] for i,r in heights.items() if r.get(key) is not None}
# A series that no longer matches the stored snapshot is a different vintage: do not mix it in.
stale=[k for k,v in series.items() if not check(k,v,1e-4 if k in ('patents','cattle','density') else 1e-6)]
# CO2: the Global Carbon Budget revised its 2023 estimates after the first snapshot. All countries are
# refreshed from the same file so every comparison uses one vintage of the same reference year.
REFRESH=[k for k in stale if k=='co2'];stale=[k for k in stale if k not in REFRESH]
for k in REFRESH:
 for c in d['countries']:c[k]=series[k].get(c['id'])
 print('  Refreshed all countries from the current file:',k)
if stale:print('  Revised upstream since the original snapshot; new countries left null for:',stale)
history={}
for r in wb('history','SP.POP.TOTL','2000:2023'):history.setdefault(r['countryiso3code'],[]).append([int(r['date']),r['value']])
hist_ok=all(sorted(history.get(i,[]))==[list(x) for x in c['history']] for i,c in old.items());print('  history matches existing:',hist_ok)
# World Happiness Report, same parsing as prepare-data.py.
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};z=zipfile.ZipFile(fetch('happiness.xlsx','https://files.worldhappiness.report/WHR26_Data_Figure_2.1.xlsx'))
strings=[''.join(n.itertext()) for n in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)];happy={}
for row in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row',ns)[1:]:
 cells={''.join(filter(str.isalpha,c.attrib['r'])):(strings[int(c.find('s:v',ns).text)] if c.attrib.get('t')=='s' else c.findtext('s:v',default='',namespaces=ns)) for c in row}
 if cells.get('A')=='2025.0' and cells.get('D'):happy[cells['C']]={'value':float(cells['D']),'low':float(cells['E']),'high':float(cells['F'])}
fold=lambda s:unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower().replace("'",'').strip()
happyFolded={fold(k):v for k,v in happy.items()}
features={f['properties']['ADM0_A3']:f for f in json.loads(fetch('countries.geojson','https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson').read_text(encoding='utf8'))['features']}
borders={c['cca3']:c for c in json.loads(fetch('borders.json','https://raw.githubusercontent.com/mledoze/countries/master/countries.json').read_text(encoding='utf8'))}
added=[]
for iso,name in NEW.items():
 if iso not in features or iso not in population or iso not in area or iso not in life:print('SKIPPED (missing core data):',iso);continue
 f=features[iso];props=f['properties'];polys=f['geometry']['coordinates'];polys=[polys] if f['geometry']['type']=='Polygon' else polys
 if iso=='RUS':
  # Natural Earth's default view attaches Crimea to Russia. The quiz takes no position: the peninsula is highlighted for neither country.
  keep=[q for q in polys if not (32<sum(x for x,y in q[0])/len(q[0])<37 and 44<sum(y for x,y in q[0])/len(q[0])<46.5)];print('  RUS: dropped',len(polys)-len(keep),'disputed polygon(s) from the highlight');polys=keep
 ring=max((poly[0] for poly in polys),key=lambda r:abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))))
 cos=math.cos(math.radians(sum(y for x,y in ring)/len(ring)));pts=[(x*cos,-y) for x,y in ring];xs,ys=zip(*pts);w=max(xs)-min(xs);h=max(ys)-min(ys);scale=min(240/w,190/h)
 hp=next((happyFolded[fold(n)] for n in [name]+HAPPY_ALIAS.get(iso,[]) if fold(n) in happyFolded),None)
 c={'id':iso,'name':name,'shape':'M'+' L'.join(f'{(x-min(xs))*scale+(300-w*scale)/2:.1f},{(y-min(ys))*scale+(230-h*scale)/2:.1f}' for x,y in pts)+'Z',
  'population':population[iso],'area':area[iso],'life':life[iso],'happiness':hp['value'] if hp else None,'happyLow':hp['low'] if hp else None,'happyHigh':hp['high'] if hp else None,
  'location':[props['LABEL_X'],props['LABEL_Y']],'worldPath':' '.join('M'+' L'.join(f'{(x+180)*2:.1f},{(90-y)*2:.1f}' for x,y in poly[0])+'Z' for poly in polys),
  'projection':{'cos':cos,'scale':scale,'left':(300-w*scale)/2-min(xs)*scale,'top':(230-h*scale)/2-min(ys)*scale},
  'borders':borders.get(iso,{}).get('borders',[]),'region':borders.get(iso,{}).get('region',''),'history':sorted(history.get(iso,[])) if hist_ok else []}
 for key in d['metrics']:
  if key in ('population','area','life','happiness'):continue
  c[key]=None if key in stale else series[key].get(iso)
 se=errors.get(iso);v=c.get('doctorates');c['doctorateLow']=max(0,v-1.96*se) if v is not None and se is not None else None;c['doctorateHigh']=v+1.96*se if v is not None and se is not None else None
 d['countries'].append(c);added.append(iso)
for key,meta in d['metrics'].items():meta['coverage']=sum(c.get(key) is not None for c in d['countries'])
p.write_text(json.dumps(d,ensure_ascii=False),encoding='utf8')
print('Added',len(added),'countries; total',len(d['countries']))
print('No happiness match:',[i for i in added if next(c for c in d['countries'] if c['id']==i)['happiness'] is None])
print('History lengths != 24:',[c['id'] for c in d['countries'] if len(c['history'])!=24])
regions={}
for c in d['countries']:regions[c['region']]=regions.get(c['region'],0)+1
print('Regions:',regions);print('Coverage:',{k:m['coverage'] for k,m in d['metrics'].items()})
