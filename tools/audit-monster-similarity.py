#!/usr/bin/env python3
"""Mede exclusividade textual e similaridade de silhuetas do atlas HD4.
Dependências offline: numpy, Python 3.
"""
from pathlib import Path
import json
import numpy as np
root=Path(__file__).resolve().parents[1]
s=(root/'js/high-density-monster-data.js').read_text(encoding='utf8')
packed=json.loads(s.split('HD_MONSTER_PACKED=Object.freeze(',1)[1].split(');',1)[0])
assert len(packed)==150
frames={}
for name,raw in packed.items():
 rows=[' '*int(row[:2],36)+row[2:] for row in raw.split('\n')]
 assert len(rows)==78 and all(len(row)<=112 for row in rows)
 frames[name]=np.array([[c!=' ' for c in row.ljust(112)] for row in rows],dtype=bool)
names=list(frames)
top=[]
for i,a in enumerate(names):
 for b in names[i+1:]:
  both=int(np.count_nonzero(frames[a] & frames[b]));either=int(np.count_nonzero(frames[a] | frames[b]));iou=float(both/either)
  if iou>.92:top.append({'a':a,'b':b,'iou':round(iou,5)})
top.sort(key=lambda x:x['iou'],reverse=True)
report={'species':len(packed),'pairs':int(len(names)*(len(names)-1)//2),'above_0_92':len(top),'above_0_98':sum(x['iou']>.98 for x in top),'maximum_iou':top[0]['iou'] if top else 0,'top_15':top[:15], 'note':'Sobreposicao de area nao e medida definitiva de semelhanca artistica. Revisao visual individual pendente.'}
(root/'docs/relatorio-similaridade-monstros-hd4.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
assert report['above_0_98']==0, 'Existe alguma silhueta quase identica na grade HD.'
print(json.dumps(report,ensure_ascii=False,indent=2))
