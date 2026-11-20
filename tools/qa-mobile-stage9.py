"""Etapa 9: auditoria visual ampliada do HTML produzido pelo jogo e do CSS completo.
Não simula os eventos JavaScript de gameplay nem prova acessibilidade WCAG integral.
"""
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
docs=root/'docs'
all_cases={
  'inicio':'ux-preview-home.html',
  'aventura':'ux-preview-world.html',
  'jogador':'ux-preview-player.html',
  'caminhos':'ux-stage4-rotas.html',
  'expedicao':'ux-stage4-expedicao.html',
  'combate':'qa-ux5-fixture.html',
  'personagem':'qa-ux6-character-fixture.html',
  'inventario':'qa-ux6-inventory-fixture.html',
  'comparacao':'qa-ux6-comparacao-fixture.html',
  'habilidades':'qa-ux6-skills-fixture.html',
  'cidade':'qa-ux7-cidade-fixture.html',
  'mercado':'qa-ux7-mercado-fixture.html',
  'taverna':'qa-ux7-taverna-fixture.html',
  'missoes':'qa-ux7-missoes-ativas-fixture.html',
  'criacao':'qa-ux9-criacao-fixture.html',
  'atlas':'qa-ux9-atlas-fixture.html',
  'mapas':'qa-ux9-mapas-fixture.html',
  'diario':'qa-ux9-diario-fixture.html',
  'ferraria':'qa-ux9-ferraria-fixture.html',
  'masmorras':'qa-ux9-masmorras-fixture.html',
  'mercante':'qa-ux9-mercante-fixture.html',
  'estatisticas':'qa-ux9-estatisticas-fixture.html',
  'acampamento':'qa-ux9-acampamento-fixture.html'
}
# Match fixture names known from stage4 build script, without inventing screenshots.
for label,name in list(all_cases.items()):
 if not (docs/name).exists() and label in ('caminhos','expedicao'):
  alternatives=list(docs.glob(f'*{label}*fixture.html'))
  if alternatives:all_cases[label]=alternatives[0].name
assert all((docs/name).exists() for name in all_cases.values()),[(label,name) for label,name in all_cases.items() if not (docs/name).exists()]
mod=(root/'js/mobile-accessibility-stage8.js').read_text().replace('export const ','const ').replace('export function ','function ')
mod='(()=>{\n'+mod+'\nwindow.stage8Enhance=enhanceMobileAccessibility;\n})()'
metrics=[];warnings=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 failures=[]
 page.on('pageerror',lambda e:failures.append(str(e)))
 for screen,fixture in all_cases.items():
  html=(docs/fixture).read_text()
  # Mantém a estrutura e o CSS reais; insere os landmarks adicionados pelo render() da etapa 8.
  html=html.replace('href="#app"','href="#game-content"')
  html=re.sub(r'<div class="(content(?: combat-content)?)">',rf'<div class="\1" id="game-content" tabindex="-1" aria-label="Conteúdo: {screen}"><h2 class="ux8-screen-heading" tabindex="-1">{screen.capitalize()}</h2>',html,count=1)
  page.set_content(html,wait_until='load')
  page.add_script_tag(content=mod)
  page.evaluate("label => window.stage8Enhance(document.querySelector('#app'),label)",screen)
  for width,height in ((320,568),(360,780),(375,667),(390,844),(430,932),(580,850),(720,1280),(1366,900)):
   page.set_viewport_size({'width':width,'height':height})
   page.wait_for_timeout(35)
   m=page.evaluate('''() => {
      const c=document.querySelector('#app .content');
      const controls=[...c.querySelectorAll('button[data-action],summary')]
        .filter(x=>x.getClientRects().length>0&&x.getBoundingClientRect().width>0);
      const sizes=controls.map(el=>({name:(el.textContent||'').trim().slice(0,45),w:el.getBoundingClientRect().width,
        h:el.getBoundingClientRect().height,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}));
      return {vw:innerWidth,documentWidth:document.documentElement.scrollWidth,contentWidth:c.scrollWidth,
       availableWidth:c.clientWidth,controls:sizes.length,
       smallControls:sizes.filter(s=>s.h<43).slice(0,7),
       outside:sizes.filter(s=>s.left<-1||s.right>innerWidth+1).slice(0,7),
       unlabeled:controls.filter(el=>!((el.getAttribute('aria-label')||el.textContent||'').trim())).length,
       ariaArt:[...c.querySelectorAll('pre.ascii-art')].filter(el=>el.getAttribute('aria-hidden')==='true').length,
       artCount:c.querySelectorAll('pre.ascii-art').length,
       namedArt:[...c.querySelectorAll('pre.ascii-art')].filter(el=>el.closest('.ascii-container')?.getAttribute('aria-label')).length,
       hadHeading:!!c.querySelector('.ux8-screen-heading')};
   }''')
   metrics.append({'screen':screen,'size':f'{width}x{height}',**m})
   assert m['documentWidth']<=width+1,(screen,width,'document overflow',m)
   assert m['contentWidth']<=m['availableWidth']+1,(screen,width,'content overflow',m)
   assert not m['outside'],(screen,width,'offscreen control',m['outside'])
   assert not m['smallControls'],(screen,width,'small control',m['smallControls'])
   assert m['unlabeled']==0,(screen,width,'unlabeled controls',m)
   assert m['ariaArt']==m['artCount']==m['namedArt'],(screen,width,'ASCII a11y',m)
   assert m['hadHeading'],(screen,width,'missing heading')
   if width==390 and screen in ('aventura','combate','personagem','cidade','missoes','criacao','atlas','mapas','ferraria','masmorras','acampamento'):
    page.screenshot(path=str(docs/f'qa-ux9-{screen}-390.png'),animations='disabled')
  # Teclado: usa controles reais na prévia, sem acionar a lógica do jogo.
  if screen=='inventario':
   summary=page.locator('.ux6-item-title').first
   if summary.count():
    summary.focus();page.keyboard.press('Enter')
    assert summary.evaluate('(e)=>e.closest("details").open')
   press=page.locator('.ux6-inventory-tabs button[aria-pressed="true"]')
   assert press.count()==1,'state aria-pressed inventory'
  if screen=='missoes':assert page.locator('.ux7-quest-filters button[aria-pressed="true"]').count()==1
  if screen=='combate':
   assert page.locator('.combat-speed-option').first.evaluate('(e)=>e.getBoundingClientRect().height')>=43
   details=page.locator('.ux-combat-history')
   if details.count():
    details.locator('summary').focus();page.keyboard.press('Enter')
    assert details.evaluate('(e)=>e.open')
  if screen=='cidade':assert page.locator('.ux7-city-switch button[aria-pressed="true"]').count()==1
 assert not failures,failures
 (docs/'qa-ux9-browser-metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n')
 print(f'OK: Etapa 9, {len(all_cases)} telas x 8 larguras, {len(metrics)} medições de rolagem, toque, controles, nomes acessíveis e artes.')
 browser.close()
