from PIL import Image,ImageDraw,ImageFilter
import math, random, json, pathlib
W,H=160,103
OUT=pathlib.Path(__file__).resolve().parent.parent/'js'
RAMP=' .:-=+*#%@'

def hero(name):
    im=Image.new('L',(W,H),0);d=ImageDraw.Draw(im)
    def poly(coords,shade,outline=0,width=1):
        d.polygon(coords,fill=shade)
        if outline:d.line(coords+[coords[0]],fill=outline,width=width,joint='curve')
    def ell(box,shade,outline=0,width=1):d.ellipse(box,fill=shade,outline=outline or None,width=width)
    def ln(coords,shade,width=1):d.line(coords,fill=shade,width=width,joint='curve')
    def rect(box,shade,outline=0,width=1):d.rectangle(box,fill=shade,outline=outline or None,width=width)
    # Atmospheric ground shadow under boots
    for i in range(5):ell((51-i*4,97+i//2,110+i*4,100+i//2),max(18,56-i*8))
    if name=='guerreiro':
        # swept cape in background
        poly([(65,39),(97,38),(111,92),(103,98),(91,86),(73,92),(52,99)],88,32,2)
        for i in range(7):ln([(64+i*5,43),(56+i*7,91)],105+i*7)
        # segmented greaves with articulated ankles
        for side in (-1,1):
            cx=80+side*16
            poly([(cx-10,60),(cx+9,60),(cx+8,79),(cx+7,88),(cx-8,89),(cx-10,76)],153,56,2)
            for y in (67,73,81):ln([(cx-8,y),(cx+7,y+1)],210,2)
            ell((cx-9,85,cx+10,92),176,60,2)
            poly([(cx-10,88),(cx+8,88),(cx+12,97),(cx+14,99),(cx-12,99),(cx-14,96)],162,47,2)
            for t in range(4):ln([(cx-8+t*3,91),(cx-10+t*4,98)],201,1)
        # under armor tapered tunic
        poly([(62,43),(98,43),(102,66),(91,73),(67,73),(58,63)],135,55,2)
        for i in range(6):ln([(65+i*6,67),(63+i*7,72)],100,1)
        # powerful shoulder pauldrons
        for side in (-1,1):
            cx=80+side*31
            ell((cx-17,35,cx+17,52),182,45,2)
            ell((cx-13,37,cx+13,45),223,82,2)
            for y in (40,45):ln([(cx-12,y),(cx+12,y)],128,1)
            poly([(cx-11,50),(cx+11,51),(cx+13,72),(cx+7,75),(cx-7,74),(cx-14,66)],137,48,2)
            for yy in (55,61,68):ln([(cx-9,yy),(cx+10,yy+1)],220,2)
            ell((cx-9,70,cx+9,80),201,44,2)
            for a in range(4):ln([(cx-7+a*4,73),(cx-9+a*4,78)],99,1)
        # bulky steel breastplate with central ridge
        poly([(62,40),(74,37),(86,37),(98,40),(102,49),(96,64),(87,68),(72,68),(62,62),(57,49)],184,49,2)
        poly([(65,43),(80,39),(79,61),(68,58)],220,100,1)
        poly([(82,39),(96,43),(93,58),(82,61)],147,61,1)
        for y in (45,49,55):ln([(67,y),(76,y-2)],239,1)
        for y in (45,49,55):ln([(84,y-2),(94,y)],106,1)
        ln([(80,40),(80,66)],241,2)
        poly([(77,48),(80,46),(83,48),(82,53),(80,56),(78,53)],75,223,1)
        # mail skirt, belt
        rect((62,65,97,69),70,195,2)
        for x in range(65,97,5):ln([(x,66),(x+2,68)],212,1)
        poly([(68,69),(93,69),(98,78),(62,78)],126,45,2)
        for x in range(66,96,4):ln([(x,72),(x+3,76)],205)
        # helmet face / gorget
        poly([(67,15),(71,9),(79,6),(89,8),(94,15),(96,29),(88,36),(72,36),(64,29)],168,48,2)
        poly([(73,15),(82,9),(91,15),(91,29),(87,34),(74,34),(69,29)],211,70,2)
        poly([(69,20),(91,20),(94,26),(86,24),(75,24),(66,26)],90,37,1)
        ln([(78,10),(78,35)],246,2);ln([(83,10),(83,34)],108,1)
        poly([(73,24),(87,24),(84,29),(76,29)],36,151,1)
        ln([(71,31),(89,31)],220,2)
        # helm crest
        for k in range(5):ln([(76+k*2,10),(70+k*3,2)],198-k*18,1)
        # Arma e escudo nao sao parte da silhueta-base; arma surge ao equipar.
    elif name=='mago':
        # billowing robe and cape, far larger lower silhouette
        poly([(71,34),(93,35),(111,93),(126,99),(36,99),(50,91)],102,40,2)
        poly([(70,38),(92,39),(107,98),(53,98)],158,63,2)
        for x in range(52,107,7):
            ln([(81+(x-80)*.32,48),(x,95)],174 if x%2 else 77,1)
        for i in range(9):ln([(44+i*8,96),(44+i*8+3,98)],225-i*8,1)
        # forearms / wide sleeves
        poly([(65,40),(57,40),(43,52),(32,70),(47,78),(65,57)],133,45,2)
        poly([(96,40),(105,42),(118,65),(127,74),(114,79),(96,59)],136,49,2)
        for pos in ((39,66,53,71),(108,66,121,73)):rect(pos,204,91,1)
        # torso mantle, defined shoulder drape
        poly([(65,37),(80,42),(96,37),(103,52),(99,71),(62,71),(58,52)],115,42,2)
        poly([(67,41),(80,47),(94,41),(94,67),(67,67)],173,70,2)
        for k in range(8):ln([(70+k*3,50),(69+k*3,65)],(205-10*k),1)
        # arcane embroidered border
        for x in range(72,93,5):
            ell((x,59,x+3,62),223,102)
            ln([(x+1,60),(x+1,64)],228,1)
        # belt sash
        ln([(64,69),(99,71)],56,4);ln([(65,70),(98,71)],216,1)
        poly([(91,69),(97,70),(106,90),(98,92)],181,59,1)
        # hood over head with face dark
        poly([(60,31),(65,14),(73,6),(81,1),(90,6),(100,18),(102,34),(92,42),(69,42)],147,38,2)
        poly([(69,26),(73,16),(80,10),(89,17),(94,30),(89,36),(73,36)],54,115,2)
        poly([(75,23),(82,21),(88,24),(88,33),(74,33)],30,80,1)
        ln([(76,28),(80,27)],221,1);ln([(84,27),(88,28)],221,1)
        poly([(67,14),(76,7),(83,5),(97,18)],214,71,2)
        for k in range(6):ln([(66+k,26),(61+k,37)],86+k*11,1)
        # arcane chest runes
        ell((73,47,88,61),79,234,2)
        poly([(80,48),(85,55),(80,59),(75,55)],221,64,1)
        ln([(80,49),(80,59)],45,1)
        # left hand reaching with magic circle
        ell((19,65,38,84),115,225,1)
        ell((23,69,34,80),61,221,1)
        for angle in range(0,360,45):
            a=math.radians(angle);x=28+13*math.cos(a);y=74+13*math.sin(a)
            ln([(28+9*math.cos(a),74+9*math.sin(a)),(x,y)],233,1)
        # Cajado surge apenas quando o personagem equipa a arma.
    elif name=='ladino':
        # Corpo inteiro, postura diagonal furtiva; nao reutiliza nenhuma arte de referencia.
        # Capa dividida, com pregas assimetricas.
        poly([(65,37),(91,36),(111,92),(105,98),(87,90),(74,99),(46,94),(56,65)],88,36,2)
        for i in range(6):
            ln([(70+i*4,45),(50+i*10,92)],115+14*i,1)
        # Botas e pernas ligeiramente abertas: tecidos foscos e couro escuro.
        for side in (-1,1):
            cx=80+side*14
            poly([(cx-8,61),(cx+8,61),(cx+8,84),(cx+5,92),(cx-9,91)],132,38,2)
            for yy in (68,76,84): ln([(cx-7,yy),(cx+5,yy+2)],199,1)
            poly([(cx-9,87),(cx+7,87),(cx+11,98),(cx-13,98)],162,43,2)
            ln([(cx-7,91),(cx+6,91)],227,2)
            for i in range(3): ln([(cx-6+i*4,88),(cx-2+i*4,96)],79+i*14,1)
        # Tunica ajustada, reforcos triangulares e capuz integrado aos ombros.
        poly([(64,38),(92,38),(101,52),(96,69),(89,75),(65,73),(57,51)],130,40,2)
        poly([(68,40),(91,41),(95,66),(85,69),(65,65)],175,55,2)
        poly([(69,45),(79,49),(73,65),(63,59)],115,48,1)
        poly([(89,43),(96,53),(92,63),(79,67)],197,73,1)
        ln([(68,44),(91,66)],58,4);ln([(69,44),(92,65)],202,1)
        ln([(62,67),(98,67)],59,4)
        for x in (65,82,94):
            rect((x,65,x+5,74),145,47,1)
            ln([(x+1,68),(x+4,68)],233,1)
        # Ombreiras assimetricas e dois bracos ligados ao torso.
        poly([(65,40),(54,39),(43,51),(39,68),(50,73),(62,54)],135,43,2)
        poly([(95,39),(106,43),(117,59),(119,71),(108,75),(95,55)],155,48,2)
        poly([(57,41),(65,42),(60,53),(48,52)],194,65,1)
        poly([(97,43),(106,45),(111,53),(99,54)],184,61,1)
        for y in (54,61): ln([(45,y),(55,y+1)],195,1)
        for y in (56,64): ln([(106,y),(116,y+1)],190,1)
        ell((38,67,50,79),178,47,2)
        ell((107,69,120,80),171,43,2)
        # Cabeca de proporcoes humanas; rosto na sombra do capuz pontudo.
        poly([(63,30),(63,18),(69,10),(79,4),(91,8),(99,22),(97,33),(89,41),(70,40)],132,35,2)
        poly([(70,26),(73,17),(80,12),(89,16),(93,26),(89,34),(72,34)],51,110,2)
        poly([(76,22),(88,20),(90,31),(75,31)],33,90,1)
        ln([(75,26),(79,25)],224,1)
        ln([(84,25),(89,26)],214,1)
        ln([(77,32),(87,33)],91,1)
        poly([(64,18),(79,5),(91,10),(97,22),(88,15),(77,14)],192,51,2)
        for i in range(5): ln([(66+i,22),(64+i,32)],74+i*16,1)
        # Ombros possuem detalhes tipicos de couro, sem armas fixas.
        for j in range(5): ln([(67+j*5,54),(69+j*5,57)],196,1)
        # Emblema discreto no peitoral.
        poly([(78,53),(81,49),(84,53),(82,57),(80,55)],65,231,1)
    else: # arqueiro
        # dark cloak, trailing garment
        poly([(65,35),(90,37),(111,91),(95,95),(69,83),(54,96),(43,93)],84,37,2)
        for i in range(5):ln([(71+i*4,43),(53+i*11,90)],125+i*13,1)
        # boots and separated legs
        for side in (-1,1):
            cx=80+side*12
            poly([(cx-8,60),(cx+8,61),(cx+10,88),(cx-7,88)],135,52,2)
            for y in (67,72,79):ln([(cx-6,y),(cx+7,y+1)],204,1)
            poly([(cx-8,83),(cx+8,83),(cx+10,99),(cx-14,98)],172,55,2)
            ln([(cx-9,92),(cx+8,92)],227,2)
        # leather torso / diagonally strapped quiver
        poly([(65,37),(90,36),(102,48),(95,67),(65,67),(58,49)],139,46,2)
        poly([(68,40),(88,39),(93,61),(81,69),(65,61)],168,58,2)
        ln([(67,41),(92,64)],69,5);ln([(67,41),(92,64)],212,1)
        # quiver at left shoulder with fletched arrows
        poly([(46,34),(61,27),(71,51),(55,56)],135,58,2)
        for x in (49,53,57,61):
            ln([(x,23),(x+8,39)],215,1)
            ln([(x-2,23),(x+3,28)],233)
        # belt pouches
        ln([(62,66),(98,66)],62,4)
        for x in (66,88):rect((x,67,x+8,74),127,41,1);ln([(x+2,69),(x+6,69)],219,1)
        # human forearms and gloves
        poly([(65,42),(56,42),(48,62),(57,69),(67,54)],134,52,2)
        poly([(96,42),(105,44),(110,62),(102,68),(91,53)],155,52,2)
        ell((48,61,60,73),183,60,2);ell((101,61,113,73),193,59,2)
        # hood and natural face
        poly([(65,20),(68,12),(78,5),(88,9),(98,20),(97,32),(89,37),(70,35)],145,46,2)
        poly([(72,20),(78,14),(89,17),(94,25),(88,33),(72,30)],72,154,1)
        ell((73,20,89,35),113,61,1)
        ln([(75,25),(79,24)],227,1);ln([(85,24),(89,25)],218,1)
        ln([(80,30),(84,31)],188,1)
        ln([(66,18),(92,17)],221,2)
        for i in range(5):ln([(66+i,23),(64+i,31)],83+i*11,1)
        # Arco e flecha sao desenhados pelo compositor dinamico.
    # density treatment for surfaces: tiny ridges/texture, only on already occupied shaded regions
    pixels=im.load();rng=random.Random({'guerreiro':1111,'mago':2222,'arqueiro':3333,'ladino':4444}[name]);out=[]
    for y in range(H):
        s=''
        for x in range(W):
            v=pixels[x,y]
            if v<12:s+=' ';continue
            # light gradient and material grain, stronger at edge facing keylight
            gradient=13*(1-x/W)+7*math.sin((x+y*.3)/8)+rng.uniform(-10,10)
            shade=max(0,min(255,v+gradient))
            idx=min(9,max(1,round(shade/255*9)))
            s+=RAMP[idx]
        out.append(s)
    assert len(out)==103 and all(len(r)==160 for r in out)
    return out

rows={n:hero(n) for n in ('guerreiro','mago','arqueiro','ladino')}
for n,r in rows.items():
    print(n, sum(c!=' ' for row in r for c in row), len(set(c for row in r for c in row)))
js='/** Retratos ASCII autorais de alta densidade. 160 colunas por 103 linhas. */\nexport const HIGH_DENSITY_HERO_ROWS = Object.freeze({\n'
for name,r in rows.items():
    js+=f'  {name}: Object.freeze('+json.dumps(r,ensure_ascii=True)+'),\n'
js+='});\n'
(OUT/'high-density-hero-arts.js').write_text(js,encoding='utf8')
# Visualização opcional para desenvolvimento: no jogo, somente o texto ASCII é renderizado
from PIL import ImageFont
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',9)
canvas=Image.new('RGB',(4*1030,1100),(14,17,21));p=ImageDraw.Draw(canvas)
for ix,(n,lines) in enumerate(rows.items()):
    x=ix*1030+5;p.text((x+6,5),n,fill=(227,220,196),font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',22))
    p.multiline_text((x,48),'\n'.join(lines),font=font,spacing=0,fill=(214,220,221))
canvas.save(str(pathlib.Path(__file__).parent.parent/'docs/previa-base-desenvolvimento.png'))
