"""Prepare global-city and height research data from cached, verified source downloads.
Run python -X utf8 scripts/research-cities-height.py from atlas-play.
Files are fetched when missing; delete an explicit cache file to refresh that source.
"""
import urllib.request,csv
import zipfile,xml.etree.ElementTree as E,json,pathlib
def fetch(name,url):
 p=pathlib.Path('data/raw')/name
 if not p.exists():
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=120) as r:p.write_bytes(r.read())
 return p
fetch('new-city-pop.xlsx','https://population.un.org/wup/assets/Download/Cities/WUP2025-F21-DEGURBA-Cities_Pop.xlsx')
z=zipfile.ZipFile('data/raw/new-city-pop.xlsx');ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
strings=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
rows=[];headers={}
with z.open('xl/worksheets/sheet2.xml') as fh:
 for _,row in E.iterparse(fh,events=('end',)):
  if row.tag.endswith('}row'):
   cells={''.join(filter(str.isalpha,c.attrib['r'])): strings[int(c.findtext('s:v',default='0',namespaces=ns))] if c.attrib.get('t')=='s' else c.findtext('s:v',default='',namespaces=ns) for c in row}
   if row.attrib['r']=='1':headers=cells;print('2025 col',[k for k,v in headers.items() if v=='2025'])
   else:
    pop=cells.get(next(k for k,v in headers.items() if v=='2025'),'')
    if pop and float(pop)>=100:
     rows.append({'id':'wup-'+cells['G'],'name':cells['H'],'country':cells['E'],'countryName':cells['B'],'population':round(float(pop)*1000),'lon':float(cells['J']),'lat':float(cells['K']),'capital':cells.get('I')=='1','year':2025})
   row.clear()
source={'label':'Global city population','source':'United Nations · WUP2025, File 21','year':'2025 midyear estimates','url':'https://population.un.org/wup/assets/Download/Cities/WUP2025-F21-DEGURBA-Cities_Pop.xlsx','definition':'Harmonized Degree of Urbanization cities: contiguous densely populated urban centres, not municipal boundaries or commuting-based metro areas. Population-weighted centroid coordinates. Original populations in thousands multiplied by 1000. Threshold 100,000 people in 2025.','license':'CC BY 3.0 IGO','citation':'United Nations, Department of Economic and Social Affairs, Population Division (2025). World Urbanization Prospects: The 2025 Revision, Online Edition.'}
out={'cities':rows,'citySource':source,'heights':{},'heightStatus':'Primary NCD-RisC download currently blocked by HTTP421 / connection resets; pending.'}
pathlib.Path('data/new-cities-height.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf8')
print('cities',len(rows),'countries',len(set(r['country'] for r in rows)),'>=1m',sum(r['population']>=1000000 for r in rows));print(sorted(rows,key=lambda c:c['population'],reverse=True)[:5])

# NCD-RisC2016 historical cohort is deliberately used; the 2020 age19/2019 endpoint is inaccessible.
heights={}
for key,slug,file in [('heightMale','average-height-of-men','new-height-owid-men.csv'),('heightFemale','average-height-of-women','new-height-owid-women.csv')]:
 url='https://ourworldindata.org/grapher/'+slug+'.csv?tab=table&time=1996'
 source=fetch(file,url)
 fetch('new-'+slug+'.metadata.json','https://ourworldindata.org/grapher/'+slug+'.metadata.json?tab=table&time=1996')
 for r in csv.DictReader(open(source,encoding='utf8')):
  if r['Year']=='1996' and len(r['Code'])==3:heights.setdefault(r['Code'],{'name':r['Entity']})[key]=float(list(r.values())[-1])
out['heights']=heights
out['heightSource']={'label':'Mean height at age18','source':'NCD-RisC (eLife2016), processed by Our World in Data','year':'Birth cohort1996 · age18 in2014','unit':'cm','url':'https://ourworldindata.org/human-height','downloadMale':'https://ourworldindata.org/grapher/average-height-of-men.csv?tab=table&time=1996','downloadFemale':'https://ourworldindata.org/grapher/average-height-of-women.csv?tab=table&time=1996','definition':'Modelled national mean height for people born in1996, separately by sex, as estimated for age18 in2014. Historical birth-cohort estimates from the2016 NCD-RisC study, not current all-adult height or age19 in2019. Point estimates supplied without uncertainty intervals; avoid near ties.','citation':'NCD Risk Factor Collaboration (2016). A century of trends in adult human height. eLife5:e13410. https://doi.org/10.7554/eLife.13410','license':'OWID processed data CC BY; original eLife2016 article CC BY4.0. OWID full metadata nonRedistributable=false.','minimumAbsoluteGapSuggested':2}
out['heightStatus']='Usable verified alternate: birthcohort1996 age18. Official age19/2019 download failed HTTP421; no secondary2019 estimates used.'
pathlib.Path('data/new-cities-height.json').write_text(json.dumps(out,ensure_ascii=False),encoding='utf8')
print('Height countries:',len(heights))
