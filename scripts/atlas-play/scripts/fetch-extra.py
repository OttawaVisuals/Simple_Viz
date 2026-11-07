import urllib.request,concurrent.futures,pathlib
urls={
'history.json':'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&date=2000:2023&per_page=10000',
'borders.json':'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
'places.geojson':'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson',
'cities-insee.html':'https://www.insee.fr/fr/statistiques/1405599?geo=COM-75056+COM-13055+COM-69123+COM-31555+COM-06088+COM-44109+COM-34172+COM-67482+COM-33063+COM-59350'
}
def fetch(item):
 n,u=item
 with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=90) as r:b=r.read()
 pathlib.Path('data/raw',n).write_bytes(b);return n,len(b)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
 for res in ex.map(fetch,urls.items()):print(res)
