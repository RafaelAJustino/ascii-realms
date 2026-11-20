import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LOCAL_NPCS,RECURRING_NPCS,cityNpcs} from '../js/city-life.js';
import {TAVERN_GUESTS,guestForRegion} from '../js/tavern-stories.js';
import {maps} from '../js/data.js';
import {NPC_WIDTH,NPC_HEIGHT,INTERIOR_WIDTH,INTERIOR_HEIGHT,INTERIOR_TYPES,NPC_PORTRAITS,INTERIOR_ART,densityNpcArtwork,densityInteriorArtwork} from '../js/density-settlements.js';
const npcs=[...LOCAL_NPCS,...RECURRING_NPCS,...TAVERN_GUESTS];
assert.equal(npcs.length,32);
assert.equal(new Set(npcs.map(n=>n.id)).size,32);
assert.deepEqual(Object.keys(NPC_PORTRAITS).sort(),npcs.map(n=>n.id).sort());
assert.equal(Object.keys(INTERIOR_ART).length,70);
const validate=(art,w,h,key)=>{assert.equal(typeof art,'string',key);const lines=art.split('\n');assert.equal(lines.length,h,key+' rows');assert.ok(lines.every(l=>l.length===w),key+' columns');assert.match(art,/^[\x20-\x7e\n]+$/,key+' ASCII');assert.ok((art.match(/[@%#*+=:\/\\|]/g)||[]).length>100,key+' shading');};
for(const npc of npcs)validate(densityNpcArtwork(npc.id),NPC_WIDTH,NPC_HEIGHT,npc.id);
for(let i=0;i<maps.length;i++)for(const kind of INTERIOR_TYPES)validate(densityInteriorArtwork(i,kind),INTERIOR_WIDTH,INTERIOR_HEIGHT,i+':'+kind);
assert.equal(new Set(Object.values(NPC_PORTRAITS)).size,32);
assert.equal(new Set(Object.values(INTERIOR_ART)).size,70);
assert.equal(densityNpcArtwork('invalid'),null);
assert.equal(densityInteriorArtwork(-1,'tavern'),null);
assert.equal(densityInteriorArtwork(0,'none'),null);
for(let region=0;region<10;region++){
 assert.ok(LOCAL_NPCS[region].region===region);
 assert.ok(TAVERN_GUESTS.filter(n=>n.region===region).length===2);
}
const ui=readFileSync(new URL('../js/ui.js',import.meta.url),'utf8');
for(const s of ["densityNpcArtwork(id)","densityInteriorArtwork(region,type)","npcPortrait(npc.id)","npcPortrait(guest.id)","interiorScene(region,'tavern')","interiorScene(region,'forge')","interiorScene(region,'materials')","interiorScene(region,'potion')","category==='weapon'?'weapon'", "details.addEventListener('toggle'", "escape(art)"]){assert.ok(ui.includes(s),'UI integration: '+s);}
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/density-settlements\.css/);
console.log('OK: 32 NPCs, 70 interiores regionais, ASCII 64x40 e 100x38, retratos distintos, lojas, tavernas, ferrarias e escape HTML.');
