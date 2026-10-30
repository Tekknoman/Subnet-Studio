import { mkdtemp,mkdir,writeFile,readFile,rm } from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';
import {assemble} from './assemble-pages.mjs';
const tmp=await mkdtemp(path.join(os.tmpdir(),'subnet-pages-'));
try {
 const dev=path.join(tmp,'dev'),prod=path.join(tmp,'prod'),output=path.join(tmp,'site');
 await mkdir(dev);await mkdir(prod);
 await writeFile(path.join(dev,'index.html'),'development');await writeFile(path.join(prod,'index.html'),'released production');
 await assemble({dev,prod,output,prodSha:'release1',devSha:'dev1'});
 assert.equal(await readFile(path.join(output,'index.html'),'utf8'),'released production');
 assert.equal(await readFile(path.join(output,'dev/index.html'),'utf8'),'development');
 await writeFile(path.join(dev,'index.html'),'next dev');
 await assemble({dev,prod,output,prodSha:'release1',devSha:'dev2'});
 assert.equal(await readFile(path.join(output,'index.html'),'utf8'),'released production');
 assert.equal(await readFile(path.join(output,'dev/index.html'),'utf8'),'next dev');
 await assemble({dev,prod,output});
 assert.match(await readFile(path.join(output,'index.html'),'utf8'),/first merged pull request/);
 assert.equal(JSON.parse(await readFile(path.join(output,'deployment.json'),'utf8')).production,null);
 console.log('PASS: separate dev/prod content, dev-only update preserves production, safe first-release placeholder.');
} finally {await rm(tmp,{recursive:true,force:true})}
