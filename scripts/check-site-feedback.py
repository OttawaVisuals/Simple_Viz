"""Check shared footer links, feedback anchors, privacy links and inline JS syntax."""
from pathlib import Path
from html.parser import HTMLParser
import json
import subprocess

ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.links=[];self.script=False;self.scripts=[];self.parts=[];self.feedback=0
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs:self.ids.append(attrs['id'])
        if tag=='a':self.links.append(attrs.get('href',''))
        if 'data-feedback' in attrs:self.feedback+=1
        if tag=='script':self.script=True;self.parts=[]
    def handle_data(self,data):
        if self.script:self.parts.append(data)
    def handle_endtag(self,tag):
        if tag=='script':self.script=False;self.scripts.append(''.join(self.parts))
paths=[ROOT/name for name in ('index.html','about.html','unreviewed.html')]+sorted((ROOT/'visualizations').glob('*.html'))
scripts=[];checked=0
for path in paths:
    if path.name=='atlas-play.html':continue
    page=Page();page.feed(path.read_text(encoding='utf-8'))
    prefix='../' if path.parent.name=='visualizations' else ''
    for href in (prefix+'about.html','mailto:hello@madeclear.ca','#feedbackHeading',prefix+'about.html#feedback-privacy'):
        assert href in page.links,(path.name,href)
    assert page.feedback==1,(path.name,'feedback count',page.feedback)
    assert page.ids.count('feedbackHeading')==1,(path.name,'feedback anchor')
    assert page.ids.count('feedbackComment')==1,(path.name,'comment id')
    scripts.extend({'page':path.name,'code':code} for code in page.scripts if code.strip())
    checked+=1
privacy=Page();privacy.feed((ROOT/'about.html').read_text(encoding='utf-8'))
assert privacy.ids.count('feedback-privacy')==1
result=subprocess.run(['node','-e',"const fs=require('fs');for(const item of JSON.parse(fs.readFileSync(0,'utf8'))){try{new Function(item.code)}catch(e){throw Error(item.page+': '+e.message)}}"],input=json.dumps(scripts),text=True,capture_output=True)
assert result.returncode==0,result.stderr
print(f'PASS {checked} pages: footer links, one feedback form each, valid feedback/privacy anchors and {len(scripts)} inline scripts parse.')
