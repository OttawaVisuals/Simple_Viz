import json,math,zipfile,xml.etree.ElementTree as E,pathlib
raw=pathlib.Path('data/raw'); ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
z=zipfile.ZipFile(raw/'happiness.xlsx'); strings=[''.join(n.itertext()) for n in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
happy={}
for row in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row',ns)[1:]:
 cells={''.join(filter(str.isalpha,c.attrib['r'])):(strings[int(c.find('s:v',ns).text)] if c.attrib.get('t')=='s' else c.findtext('s:v',default='',namespaces=ns)) for c in row}
 if cells.get('A')=='2025.0' and cells.get('D'): happy[cells['C']]={ 'value':float(cells['D']),'low':float(cells['E']),'high':float(cells['F'])}
wb={key:{x['countryiso3code']:x['value'] for x in json.load(open(raw/(key+'.json'),encoding='utf8'))[1] if x['value'] is not None} for key in ['population','area','life']}
selection={'LTU':'Lithuania','VEN':'Venezuela','FRA':'France','PRT':'Portugal','BEL':'Belgium','SVN':'Slovenia','DEU':'Germany','ESP':'Spain','ITA':'Italy','POL':'Poland','FIN':'Finland','SWE':'Sweden','NOR':'Norway','DNK':'Denmark','ISL':'Iceland','IRL':'Ireland','GBR':'United Kingdom','NLD':'Netherlands','CHE':'Switzerland','AUT':'Austria','GRC':'Greece','ROU':'Romania','EST':'Estonia','LVA':'Latvia','CZE':'Czechia','HRV':'Croatia','USA':'United States','CAN':'Canada','MEX':'Mexico','BRA':'Brazil','ARG':'Argentina','CHL':'Chile','COL':'Colombia','PER':'Peru','CRI':'Costa Rica','AUS':'Australia','NZL':'New Zealand','JPN':'Japan','KOR':'South Korea','CHN':'China','IND':'India','IDN':'Indonesia','THA':'Thailand','VNM':'Vietnam','PHL':'Philippines','MYS':'Malaysia','ZAF':'South Africa','EGY':'Egypt','KEN':'Kenya','NGA':'Nigeria','ETH':'Ethiopia','MAR':'Morocco','TUR':'Türkiye','SAU':'Saudi Arabia'}
alias={'Türkiye':'Turkiye','Czechia':'Czechia','South Korea':'Republic of Korea'}
features=json.load(open(raw/'countries.geojson',encoding='utf8'))['features']; paths={}; world=[]
for f in features:
 p=f['properties']; iso=p['ADM0_A3']; polys=f['geometry']['coordinates']; polys=[polys] if f['geometry']['type']=='Polygon' else polys
 world.append(' '.join('M'+' L'.join(f'{(x+180)*2:.1f},{(90-y)*2:.1f}' for x,y in poly[0])+'Z' for poly in polys))
 if iso not in selection: continue
 # Main landmass outline: generalized Natural Earth geometry, independently fitted.
 ring=max((poly[0] for poly in polys),key=lambda r:abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1))))
 lat=sum(y for x,y in ring)/len(ring); points=[(x*math.cos(math.radians(lat)),-y) for x,y in ring]; xs,ys=zip(*points); w=max(xs)-min(xs); h=max(ys)-min(ys); scale=min(240/w,190/h)
 paths[iso]='M'+' L'.join(f'{(x-min(xs))*scale+(300-w*scale)/2:.1f},{(y-min(ys))*scale+(230-h*scale)/2:.1f}' for x,y in points)+'Z'
countries=[]
for iso,name in selection.items():
 if iso not in paths or any(iso not in wb[m] for m in wb): print('Missing',iso); continue
 happiness=happy.get(name) or happy.get(alias.get(name,''))
 countries.append({'id':iso,'name':name,'shape':paths[iso],**{m:wb[m][iso] for m in wb},'happiness':happiness['value'] if happiness else None,'happyLow':happiness['low'] if happiness else None,'happyHigh':happiness['high'] if happiness else None})
meta={'population':{'label':'Population','unit':'people','year':'2023','source':'World Bank','url':'https://data.worldbank.org/indicator/SP.POP.TOTL','definition':'Total midyear population, all ages.'},'area':{'label':'Land area','unit':'km²','year':'2023','source':'World Bank','url':'https://data.worldbank.org/indicator/AG.LND.TOTL.K2','definition':'Land area excluding inland water bodies. National statistical boundaries may differ from the simplified outline.'},'life':{'label':'Life expectancy','unit':'years','year':'2023','source':'World Bank','url':'https://data.worldbank.org/indicator/SP.DYN.LE00.IN','definition':'Life expectancy at birth, both sexes. A period estimate based on current mortality rates.'},'happiness':{'label':'Life satisfaction','unit':'/ 10','year':'2023–2025 · 2026 report','source':'World Happiness Report','url':'https://www.worldhappiness.report/data-sharing/','definition':'Average self-reported life evaluation on a 0–10 ladder, over three years ending 2025. Survey estimates, not an objective measure of happiness.'}}
pathlib.Path('public/data/countries.json').write_text(json.dumps({'countries':countries,'metrics':meta},ensure_ascii=False),encoding='utf8')
pathlib.Path('public/world.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 360"><g fill="#487562" opacity=".14">'+''.join('<path d="'+p+'"/>' for p in world)+'</g></svg>')
print('Countries:',len(countries),'with happiness:',sum(c['happiness'] is not None for c in countries))
print('Missing happiness:',[c['name'] for c in countries if c['happiness'] is None])
