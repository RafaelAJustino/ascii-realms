from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[1]/'docs'
files={
'inicio':'ux-preview-home.html','aventura':'ux-stage4-aventura.html','caminhos':'ux-stage4-rotas.html','expedicao':'ux-stage4-expedicao.html','evento':'ux-stage4-evento.html','acampamento':'ux-stage4-acampamento.html',
'combate':'qa-ux5-fixture.html','personagem':'qa-ux6-character-fixture.html','inventario':'qa-ux6-inventory-fixture.html','comparacao':'qa-ux6-comparacao-fixture.html','habilidades':'qa-ux6-skills-fixture.html',
'cidade':'qa-ux7-cidade-fixture.html','taverna':'qa-ux7-taverna-fixture.html','mercado':'qa-ux7-mercado-fixture.html','missoes':'qa-ux7-missoes-ativas-fixture.html','mundo':'qa-ux9-atlas-fixture.html','mapas':'qa-ux9-mapas-fixture.html','ferraria':'qa-ux9-ferraria-fixture.html','masmorras':'qa-ux9-masmorras-fixture.html',
}
sizes=[(320,640),(360,740),(375,812),(390,844),(430,932),(580,850),(720,900)]
records=[];errors=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844})
 for screen,file in files.items():
  html=(root/file).read_text()
  page.set_content(html,wait_until='load')
  for width,height in sizes:
   page.set_viewport_size({'width':width,'height':height})
   page.wait_for_timeout(12)
   data=page.evaluate('''() => {let content=document.querySelector('#game-content')||document.querySelector('#app .content');let nav=document.querySelector('#app > .ux-area-nav');let controls=[...document.querySelectorAll('#app button[data-action],#app summary')].filter(el=>{const r=el.getBoundingClientRect(),st=getComputedStyle(el);return st.display!=='none'&&r.width>0&&r.height>0});return {documentWidth:document.documentElement.scrollWidth,contentWidth:content?.scrollWidth,contentClient:content?.clientWidth,navFixed:nav?getComputedStyle(nav).position:null,offscreen:controls.filter(el=>{const r=el.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1}).slice(0,4).map(el=>(el.textContent||'').trim().slice(0,32)),small:controls.filter(el=>el.getBoundingClientRect().height<43).slice(0,6).map(el=>({t:(el.textContent||'').trim().slice(0,30),h:Math.round(el.getBoundingClientRect().height)})),n:controls.length};}''')
   records.append({'screen':screen,'size':f'{width}x{height}',**data})
   if data['documentWidth']>width+1 or (data['contentWidth'] is not None and data['contentWidth']>data['contentClient']+2) or data['offscreen']:
    errors.append({'screen':screen,'size':width,'issue':data})
   if screen in ['aventura','caminhos','combate','cidade','mundo','personagem','inventario','missoes'] and width==390:
    page.screenshot(path=str(root/f'preview-ux-consolidada-{screen}-390.png'),animations='disabled')
 browser.close()
result={'screens':len(files),'resolutions':len(sizes),'checks':len(records),'errors':errors,'smallControls':[(r['screen'],r['size'],r['small']) for r in records if r['small']][:25]}
(root/'qa-ux-consolidada-metricas.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps(result,ensure_ascii=False,indent=2)[:8500])

assert not errors, errors
assert not result['smallControls'], result['smallControls']
print(f"OK: auditoria UX consolidada, {len(records)} verificações visuais sem erro de responsividade ou controle menor que 43px.")
