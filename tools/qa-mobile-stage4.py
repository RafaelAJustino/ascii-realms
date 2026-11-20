"""Avaliação visual isolada: HTML real renderizado e CSS real, sem gameplay end-to-end."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[1]
widths=(320,360,375,390,430,720,1366)
scenes=('rotas','expedicao','evento','acampamento','aventura')
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    for scene in scenes:
        html=(root/'docs'/f'ux-stage4-{scene}.html').read_text()
        for width in widths:
            page=browser.new_page(viewport={'width':width,'height':812},device_scale_factor=1)
            try:
                page.set_content(html,wait_until='domcontentloaded',timeout=20000)
                entry=page.evaluate('''()=>{
                  const content=document.querySelector('.content'),buttons=[...document.querySelectorAll('button[data-action]')];
                  const documentWidth=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);
                  const buttonRects=buttons.map(b=>{const r=b.getBoundingClientRect();return {height:r.height,width:r.width,left:r.left,right:r.right,disabled:b.disabled,name:b.textContent.trim()}});
                  const visibleRects=buttonRects.filter(b=>b.width>0);
                  const target=document.querySelector('[data-action="journeyContinue"]');
                  const art=document.querySelector('.ux-journey-art');
                  const card=document.querySelector('.ux-journey-event');
                  const actions=document.querySelector('.ux-journey-actions');
                  return {documentWidth,innerWidth:innerWidth,contentWidth:content?.scrollWidth||0,contentClient:content?.clientWidth||0,buttonRects:visibleRects,routeCount:document.querySelectorAll('.ux-path-card').length,eventBeforeActions:card&&actions?card.getBoundingClientRect().top<=actions.getBoundingClientRect().top:null,actionsBeforeArt:target&&art?target.getBoundingClientRect().top<=art.getBoundingClientRect().top:null};
                }''')
                entry.update(scene=scene,width=width,overflow=entry['documentWidth']>width+1 or entry['contentWidth']>entry['contentClient']+1,shortButton=any(0<b['height']<43.9 for b in entry['buttonRects']),offscreenButton=any(b['left']<-1 or b['right']>width+1 for b in entry['buttonRects']))
                if width in (320,390) and scene in ('rotas','expedicao','evento','acampamento'):
                    page.screenshot(path=str(root/'docs'/f'ux-stage4-{scene}-{width}.png'),full_page=False)
                results.append(entry)
            except Exception as exc:
                results.append({'scene':scene,'width':width,'error':str(exc)})
            finally:page.close()
    browser.close()
(root/'docs'/'ux-stage4-qa-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('TOTAL',len(results),'ERRORS',len([r for r in results if r.get('error')]),'OVERFLOW',[(r['scene'],r['width']) for r in results if r.get('overflow')],'SHORT',[(r['scene'],r['width']) for r in results if r.get('shortButton')],'OFFSCREEN',[(r['scene'],r['width']) for r in results if r.get('offscreenButton')]);
