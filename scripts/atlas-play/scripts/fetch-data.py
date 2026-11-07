import json, urllib.request, concurrent.futures, pathlib
root=pathlib.Path('data/raw')
urls={
 'population.json':'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&date=2023&per_page=400',
 'area.json':'https://api.worldbank.org/v2/country/all/indicator/AG.LND.TOTL.K2?format=json&date=2023&per_page=400',
 'life.json':'https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&date=2023&per_page=400',
 'countries.geojson':'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
 'happiness.xlsx':'https://files.worldhappiness.report/WHR26_Data_Figure_2.1.xlsx'
}
def get(item):
 name,url=item
 req=urllib.request.Request(url,headers={'User-Agent':'AtlasPlay/1.0 educational geography quiz'})
 with urllib.request.urlopen(req,timeout=90) as r: blob=r.read()
 (root/name).write_bytes(blob)
 return name,len(blob)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
 for item in ex.map(get,urls.items()): print(item)
(root/'sources.json').write_text(json.dumps(urls,indent=2))
