import urllib.request,pathlib,concurrent.futures,json
urls={'renewable':'https://api.worldbank.org/v2/country/all/indicator/EG.ELC.RNEW.ZS?format=json&date=2015:2023&per_page=5000','alcohol':'https://api.worldbank.org/v2/country/all/indicator/SH.ALC.PCAP.LI?format=json&date=2015:2023&per_page=5000'}
def get(item):
 key,url=item
 with urllib.request.urlopen(url,timeout=90) as r:b=r.read()
 pathlib.Path('data/raw/core-'+key+'.json').write_bytes(b)
 d=json.loads(b)[1];years={}
 for r in d:
  if r['value'] is not None:years[r['date']]=years.get(r['date'],0)+1
 print(key,years)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:list(ex.map(get,urls.items()))
