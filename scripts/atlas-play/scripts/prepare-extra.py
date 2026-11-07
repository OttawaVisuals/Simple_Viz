import json,math,pathlib
p=pathlib.Path('public/data/countries.json');data=json.loads(p.read_text(encoding='utf8'));raw=pathlib.Path('data/raw')
features=json.load(open(raw/'countries.geojson',encoding='utf8'))['features'];byid={f['properties']['ADM0_A3']:f for f in features}
borders={c['cca3']:c for c in json.load(open(raw/'borders.json',encoding='utf8'))};history={}
for r in json.load(open(raw/'history.json',encoding='utf8'))[1]:
 if r['value'] is not None:history.setdefault(r['countryiso3code'],[]).append([int(r['date']),r['value']])
for c in data['countries']:
 f=byid[c['id']];props=f['properties'];c['location']=[props['LABEL_X'],props['LABEL_Y']];polys=f['geometry']['coordinates'];polys=[polys] if f['geometry']['type']=='Polygon' else polys
 c['worldPath']=' '.join('M'+' L'.join(f'{(x+180)*2:.1f},{(90-y)*2:.1f}' for x,y in poly[0])+'Z' for poly in polys)
 ring=max((poly[0] for poly in polys),key=lambda r:abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))))
 cos=math.cos(math.radians(sum(y for x,y in ring)/len(ring)));pts=[(x*cos,-y) for x,y in ring];xs,ys=zip(*pts);w=max(xs)-min(xs);h=max(ys)-min(ys);scale=min(240/w,190/h)
 c['projection']={'cos':cos,'scale':scale,'left':(300-w*scale)/2-min(xs)*scale,'top':(230-h*scale)/2-min(ys)*scale}
 c['borders']=borders.get(c['id'],{}).get('borders',[]);c['region']=borders.get(c['id'],{}).get('region','')
 c['history']=sorted(history.get(c['id'],[]))
places=json.load(open(raw/'places.geojson',encoding='utf8'))['features'];coords={f['properties']['name']:f['geometry']['coordinates'] for f in places if f['properties'].get('adm0name')=='France'}
# INSEE RP2023, municipal populations, geography 2026. Verified against the linked ten-commune comparison table.
pops={'Paris':2103778,'Marseille':886040,'Lyon':519127,'Toulouse':514819,'Nice':357737,'Nantes':327734,'Montpellier':310240,'Strasbourg':293771,'Bordeaux':267991,'Lille':238246}
fr=next(c for c in data['countries'] if c['id']=='FRA');proj=fr['projection'];data['cities']=[]
for name,pop in pops.items():
 lon,lat=coords[name];data['cities'].append({'id':name.lower(),'name':name,'country':'FRA','population':pop,'lon':lon,'lat':lat,'point':[lon*proj['cos']*proj['scale']+proj['left'],-lat*proj['scale']+proj['top']]})
data['sources']=[{'label':'French city populations','source':'INSEE · RP2023','year':'2023 · commune boundaries 2026','url':'https://www.insee.fr/fr/statistiques/1405599?geo=COM-75056+COM-13055+COM-69123+COM-31555+COM-06088+COM-44109+COM-34172+COM-67482+COM-33063+COM-59350','definition':'Municipal population (city proper), not metropolitan areas. Ten French cities in the first city pack.'},{'label':'Population history','source':'World Bank · SP.POP.TOTL','year':'2000–2023','url':'https://data.worldbank.org/indicator/SP.POP.TOTL','definition':'Annual midyear populations. Growth is (population in 2023 / population in 2000 − 1) × 100. Lines use actual annual observations, indexed to 2000 = 100.'},{'label':'Land borders','source':'mledoze/countries · ODbL 1.0','year':'Snapshot downloaded 7 Nov 2026','url':'https://github.com/mledoze/countries','definition':'Land-border lists from the cited open database. Questions use a selected set of targets and avoid China/India and other disputed-border targets. Includes overseas land borders where the database lists them.'},{'label':'Maps and city coordinates','source':'Natural Earth · public domain','year':'1:110m countries / 1:10m populated places','url':'https://www.naturalearthdata.com/about/terms-of-use/','definition':'Simplified country outlines and approximate city-center coordinates. Pin rounds use the mainland France outline, a local equirectangular projection, and great-circle distance with a 100 km tolerance.'}]
p.write_text(json.dumps(data,ensure_ascii=False),encoding='utf8');pathlib.Path('public/data/border-license.txt').write_text('Border attributes are derived from mledoze/countries, available under the Open Database License (ODbL) 1.0. Attribution: https://github.com/mledoze/countries . License: https://opendatacommons.org/licenses/odbl/1-0/ . This downloadable dataset includes the derived border lists. Other data sources and licenses are described in the application sources panel.');print(len(data['countries']),'countries;',len(data['cities']),'cities;',sum(len(c['history']) for c in data['countries']),'country-year observations')
