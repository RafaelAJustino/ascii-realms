import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WELCOME_ART_MOBILE,WELCOME_ART_DESKTOP } from '../js/welcome-art.js';
for (const [art,width] of [[WELCOME_ART_MOBILE,148],[WELCOME_ART_DESKTOP,196]]) {
 const lines=art.split('\n');
 assert.equal(lines.length,width===148?42:56);
 assert.ok(lines.every(line=>line.length===width));
 assert.match(art, /[@%]{4,}/);
 assert.ok(art.includes('@'));
 assert.ok(art.includes('#'));
}
const source=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
assert.match(source,/ux-welcome-art-mobile/);
assert.match(source,/ux-welcome-art-desktop/);
assert.match(source,/fitWelcomeArtwork/);
assert.doesNotMatch(source,/const INTRO_ART/);
const style=readFileSync(new URL('../css/welcome-art.css',import.meta.url),'utf8');
assert.match(style,/white-space:pre/);
assert.match(style,/aspect-ratio/);
console.log('OK: arte ASCII fiel a referencia, 148x42 mobile e 196x56 desktop, título centralizado e adaptação.');
