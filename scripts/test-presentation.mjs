import assert from 'node:assert/strict';
import {binaryAddress,deploymentConfig,enabledTab,TAB_IDS} from '../dist/presentation.js';
// All flag combinations, including no tabs and a calculator without an explorer.
for(let mask=0;mask<16;mask++) {
 const tabs=Object.fromEntries(TAB_IDS.map((id,i)=>[id,Boolean(mask & (1<<i))]));
 const config=deploymentConfig({version:1,tabs});
 for(const id of TAB_IDS) assert.equal(enabledTab(config,id),tabs[id]?id:TAB_IDS.find(t=>tabs[t])??null);
}
assert.equal(deploymentConfig({tabs:{practice:false}}).tabs.calculate,true);
assert.equal(deploymentConfig({components:{importPlan:false}}).components.exportPlan,true);
assert.throws(()=>deploymentConfig({tabs:{practice:'false'}}));
assert.throws(()=>deploymentConfig({tabs:{typo:false}}));
for(const prefix of [0,1,4,8,20,21,31,32]) {
 const html=binaryAddress(0xc0a801ff,prefix);
 assert.equal((html.match(/class="octet"/g)||[]).length,4);
 assert.equal((html.match(/class="nibble"/g)||[]).length,8);
 assert.equal((html.match(/class="octet-dot"/g)||[]).length,3);
 assert.equal((html.match(/class="bit host"/g)||[]).length,32-prefix);
 assert.match(html,/192\.168\.1\.255/);
 assert.match(html,/11000000\.10101000\.00000001\.11111111/);
 for(const decimal of [192,168,1,255]) assert.ok(html.includes(`class="octet-decimal">${decimal}<`));
}
console.log('PASS: binary octets, nibbles, decimal labels, prefix boundaries and all 16 tab configurations.');
