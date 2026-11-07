import json,zipfile,xml.etree.ElementTree as E
p=json.load(open('data/raw/countries.geojson'))['features'][0]['properties']; print({k:p[k] for k in ['ADMIN','ISO_A3','ADM0_A3','NAME']})
z=zipfile.ZipFile('data/raw/happiness.xlsx'); ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
strings=[''.join(n.itertext()) for n in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
print(z.namelist()[:12])
for name in ['xl/workbook.xml','xl/_rels/workbook.xml.rels']: print(z.read(name).decode()[:3000])
for row in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row',ns)[:6]:
 print([(c.attrib.get('r'),strings[int(c.find('s:v',ns).text)] if c.attrib.get('t')=='s' else (c.findtext('s:v',default='',namespaces=ns))) for c in row])
