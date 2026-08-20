from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
FONT = r"C:\Windows\Fonts\georgiai.ttf"
FG, PAPER, NAVY, LIGHT, BLUE, BLUE_DARK = "#1B1A17", "#F7F5F0", "#121A2C", "#E9E6DB", "#2F6BD8", "#6FA0F2"

def font(size): return ImageFont.truetype(FONT, size)

def signal(draw, box, color, width):
    x, y, w, h = box
    pts = [(x,y+h*.62),(x+w*.035,y+h*.62),(x+w*.07,y+h*.42),(x+w*.105,y+h*.82),
           (x+w*.14,y+h*.25),(x+w*.175,y+h*.72),(x+w*.21,y+h*.52),(x+w*.25,y+h*.52),(x+w,y+h*.52)]
    draw.line(pts, fill=color, width=width, joint="curve")

def mark(size, bg, fg, accent, transparent=False):
    im = Image.new("RGBA", (size,size), (0,0,0,0) if transparent else bg)
    d = ImageDraw.Draw(im)
    f = font(round(size*.30)); text="mc"; b=d.textbbox((0,0),text,font=f)
    d.text(((size-(b[2]-b[0]))/2, size*.16), text, font=f, fill=fg)
    signal(d,(size*.14,size*.43,size*.72,size*.24),accent,max(2,round(size*.027)))
    return im

def wordmark(draw, origin, scale, color):
    x,y=origin; big=font(round(150*scale)); small=font(round(74*scale))
    draw.text((x,y),"m",font=big,fill=color)
    ade_x=x+draw.textlength("m",font=big)+18*scale
    draw.text((ade_x,y+92*scale),"ade",font=small,fill=color)
    c_x=ade_x+draw.textlength("ade",font=small)+34*scale
    draw.text((c_x,y),"c",font=big,fill=color)
    lear_x=c_x+draw.textlength("c",font=big)+16*scale
    draw.text((lear_x,y+92*scale),"lear",font=small,fill=color)

def lockup(width, dark=False, transparent=True):
    height=round(width*.25); bg=(0,0,0,0) if transparent else (NAVY if dark else PAPER)
    im=Image.new("RGBA",(width,height),bg); d=ImageDraw.Draw(im)
    fg=LIGHT if dark else FG; accent=BLUE_DARK if dark else BLUE
    icon=mark(height, bg, fg, accent, True); im.alpha_composite(icon,(0,0))
    wordmark(d,(height*.95,height*.08),height/300,fg)
    return im

def wordmark_image(width, dark=False):
    height=round(width*260/900); im=Image.new("RGBA",(width,height),(0,0,0,0)); d=ImageDraw.Draw(im)
    wordmark(d,(width*.055,height*.05),width/900,LIGHT if dark else FG)
    return im

for size in (32,64,128,256,512,1024):
    mark(size,PAPER,FG,BLUE).save(ROOT/f"madeclear-mark-light-{size}.png")
    mark(size,NAVY,LIGHT,BLUE_DARK).save(ROOT/f"madeclear-mark-dark-{size}.png")
    mark(size,PAPER,FG,BLUE,True).save(ROOT/f"madeclear-mark-transparent-{size}.png")

for width in (600,1200):
    lockup(width,False,True).save(ROOT/f"madeclear-lockup-light-{width}.png")
    lockup(width,True,True).save(ROOT/f"madeclear-lockup-dark-{width}.png")
    wordmark_image(width,False).save(ROOT/f"madeclear-wordmark-light-{width}.png")
    wordmark_image(width,True).save(ROOT/f"madeclear-wordmark-dark-{width}.png")

mark(1024,PAPER,FG,BLUE).save(ROOT/"madeclear-social-light-1024.png")
mark(1024,NAVY,LIGHT,BLUE_DARK).save(ROOT/"madeclear-social-dark-1024.png")
lockup(600,False,True).save(ROOT/"madeclear-email-signature-light.png")
lockup(600,True,True).save(ROOT/"madeclear-email-signature-dark.png")

icons=[mark(s,PAPER,FG,BLUE).convert("RGBA") for s in (16,32,48,64)]
icons[-1].save(ROOT/"favicon.ico",format="ICO",sizes=[(16,16),(32,32),(48,48),(64,64)])
