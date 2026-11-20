#!/usr/bin/env python3
"""Galeria HTML e amostra PNG de retratos em caracteres ASCII."""
import sys, html
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
sys.path.insert(0,str(Path(__file__).resolve().parent))
from generate_bosses_hd import REGIONAL,DUNGEON,render_boss
ROOT=Path(__file__).resolve().parents[1]
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
font=ImageFont.truetype(fontpath,7)
font_title=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
names=REGIONAL+DUNGEON
# Prévias PNG: seis chefes regionais e seis exclusivos de masmorras.
def build_preview(selected,filename):
 cols=3;rows=2;cellw=620;cellh=800
 img=Image.new('RGB',(cols*cellw,rows*cellh),'#11151d');d=ImageDraw.Draw(img)
 for pos,i in enumerate(selected):
  name=names[i];col=pos%cols;row=pos//cols;x=col*cellw;y=row*cellh
  d.text((x+16,y+14),name,font=font_title,fill='#e6c99a')
  art=render_boss(name,i).splitlines()
  for yy,line in enumerate(art):
   # cada pixel permanece texto em fonte monoespaçada
   for xx,c in enumerate(line):
    if c==' ':continue
    density=' .:-=+*#%@'.index(c)
    lum=int(70+density/9*180)
    d.text((x+16+xx*4.5,y+46+yy*8.1),c,font=font,fill=(lum,int(lum*.89),int(lum*.72)))
 img=img.resize((1240,1067),Image.Resampling.LANCZOS)
 out=ROOT/'docs'/filename;img.save(out,optimize=True)
 return out
out=build_preview(range(6),'previa-chefes-hd5.png')
second=build_preview(range(10,16),'previa-chefes-masmorras-hd5.png')
# Arquivo HTML de galeria, sem imagens (so texto em <pre>).
def pre(content):return html.escape(content)
items=[]
for i,name in enumerate(names):
 variants=[1,2,3] if i<10 else [1]
 for phase in variants:
  art=render_boss(name,i,phase)
  items.append(f'<article><h2>{pre(name)} {" · Fase "+str(phase) if i<10 else " · Masmorra"}</h2><div class="frame"><pre>{pre(art)}</pre></div></article>')
page='''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASCII REALMS: 20 Chefes HD</title><style>body{background:#10161b;color:#e4d5bf;font:15px/1.5 system-ui,sans-serif;margin:0;padding:20px}header{max-width:950px;margin:auto}main{max-width:1300px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,530px),1fr));gap:12px}article{border:1px solid #48575b;padding:10px;border-radius:8px;min-width:0}h2{font-size:15px}.frame{overflow:hidden;text-align:center;max-width:100%}pre{display:inline-block;text-align:left;white-space:pre;margin:0;color:#a7c6a6;font:400 7px/1.03 'DejaVu Sans Mono',Consolas,monospace;letter-spacing:0;max-width:none}@media(max-width:680px){pre{font-size:3.7px}}</style></head><body><header><h1>20 Chefes: Atlas de Alta Densidade</h1><p>20 retratos únicos. Os dez chefes regionais possuem variantes visuais para cada fase. Arte textual ASCII, 128 × 88. A galeria é para revisão artística, não para validar automaticamente a qualidade.</p></header><main>'''+''.join(items)+'''</main><script>function resize(){document.querySelectorAll('.frame').forEach(el=>{const pre=el.querySelector('pre');pre.style.fontSize=Math.min(7,Math.max(1.6,(el.clientWidth-10)/(128*.605))).toFixed(2)+'px'})}addEventListener('resize',resize);resize();</script></body></html>'''
(ROOT/'docs/galeria-chefes-hd5.html').write_text(page,encoding='utf-8')
print('previews',out,second,'gallery entries',len(items))
