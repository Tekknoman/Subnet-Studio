import fs from 'node:fs/promises';import {execFileSync} from 'node:child_process';import path from 'node:path';import {createHash} from 'node:crypto';
import {assemble} from './assemble-pages.mjs';
export function featurePath(branch){return branch.slice(5).replace(/[^a-zA-Z0-9-]/g,'-').slice(0,60)+'-'+createHash('sha256').update(branch).digest('hex').slice(0,10)}
async function run(){
 const refs=JSON.parse(await fs.readFile('refs.json','utf8'));
 async function checkout(name,sha){if(!/^[a-f0-9]{40}$/.test(sha))throw Error('Invalid commit SHA');const target=path.resolve('.preview-sources',name);await fs.mkdir(target,{recursive:true});execFileSync('git',['archive','--format=tar','--output='+path.resolve('.preview-sources',name+'.tar'),sha]);execFileSync('tar',['-xf',path.resolve('.preview-sources',name+'.tar'),'-C',target]);execFileSync('npm',['test'],{cwd:target,stdio:'inherit'});return target}
 const dev=await checkout('dev',refs.dev),prod=refs.prod?await checkout('prod',refs.prod):null;
 if(prod&&(await fs.readdir(path.join(prod,'dist'))).includes('features'))throw Error('Production dist/features conflicts with preview URLs.');
 await assemble({dev:path.join(dev,'dist'),prod:prod?path.join(prod,'dist'):'',prodSha:refs.prod,devSha:refs.dev,prodPr:refs.pr});
 const previews=[];
 for(const f of refs.features){let slug=featurePath(f.branch),source=await checkout(slug,f.sha); // Fail safely: keep live site if any selected source fails tests.
  const entries=await fs.readdir(path.join(source,'dist'),{recursive:true,withFileTypes:true});if(entries.some(e=>e.isSymbolicLink()))throw Error('Preview assets must not contain symlinks.');
  await fs.cp(path.join(source,'dist'),path.join('_site','features',slug),{recursive:true});previews.push({...f,path:'features/'+slug+'/'});
 }
 await fs.mkdir('_site/features',{recursive:true});
 const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 await fs.writeFile('_site/features/index.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Subnet Studio previews</title><body style="font:16px system-ui;max-width:800px;margin:60px auto;padding:24px"><h1>Feature previews</h1><p>Development branches. Changes here are not production releases.</p><ul>${previews.map(f=>`<li><a href="./${featurePath(f.branch)}/">${escape(f.branch)}</a> · ${f.sha.slice(0,7)}</li>`).join('')}</ul><a href="../dev/">Development</a></body></html>`);
 await fs.writeFile('_site/deployment.json',JSON.stringify({...refs,features:previews},null,2));
 console.log('Published artifact includes',previews.length,'feature previews.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname)await run();
