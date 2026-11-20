"""Inspeciona o HTML real de cidade, mercado, taverna e missões em sete larguras.
Nao representa execução interativa completa no navegador.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];docs=root/'docs'
names=('cidade','mercado','taverna','contratos','missoes-disponiveis','missoes-ativas','missoes-prontas')
results=[];errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 page.on('pageerror',lambda exc:errors.append(str(exc)))
 for name in names:
  page.set_content((docs/f'qa-ux7-{name}-fixture.html').read_text(),wait_until='load')
  for width,height in ((320,568),(360,780),(375,667),(390,844),(430,932),(720,1280),(1366,900)):
   page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(35)
   values=page.evaluate('''() => {
     const main=document.querySelector('#app .content');
     const active=[...main.querySelectorAll('button[data-action]')].filter(b=>b.getClientRects().length>0&&b.getBoundingClientRect().width>0);
     const buttons=active.map(b=>({label:(b.textContent||'').trim().slice(0,32),height:b.getBoundingClientRect().height,left:b.getBoundingClientRect().left,right:b.getBoundingClientRect().right}));
     return {vw:innerWidth,docW:document.documentElement.scrollWidth,mainW:main.scrollWidth,mainCW:main.clientWidth,buttons:buttons.length,
       minButton:Math.round(Math.min(...buttons.map(b=>b.height))),offscreen:buttons.filter(b=>b.left<-1||b.right>innerWidth+1).map(b=>b.label)};
   }''')
   results.append({'screen':name,'viewport':f'{width}x{height}',**values})
   assert values['docW']<=width+1,(name,width,'document overflow',values)
   assert values['mainW']<=values['mainCW']+1,(name,width,'content overflow',values)
   assert values['minButton']>=43,(name,width,'small buttons',values)
   assert not values['offscreen'],(name,width,'offscreen buttons',values)
   if width==390:
    if name=='mercado':page.locator('.ux7-store-tabs').scroll_into_view_if_needed()
    if name=='contratos':page.locator('[data-ux7-key="tavern-contracts"]').scroll_into_view_if_needed()
    page.screenshot(path=str(docs/f'qa-ux7-{name}-390.png'),animations='disabled')
   if width==320 and name in ('cidade','missoes-ativas'):
    page.screenshot(path=str(docs/f'qa-ux7-{name}-320.png'),animations='disabled')
  if name=='cidade':
   assert page.locator('.ux7-service').count()==5
   assert page.locator('.ux7-city-shop details').count()>=1
  if name=='contratos':
   assert page.locator('[data-ux7-key="tavern-contracts"][open]').count()==1
   assert page.locator('.city-contract').count()>=1
  if name=='missoes-ativas':
   assert page.locator('.ux7-quest-card[data-bucket="active"]').count()>=2
  if name=='missoes-prontas':
   assert page.locator('.ux7-quest-card[data-bucket="ready"]').count()>=1
 assert not errors,errors
 (docs/'qa-ux7-browser-metrics.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
 print(f'OK: Etapa 7 visual, {len(names)} telas x 7 resoluções, {len(results)} verificações de largura, toque e visibilidade.')
 browser.close()
