"""Teste de responsividade com markup real de character(), inventory(), skills().
O navegador lê previews autocontidas, pois navegação a URLs locais está bloqueada.
Fluxos de cliques são testados por tests/mobile-character-stage6.mjs.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];docs=root/'docs'
results=[];errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 page.on('pageerror',lambda e:errors.append(str(e)))
 for name in ('character','inventory','comparacao','skills'):
  page.set_content((docs/f'qa-ux6-{name}-fixture.html').read_text(),wait_until='load')
  for width,height in ((320,568),(360,780),(375,667),(390,844),(430,932),(720,1280),(1366,900)):
   page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(65)
   metrics=page.evaluate('''() => {
      const area=document.querySelector('#app .content');
      const buttons=[...area.querySelectorAll('button[data-action]')].filter(b=>b.getClientRects().length && b.getBoundingClientRect().width>0);
      return {viewport:innerWidth,docW:document.documentElement.scrollWidth,contentW:area.scrollWidth,contentClientW:area.clientWidth,
        minButtonHeight:Math.round(Math.min(...buttons.map(b=>b.getBoundingClientRect().height))),
        outsideButtons:buttons.filter(b=>b.getBoundingClientRect().left<-1 || b.getBoundingClientRect().right>innerWidth+1).length};
   }''')
   results.append({'screen':name,'size':f'{width}x{height}', **metrics})
   assert metrics['docW']<=width+1,(name,width,metrics)
   assert metrics['contentW']<=metrics['contentClientW']+1,(name,width,metrics)
   assert metrics['minButtonHeight']>=43,(name,width,metrics)
   assert metrics['outsideButtons']==0,(name,width,metrics)
   if width==390:
    if name=='comparacao':page.locator('.ux6-item-card[open]').scroll_into_view_if_needed()
    page.screenshot(path=str(docs/f'qa-ux6-{name}-390.png'),animations='disabled')
  if name=='inventory':
   assert page.locator('.ux6-slot').count()==7
   assert page.locator('.ux6-inventory-tabs button').count()==4
  if name=='comparacao':
   assert page.locator('.ux6-item-card').count()==3
   assert page.locator('.ux6-item-card[open] .ux6-compare-row').count()>0
   page.locator('.ux6-item-card').last.locator('summary.ux6-item-title').click()
   assert page.locator('.ux6-item-card[open]').count()==2
  if name=='skills':
   assert page.locator('.ux6-skill').count()==4
   assert page.locator('.ux6-variant-choice button').count() in (9,12)
 assert not errors,errors[:5]
 (docs/'qa-ux6-browser-metrics.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
 print('OK: Etapa 6 visual, 4 estados x 7 resoluções, 28 verificações de largura, toque e leitura. Navegação local não testada.')
 browser.close()
