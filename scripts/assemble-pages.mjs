import { cp, mkdir, writeFile, access, lstat, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

// Buildless application: copy static assets without changing application code.
// Reject links to keep the Pages artifact portable and prevent copying outside dist.
async function checkDirectory(dir) {
  for (const name of await readdir(dir)) {
    const entry = path.join(dir, name), info = await lstat(entry);
    if (info.isSymbolicLink()) throw Error(`Symlinks are not supported: ${entry}`);
    if (info.isDirectory()) await checkDirectory(entry);
  }
}
export async function assemble({dev='development/dist', prod='production/dist', output='_site', prodSha='', devSha='', prodPr=''}={}) {
  await access(path.join(dev,'index.html'));
  await checkDirectory(dev);
  if (prodSha) { await access(path.join(prod,'index.html')); await checkDirectory(prod); }
  await rm(output, {recursive:true, force:true});
  await mkdir(output, {recursive:true});
  if (prodSha) {
    // /dev is reserved for the development deployment.
    if ((await readdir(prod)).includes('dev')) throw Error('Production dist/dev conflicts with the development URL.');
    await cp(prod, output, {recursive:true});
  } else {
    await writeFile(path.join(output,'index.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Subnet Studio</title><body style="font:18px system-ui;max-width:650px;margin:12vh auto;padding:24px"><h1>Subnet Studio</h1><p>Production is waiting for its first merged pull request into <strong>prod</strong>.</p><p><a href="./dev/">Open the development version →</a></p></body></html>');
  }
  await cp(dev, path.join(output,'dev'), {recursive:true});
  await writeFile(path.join(output,'.nojekyll'),'');
  await writeFile(path.join(output,'deployment.json'), JSON.stringify({development:devSha,production:prodSha||null,productionPullRequest:prodPr||null},null,2));
}
if (process.argv[1] && path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)) {
  await assemble({prodSha:process.env.PROD_SHA||'',devSha:process.env.DEV_SHA||'',prodPr:process.env.PROD_PR||''});
}
