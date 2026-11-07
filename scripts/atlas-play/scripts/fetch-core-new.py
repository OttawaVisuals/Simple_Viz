import urllib.request,concurrent.futures,pathlib,json
metrics={'forest':'AG.LND.FRST.ZS','renewable':'EG.ELC.RNEW.ZS','internet':'IT.NET.USER.ZS','gdp':'NY.GDP.PCAP.PP.CD','patents':'IP.PAT.RESD','alcohol':'SH.ALC.PCAP.LI'}
urls={k:f'https://api.worldbank.org/v2/country/all/indicator/{v}?format=json&date=2023&per_page=400' for k,v in metrics.items()}
urls['co2']='https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv'
def fetch(item):
 key,url=item
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AtlasPlay/1.0'}),timeout=90) as r:b=r.read()
  pathlib.Path('data/raw',f'core-{key}.'+('csv' if key=='co2' else 'json')).write_bytes(b)
  return key,len(b)
 except Exception as e:return key,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=7) as ex:
 for x in ex.map(fetch,urls.items()):print(x)
pathlib.Path('data/raw/core-new-sources.json').write_text(json.dumps(urls,indent=2))
