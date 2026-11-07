import json,csv,pathlib
root=pathlib.Path('.');p=root/'public/data/countries.json';d=json.loads(p.read_text(encoding='utf8'));countries=d['countries']
def wb(key,year):return {r['countryiso3code']:float(r['value']) for r in json.load(open('data/raw/core-'+key+'.json',encoding='utf8'))[1] if r['value'] is not None and r['date']==str(year)}
def owid(key,col,year=2023):return {r.get('Code',r.get('iso_code')):float(r[col]) for r in csv.DictReader(open('data/raw/core-'+key+'.csv',encoding='utf8')) if r.get('Year',r.get('year'))==str(year) and r.get(col)}
new=[]
def add(key,label,unit,year,source,url,definition,values,group='World',precision=1):
 m=dict(key=key,label=label,unit=unit,year=str(year),source=source,url=url,definition=definition,group=group,precision=precision,coverage=sum(c['id'] in values for c in countries))
 d['metrics'][key]=m
 for c in countries:c[key]=values.get(c['id'])
 new.append(key)
add('density','Population density','people / km²',2023,'World Bank · derived','https://data.worldbank.org/indicator/SP.POP.TOTL','Total population divided by land area, both 2023. National averages mask where people actually live.',{c['id']:c['population']/c['area'] for c in countries},'People')
for key,label,unit,year,code,definition,group,precision in [
('forest','Forest cover','% of land area',2023,'AG.LND.FRST.ZS','Forest area as a percentage of land area.','Nature',1),
('renewable','Renewable electricity','% of electricity generated',2021,'EG.ELC.RNEW.ZS','Share of electricity output from renewable sources. This is electricity, not all energy use. Latest common usable snapshot from this World Bank series is 2021.','Nature',1),
('internet','Internet use','% of population',2023,'IT.NET.USER.ZS','Individuals using the internet, as a percentage of total population.','Digital',1),
('gdp','GDP per person (PPP)','international $ / person',2023,'NY.GDP.PCAP.PP.CD','GDP per capita adjusted for purchasing-power differences, current international dollars. Not household income or wealth.','Economy',0),
('patents','Resident patent applications','applications / million people',2023,'IP.PAT.RESD','Resident patent applications divided by same-year population, multiplied by one million. Applications, not granted patents. Original source WIPO.','Economy',1),
('alcohol','Alcohol consumption','L pure alcohol / person aged 15+ / year',2020,'SH.ALC.PCAP.LI','Total estimated annual alcohol consumption per resident aged 15+, including abstainers; litres of pure alcohol, not litres of beer or wine. WHO data distributed by World Bank.','Everyday',1)]:
 values=wb(key,year)
 if key=='patents':values={c['id']:values[c['id']]/c['population']*1e6 for c in countries if c['id'] in values}
 add(key,label,unit,year,'World Bank',f'https://data.worldbank.org/indicator/{code}',definition,values,group,precision)
add('co2','CO₂ per person','tonnes / person / year',2023,'Global Carbon Budget via Our World in Data','https://github.com/owid/co2-data','Annual territorial CO₂ emissions from fossil fuels and industry per person. Excludes land-use change and is not consumption-based emissions.',owid('co2','co2_per_capita'),'Nature',2)
add('hdi','Human Development Index','index / 1',2023,'UNDP via Our World in Data','https://ourworldindata.org/grapher/human-development-index','UNDP composite index covering life expectancy, education and income. Scores range from 0 to 1; an index is not a physical quantity.',owid('hdi','Human Development Index'),'People',3)
add('calories','Food energy supply','kcal / person / day',2023,'FAOSTAT via Our World in Data','https://ourworldindata.org/grapher/daily-per-capita-caloric-supply','Food energy available per person per day. Supply includes food that may be wasted; this is not actual calorie intake.',owid('calories','Daily calorie supply per person'),'Everyday',0)
cattle=owid('cattle','Cattle - Stocks (animals)')
add('cattle','Cattle per person','cattle / resident',2023,'FAOSTAT via Our World in Data · derived','https://ourworldindata.org/grapher/cattle-livestock-count-heads','Cattle stocks divided by the same-year 2023 population. Cattle includes more than dairy cows; stocks are recorded at national reference dates.',{c['id']:cattle[c['id']]/c['population'] for c in countries if c['id'] in cattle},'Everyday',2)
u=json.load(open('data/new-unusual.json',encoding='utf8'))
for m in u['metrics']:
 key=m['key'];precision=m.get('displayDecimals',1);add(key,m['label'],m['unit'],m['year'],m['source'],m['url'],m['definition'],m['values'],'People' if key=='doctorates' else 'Digital',precision)
 # Preserve upstream download, license and conversion details.
 d['metrics'][key].update({k:v for k,v in m.items() if k not in ['values','coverage','missingCountries']})
 if key=='doctorates':
  errors=m.get('standardErrors',{})
  for c in countries:
   se=errors.get(c['id']);value=c.get('doctorates');c['doctorateLow']=max(0,value-1.96*se) if value is not None and se is not None else None;c['doctorateHigh']=value+1.96*se if value is not None and se is not None else None
  d['metrics'][key]['definition']+=' Compare/rank/insert questions require reported standard errors and nonoverlapping approximate 95% intervals (estimate ±1.96 standard errors). Missing uncertainty is excluded from those comparisons; this is a conservative gameplay guard, not a formal statistical test.'
h=json.load(open('data/new-cities-height.json',encoding='utf8'))
heights=h['heights'];print('height structure',type(heights).__name__)
if isinstance(heights,list):heights={r['iso3']:r for r in heights}
for key,label in [('heightMale','Male height at age 18'),('heightFemale','Female height at age 18')]:
 vals={iso:r[key] for iso,r in heights.items() if r.get(key) is not None};src=h['heightSource'];add(key,label,'cm',src['year'],src['source'],src['url'],src['definition']+' Questions require at least a 2 cm gap; no confidence intervals were provided in this export.',vals,'People',1)
d['globalCities']=h['cities'];d['citySource']=h['citySource'];d['unavailableTopics']=u.get('notIncluded',[])
d['sources'][0]['label']='French city reference (legacy pack)'
d['sources'][0]['definition']='INSEE municipal population (city proper), 2023. Ten French cities retained as reference; current worldwide ranking and pin rounds use UN WUP2025 instead.'
d['sources'][3]['label']='Base maps'
d['sources'][3]['definition']='Public-domain simplified Natural Earth country outlines. World pin rounds use an equirectangular world map, UN WUP2025 population-weighted city centroids, and great-circle distance scoring with difficulty-specific tolerances.'
# The French pack remains a distinct source and pin pool; global ranking replaces its old default.
for key,meta in d['metrics'].items():
 meta.setdefault('group','People' if key in ['population','life','happiness'] else 'World');meta['coverage']=sum(c.get(key) is not None for c in countries)
p.write_text(json.dumps(d,ensure_ascii=False),encoding='utf8')
print('metrics:',len(d['metrics']),'cities:',len(d['globalCities']))
for k in new:print(k,d['metrics'][k]['coverage'],d['metrics'][k]['year'])

