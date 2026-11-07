"""Acquire and normalize unusual quiz data from primary institutional sources.
Only one common observation year (2024) is used per released metric.
Run from atlas-play. Cached raw downloads are retained for auditability.
"""
import csv,json,pathlib,urllib.request,concurrent.futures
ROOT=pathlib.Path('data/raw');ROOT.mkdir(parents=True,exist_ok=True)
URLS={
'oecd-doctorates.csv':'https://sdmx.oecd.org/public/rest/v1/data/OECD.EDU.IMEP,DSD_EAG_LSO_EA@DF_LSO_NEAC_DISTR_EA,1.0/.?startPeriod=2024&endPeriod=2024&format=csvfilewithlabels',
'itu.csv':'https://datacatalogfiles.worldbank.org/ddh-published/0067055/DR0095956/ITU_DH.csv',
'population2024.json':'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&date=2024&per_page=400',
}
def fetch(item):
 name,url=item;path=ROOT/('unusual-'+name)
 if not path.exists():
  request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'text/csv,application/json,*/*'})
  with urllib.request.urlopen(request,timeout=120) as response:path.write_bytes(response.read())
 return name,path.stat().st_size
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for item in pool.map(fetch,URLS.items()):print(item)
existing=json.loads(pathlib.Path('public/data/countries.json').read_text(encoding='utf8'));existing_ids={c['id'] for c in existing['countries']}
country_ids={c['cca3'] for c in json.loads(pathlib.Path('data/raw/borders.json').read_text(encoding='utf8'))}
with open(ROOT/'unusual-oecd-doctorates.csv',encoding='utf-8-sig') as f:
 oecd=list(csv.DictReader(f))
filters={'SEX':'_T','AGE':'Y25T64','ATTAINMENT_LEV':'ISCED11A_8','EDUCATION_FIELD':'_T','MEASURE':'POP','INCOME':'_Z','BIRTH_PLACE':'_T','MIGRATION_AGE':'_Z','EDU_STATUS':'ED_NED','LABOUR_FORCE_STATUS':'POP','DURATION_UNEMP':'_Z','UNIT_MEASURE':'PT_POP_SEX_AGE','WORK_TIME_ARNGMNT':'_Z','QUESTIONNAIRE':'NEAC','TIME_PERIOD':'2024'}
rows=[r for r in oecd if r['REF_AREA'] in country_ids and all(r.get(k)==v for k,v in filters.items())]
def numeric(r):
 try:return float(r['OBS_VALUE'])
 except (ValueError,TypeError):return None
doc={r['REF_AREA']:numeric(r) for r in rows if r['STATISTICAL_OPERATION']=='OBS' and r['OBS_STATUS']=='A' and numeric(r) is not None}
se={r['REF_AREA']:numeric(r) for r in rows if r['STATISTICAL_OPERATION']=='SE' and r['OBS_STATUS']=='A' and numeric(r) is not None}
metrics=[{'key':'doctorates','label':'Doctorate attainment','unit':'% of adults 25–64','year':'2024','source':'OECD · Education at a Glance','url':'https://data-explorer.oecd.org/vis?df[ag]=OECD.EDU.IMEP&df[id]=DSD_EAG_LSO_EA%40DF_LSO_NEAC_DISTR_EA&df[vs]=1.0','downloadUrl':URLS['oecd-doctorates.csv'],'definition':'Share of adults aged 25–64 whose attainment is doctoral or equivalent level (ISCED 2011 level 8), both sexes combined. Same calendar year 2024. Normal-value observations only; missing or included-in-another-category cells excluded. Not the percentage of the entire population and not annual PhD graduates. OECD source display precision is one decimal place.','values':doc,'standardErrors':se,'license':'OECD Terms and Conditions: https://www.oecd.org/en/about/terms-conditions.html','displayDecimals':1}]
pop={r['countryiso3code']:r['value'] for r in json.loads((ROOT/'unusual-population2024.json').read_text(encoding='utf8'))[1] if r['value'] is not None and r['countryiso3code'] in country_ids}
with open(ROOT/'unusual-itu.csv',encoding='utf8') as f:itu=list(csv.DictReader(f))
base=[r for r in itu if r['TIME_PERIOD']=='2024' and r['REF_AREA'] in country_ids and r['UNIT_MEASURE']=='XB_Y' and r['SEX']=='_T' and r['AGE']=='_T' and r['URBANISATION']=='_T' and r['COMP_BREAKDOWN_1']=='_Z' and r['COMP_BREAKDOWN_2']=='_Z' and r['COMP_BREAKDOWN_3']=='_Z' and r['OBS_STATUS']=='A' and numeric(r) is not None]
traffic={key:{r['REF_AREA']:numeric(r)*10**int(r['UNIT_MULT'] or 0) for r in base if r['INDICATOR']==indicator} for key,indicator in [('mobileTraffic','TRAF_MOB_BB'),('fixedTraffic','TRAF_FIX_BB')]}
for key,label in [('mobileTraffic','Mobile internet traffic'),('fixedTraffic','Fixed internet traffic')]:
 values={iso:eb*1e9/pop[iso] for iso,eb in traffic[key].items() if iso in pop and pop[iso]>0}
 metrics.append({'key':key,'label':label,'unit':'GB / resident / year','year':'2024','source':'ITU DataHub via World Bank · population: World Bank','url':'https://datacatalog.worldbank.org/search/dataset/0067055/itu-data-hub','downloadUrl':URLS['itu.csv'],'populationUrl':URLS['population2024.json'],'definition':('Annual domestic mobile-broadband Internet traffic (3G or newer)' if key=='mobileTraffic' else 'Annual fixed-broadband Internet traffic')+', uploads and downloads combined, divided by the same country’s 2024 midyear population. Exabytes converted to decimal gigabytes (1 EB = 1 billion GB). This is GB per resident per YEAR, not per subscriber or per month, and includes business traffic. Missing traffic or population observations excluded.','values':values,'license':'CC BY 4.0 per World Bank catalog; traffic originally ITU, denominator World Bank SP.POP.TOTL.','displayDecimals':1})
common=set(traffic['mobileTraffic'])&set(traffic['fixedTraffic'])&set(pop)
metrics.append({'key':'internetTraffic','label':'Total broadband internet traffic','unit':'GB / resident / year','year':'2024','source':'ITU DataHub via World Bank · population: World Bank','url':'https://datacatalog.worldbank.org/search/dataset/0067055/itu-data-hub','downloadUrl':URLS['itu.csv'],'populationUrl':URLS['population2024.json'],'definition':'Sum of reported fixed and mobile broadband Internet traffic in 2024 (uploads plus downloads), divided by 2024 midyear population. GB per resident per YEAR, not a typical user’s personal consumption. Only countries reporting BOTH fixed and mobile components are included. No missing component is filled with zero. Decimal conversion: 1 EB = 1 billion GB.','values':{iso:(traffic['mobileTraffic'][iso]+traffic['fixedTraffic'][iso])*1e9/pop[iso] for iso in common if pop[iso]>0},'license':'CC BY 4.0 per World Bank catalog.','displayDecimals':1})
for m in metrics:m['coverage']={'allCountries':len(m['values']),'existingQuizCountries':len(set(m['values'])&existing_ids),'existingQuizMissing':sorted(existing_ids-set(m['values']))}
output={'metrics':metrics,'notIncluded':[{'key':'timeUse','reason':'The OECD TIME_USE public API responded with 175 aggregate activity records for 35 countries, but contains NO observation-year dimension. OECD metadata explicitly uses different national survey years and methodological caveats; using the latest table as a same-year international comparison would be misleading. No time-use metric was released. Main categories only: leisure, personal care, unpaid work, paid work/study, other; no separately downloadable sleep/eating data obtained.','source':'https://www.oecd.org/en/data/datasets/time-use-database.html','downloadUrl':'https://sdmx.oecd.org/public/rest/v1/data/OECD.WISE.INE,DSD_TIME_USE@DF_TIME_USE,1.0/.._T?format=csvfilewithlabels'}]}
pathlib.Path('data/new-unusual.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf8')
for m in metrics:print(m['key'],m['coverage'])
