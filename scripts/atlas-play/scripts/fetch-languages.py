import urllib.request,pathlib
root=pathlib.Path('.');base='https://raw.githubusercontent.com/unicode-org/cldr-json/49.0.0/'
for name,url in [('language-territoryInfo.json',base+'cldr-json/cldr-core/supplemental/territoryInfo.json'),('language-license.txt',base+'LICENSE')]:
 p=root/'data/raw'/name;p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists():
  with urllib.request.urlopen(url,timeout=60) as r:p.write_bytes(r.read())
