import urllib.request,pathlib,concurrent.futures,json
urls={k:f'https://ourworldindata.org/grapher/{slug}.csv' for k,slug in {'hdi':'human-development-index','calories':'daily-per-capita-caloric-supply','cattle':'cattle-livestock-count-heads'}.items()}
def get(item):
 k,u=item
 try:
  with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=90) as r:b=r.read()
  pathlib.Path('data/raw/core-'+k+'.csv').write_bytes(b);print(k,len(b),b[:150])
 except Exception as e:print(k,str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:list(ex.map(get,urls.items()))
for name in ['forest','renewable','internet','gdp','patents','alcohol']:
 d=json.load(open('data/raw/core-'+name+'.json',encoding='utf8'));print(name,sum(r['value'] is not None for r in d[1]))
