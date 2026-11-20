from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[1]
widths=(320,360,375,390,430,720,1366)
pages=('player','diary','atlas','world')
records=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    for label in pages:
        html=(root/f'docs/ux-stage3-{label}.html').read_text()
        for w in widths:
            page=browser.new_page(viewport={'width':w,'height':812},device_scale_factor=1)
            try:
                page.set_content(html,wait_until='domcontentloaded',timeout=15000)
                record=page.evaluate('''()=>{
                  const c=document.querySelector('.content'),tabs=[...document.querySelectorAll('.ux-area-tab')],n=document.querySelector('.ux-area-nav');
                  const norm=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),v=window.innerWidth;
                  const rects=tabs.map(b=>{const r=b.getBoundingClientRect();return {height:Math.round(r.height),width:Math.round(r.width),left:Math.round(r.left),right:Math.round(r.right),label:b.textContent.trim()};});
                  return {pageWidth:norm,viewport:v,contentWidth:c?.scrollWidth||0,contentClient:c?.clientWidth||0,tabRects:rects,navVisible:!!n,selected:tabs.filter(x=>x.getAttribute('aria-current')==='page').length};
                }''')
                record.update({'screen':label,'width':w,'overflow':record['pageWidth']>w+1 or record['contentWidth']>record['contentClient']+1,'shortButton':any(t['height']<44 for t in record['tabRects'])})
                if w in (320,390) and label in ('diary','atlas','player'):
                    page.screenshot(path=str(root/f'docs/ux-stage3-{label}-{w}.png'),full_page=False)
                records.append(record)
            except Exception as e:
                records.append({'screen':label,'width':w,'error':str(e)})
            finally:
                page.close()
    browser.close()
out=root/'docs/ux-stage3-qa-results.json'
out.write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('TOTAL',len(records),'ERRORS',sum('error' in r for r in records),'OVERFLOW',[(r['screen'],r['width']) for r in records if r.get('overflow')],'SHORT',[(r['screen'],r['width']) for r in records if r.get('shortButton')])
print('samples',records[:2])
