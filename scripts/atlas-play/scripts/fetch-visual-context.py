import urllib.request,json,concurrent.futures,pathlib,csv,io
base=pathlib.Path('data/raw');base.mkdir(parents=True,exist_ok=True)
urls={k:f'https://api.worldbank.org/v2/country/all/indicator/{code}?format=json&date=2021&per_page=400' for k,code in {'renewable':'EG.ELC.RNEW.ZS','coal':'EG.ELC.COAL.ZS','gas':'EG.ELC.NGAS.ZS','oil':'EG.ELC.PETR.ZS','nuclear':'EG.ELC.NUCL.ZS','hydro':'EG.ELC.HYRO.ZS','otherRenewable':'EG.ELC.RNWX.ZS'}.items()}
urls.update({k:'https://ourworldindata.org/grapher/'+slug+'.csv?tab=table&time=1996' for k,slug in [('heightMale','average-height-of-men'),('heightFemale','average-height-of-women')]})
def fetch(item):
 k,u=item;p=base/f'context-{k}.json' if not k.startswith('height') else base/f'context-{k}.csv'
 try:
  if not p.exists():
   with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=90) as r:p.write_bytes(r.read())
  if k.startswith('height'):
   rows=list(csv.DictReader(io.StringIO(p.read_text(encoding='utf8'))));return k,[r for r in rows if r['Entity']=='World' and r['Year']=='1996'][:2]
  d=json.loads(p.read_text(encoding='utf8'));return k,[(r['countryiso3code'],r['value']) for r in d[1] if r['countryiso3code'] in ['WLD','DEU']]
 except Exception as e:return k,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
 for r in ex.map(fetch,urls.items()):print(r)
