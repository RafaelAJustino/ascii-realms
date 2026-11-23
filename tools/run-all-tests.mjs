/** Execução determinística, sem vazamento de timers entre suítes DOM simuladas. */
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const packageJSON=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));
const tests=packageJSON.scripts['test:individual'].match(/tests\/[\w-]+\.mjs/g)||[];
let passed=0;const failures=[];
for(const file of tests){
 const result=spawnSync(process.execPath,['--input-type=module','-e',`await import('./${file}'); process.exit(0);`],{cwd:root,encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024});
 const output=((result.stdout||'')+'\n'+(result.stderr||'')).trim();
 if(result.status===0&&!result.error){passed++;process.stdout.write(`OK ${file}\n`);}
 else{failures.push(file);process.stderr.write(`FALHA ${file}: ${result.error?.message||result.status}\n${output.slice(-1700)}\n`);}
}
process.stdout.write(`Total: ${passed}/${tests.length} testes aprovados.\n`);
if(failures.length)process.exitCode=1;
