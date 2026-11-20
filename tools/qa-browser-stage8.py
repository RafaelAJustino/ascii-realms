"""QA isolada para o componente ASCII; não afirma testar o jogo completo.
Requer Python Playwright e Chromium. Executar: python tools/qa-browser-stage8.py
"""
from pathlib import Path
from html import escape
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ART = (ROOT / 'docs' / 'qa-amostra-heroi.txt')
if ART.is_file():
    reference = ART.read_text(encoding='utf-8').rstrip('\n')
else:
    reference = '\n'.join((' ' * 16 + ':==+*#%%@' * 8).ljust(160)[:160] for _ in range(103))
css = '\n'.join((ROOT / c).read_text() for c in [
    'css/combat.css', 'css/visual-polish.css', 'css/dynamic-combat-art.css',
    'css/density-art.css', 'css/density-events.css', 'css/high-density-final.css'
])
module = (ROOT / 'js/ascii-presentation.js').read_text().replace('export function ', 'function ')
ui = (ROOT / 'js/ui.js').read_text()
ui_functions = ui[ui.index('let asciiResizeObserver=null;'):ui.index('function openAsciiViewer(content,artElement)')]
ui_functions = ui_functions.replace('export function fitAscii(', 'function fitAscii(')
script = module + '\n' + ui_functions + '\nfunction openAsciiViewer(text,source){return openDetailedAsciiViewer(text,source)}\nwindow.stage8QA={fitAscii,openDetailedAsciiViewer};'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                args=['--no-sandbox', '--disable-dev-shm-usage'])
    for width, height in [(320,568),(390,844),(720,900),(1366,900)]:
        page = browser.new_page(viewport={'width':width, 'height':height})
        page_errors=[]
        page.on('pageerror', lambda error: page_errors.append(str(error)))
        colored=escape(reference[:200])
        rest=escape(reference[200:])
        markup=f'''<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#102020;color:#ccc;margin:0"><main id="app" style="max-width:720px;margin:auto"><div class="ascii-container" style="width:100%;height:320px"><pre class="ascii-art density-hero dynamic-hero high-density-character" data-ascii="true"><span class="avatar-ink avatar-weapon-legendary">{colored}</span>{rest}</pre></div><div class="event-flicker">Evento</div></main></body></html>'''
        page.set_content(markup)
        page.add_style_tag(content=css)
        page.add_script_tag(content=script)
        page.evaluate('window.stage8QA.fitAscii(document.querySelector(".ascii-art"))')
        art=page.locator('.ascii-container')
        assert art.get_attribute('role')=='button', f'Zoom do herói não habilitado em {width}px'
        art.focus()
        art.press('Enter')
        dialog=page.locator('#ascii-art-viewer')
        assert dialog.evaluate('(el) => el.open')
        assert page.locator('#ascii-art-viewer .avatar-weapon-legendary').count()==1
        assert dialog.get_attribute('data-rows')=='103'
        assert dialog.get_attribute('data-cols')=='160'
        font=page.locator('#ascii-art-viewer pre').evaluate('(el)=>parseFloat(getComputedStyle(el).fontSize)')
        assert font>=7, (width,font)
        page.get_by_role('button',name='Aumentar zoom').click()
        bigger=page.locator('#ascii-art-viewer pre').evaluate('(el)=>parseFloat(getComputedStyle(el).fontSize)')
        assert bigger>font
        page.get_by_role('button',name='Ajustar').click()
        fitted=page.locator('#ascii-art-viewer pre').evaluate('(el)=>parseFloat(getComputedStyle(el).fontSize)')
        assert fitted<=bigger
        doc_width=page.evaluate('document.documentElement.scrollWidth')
        assert doc_width<=width+1, (width,doc_width)
        if width in [320,390]:
            page.get_by_role('button',name='Aumentar zoom').click()
            page.screenshot(path=str(ROOT / 'docs' / f'qa-visualizador-{width}.png'))
        page.keyboard.press('Escape')
        assert not dialog.evaluate('(el) => el.open')
        page.emulate_media(reduced_motion='reduce')
        assert page.locator('.event-flicker').evaluate('(el)=>getComputedStyle(el).animationName')=='none'
        assert not page_errors, page_errors
        print(f'OK: {width}×{height}, zoom {font:.2f}→{bigger:.2f}px, ajustar {fitted:.2f}px, sem overflow, cor preservada, Esc e movimento reduzido')
        page.close()
    browser.close()
