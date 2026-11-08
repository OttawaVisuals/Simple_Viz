"""Keep inline footers/feedback consistent without adding runtime dependencies."""
from pathlib import Path
import difflib
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
reference = (ROOT / 'visualizations/lightning-distance.html').read_bytes().decode('utf-8')
form = re.search(r'  <section class="feedback" data-feedback.*?</section>', reference, re.S).group()
form = re.sub(r'\s*<p class="feedback-privacy">.*?</p>', '', form, flags=re.S)
feedback_css = re.search(r'  \.feedback\{.*?\.feedback-trap\{[^}]*\}', reference, re.S).group()
feedback_js = next(block for block in re.findall(r'<script>.*?</script>', reference, re.S) if "var root = document.querySelector('[data-feedback]')" in block)
footer_re = re.compile(r'<(?P<tag>div|footer)\b[^>]*\bclass="(?:site-footer|footer)"[^>]*>.*?</(?P=tag)>', re.S)
paths = [ROOT / name for name in ('index.html', 'about.html', 'unreviewed.html')]
paths += sorted((ROOT / 'visualizations').glob('*.html'))

def update(path, text):
    if path.name == 'atlas-play.html':
        return text  # Generated from its React source.
    prefix = '../' if path.parent.name == 'visualizations' else ''
    privacy = f'{prefix}about.html#feedback-privacy'
    footer = f'''<div class="site-footer" data-site-links>
    <span>Designed and maintained by Simon using AI-assisted development. Sources and approximations are stated on each page.</span>
    <nav aria-label="Page links"><a href="{prefix}about.html">About</a> · <a href="mailto:hello@madeclear.ca">Contact</a> · <a href="#feedbackHeading">Feedback</a> · <a href="{privacy}">Privacy</a></nav>
  </div>'''
    old_footer = footer_re.search(text)
    if old_footer:
        text = text[:old_footer.start()] + footer + text[old_footer.end():]
    else:
        closing = re.search(r'</div>\s*</main>', text)
        if not closing:
            raise ValueError(f'No footer insertion point: {path.name}')
        text = text[:closing.start()] + footer + '\n' + text[closing.start():]
    if 'data-feedback' not in text:
        position = text.index(footer)
        text = text[:position] + form + '\n\n  ' + text[position:]
        text = text.replace('</style>', feedback_css + '\n@media(max-width:700px){.feedback-head{grid-template-columns:1fr}.feedback-choices{justify-content:flex-start}}\n</style>', 1)
        text += '\n' + feedback_js + '\n'
    if 'class="feedback-privacy"' not in text:
        copy = '<p class="feedback-copy">Your response is private and helps improve this page.</p>'
        note = f'<p class="feedback-privacy">No reply address is collected. <a href="{privacy}">How private feedback works</a>.</p>'
        if copy not in text:
            raise ValueError(f'Feedback copy not found: {path.name}')
        text = text.replace(copy, copy + '\n        ' + note, 1)
    if '/* Shared page links */' not in text:
        css = '''
/* Shared page links */
.site-footer[data-site-links]{margin-top:24px;padding-top:16px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:12px 24px;color:var(--muted);font:11.5px/1.7 ui-monospace,monospace}
.site-footer[data-site-links]>span{max-width:70ch}
.site-footer[data-site-links] nav{display:flex;align-items:center;flex-wrap:wrap;gap:0 10px}
.site-footer[data-site-links] nav a{display:inline-flex;align-items:center;min-height:44px;color:var(--muted2);text-decoration:underline;text-underline-offset:3px}
.feedback-privacy{margin:7px 0 0;font:11px/1.6 ui-monospace,monospace;color:var(--muted)}
.feedback-privacy a{color:var(--muted2);text-decoration:underline}
'''
        text = text.replace('</style>', css + '</style>', 1)
    return text

changed = 0
for path in paths:
    text = path.read_bytes().decode('utf-8')
    updated = update(path, text)
    # Preserve the checkout's existing line-ending convention before comparing.
    if '\r\n' in text:
        updated = updated.replace('\r\n', '\n').replace('\n', '\r\n')
    if updated != text:
        path.write_bytes(updated.encode('utf-8'))
        changed += 1
        if path.name == 'egg-boiling-time.html':
            relative = path.relative_to(ROOT).as_posix()
            baseline = subprocess.check_output(['git', 'show', f'HEAD:{relative}'], cwd=ROOT).decode('utf-8')
            baseline_updated = update(path, baseline)
            patch = ''.join(difflib.unified_diff(baseline.splitlines(True), baseline_updated.splitlines(True), fromfile='a/'+relative, tofile='b/'+relative))
            output = ROOT / 'tmp/site-footer-egg.patch'
            output.parent.mkdir(exist_ok=True)
            output.write_bytes(patch.encode('utf-8'))
print(f'Updated {changed} pages. Atlas Play remains generated from source.')
