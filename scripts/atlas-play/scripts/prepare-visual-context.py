"""Build sourced visual context. Run fetch-visual-context.py first. Missing values remain null."""
import json,csv,pathlib,datetime
root=pathlib.Path('.');raw=root/'data/raw';base=json.loads((root/'public/data/countries.json').read_text(encoding='utf8'))
codes={'renewable':'EG.ELC.RNEW.ZS','coal':'EG.ELC.COAL.ZS','gas':'EG.ELC.NGAS.ZS','oil':'EG.ELC.PETR.ZS','nuclear':'EG.ELC.NUCL.ZS','hydro':'EG.ELC.HYRO.ZS','otherRenewable':'EG.ELC.RNWX.ZS'}
maps={k:{r['countryiso3code']:r['value'] for r in json.loads((raw/f'context-{k}.json').read_text())[1] if r['date']=='2021'} for k in codes}
fuels=['hydro','otherRenewable','coal','gas','oil','nuclear']
def electricity(code):
 row={k:maps[k].get(code) for k in codes};row['invalidSourceValues']={k:row[k] for k in codes if row[k] is not None and not 0<=row[k]<=100};
 for k in row['invalidSourceValues']:row[k]=None
 vals=[row[k] for k in fuels];row['reportedTotal']=sum(vals) if all(v is not None for v in vals) else None
 row['otherUnallocated']=max(0,100-row['reportedTotal']) if row['reportedTotal'] is not None and row['reportedTotal']<=100 else None
 return row
worldHeights={}
for key in ['heightMale','heightFemale']:
 rows=list(csv.DictReader((raw/f'context-{key}.csv').read_text(encoding='utf8').splitlines()));row=next(r for r in rows if r['Entity']=='World' and r['Year']=='1996');worldHeights[key]=float(list(row.values())[-1])
animals=[
 {'key':'dog','label':'Labrador','cm':60,'basis':'shoulder','url':'https://www.ukcdogs.com/docs/breeds/labrador-retriever.pdf','definition':'Illustrative male Labrador at 60 cm, within UKC adult male standard 22.5–24.5 inches (57.15–62.23 cm); not a measured breed average.'},
 {'key':'penguin','label':'Emperor penguin','cm':110,'basis':'standing','url':'https://www.aquariumofpacific.org/onlinelearningcenter/species/emperor_penguin','definition':'Illustrative 110 cm standing height within Aquarium of the Pacific range 90–120 cm; not beak-to-tail length or a species average.'},
 {'key':'horse','label':'Thoroughbred','cm':162.56,'basis':'withers','url':'https://2026mdmanual.msa.maryland.gov/msa/mdmanual/01glance/symbols/html/horse.html','definition':'Maryland State Archives gives an average Thoroughbred height of 16 hands (64 inches) at the withers. Exact conversion 162.56 cm, displayed rounded to 163 cm.'},
 {'key':'elephant','label':'Male elephant','cm':310,'basis':'shoulder','url':'https://animals.sandiegozoo.org/animals/elephant','definition':'Illustrative 310 cm shoulder height within San Diego Zoo stated adult male average range 300–320 cm. Elephant species and individuals vary; this is a scale reference, not a universal mean.'}
]
context={'snapshot':'2026-11-07','electricity':{'year':'2021','source':'World Bank · World Development Indicators','sources':{k:'https://data.worldbank.org/indicator/'+v for k,v in codes.items()},'definition':'Shares of electricity output, not total energy use. World uses the reported WLD aggregate, not an average over quiz countries. Negative or over-100 component shares are retained in invalidSourceValues for audit and omitted from visuals, never converted to zero. Separately reported fuel series may not sum to 100%; valid values are never rescaled. Other/unallocated is a derived positive residual when all six components exist; over-100 totals are flagged, never forced to balance. Non-hydro renewables are grouped in this source.','world':electricity('WLD'),'countries':{c['id']:electricity(c['id']) for c in base['countries']}},'height':{'world':worldHeights,'year':'Birth cohort 1996 · age 18 in 2014','source':'NCD-RisC (2016), processed by Our World in Data','sources':{k:'https://ourworldindata.org/grapher/'+('average-height-of-men' if k=='heightMale' else 'average-height-of-women') for k in worldHeights},'definition':'World-row means for the same sex and birth cohort as quiz values. Historical estimates, not current whole-population averages.','animals':animals}}
(root/'public/data/visual-context.json').write_text(json.dumps(context,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Saved visual context:',len(context['electricity']['countries']),'electricity countries;',worldHeights)
