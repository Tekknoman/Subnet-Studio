import assert from 'node:assert/strict';import fs from 'node:fs';
import {migrate,structure,diagnostics,blankPlan,gaps,nextFree,split,locate} from '../dist/designer-model.js';
let old=JSON.parse(fs.readFileSync('dist/ost-campus.json')),p=migrate(old);assert.deepEqual(diagnostics(p),[]);
for(let pool of old.pools)for(let a of pool.allocations){let b=locate(p,a.id).node;assert.equal(b.cidr,a.cidr);assert.equal(b.requiredHosts,a.requiredHosts)}
assert.deepEqual(migrate(JSON.parse(JSON.stringify(p))),p);
let b=blankPlan(),root=b.roots[0];root.cidr='192.168.0.0/24';split(root);assert.equal(gaps(root).length,0);assert.deepEqual(diagnostics(b),[]);
root.children[1].cidr=root.children[0].cidr;assert.equal(diagnostics(b).find(x=>x.other).end-diagnostics(b).find(x=>x.other).start+1,128);assert.equal(gaps(root)[0].start,3232235648);assert.equal(nextFree(root,25),'192.168.0.128/25');
root.children[1].cidr='192.168.1.0/25';assert.ok(diagnostics(b).some(x=>x.message.includes('outside')));
root.children[1].cidr='192.168.0.1/25';assert.ok(diagnostics(b).some(x=>x.message.includes('aligned')));
let c=blankPlan(),n=c.roots[0];n.cidr='0.0.0.0/0';for(let i=0;i<32;i++){split(n);n=n.children[0]}assert.equal(n.cidr,'0.0.0.0/32');assert.throws(()=>split(n));structure(c);assert.deepEqual(diagnostics(c),[]);
assert.throws(()=>structure({...b,roots:[root,root]}));
console.log('PASS: legacy migration preserves 42 allocations, v2 roundtrip, exact gaps/overlaps, out-of-bounds, alignment, and recursive splitting from /0 to /32.');
