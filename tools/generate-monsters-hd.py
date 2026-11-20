#!/usr/bin/env python3
"""ASCII REALMS, Etapa 4. 150 especies originais em superficies ASCII textuais.

Gera geometria anatomica e sombreamento por especie, sem copiar outras artes
ou depender de imagens externas. O resultado e arte ASCII real, nao bitmap.
Estes retratos procedurais requerem ainda curadoria visual individual.
"""
import json, math, random, re, subprocess, unicodedata
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import distance_transform_edt

ROOT=Path(__file__).resolve().parents[1]
W,H=112,78
S=2
RAMP=' .:-=+*#%@'

# Cada especie tem um perfil de anatomia. Grupos repartem tecnicas,
# jamais um retrato final. Ordem dos testes: do mais especifico ao geral.
TYPE_RULES=[
 ('scorpion',r'escorpi[aã]o'),('spider',r'aranha|matriarca'),
 ('insect',r'vespa|mosquito|besouro|escaravelho|vermes'),
 ('crocodile',r'crocodilo|lagarto|salamandra'),('snake',r'serpente|v[ií]bora|enguia|sanguessuga'),
 ('bat',r'morcego'),('owl',r'coruja'),('vulture',r'abutre'),('corvid',r'corvo'),
 ('raptor',r'harpia|[aá]guia'),('griffin',r'grifo|le[aã]o alado'),
 ('wolf',r'lobo|c[aã]o|chacal|hiena|raposa'),('boar',r'javali'),
 ('stag',r'cervo|alce|cabra'),('giant',r'\btroll\b|\byeti\b'),('bear',r'urso'),('cat',r'lince|fera dos juncos'),
 ('seal',r'foca'),('frog',r'sapo'),('rat',r'rato'),
 ('tree',r'\bent\b|raiz|carvalho'),
 ('skeleton',r'esqueleto|carni[cç]al|m[uú]mia|necromante|algoz sepulcral'),
 ('construct',r'aut[oô]mato|golem|colosso|tit[aã]|sentinela|[ií]dolo|armadura|est[aá]tua|guardi[aã]o'),
 ('chimera',r'quimera'),('demon',r'diabrete|predador abissal|g[aá]rgula'),
 ('spirit',r'espectro|esp[ií]rito|elemental|banshee|vento|vulto|fagulha|orbe|lamento|sombra|aberra[cç][aã]o|\beco\b|ara[uú]to da aus[eê]ncia|bolha'),
 ('human',r'bandido|saqueador|arqueiro|capit[aã]o|desertor|assaltante|contrabandista|alquimista|mercen[aá]rio|capataz|prof anador|profanador|ladr[aã]o|ca[cç]ador|cavaleiro|inquisidor|paladino|cultista|bruxa|n[oô]made|arconte|vigia|profeta|arauto|juiz'),
]

def species_type(name):
 s=name.lower()
 for t,pattern in TYPE_RULES:
  if re.search(pattern,s):return t
 return 'beast'


def seed32(text):
 h=2166136261
 for b in text.encode('utf-8'):
  h=((h^b)*16777619)&0xffffffff
 return h

class Art:
 def __init__(self,name,region,kind):
  self.name=name;self.region=region;self.kind=kind;self.seed=seed32(name+'::hd4')
  self.rng=random.Random(self.seed)
  self.b=np.zeros((H,W),dtype=np.float32)
  self.yy,self.xx=np.mgrid[:H,:W]
  self.details=[]
  self.origin=(55,37)
  self.tint=region
 def pathmask(self,verts,outline=0):
  im=Image.new('L',(W*S,H*S),0)
  d=ImageDraw.Draw(im)
  d.polygon([(round(x*S),round(y*S)) for x,y in verts],fill=255)
  return np.array(im.resize((W,H),Image.Resampling.LANCZOS),dtype=np.float32)/255
 def ellipse_mask(self,box):
  im=Image.new('L',(W*S,H*S),0);d=ImageDraw.Draw(im)
  x,y,x2,y2=box
  d.ellipse((x*S,y*S,x2*S,y2*S),fill=255)
  return np.array(im.resize((W,H),Image.Resampling.LANCZOS),dtype=np.float32)/255
 def layer(self,m,lum=165,material='skin',point=None,depth=1):
  if point is None:point=(56,31)
  px,py=point
  # Sombras continuas com subamostragem e relevo, nao ruido aleatorio puro.
  x=(self.xx-px)/max(4,35*depth);y=(self.yy-py)/max(4,26*depth)
  light= -38*x-37*y+19*np.exp(-(x*x+y*y)*1.1)
  curvature=np.clip(distance_transform_edt(m>.35)/8,0,1)
  light+=52*curvature-38
  waves={'metal':12*np.sin(self.xx*.44+self.yy*.11),'fur':9*np.sin(self.xx*.73+self.yy*.81),
   'skin':7*np.cos(self.yy*.33+self.xx*.11),'leather':5*np.sin(self.yy*.5),'scale':10*np.cos(self.xx*.60)*np.sin(self.yy*.70),
   'cloth':8*np.sin(self.yy*.25+self.xx*.09),'bone':3*np.cos(self.xx*.36),
   'stone':13*np.sin(self.xx*.3+self.yy*.9),'smoke':9*np.sin(self.xx*.19+self.yy*.25),
   'feather':9*np.cos(self.xx*.45-self.yy*.7),'chitin':8*np.cos(self.xx*.84+self.yy*.34)}[material]
  grain=(np.sin(self.xx*(.36+(self.seed%11)*.018)+self.yy*.94)*np.cos(self.xx*.20-self.yy*.47))*13
  val=np.clip(lum+light+waves*1.5+grain,16,253)
  self.b=self.b*(1-m)+val*m
 def polygon(self,pts,lum=168,material='fur',point=None):
  self.layer(self.pathmask(pts),lum,material,point)
 def ellipse(self,cx,cy,rx,ry,lum=165,material='fur'):
  self.layer(self.ellipse_mask((cx-rx,cy-ry,cx+rx,cy+ry)),lum,material,(cx-4,cy-4))
 def stroke(self,pts,lum=170,width=1):
  im=Image.new('L',(W*S,H*S),0);d=ImageDraw.Draw(im)
  d.line([(round(x*S),round(y*S)) for x,y in pts],fill=255,width=max(1,round(width*S)),joint='curve')
  m=np.array(im.resize((W,H),Image.Resampling.LANCZOS))/255
  self.b=self.b*(1-m)+lum*m
 def dot(self,x,y,rad=1,lum=205):self.ellipse(x,y,rad,rad,lum,'metal')
 def texture(self,x,y,rx,ry,count=12,orientation='/',dark=105):
  for _ in range(count):
   px=x+self.rng.uniform(-rx,rx);py=y+self.rng.uniform(-ry,ry)
   if self.b[max(0,min(H-1,round(py))),max(0,min(W-1,round(px)))]<20:continue
   length=self.rng.uniform(.7,3.4)
   if orientation=='/':self.stroke([(px,py+length),(px+length*.7,py)],dark,.55)
   elif orientation=='-':self.stroke([(px,py),(px+length,py)],dark,.55)
   else:self.dot(px,py,.5,dark)
 def highlight(self,x,y,rx,ry):
  self.ellipse(x,y,rx,ry,228,'metal')
 def bg(self):
  # Silhueta nao enterrada num fundo de simbolos. Sombra no solo e vestigios locais.
  self.ellipse(55,71,31+self.rng.randrange(12),3,29,'smoke')
  for i in range(14):
   x=self.rng.randrange(3,W-3);y=self.rng.randrange(3,H-8)
   if self.rng.random()<.3:
    self.dot(x,y,.5,37)
  # marcas de terreno regionais
  for i in range(6):
   x=self.rng.randint(5,107);y=self.rng.randint(65,76)
   if self.region in [0,2,6]:self.stroke([(x,y),(x-2,y-4)],38,.5)
   elif self.region in [1,7]:self.stroke([(x,y),(x+4,y)],38,.5)
   elif self.region in [3,5]:self.stroke([(x-2,y),(x,y-3),(x+4,y)],38,.6)
   elif self.region in [8,9]:self.dot(x,y,.9,52)
 def eyes(self,x,y,spacing=6,lum=244):
  self.ellipse(x-spacing/2,y,1.4,1.5,lum,'metal')
  self.ellipse(x+spacing/2,y,1.4,1.5,lum,'metal')
  self.dot(x-spacing/2,y-.3,.5,255);self.dot(x+spacing/2,y-.3,.5,255)
 def horns(self,cx,cy,spread=13,length=13):
  for side in [-1,1]:
   self.polygon([(cx+side*6,cy+3),(cx+side*spread,cy-length),(cx+side*10,cy+3)],174,'bone')
   self.stroke([(cx+side*8,cy+2),(cx+side*spread,cy-length)],240,.7)
 def crack(self,x,y,scale=1):
  self.stroke([(x,y),(x+4*scale,y+3*scale),(x+1*scale,y+7*scale),(x+6*scale,y+10*scale)],35,1)
  self.stroke([(x+3*scale,y+2*scale),(x+7*scale,y+1*scale)],235,.6)
 def finish(self):
  values=np.clip(self.b,0,255)
  # sombras de alta densidade: areas iluminadas com @, sombras menores com :.
  ids=np.clip(np.rint(values/255*9).astype('int32'),0,9)
  ids[(values<12)]=0
  chars=np.array(list(RAMP),dtype='<U1')[ids]
  rows=[''.join(r) for r in chars]
  assert len(rows)==H and all(len(r)==W for r in rows)
  assert all(32<=ord(c)<=126 for r in rows for c in r)
  return '\n'.join(rows)

def quad(a,kind):
 r=a.rng
 bodyw={'bear':29,'boar':25,'stag':24,'cat':24,'wolf':25,'seal':28,'rat':19,'beast':25}[kind]
 bodyh={'bear':18,'boar':14,'stag':12,'cat':11,'wolf':13,'seal':11,'rat':9,'beast':13}[kind]
 bodyw+=r.randint(-3,4);bodyh+=r.randint(-2,3)
 cy=40+r.randint(-4,3);cx=49+r.randint(-4,4)
 neck=78;headx=81+r.randint(-5,4);heady=29+r.randint(-4,3)
 if kind=='seal':
  a.ellipse(51,54,31,13,174,'fur');a.ellipse(80,45,12,13,167,'fur')
  a.ellipse(35,66,14,3,125,'fur');a.ellipse(68,64,14,4,130,'fur')
  for x in (75,83):a.dot(x,42,1.5,236)
  for side in (-1,1):a.stroke([(82,48+side*2),(95,49+side*3)],110,.6)
  return
 if kind=='rat':
  cy=51;heady=41;headx=78
 if kind=='bear':
  headx=77;heady=31;bodyw=28
 if kind=='stag':heady=28
 a.ellipse(cx,cy,bodyw,bodyh,162+r.randint(-8,14),'fur')
 a.ellipse(69,cy-5,12,bodyh-2,150,'fur')
 # cauda, conectada na garupa
 if kind in ('wolf','cat','rat'):
  a.stroke([(27,cy+2),(16,cy-8-r.randint(2,8)),(6,cy-3 if kind=='cat' else cy-17)],154,6 if kind!='rat' else 2)
  a.stroke([(27,cy),(16,cy-9),(7,cy-17)],209,1.4)
 elif kind=='boar':a.ellipse(23,cy-6,7,6,152,'fur')
 elif kind=='stag':a.stroke([(25,cy-5),(18,cy-13),(12,cy-11)],172,2)
 elif kind=='bear':a.ellipse(22,cy+3,6,5,155,'fur')
 legs=([34,49,66,76] if kind!='rat' else [38,48,66,75]);yfoot=67 if kind!='rat' else 69
 for j,x in enumerate(legs):
  xx=x+(-3 if j in (0,2) else 3)
  a.polygon([(x-4,cy+bodyh*.55),(x+5,cy+bodyh*.55),(xx+4,yfoot-2),(xx+7,yfoot),(xx-4,yfoot),(xx-4,yfoot-3)],146+(j%2)*10,'fur')
  a.stroke([(xx-4,yfoot-1),(xx+8,yfoot-1)],188,1)
  for claw in range(3):a.stroke([(xx+claw*3,yfoot-1),(xx+claw*3+1,yfoot+2)],213,.7)
 a.ellipse(headx,heady,12 if kind!='rat' else 9,11 if kind!='bear' else 13,191,'fur')
 if kind in ('wolf','cat','rat'):
  for side in (-1,1):
   eh=16 if kind!='rat' else 11
   a.polygon([(headx+side*6,heady-6),(headx+side*10,heady-eh-6),(headx+side*2,heady-10)],195,'fur')
   a.stroke([(headx+side*5,heady-7),(headx+side*10,heady-eh-5)],106,1)
 if kind=='bear':
  a.ellipse(headx-9,heady-10,5,5,143,'fur');a.ellipse(headx+9,heady-10,5,5,143,'fur')
 if kind=='boar':
  a.ellipse(headx,heady+2,15,8,173,'fur')
  a.ellipse(headx+14,heady+9,11,6,143,'fur')
  a.stroke([(headx+5,heady+9),(headx+10,heady+3),(headx+16,heady+2)],226,1.8)
 if kind=='stag':
  for side in (-1,1):
   a.stroke([(headx+side*5,heady-7),(headx+side*12,heady-25),(headx+side*23,heady-31)],209,2.7)
   a.stroke([(headx+side*11,heady-19),(headx+side*4,heady-30)],220,1.7)
   a.stroke([(headx+side*17,heady-26),(headx+side*16,heady-37)],201,2)
 if kind=='rat':
  a.ellipse(headx+7,heady+4,10,5,154,'fur')
  a.ellipse(headx-4,heady-6,8,8,122,'fur')
 else:a.ellipse(headx+8,heady+5,10+r.randint(-2,5) if kind!='boar' else 8,4+r.randint(0,3),145,'fur')
 a.eyes(headx+3,heady-2,7,245)
 a.ellipse(headx+18,heady+8,3,2,222,'metal')
 for side in (-1,1):
  a.stroke([(headx+18,heady+9),(headx+29,heady+9+side*4)],78,.7)
 for k in range(30):
  x=r.randint(int(cx-20),int(cx+bodyw-5));y=r.randint(int(cy-bodyh+3),int(cy+bodyh-3))
  if a.b[max(0,y),max(0,x)]>70:
   a.stroke([(x,y+1),(x+1,y-1)],r.randint(92,198),.7)
 if 'espinhos' in a.name.lower() or 'corrompido' in a.name.lower():
  for i in range(9):
   x=27+i*5
   a.polygon([(x-3,cy-11),(x,cy-15-r.randint(1,9)),(x+3,cy-10)],183,'stone')
 if 'espectral' in a.name.lower() or 'nada' in a.name.lower():
  for i in range(6):
   x=r.randint(20,70);y=r.randint(25,48)
   a.stroke([(x,y),(x-r.randint(5,9),y-r.randint(6,12))],78,1)
 if 'glacial' in a.name.lower() or 'neve' in a.name.lower() or 'polar' in a.name.lower():
  a.texture(54,cy,18,10,42,'-',212)


def arthropod(a,kind):
 r=a.rng
 if kind=='scorpion':
  a.ellipse(50,46,17,10,177,'chitin');a.ellipse(71,44,10,7,161,'chitin')
  for i in range(5):a.stroke([(40+i*5,43),(40+i*5,51)],84,1)
  for side in (-1,1):
   for k in range(4):
    x=43+k*6
    a.stroke([(x,51),(x+side*(11+k%2*3),56+(k%3)*3),(x+side*(13+k%2*3),68)],164,2)
   a.stroke([(64,43),(78+side*7,36),(80+side*12,24)],187,3)
   a.ellipse(80+side*12,24,5,5,194,'chitin')
   a.polygon([(83+side*12,24),(96+side*12,18),(90+side*12,30)],161,'chitin')
  a.stroke([(34,45),(24,36),(26,25),(39,15),(51,19),(52,30)],187,5)
  a.polygon([(49,30),(54,29),(51,37)],231,'bone')
  a.eyes(75,42,5)
  return
 if kind=='spider':
  abx=40+r.randint(-3,3)
  # oito pernas com articulacoes reconheciveis e bifurcacao de espessura
  for side in (-1,1):
   for k in range(4):
    jointx=54+side*(18+k*5+r.randint(-4,4))
    jointy=25+k*5+r.randint(-5,5)
    endx=54+side*(36+k*2+r.randint(-5,6))
    endy=58+(k%2)*6+r.randint(-5,4)
    a.stroke([(53+side*k*2,41+k*2),(jointx,jointy),(endx,endy)],105,4 if k<2 else 3)
    a.stroke([(53+side*k*2,41+k*2),(jointx,jointy),(endx,endy)],190,1.5)
    a.ellipse(jointx,jointy,2,2,207,'chitin')
  a.ellipse(abx,47,16+r.randint(-2,6),13+r.randint(-2,5),176,'chitin')
  a.ellipse(67+r.randint(-2,2),40,11+r.randint(-2,3),9+r.randint(-2,3),193,'chitin')
  for i in range(6):a.dot(60+(i%3)*5,35+(i//3)*4,1.1,235)
  for side in [-1,1]:a.stroke([(65+side*4,49),(64+side*8,57)],210,1.4)
  a.texture(39,48,15,10,34,'-',108)
  if 'matriarca' in a.name.lower():
   a.ellipse(39,46,12,8,191,'chitin')
   for x in (24,35,45):a.stroke([(x,38),(x+4,35),(x+8,38)],243,1)
  return
 # vespas, mosquitos, escaravelhos, besouros, vermes
 is_wasp=bool(re.search('vespa|mosquito',a.name.lower()))
 is_worm='vermes' in a.name.lower()
 if is_worm:
  for i in range(16):
   x=18+i*5; y=51-16*math.sin(i/15*math.pi)
   a.ellipse(x,y,8,8,140+i%3*12,'chitin')
   a.stroke([(x,y-7),(x+4,y-7)],209,.8)
  a.ellipse(93,50,8,6,168,'chitin');a.eyes(96,48,6)
  return
 if is_wasp:
  a.polygon([(46,35),(26,12),(37,9),(56,31)],154,'feather')
  a.polygon([(57,32),(80,11),(91,15),(68,39)],143,'feather')
  for x in [37,46,55,65]:a.stroke([(x,48),(x-7,62),(x-12,70)],168,1.3)
  a.ellipse(43,45,20,8,181,'chitin');a.ellipse(69,43,11,10,182,'chitin')
  a.eyes(74,40,5)
  a.stroke([(28,46),(17,46),(8,55)],135,3)
  for x in [29,38,47]:a.stroke([(x,38),(x,52)],78,2.3)
  if 'mosquito' in a.name.lower():a.stroke([(79,44),(100,50)],225,1.7)
  else:a.polygon([(23,42),(11,45),(24,49)],221,'bone')
 else:
  a.ellipse(48,45,25,15,177,'chitin')
  a.ellipse(71,43,10,10,177,'chitin')
  a.stroke([(49,29),(49,59)],90,1.5)
  for k in range(3):
   for side in [-1,1]:a.stroke([(64,50),(64+side*(12+k*4),60),(64+side*(23+k*3),68)],160,2)
  a.eyes(73,40,6)
  for i in range(9):
   y=33+i*3;a.stroke([(32,y),(44,y)],205,.5)
  a.stroke([(68,33),(64,21)],189,1.7);a.stroke([(76,34),(82,22)],185,1.7)
  if 'dourado' in a.name.lower() or 'solar' in a.name.lower():
   for i in range(12):
    angle=i*math.pi/6
    a.stroke([(48+23*math.cos(angle),45+14*math.sin(angle)),(48+30*math.cos(angle),45+19*math.sin(angle))],110,1)


def reptile(a,kind):
 name=a.name.lower();r=a.rng
 if kind=='snake':
  if 'sanguessuga' in name:
   for i in range(24):
    t=i/23;x=22+66*t;y=52+12*math.sin(t*math.pi*2)
    a.ellipse(x,y,10,6,140+(i%4)*5,'scale')
   a.ellipse(89,51,9,6,179,'scale');a.ellipse(96,51,5,4,43,'smoke')
   return
  if 'enguia' in name:
   for i in range(32):
    t=i/31
    a.ellipse(12+80*t,43+12*math.sin(t*math.pi*3),6-t*3.5,8-t*4,150,'scale')
   a.ellipse(92,43,9,6,167,'scale');a.eyes(94,40,5)
   return
  # Curva corporal exclusiva por especie: frequencia, arco, largura, cabeca e postura.
  startx=18+r.randint(-3,10);span=59+r.randint(-4,10)
  basey=53+r.randint(-4,7);height=8+r.randint(-3,5)
  phase=r.uniform(-.8,.7);frequency=r.uniform(1.5,2.9)
  thickness=6+r.randint(0,3)
  def path(t):return startx+span*t,basey-height*math.sin(t*math.pi*frequency+phase)
  for i in range(32):
   t=i/31;x,y=path(t)
   a.ellipse(x,y,thickness+1,thickness,140+(i%4)*5,'scale')
  ex,ey=path(1);neckrise=20+r.randint(-4,11)
  for j in range(11):
   t=j/10;a.ellipse(ex+3*t,ey-neckrise*t,4+r.randint(0,2),5,163,'scale')
  hx,hy=ex+5,ey-neckrise
  a.ellipse(hx,hy,10+r.randint(-1,4),7+r.randint(-1,2),190,'scale')
  a.polygon([(hx+3,hy),(hx+22,hy+4),(hx+14,hy+9),(hx+7,hy+7)],161,'scale')
  a.eyes(hx+5,hy-1,7)
  a.stroke([(hx+18,hy+9),(hx+25,hy+11),(hx+23,hy+17)],139,1)
  for i in range(12):
   x,y=path(i/11);a.stroke([(x,y-2),(x+1,y+3)],95,1.1)
  if 'cristal' in name or 'radiante' in name:
   for i in range(9):
    x,y=path(i/10);a.polygon([(x-2,y-6),(x,y-14),(x+3,y-5)],225,'metal')
  if 'sem sombra' in name:
   for i in range(8):
    x,y=path(i/7);a.stroke([(x,y+8),(x-8,y+18)],80,1.5)
  return
  for i in range(10):
   x=20+i*7;y=48-8*math.sin(i/9*math.pi*2.1)
   a.stroke([(x,y),(x+2,y+4)],92,1.3)
  if 'cristal' in name or 'radiante' in name:
   for i in range(7):a.polygon([(25+i*8,47),(29+i*8,40),(33+i*8,47)],230,'metal')
  return
 # Crocodilo e outros lagartos: alongados com quatro patas e cauda grossa.
 a.polygon([(30,42),(7,46),(29,55),(68,54),(87,45),(63,36)],154,'scale')
 a.ellipse(52,45,29,12,172,'scale')
 a.polygon([(69,42),(89,36),(104,42),(110,48),(82,51),(65,47)],182,'scale')
 a.ellipse(91,43,12,4,171,'scale')
 for legx in [37,67]:
  for legsy in (-1,1):
   a.stroke([(legx,47),(legx+legsy*7,57),(legx+legsy*11,67)],155,4)
   a.stroke([(legx+legsy*11,67),(legx+legsy*17,67)],212,1.5)
 a.eyes(90,39,8)
 a.stroke([(86,49),(109,48)],68,1.3)
 for i in range(11):
  x=26+i*6;a.polygon([(x,34),(x+3,28-r.randint(0,3)),(x+6,36)],169,'scale')
 for x in range(89,106,3):a.stroke([(x,49),(x+1,51)],227,.6)
 if 'salamandra' in name:
  for i in range(8):a.ellipse(36+i*5,45+(i%2)*3,1.6,1.5,215,'metal')


def avian(a,kind):
 r=a.rng;name=a.name.lower()
 if kind=='bat':
  span=r.randint(35,54);lift=r.randint(4,19);droop=r.randint(4,15)
  for side in (-1,1):
   a.polygon([(56,34),(56+side*15,16),(56+side*(span-6),lift),(56+side*span,22+droop),(56+side*(span-12),25+droop),(56+side*(span-24),45)],143,'leather')
   for j in (17,28,40):a.stroke([(55,39),(56+side*j,15+(j%3)*6-r.randrange(5))],95,1.2)
  a.ellipse(56,42,12,17,168,'fur');a.ellipse(56,27,9,8,189,'fur')
  a.horns(56,25,9,15);a.eyes(56,27,8)
  for side in [-1,1]:a.stroke([(56+side*5,56),(56+side*9,65)],192,1.5)
  return
 if kind=='griffin':
  quad(a,'cat')
  a.polygon([(50,38),(18,18),(4,23),(21,46),(50,46)],167,'feather')
  a.polygon([(63,39),(95,9),(106,12),(96,43),(62,49)],180,'feather')
  for side in (-1,1):
   for k in range(6):a.stroke([(54,44),(54+side*(12+k*6),29-k*3)],126,1)
  return
 # Rapaces, corvos e abutres com bico pontudo, penas reconheciveis.
 if kind=='owl':
  a.ellipse(57,45,17,23,172,'feather')
  a.ellipse(57,26,18,16,181,'feather')
  a.polygon([(42,19),(37,6),(51,16)],186,'feather')
  a.polygon([(72,19),(77,6),(64,16)],181,'feather')
  a.ellipse(49,27,8,9,209,'feather');a.ellipse(66,27,8,9,209,'feather')
  a.eyes(58,27,17,247)
  a.polygon([(54,32),(59,32),(56,41)],224,'bone')
 else:
  a.ellipse(54,43,12+r.randint(0,5),18+r.randint(0,7),166,'feather')
  a.ellipse(62+r.randint(-3,3),26+r.randint(-3,3),11+r.randint(0,5),9+r.randint(0,3),189,'feather')
  a.eyes(66,24,7)
  a.polygon([(66,28),(84,30),(69,35)],213,'bone')
  for side in [-1,1]:
   w=r.randint(28,46);tip=r.randint(4,24)
   a.polygon([(54,39),(54+side*19,29),(54+side*w,tip),(54+side*(w+2),35+r.randint(-9,8)),(54+side*11,55)],150,'feather')
   for j in range(6):a.stroke([(54+side*3,40),(54+side*(13+j*4),30-j*2)],117,.8)
 a.stroke([(53,61),(48,70),(42,71)],176,2)
 a.stroke([(65,60),(64,71),(70,72)],176,2)
 for i in range(8):
  a.stroke([(43+i*3,53),(39+i*3,59)],120,1)
 if 'pestilento' in name or 'maldito' in name:
  for i in range(5):a.stroke([(40+i*6,36),(31+i*7,29)],75,1)

def woods(a):
 r=a.rng
 # Tronco ramificado com raizes integradas, folhagem e rosto lenhoso.
 a.polygon([(43,69),(47,54),(45,34),(38,26),(45,30),(49,11),(55,33),(65,19),(62,40),(70,64),(78,72),(61,70),(53,61)],159,'stone')
 for side in (-1,1):
  a.stroke([(55,47),(55+side*18,34),(55+side*30,19)],144,6)
  a.stroke([(55+side*18,34),(55+side*31,38)],154,3)
  a.stroke([(54,61),(55+side*21,74)],165,5)
  a.stroke([(55+side*21,74),(55+side*29,71)],164,2)
 for j in range(7):
  theta=(j/7)*math.pi*2
  xx=52+22*math.cos(theta);yy=24+(12+r.randint(-3,5))*math.sin(theta)
  a.ellipse(xx,yy,9+r.randint(0,8),8+r.randint(0,10),122+r.randrange(24),'fur')
 a.ellipse(54,39,12,15,173,'stone')
 a.eyes(54,38,12,237)
 a.stroke([(50,49),(54,51),(61,49)],80,2)
 for j in range(23):
  x=r.randint(38,68);y=r.randint(31,66)
  if a.b[y,x]>35:a.stroke([(x,y),(x-2,y+7)],67,.7)
 if 'p[uú]trida' in a.name.lower() or 'faminta' in a.name.lower():
  for j in range(6):
   x=43+j*5;a.stroke([(x,26),(x-3,17-r.randrange(5))],65,2)


def humanoid(a,kind):
 r=a.rng;name=a.name.lower();s=a.seed
 skeletal=(kind=='skeleton')
 built=(kind=='construct')
 heavy=built or kind=='giant' or 'cavaleiro' in name or 'paladino' in name or 'sentinela' in name
 hood=('saqueador' in name or 'bruxa' in name or 'cultista' in name or 'necromante' in name or 'ladr[aã]o' in name or 'profeta' in name or 'desertor' in name or 'n[oô]made' in name)
 robe=('bruxa' in name or 'necromante' in name or 'alquimista' in name or 'profeta' in name or 'cultista' in name or 'arconte' in name or 'arauto' in name)
 # pernas e botas
 for sign in (-1,1):
  x=55+sign*9+r.randint(-2,2)
  a.polygon([(x-6,50),(x+5,51),(x+6+sign*3,65),(x+6+sign*5,71),(x-7+sign*4,71)],133 if skeletal else 155,'bone' if skeletal else 'leather')
  a.ellipse(x+sign*5,70,8,3,141,'metal' if heavy else 'leather')
  a.stroke([(x-3,63),(x+6,63)],221,1.2)
 if robe:
  a.polygon([(45,40),(65,40),(77+r.randint(-3,3),72),(33-r.randint(-3,3),72)],164,'cloth')
 else:
  a.polygon([(48,38),(62,38),(69,54),(43,54)],174 if heavy else 145,'metal' if heavy else 'leather')
 # braços e ombreiras
 for sign in (-1,1):
  shoulder=55+sign*16
  a.ellipse(shoulder,35,8 if heavy else 6,7,190 if heavy else 151,'metal' if heavy else 'cloth')
  a.stroke([(shoulder,39),(55+sign*22,54),(55+sign*20,61)],132 if skeletal else 165,5 if heavy else 3)
  a.ellipse(55+sign*20,61,3,4,180,'metal' if heavy else 'leather')
 # tronco e peito, sobreposicao propositada para continuidade das camadas
 a.polygon([(47,31),(64,31),(68,49),(60,54),(49,54),(42,48)],185 if heavy else 152,'metal' if heavy else 'cloth')
 if kind=='giant':
  for y in range(34,53,4):a.stroke([(43,y),(38,y+3),(46,y+5)],130,2)
  for x in range(44,68,6):a.stroke([(x,36),(x+4,43)],218,1)
 if skeletal:
  # costelas, espinha, mandibula e osso exposto
  for y in range(38,50,3):
   a.stroke([(46,y),(55,y+3),(64,y)],211,2)
  a.stroke([(55,35),(55,53)],103,2)
 else:
  a.stroke([(47,40),(63,40)],229 if heavy else 166,1.2)
  a.stroke([(56,32),(55,51)],110,1.4)
  for j in range(4):
   if heavy:a.stroke([(46,37+j*4),(64,37+j*4)],130,1)
 if robe:
  for x in range(40,72,6):a.stroke([(x,55),(x+(x-54)*.28,70)],105,.7)
 # pescoço e cabeça
 a.ellipse(55,21,9 if heavy else 7,10,177 if skeletal else 181,'bone' if skeletal else 'skin')
 if hood:
  a.polygon([(47,27),(44,20),(51,8),(61,9),(67,20),(62,28)],168,'cloth')
  a.ellipse(55,23,6,7,93,'cloth')
  a.eyes(56,22,6,215)
 elif heavy:
  a.polygon([(45,20),(48,12),(64,12),(68,20),(64,28),(47,28)],194,'metal')
  a.stroke([(48,22),(65,22)],67,2)
  a.eyes(55,21,8,235)
 else:
  if skeletal:
   a.ellipse(55,22,9,10,210,'bone');a.eyes(55,20,8,49)
   a.stroke([(49,27),(61,27)],79,2)
   for i in range(5):a.stroke([(51+i*2,26),(51+i*2,31)],125,.6)
  else:
   a.ellipse(55,21,8,10,188,'skin');a.eyes(55,21,8,228)
   a.stroke([(53,28),(58,28)],112,1)
   a.stroke([(47,13),(61,13)],95,2)
 # capacetes guerreiros e roupas regionais
 if kind=='giant':
  a.horns(55,15,11,9)
  for sign in [-1,1]:a.stroke([(55+sign*18,44),(55+sign*21,56),(55+sign*22,64)],132,4)
 if built:
  a.polygon([(42,28),(47,13),(55,9),(64,13),(68,29)],179,'stone' if 'golem' in name or 'colosso' in name else 'metal')
  a.eyes(55,24,8,246)
  for y in range(34,50,5):a.stroke([(45,y),(66,y)],98,1.5)
  a.crack(55,39,1)
 # armamento ancorado na mão direita
 wx=76;wy=60
 if re.search('arqueiro|ca[cç]ador|vigia',name):
  a.stroke([(82,65),(90,49),(88,23),(79,10)],197,2.2)
  a.stroke([(82,65),(71,44),(79,10)],104,.9)
  a.stroke([(74,53),(95,37)],226,1.6)
 elif re.search('bruxa|alquimista|profeta|necromante|cultista|arauto',name):
  a.stroke([(78,72),(78,14)],160,2.8)
  a.ellipse(78,12,6,6,222,'metal')
  a.ellipse(78,12,3,3,84,'smoke')
 else:
  a.stroke([(76,63),(86,13)],200,3.1)
  a.polygon([(84,19),(88,4),(92,21)],211,'metal')
  a.stroke([(79,58),(89,58)],125,2)
 if re.search('capit[aã]o|paladino|arconte|sentinela',name):
  a.polygon([(35,32),(39,23),(46,30),(46,51),(38,59),(31,51)],196,'metal')
  a.stroke([(34,39),(43,39)],95,1)
 # Heráldica e roupa exclusiva por identificador, desenhadas sobre o corpo.
 variant=(s>>5)%8
 if variant==0:
  a.polygon([(40,32),(44,30),(42,59),(28,69),(34,46)],122,'cloth')
  a.stroke([(42,33),(33,65)],200,1)
 elif variant==1:
  a.stroke([(45,36),(64,51)],226,3)
  a.ellipse(57,46,4,4,90,'metal')
 elif variant==2:
  for j in range(4):a.stroke([(43,37+j*4),(67,36+j*4)],212,1)
 elif variant==3:
  a.polygon([(47,28),(48,17),(54,8),(62,19),(62,29)],208,'metal')
  a.stroke([(55,10),(58,2)],244,2)
 elif variant==4:
  a.ellipse(41,55,6,9,148,'leather')
  for j in range(5):a.stroke([(43,51+j*2),(45,51+j*2)],210,1)
 elif variant==5:
  a.polygon([(41,36),(48,29),(51,34),(48,43)],224,'metal')
  a.polygon([(62,33),(71,30),(75,38),(66,43)],224,'metal')
 elif variant==6:
  a.polygon([(38,31),(43,28),(42,53),(26,72),(30,41)],132,'cloth')
  a.stroke([(30,47),(28,68)],237,1)
 else:
  a.polygon([(68,34),(75,38),(80,58),(74,69),(69,53)],139,'leather')
  a.polygon([(33,35),(43,34),(46,60),(34,60)],190,'metal')
 # Segunda variacao estrutural independente: capa, broquel, mochila ou estandarte.
 secondary=(s>>17)%6
 if secondary==0:
  a.polygon([(43,29),(35,33),(25,54),(25,71),(43,62)],120,'cloth')
 elif secondary==1:
  a.polygon([(68,34),(79,36),(84,63),(79,70),(68,59)],117,'cloth')
 elif secondary==2:
  a.ellipse(33,48,11,16,172,'metal')
  a.stroke([(24,47),(42,47)],102,2)
 elif secondary==3:
  a.polygon([(44,31),(31,35),(27,46),(31,55),(44,52)],163,'leather')
  a.stroke([(29,39),(40,46)],217,1)
 elif secondary==4:
  a.stroke([(37,66),(30,23)],158,3)
  a.polygon([(29,25),(24,12),(40,18),(39,36)],189,'cloth')
 else:
  for offset in (-1,1):
   a.polygon([(55+offset*12,33),(55+offset*21,29),(55+offset*26,35),(55+offset*18,45)],197,'metal')
 # Marcas ligadas a nome/ocupacao, nao meros pontos aleatorios
 if re.search('exilado|desertor|renegado|ca[ií]do',name):a.crack(54,43,.8)
 if re.search('mercen[aá]rio|saqueador|bandido|contrabandista|assaltante',name):
  a.stroke([(50,46),(59,50),(65,44)],94,1.5)
  a.polygon([(45,53),(64,53),(63,58),(46,58)],117,'leather')
 if re.search('ossu[aá]rio|sepulcral|t[uú]mulo|m[uú]mia',name):
  for j in range(7):
   y=15+j*7;a.stroke([(46,y),(64,y+2)],205,1.5)
 if 'alquimista' in name:
  a.ellipse(40,56,6,7,170,'metal');a.ellipse(40,51,3,2,210,'metal')
 if 'bruxa' in name:
  a.polygon([(44,13),(56,-3),(69,13)],151,'cloth')


def ethereal(a,kind):
 r=a.rng;name=a.name.lower()
 if kind=='demon':
  humanoid(a,'human')
  a.horns(55,13,17,19)
  for sign in [-1,1]:
   a.polygon([(55+sign*6,42),(55+sign*29,22),(55+sign*47,9),(55+sign*33,46),(55+sign*9,53)],114,'leather')
  a.eyes(55,25,8,255)
  return
 if 'bolha' in name or 'orbe' in name:
  a.ellipse(55,37,24,24,167,'smoke');a.ellipse(48,27,10,7,215,'smoke')
  a.ellipse(65,45,7,6,43,'smoke')
  for i in range(12):
   th=i/12*2*math.pi;rr=31+r.randint(-3,4)
   a.dot(55+rr*math.cos(th),38+rr*.7*math.sin(th),.8,117)
  return
 # Corpo intangivel, rosto e tiras de tecido pairando em vez de pernas
 for j in range(13):
  z=j/12;x=55+math.sin(z*(2.4+(a.seed%7)*.42)+a.seed%4)*(3+r.randrange(3))
  a.ellipse(x,23+z*40,11+(a.seed%5)+z*(8+r.randrange(5)),8+2*z,190-j*8,'smoke')
 a.ellipse(55+r.randint(-3,3),25,11+r.randint(0,7),12+r.randint(1,5),192,'smoke')
 a.polygon([(44,20),(49,7),(60,8),(68,21)],166,'cloth')
 a.eyes(55,24,11,254)
 a.ellipse(55,34,3,5,48,'smoke')
 for sign in [-1,1]:
  a.stroke([(55+sign*10,39),(55+sign*21,52),(55+sign*31,58)],147,5)
  a.stroke([(55+sign*16,58),(55+sign*(22+r.randint(0,9)),73)],86,2)
 for i in range(13):
  x=24+i*5;y=54+r.randrange(-10,15)
  a.stroke([(x,y),(x+r.randrange(-4,4),y+7)],89,1)
 if 'gelo' in name or 'geada' in name:
  for i in range(8):a.polygon([(37+i*5,57),(39+i*5,47),(41+i*5,57)],219,'metal')


def paint_one(name,region):
 kind=species_type(name);a=Art(name,region,kind);a.bg()
 if kind in ('wolf','cat','bear','boar','stag','seal','rat','beast'):quad(a,kind)
 elif kind=='frog':
  a.ellipse(55,47,25,17,149,'skin');a.ellipse(55,30,18,13,174,'skin')
  for x in (42,68):
   a.ellipse(x,22,7,7,184,'skin');a.dot(x,22,3,235)
   a.stroke([(x,53),(x-8 if x<55 else x+8,68),(x-17 if x<55 else x+17,68)],180,5)
  a.stroke([(43,39),(55,42),(68,39)],75,1.3)
  for i in range(17):
   x=a.rng.randrange(37,74);y=a.rng.randrange(35,55)
   if a.b[y,x]>60:a.dot(x,y,a.rng.uniform(.5,2.5),85)
 elif kind in ('spider','scorpion','insect'):arthropod(a,kind)
 elif kind in ('snake','crocodile'):reptile(a,kind)
 elif kind in ('owl','vulture','corvid','raptor','bat','griffin'):avian(a,kind)
 elif kind=='tree':woods(a)
 elif kind in ('human','skeleton','construct','giant'):humanoid(a,kind)
 elif kind=='chimera':
  quad(a,'cat')
  for sign in (-1,1):
   a.stroke([(59+sign*5,34),(58+sign*16,20)],172,6)
   a.ellipse(58+sign*16,17,8,9,190,'fur')
   a.horns(58+sign*16,11,5,8)
  for sign in (-1,1):a.polygon([(55,40),(55+sign*20,18),(55+sign*37,7),(55+sign*24,48)],128,'leather')
 else:ethereal(a,kind)
 # materia e bioma influenciam propriedades reais da imagem, nao apenas cor
 n=name.lower()
 if 'cristal' in n or 'vidro' in n or 'luminosa' in n:
  for _ in range(9):
   x=a.rng.randrange(24,91);y=a.rng.randrange(13,66)
   if a.b[y,x]>80:a.polygon([(x,y-3),(x+3,y),(x,y+4),(x-2,y)],214,'metal')
 if 'cinzas' in n or 'brasa' in n or 'lava' in n or 'magm' in n or 'incandescente' in n:
  for _ in range(15):
   x=a.rng.randrange(25,94);y=a.rng.randrange(16,67)
   if a.b[y,x]>90:a.stroke([(x,y),(x+2,y+3),(x,y+6)],224,1)
 if 'geada' in n or 'congelado' in n or 'gelo' in n:
  for _ in range(12):
   x=a.rng.randrange(19,98);y=a.rng.randrange(13,66)
   if a.b[y,x]>80:a.stroke([(x,y),(x+3,y)],228,1)
 if 'oss' in n or 't[uú]mulo' in n:
  a.texture(55,44,20,16,14,'-',104)
 if 'fraturad' in n or 'rachad' in n:
  for i in range(3):a.crack(35+i*13,37+i*4,.8)
 return kind,a.finish()

# Invariantes: catálogo e ids vêm do jogo, não de uma lista manual separada.
proc=subprocess.run(['node','--input-type=module','-e',
 "import{REGION_SPECIES}from'./js/expanded-species.js';console.log(JSON.stringify(REGION_SPECIES.map((region,r)=>region.map(s=>({id:s.id,name:s.name,region:r})))));"],cwd=ROOT,capture_output=True,text=True,check=True)
registry=json.loads(proc.stdout)
entries=[spec for region in registry for spec in region]
assert len(entries)==150 and len(set(x['name'] for x in entries))==150

ARTS={};meta=[]
for e in entries:
 name=e['name'];kind,art=paint_one(name,e['region'])
 assert len(art.splitlines())==H and all(len(line)==W for line in art.splitlines())
 ARTS[name]=art
 meta.append({**e,'family':kind,'width':W,'height':H,'method':'sombreamento anatomico procedural','status':'integrado; curadoria individual pendente'})
assert len(set(ARTS.values()))==150,'Artes duplicadas'

# Compactacao por linha (largura e espacamentos reconstituidos). Cada linha
# registra em base36 seu recuo esquerdo nos dois primeiros caracteres.
def base36(i):
 chars='0123456789abcdefghijklmnopqrstuvwxyz';return chars[i//36]+chars[i%36]
def pack(art):
 chunks=[]
 for line in art.split('\n'):
  l=len(line)-len(line.lstrip(' '));chunks.append(base36(l)+line.strip(' '))
 return '\n'.join(chunks)
packed={name:pack(art) for name,art in ARTS.items()}
payload=json.dumps(packed,ensure_ascii=False,separators=(',',':'))
module=f'''/** ASCII REALMS: atlas textual gerado em build por tools/generate-monsters-hd.py.
 * Original 112x78, compactado por linhas. Nao contem imagens nem chefes.
 */
export const HD_MONSTER_WIDTH={W};
export const HD_MONSTER_HEIGHT={H};
export const HD_MONSTER_PACKED=Object.freeze({payload});
'''
(ROOT/'js/high-density-monster-data.js').write_text(module,encoding='utf-8')
(ROOT/'docs').mkdir(exist_ok=True)
(ROOT/'docs/inventario-monstros-hd4.json').write_text(json.dumps({'width':W,'height':H,'total':len(meta),'creatures':meta},ensure_ascii=False,indent=2),encoding='utf-8')
# Galeria independente de módulos ES, para inspecao mesmo via arquivo local.
from html import escape
sample_ids=[0,1,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,23,29,32,42,44,48,65,74,81,93,107,126,140,147]
page=['<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASCII REALMS - Monstros HD4</title>',
 '<style>body{background:#101820;color:#d6ddda;font:14px system-ui;margin:1rem}h1{margin:0 0 1rem}summary{cursor:pointer}p{color:#abb5b4}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:12px}article{min-width:0;padding:12px;border:1px solid #465a52;border-radius:8px;overflow:hidden}pre{white-space:pre;line-height:1;letter-spacing:0;margin:0;font-weight:400;color:#bad2be;font-family:Consolas,"DejaVu Sans Mono",monospace;font-size:3.7px}button{font:inherit;padding:9px;border:1px solid #779d87;color:inherit;background:#223b32;cursor:pointer}article:not(.show) pre{display:none}@media(min-width:900px){pre{font-size:5px}}</style></head><body><h1>150 monstros, Etapa 4</h1><p>Galeria para revisao artistica. Cada figura e texto ASCII original, 112x78. As composicoes sao procedurais, ainda nao aprovadas individualmente.</p><button onclick="document.querySelectorAll(\'article\').forEach(e=>e.classList.toggle(\'show\'))">Abrir/fechar todas</button><div class="grid">']
for e in entries:
 name=e['name'];art=ARTS[name]
 page.append(f'<article class="show"><h3>{escape(name)}</h3><p>{species_type(name)} | Regiao {e["region"]+1}</p><pre>{escape(art)}</pre></article>')
page.append('</div></body></html>')
(ROOT/'docs/galeria-monstros-hd4.html').write_text(''.join(page),encoding='utf-8')
print('150 retratos ASCII distintos criados; 112x78; atlas:',round((ROOT/'js/high-density-monsters.js').stat().st_size/1024),'KB')
print('Familias:',{t:sum(m['family']==t for m in meta) for t in sorted({m['family'] for m in meta})})
