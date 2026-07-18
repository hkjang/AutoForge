import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ArtifactStore } from './artifacts.js';

test('content addressed store deduplicates and verifies artifacts',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'af-artifact-test-'));try{const metadata=[],store=new ArtifactStore({root,metadata}),a=store.put(Buffer.from('cad-data'),{projectId:'p',name:'body.step'}),b=store.put(Buffer.from('cad-data'),{projectId:'p',name:'copy.step'});assert.equal(a.id,b.id);assert.equal(a.sha256.length,64);assert.equal(store.verify(a),true);assert.equal(fs.readFileSync(store.pathFor(a),'utf8'),'cad-data')}finally{fs.rmSync(root,{recursive:true,force:true})}});
test('invalid checksum path is rejected',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'af-artifact-test-'));try{const store=new ArtifactStore({root});assert.throws(()=>store.pathFor({sha256:'../escape'}),/invalid/)}finally{fs.rmSync(root,{recursive:true,force:true})}});
