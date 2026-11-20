#!/usr/bin/env python3
"""ASCII REALMS, Etapa 5. 20 chefes individuais em superficies ASCII textuais.

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
W,H=128,88
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


# A cada chefe corresponde uma direcao de arte autoral propria. Compartilham-se
# somente primitivas tecnicas de desenho (ellipses, mascaras e sombreamento).
# O sprite final nunca e reutilizado entre entidades distintas.
from hashlib import sha256

REGIONAL=[
 'Guardião das Raízes','Escorpião Imperial','Hidra Venenosa','Golem Ancestral',
 'Rei Esquecido','Dragão Glacial','Senhor dos Mortos','Demônio das Chamas',
 'Serafim Corrompido','Entidade Primordial'
]
DUNGEON=[
 'Coração Enraizado','Matriarca de Areia','Devorador Tóxico','Colosso Ferrífero',
 'Sentinela do Túmulo','Titã de Geada','Arauto das Cinzas Mortas','Fornalha Viva',
 'Juiz da Aurora','Núcleo do Nada'
]

# Relevo atmosferico e pinceladas de materiais no fundo. Nao encobre silhuetas.
def atmosphere(a,kind):
 r=a.rng
 a.ellipse(63,80,39,2,28,'smoke')
 for i in range(22):
  x=r.randint(4,122);y=r.randint(3,82)
  if a.b[y,x]>15:continue
  if kind in ('fire','ash'):
   a.stroke([(x,y+3),(x-1,y+1),(x+1,y-3)],55+(i%3)*13,.6)
  elif kind in ('ice','holy'):
   a.dot(x,y,.6,62)
   if i%5==0:a.stroke([(x-2,y),(x+2,y)],54,.7)
  elif kind in ('void','poison'):
   a.ellipse(x,y,1.5+(i%3),.7,27+(i%4)*8,'smoke')
  elif kind in ('sand','tomb'):
   a.stroke([(x-3,y),(x+2,y)],35+(i%4)*6,.6)
  else:
   a.stroke([(x,y),(x+2,y-1)],29+(i%4)*8,.6)

def iris(a,x,y,r=3,lum=244):
 a.ellipse(x,y,r,r,20,'smoke');a.ellipse(x,y,r*.7,r*.7,232,'metal');a.dot(x-.5,y-.7,.7,253)
def runic(a,x,y,unit=1,lum=234):
 a.stroke([(x-3*unit,y-3*unit),(x,y+4*unit),(x+3*unit,y-3*unit)],lum,1)
 a.stroke([(x-2*unit,y+1*unit),(x+2*unit,y+1*unit)],lum,.7)

def wing(a,root,tip,low,material='feather',lum=168,divisions=7):
 a.polygon([root,(root[0]*.5+tip[0]*.5,tip[1]+5),tip,low],lum,material)
 for k in range(divisions):
  t=(k+1)/(divisions+1)
  p=(root[0]*(1-t)+tip[0]*t,root[1]*(1-t)+tip[1]*t)
  q=(low[0]*(1-t)+tip[0]*t,low[1]*(1-t)+tip[1]*t)
  a.stroke([root,p,q],85 if material=='feather' else 103,1.2)

def armored(a,x=63,y=39,scale=1,kind='metal'):
 s=scale
 # pernas encaixadas no torso
 for side in [-1,1]:
  sx=x+side*10*s
  a.polygon([(sx-7*s,y+16*s),(sx+6*s,y+17*s),(sx+9*s,y+40*s),(sx-7*s,y+40*s)],165,kind)
  a.polygon([(sx-10*s,y+38*s),(sx+9*s,y+38*s),(sx+12*s,y+42*s),(sx-10*s,y+42*s)],199,kind)
  a.stroke([(sx-5*s,y+22*s),(sx+5*s,y+24*s),(sx-4*s,y+28*s)],83,1.3)
 a.polygon([(x-16*s,y-18*s),(x+16*s,y-18*s),(x+20*s,y+12*s),(x+8*s,y+20*s),(x-8*s,y+20*s),(x-20*s,y+12*s)],173,kind)
 a.polygon([(x-21*s,y-17*s),(x-31*s,y-15*s),(x-26*s,y+14*s),(x-21*s,y+20*s),(x-15*s,y+7*s)],178,kind)
 a.polygon([(x+21*s,y-17*s),(x+31*s,y-15*s),(x+26*s,y+14*s),(x+21*s,y+20*s),(x+15*s,y+7*s)],178,kind)
 a.ellipse(x-23*s,y-20*s,10*s,7*s,213,kind)
 a.ellipse(x+23*s,y-20*s,10*s,7*s,213,kind)
 for k in range(4):a.stroke([(x-10*s,y-13*s+k*7*s),(x+10*s,y-13*s+k*7*s)],114,1.1)

def armored_head(a,x=63,y=17,kind='metal',mask=True):
 a.ellipse(x,y,11,12,196,kind)
 a.polygon([(x-13,y-4),(x+13,y-4),(x+10,y-12),(x-10,y-12)],212,kind)
 if mask:
  a.stroke([(x-7,y),(x+7,y)],55,2)
  iris(a,x-4,y,1.5);iris(a,x+4,y,1.5)
 a.stroke([(x-7,y+7),(x+7,y+7)],89,1.5)

def guardiao(a):
 atmosphere(a,'wood')
 # tronco entalhado e copa assimetrica; sete galhos independentes
 for x,yy,rx,ry in [(36,21,18,12),(60,15,25,14),(82,24,20,13),(52,33,30,15),(94,35,13,10)]:a.ellipse(x,yy,rx,ry,124+(x%3)*13,'fur')
 a.polygon([(50,76),(54,46),(42,39),(38,23),(45,22),(59,41),(68,40),(79,13),(87,15),(78,48),(81,76),(72,81),(66,67),(61,81)],159,'stone')
 for x in [43,52,73,84]:a.stroke([(64,65),(x,41),(x-6,24)],151,4)
 for xx in [45,54,65,78]:a.stroke([(xx,52),(xx+3,65),(xx-1,76)],75,1)
 a.ellipse(63,43,13,12,175,'stone');iris(a,58,40,2.4);iris(a,69,40,2.4)
 a.stroke([(59,50),(65,53),(71,50)],57,2)
 for side in [-1,1]:
  a.stroke([(63+side*19,51),(63+side*37,60),(63+side*49,46)],168,6)
  for j in range(3):a.stroke([(63+side*(31+j*5),56-j*3),(63+side*(38+j*5),45-j*5)],137,2.4)
  a.stroke([(63+side*7,74),(63+side*22,82)],124,5)
 a.texture(64,48,14,22,42,'/',66)

def scorpion(a):
 atmosphere(a,'sand')
 for side in [-1,1]:
  for i in range(4):
   x=64+side*(12+i*6);y=50+i*3
   a.stroke([(x,y),(x+side*(13+i),y+8),(x+side*(19+i*2),78-i)],138,3)
   a.stroke([(x+side*(19+i*2),78-i),(x+side*(23+i*2),81-i)],222,1.5)
 for i,(x,y) in enumerate([(48,49),(57,48),(67,48),(76,46),(84,41)]):
  a.ellipse(x,y,13-i*.7,13-i*.6,171+i*7,'chitin')
  a.stroke([(x-4,y-8),(x+4,y-8)],98,1.2)
 a.ellipse(39,44,16,13,198,'chitin');iris(a,32,38,2);iris(a,43,38,2)
 for side in [-1,1]:
  x=43+side*18
  a.stroke([(x,52),(x+side*17,43),(x+side*24,31)],160,6)
  a.ellipse(x+side*27,27,13,9,184,'chitin')
  a.polygon([(x+side*29,27),(x+side*44,12),(x+side*38,32)],218,'chitin')
  a.polygon([(x+side*30,30),(x+side*42,39),(x+side*36,25)],169,'chitin')
 # cauda segmentada, arqueada sobre o corpo e ferrão curvo
 for i,(x,y) in enumerate([(88,43),(96,35),(104,27),(106,18),(100,12),(91,12)]):
  a.ellipse(x,y,8-i*.6,7-i*.5,163+i*6,'chitin')
 a.polygon([(84,11),(91,8),(93,19),(84,26),(88,17)],228,'chitin')
 for x,y in [(39,47),(62,44),(87,40)]:runic(a,x,y,.7,220)

def hydra(a):
 atmosphere(a,'poison')
 a.ellipse(64,57,34,18,164,'scale')
 a.stroke([(37,59),(22,53),(9,60)],145,8)
 for x,y,lean in [(39,32,-13),(66,20,0),(92,33,13)]:
  a.stroke([(64,53),(x+lean*.2,47),(x,y+8)],154,11)
  a.ellipse(x,y,12,9,190,'scale');a.polygon([(x+2,y+3),(x+17,y+9),(x+10,y+13),(x-2,y+9)],178,'scale')
  iris(a,x+1,y-2,2);iris(a,x+8,y-2,2)
  a.polygon([(x-6,y-4),(x-10,y-17),(x+1,y-9)],205,'scale')
  a.polygon([(x+3,y-5),(x+9,y-15),(x+10,y-4)],201,'scale')
  a.stroke([(x+10,y+10),(x+20,y+13),(x+25,y+11)],216,1)
  for i in range(4):a.stroke([(x-6+i*3,y+6),(x-4+i*3,y+12)],88,1)
 for k in range(2):
  x=46+k*38
  a.stroke([(x,65),(x-7,77),(x+2,79)],161,6)
 for i in range(11):a.stroke([(32+i*6,54),(34+i*6,49)],94,1.5)

def golem(a):
 atmosphere(a,'stone')
 armored(a,63,39,1.17,'stone')
 armored_head(a,63,17,'stone')
 for side in [-1,1]:
  sx=63+side*23
  a.polygon([(sx-8,22),(sx+8,23),(sx+14,36),(sx-9,41)],183,'stone')
  a.ellipse(sx+side*5,52,10,10,193,'stone')
  for v in range(4):a.crack(sx-4+v*2,43+v*4,.38)
 a.ellipse(63,40,12,13,82,'stone');runic(a,63,40,2,247)
 for side in [-1,1]:
  a.polygon([(63+side*19,23),(63+side*23,4),(63+side*34,20)],211,'stone')
  a.polygon([(63+side*6,75),(63+side*10,85),(63+side*23,83)],159,'stone')
 a.texture(63,42,17,23,40,'-',54)

def king(a):
 atmosphere(a,'tomb')
 # trono alto de pedra, tecido rasgado e coroa de cinco pontas
 a.polygon([(36,72),(31,21),(44,14),(81,14),(97,26),(89,74)],96,'stone')
 a.stroke([(34,27),(43,15),(84,15),(93,27)],191,3)
 a.polygon([(46,70),(40,35),(50,26),(74,26),(83,38),(80,72),(94,79),(29,79)],111,'cloth')
 a.polygon([(52,31),(47,73),(62,82),(76,74),(73,31)],178,'bone')
 for side in [-1,1]:
  a.stroke([(63+side*17,40),(63+side*28,56),(63+side*19,70)],185,5)
  a.dot(63+side*27,58,5,194)
 a.ellipse(63,23,12,12,202,'bone');iris(a,58,22,2);iris(a,69,22,2)
 a.stroke([(57,30),(70,30)],66,1.5)
 for i in range(6):a.stroke([(54+i*3,42),(54+i*3,62)],82,1.3)
 a.polygon([(50,15),(47,4),(55,12),(61,2),(66,11),(75,4),(78,16)],226,'metal')
 for x in [53,63,74]:a.dot(x,13,2,244)
 a.stroke([(91,62),(100,35),(104,11)],218,3)
 a.polygon([(103,7),(110,17),(98,17)],235,'metal')

def glacial(a):
 atmosphere(a,'ice')
 wing(a,(58,43),(3,9),(36,66),'scale',192,8)
 wing(a,(72,44),(123,10),(94,66),'scale',188,8)
 a.ellipse(66,54,22,22,173,'scale')
 a.stroke([(68,62),(36,75),(27,81)],189,9)
 a.ellipse(74,27,15,16,197,'scale')
 a.polygon([(77,27),(104,35),(113,46),(89,42),(72,35)],191,'scale')
 a.polygon([(61,20),(57,4),(69,17)],232,'metal')
 a.polygon([(76,16),(87,1),(84,24)],240,'metal')
 iris(a,84,24,2.5)
 for x in [52,65,77]:a.polygon([(x,44),(x+3,30),(x+11,48)],202,'metal')
 for side in [-1,1]:a.stroke([(66+side*11,65),(66+side*14,77),(66+side*23,79)],180,5)
 for i in range(7):a.polygon([(15+i*15,71),(16+i*15,62-i%3*4),(20+i*15,71)],65,'metal')

def deadlord(a):
 atmosphere(a,'tomb')
 a.polygon([(52,33),(41,47),(30,77),(51,72),(63,81),(80,70),(96,78),(83,41),(74,32)],126,'cloth')
 a.polygon([(51,27),(45,12),(53,4),(74,5),(81,14),(76,32)],140,'cloth')
 a.ellipse(63,19,10,11,193,'bone');iris(a,59,17,2);iris(a,67,17,2)
 a.polygon([(58,26),(69,26),(63,32)],70,'bone')
 for x in [46,55,73,81]:a.stroke([(x,42),(x+(x-63)*.3,69)],69,2)
 a.stroke([(81,46),(96,43),(107,9)],222,3)
 a.stroke([(107,9),(90,6),(84,13),(94,22),(107,9)],214,3)
 for side in [-1,1]:
  a.stroke([(63+side*15,37),(63+side*21,50),(63+side*27,46)],177,4)
  a.ellipse(63+side*34,35,10,13,76,'smoke')
  iris(a,63+side*36,34,2)
 for i in range(6):a.ellipse(30+i*14,71-i%3*7,5,4,78,'smoke')

def demon(a):
 atmosphere(a,'fire')
 wing(a,(54,39),(9,6),(26,70),'leather',117,7)
 wing(a,(72,37),(117,5),(104,70),'leather',130,7)
 armored(a,63,39,.9,'skin')
 a.ellipse(63,16,12,13,196,'skin')
 for side in [-1,1]:
  a.polygon([(63+side*6,12),(63+side*13,-1),(63+side*18,15)],214,'bone')
  a.stroke([(63+side*15,42),(63+side*29,56),(63+side*41,50)],190,5)
  a.polygon([(63+side*39,50),(63+side*46,46),(63+side*43,58)],230,'bone')
 iris(a,58,16,2.7);iris(a,68,16,2.7)
 for i in range(7):
  x=35+i*10
  a.polygon([(x,75),(x-4,61-i%2*5),(x+5,68-i%3*5),(x+8,75)],137+i*8,'smoke')
 a.ellipse(63,43,7,10,76,'skin');runic(a,63,43,1.5,249)

def seraph(a):
 atmosphere(a,'holy')
 for side in [-1,1]:
  wing(a,(63+side*8,36),(63+side*54,5),(63+side*37,63),'feather',171,10)
  wing(a,(63+side*8,43),(63+side*49,31),(63+side*40,73),'feather',188,8)
  wing(a,(63+side*6,52),(63+side*36,60),(63+side*27,82),'feather',163,7)
 a.polygon([(55,34),(45,68),(60,80),(74,69),(82,78),(71,35)],172,'cloth')
 a.ellipse(63,27,10,12,210,'skin');iris(a,59,25,2);iris(a,68,25,2)
 a.stroke([(63,12),(63,6)],200,1.5)
 # aureola quebrada em segmentos
 for s0,s1 in [(0,83),(112,183),(213,260),(282,346)]:
  pts=[(63+19*math.cos(math.radians(t)),15+8*math.sin(math.radians(t))) for t in range(s0,s1+1,5)]
  a.stroke(pts,221,2)
 a.ellipse(63,47,9,11,88,'cloth');runic(a,63,46,1.2,249)
 a.stroke([(82,59),(92,31),(95,13)],221,2)
 for x in [35,92]:a.stroke([(x,46),(x+4,53)],114,2)

def primordial(a):
 atmosphere(a,'void')
 for k in range(8):
  angle=2*math.pi*k/8
  cx=63+math.cos(angle)*27;cy=41+math.sin(angle)*23
  px=63+math.cos(angle)*38;py=41+math.sin(angle)*33
  a.stroke([(63,43),(cx,cy),(px,py)],96+k*10,4+k%3)
  a.ellipse(px,py,6+k%4,5+k%2,123,'smoke')
  if k%2==0:iris(a,px,py,2)
 a.ellipse(63,43,26,25,185,'smoke')
 a.ellipse(63,43,20,18,54,'smoke')
 a.ellipse(63,43,12,11,9,'smoke')
 for x,y,rr in [(55,34,2),(76,34,2),(51,50,2),(71,57,2),(64,42,4)]:iris(a,x,y,rr)
 for side in [-1,1]:
  for i in range(3):
   x=63+side*(23+i*9);a.stroke([(x,15+i*6),(x+side*8,10+i*6),(x+side*15,18+i*9)],190,1.5)
 for i in range(8):runic(a,25+i*11,77-(i%3)*4,.45,149)

def rooted_heart(a):
 atmosphere(a,'wood')
 for side in [-1,1]:
  for i in range(5):
   x=63+side*(12+i*4)
   a.stroke([(63,52),(x,66),(x+side*(8+i),79)],107+i*8,2+(i%2))
 for x,y,r in [(51,31,18),(73,31,18),(63,50,23)]:a.ellipse(x,y,r,r*.9,152,'skin')
 a.polygon([(32,42),(64,76),(98,39),(86,21),(63,34),(41,20)],185,'skin')
 a.ellipse(64,41,13,14,89,'wood' if False else 'stone')
 iris(a,64,39,5)
 for i in range(7):a.stroke([(44+i*6,29),(50+i*4,42),(44+i*5,57)],93,1.3)
 for i in range(5):
  x=40+i*11;a.polygon([(x,24),(x+6,10-i%2*5),(x+12,25)],157,'fur')
 for x in [37,89]:a.stroke([(x,33),(x+(x-63)*.2,21),(x+(x-63)*.7,12)],149,3)

def sandmatriarch(a):
 atmosphere(a,'sand')
 a.ellipse(63,46,27,22,192,'chitin');a.ellipse(91,44,13,12,179,'chitin')
 for side in [-1,1]:
  for k in range(4):
   x=59+side*(11+k*5);ex=63+side*(38+k*3)
   a.stroke([(x,48-k*3),(ex,25+k*10),(ex+side*10,66+k*4)],133,4)
   a.stroke([(ex,25+k*10),(ex+side*10,66+k*4)],202,1)
 for x in [85,91,96]:iris(a,x,41,1.8)
 for side in [-1,1]:a.stroke([(89+side*5,52),(86+side*7,65)],201,2)
 a.ellipse(51,40,16,13,174,'chitin')
 for i in range(8):
  x=42+i*5;a.stroke([(x,31),(x+2,28)],85,1)
 for i in range(12):a.dot(49+(i%4)*9,41+(i//4)*5,.7,236)
 a.polygon([(49,24),(64,14),(76,24)],212,'metal')

def devourer(a):
 atmosphere(a,'poison')
 a.ellipse(60,58,37,20,140,'skin')
 a.ellipse(65,38,35,23,163,'skin')
 a.polygon([(29,38),(102,35),(92,60),(40,60)],55,'skin')
 a.polygon([(35,42),(95,41),(89,56),(43,57)],23,'smoke')
 for x in range(40,96,6):
  a.polygon([(x,43),(x+4,43),(x+2,50)],212,'bone')
  a.polygon([(x,57),(x+4,57),(x+2,52)],193,'bone')
 iris(a,43,25,4);iris(a,86,24,4)
 for side in [-1,1]:
  a.stroke([(63+side*25,62),(63+side*38,74),(63+side*40,79)],145,6)
  a.stroke([(63+side*30,30),(63+side*42,16),(63+side*36,10)],101,4)
 for x,y in [(23,27),(104,35),(17,61),(112,59)]:a.ellipse(x,y,4,6,82,'smoke')

def ferrocolossus(a):
 atmosphere(a,'stone')
 armored(a,63,37,1.3,'metal')
 armored_head(a,63,13,'metal')
 for side in [-1,1]:
  x=63+side*31
  a.ellipse(x,47,13,16,174,'metal')
  for i in range(5):a.stroke([(x-9,35+i*6),(x+9,35+i*6)],82,2)
  a.ellipse(x,61,12,11,205,'metal')
  for i in range(7):
   theta=i*math.pi/3.5
   a.dot(x+7*math.cos(theta),61+7*math.sin(theta),1,81)
 a.ellipse(63,37,14,14,80,'metal');a.ellipse(63,37,8,9,245,'metal')
 a.polygon([(48,22),(51,5),(60,18)],214,'metal')
 a.polygon([(77,23),(82,6),(89,23)],216,'metal')
 for x in [52,74]:a.stroke([(x,56),(x+1,72)],103,2)

def tombsentinel(a):
 atmosphere(a,'tomb')
 a.polygon([(46,80),(40,28),(46,10),(80,10),(87,32),(80,80)],160,'stone')
 a.polygon([(51,76),(48,29),(53,17),(74,17),(78,31),(73,77)],96,'stone')
 a.ellipse(63,28,13,14,204,'bone');iris(a,57,27,2);iris(a,70,27,2)
 for side in [-1,1]:
  x=63+side*27
  a.stroke([(63+side*12,36),(x,45),(x+side*6,61)],208,5)
  a.dot(x+side*6,61,5,217)
 for j in range(5):
  y=47+j*6
  runic(a,63,y,.8,192 if j%2 else 248)
 a.stroke([(102,78),(103,24),(106,6)],226,3)
 a.polygon([(99,24),(105,3),(111,24)],205,'metal')
 a.ellipse(63,11,18,5,140,'stone')

def frosttitan(a):
 atmosphere(a,'ice')
 armored(a,62,39,1.18,'stone')
 armored_head(a,62,17,'stone')
 for side in [-1,1]:
  a.polygon([(62+side*12,23),(62+side*24,1),(62+side*31,25)],233,'metal')
  a.polygon([(62+side*23,39),(62+side*38,24),(62+side*33,55)],203,'metal')
 a.polygon([(55,39),(62,27),(71,39),(62,52)],75,'metal');runic(a,62,39,1.2,248)
 a.stroke([(96,63),(104,29),(108,13)],233,4)
 a.polygon([(100,27),(117,15),(119,32),(100,44)],209,'metal')
 for i in range(9):
  x=28+i*9;a.dot(x,73-i%2*5,2,52)

def ashherald(a):
 atmosphere(a,'ash')
 a.polygon([(57,23),(45,37),(32,78),(54,69),(64,82),(84,72),(95,78),(78,36),(72,24)],133,'smoke')
 for j in range(4):
  a.polygon([(51-j*2,41+j*6),(40-j*2,59+j*5),(50,70+j*3),(66,56+j*5)],101+j*13,'smoke')
 a.polygon([(52,28),(47,12),(55,4),(73,7),(82,26)],135,'cloth')
 a.ellipse(64,24,10,10,84,'bone');iris(a,59,23,2.7);iris(a,69,23,2.7)
 a.stroke([(84,56),(97,36),(105,6)],184,3)
 a.ellipse(105,8,6,7,195,'smoke')
 for i in range(21):
  x=23+(i*17)%83;y=29+(i*11)%50
  if a.b[y,x]<10:a.dot(x,y,1+(i%2),55+(i%4)*14)

def furnace(a):
 atmosphere(a,'fire')
 for side in [-1,1]:
  sx=63+side*22
  a.polygon([(sx-9,49),(sx+8,49),(sx+11,80),(sx-11,80)],159,'metal')
  a.polygon([(sx-14,30),(sx+13,29),(sx+18,51),(sx-14,50)],187,'metal')
  a.polygon([(sx-3,10),(sx+11,10),(sx+10,35),(sx-4,35)],127,'metal')
  for y in range(15,34,6):a.stroke([(sx-3,y),(sx+10,y)],71,2)
 a.polygon([(42,30),(85,30),(92,62),(82,75),(44,75),(36,60)],190,'metal')
 a.ellipse(63,53,23,20,82,'metal')
 a.polygon([(46,39),(79,39),(82,68),(46,68)],39,'metal')
 for i in range(6):
  x=48+i*5;a.polygon([(x,65),(x-4,51-i%2*6),(x+3,43-i%3*3),(x+6,65)],152+i*12,'smoke')
 for x in [43,83]:
  for y in [36,61]:a.dot(x,y,1.8,235)
 a.ellipse(63,18,12,8,154,'metal');runic(a,63,17,1.4,241)

def judge(a):
 atmosphere(a,'holy')
 wing(a,(48,31),(5,9),(21,65),'feather',187,10)
 wing(a,(79,31),(118,11),(102,67),'feather',187,10)
 a.polygon([(56,25),(48,50),(42,77),(62,83),(83,75),(78,50),(70,26)],187,'cloth')
 a.ellipse(64,20,9,11,205,'skin');iris(a,60,20,1.7);iris(a,69,20,1.7)
 for x in [52,63,74]:a.stroke([(x,43),(x,73)],109,1.2)
 a.stroke([(63,9),(63,3)],241,2)
 a.stroke([(48,9),(53,5),(75,5),(80,9)],229,1.7)
 # balanca nas maos: dois pratos suspensos por correntes, nao flutuantes
 a.stroke([(84,45),(94,28),(104,27)],231,2.5)
 a.stroke([(90,27),(117,27)],226,2)
 for x in [93,114]:
  a.stroke([(x,28),(x,42)],163,1)
  a.stroke([(x-6,42),(x+6,42)],240,2)
  a.stroke([(x-6,42),(x,47),(x+6,42)],208,1)
 a.ellipse(63,45,8,10,83,'cloth');runic(a,63,45,1.3,246)

def core(a):
 atmosphere(a,'void')
 for i in range(7):
  radius=11+i*5
  points=[]
  for theta in range(0,360,4):
   rr=radius*(1+.04*math.sin(theta*.2+i))
   points.append((63+rr*math.cos(math.radians(theta)),43+rr*.78*math.sin(math.radians(theta))))
  a.stroke(points,48+(i%3)*27,1.5)
 for i in range(10):
  theta=math.radians(i*36+20)
  x=63+39*math.cos(theta);y=43+29*math.sin(theta)
  a.polygon([(x-5,y+3),(x+2,y-7),(x+7,y+2)],129+(i%4)*17,'stone')
 a.ellipse(63,43,21,18,110,'smoke')
 a.ellipse(63,43,14,13,34,'smoke')
 a.ellipse(63,43,6,6,1,'smoke')
 for k in range(8):
  t=math.radians(k*45)
  runic(a,63+28*math.cos(t),43+22*math.sin(t),.55,196)
 for x,y in [(42,17),(96,22),(29,62),(109,61)]:a.ellipse(x,y,3,4,73,'smoke')

ARTISTS=[guardiao,scorpion,hydra,golem,king,glacial,deadlord,demon,seraph,primordial,
 rooted_heart,sandmatriarch,devourer,ferrocolossus,tombsentinel,frosttitan,ashherald,furnace,judge,core]
REGIONS=['wood','sand','poison','stone','tomb','ice','tomb','fire','holy','void']

def phase_marks(a,region,phase):
 if phase==1:return
 # Fase 2: rachaduras e aura. Fase 3: ruptura acentuada e faíscas.
 energy={'wood':202,'sand':211,'poison':192,'stone':220,'tomb':199,'ice':241,'fire':219,'holy':241,'void':218}[REGIONS[region]]
 for i in range(5+(phase-2)*9):
  t=(i*.61803398875 +region*.13)%1
  x=63+math.cos(t*2*math.pi)*(35+(i%3)*7)
  y=42+math.sin(t*2*math.pi)*(25+(i%3)*6)
  a.stroke([(x-3,y+2),(x,y-3),(x+3,y-5)],energy,1 if phase==2 else 1.5)
 for i in range(phase*3):
  x=41+(i*11+region*3)%41;y=30+(i*7)%39
  if a.b[y,x]>35:a.crack(x,y,.55 if phase==2 else .82)


def render_boss(name,index,phase=1):
 a=Art(name,index%10,'boss')
 # Preserva detalhe e silhueta mesmo no terceiro estagio.
 ARTISTS[index](a)
 if index<10:phase_marks(a,index,phase)
 art=a.finish()
 assert len(art.splitlines())==H and all(len(s)==W for s in art.splitlines())
 return art

# Compactacao textual sem loss: dois digitos base-36 codificam indentacao.
ALPH='0123456789abcdefghijklmnopqrstuvwxyz'
def pack(s):
 result=[]
 for row in s.splitlines():
  indent=len(row)-len(row.lstrip(' '))
  assert indent<36*36
  result.append(ALPH[indent//36]+ALPH[indent%36]+row[indent:].rstrip(' '))
 return '\n'.join(result)

def main():
 names=REGIONAL+DUNGEON
 result={}
 for i,name in enumerate(names):
  for phase in (1,2,3) if i<10 else (1,):
   result[f'{name}@{phase}']=render_boss(name,i,phase)
 assert len(result)==40
 assert len(set(result.values()))==40
 # A primeira fase de cada chefe tambem nao pode ser igual a um retrato de monstro.
 from PIL import ImageFont
 DATA=ROOT/'js/high-density-boss-data.js'
 text='// ASCII REALMS: 20 chefes, 30 variantes de fase de 128x88, arte ASCII. Gerado pelo script tools/generate-bosses-hd.py.\n'
 text+='export const HD_BOSS_WIDTH=128, HD_BOSS_HEIGHT=88;\n'
 text+='export const HD_BOSS_PACKED=Object.freeze('+json.dumps({k:pack(v) for k,v in result.items()},ensure_ascii=False,separators=(',',':'))+');\n'
 DATA.write_text(text,encoding='utf-8')
 manifest=[{'id':n,'category':'regional' if i<10 else 'dungeon','index':i%10,'dimensions':[W,H],'phases':[1,2,3] if i<10 else [1],
 'sha256':sha256(result[n+'@1'].encode()).hexdigest()} for i,n in enumerate(names)]
 (ROOT/'docs/inventario-chefes-hd5.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 print('generated',len(names),'bosses,',len(result),'phase arts',DATA.stat().st_size,'bytes')

if __name__=='__main__':main()
