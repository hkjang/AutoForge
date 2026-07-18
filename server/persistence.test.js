import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createPersistence } from './persistence.js';

const fixture=()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'af-persistence-'));return{root,store:createPersistence(root),close:()=>fs.rmSync(root,{recursive:true,force:true})}};
test('durable persistence writes data and SHA-256 sidecar',()=>{const x=fixture();try{x.store.persist({version:1});const file=x.store.path();assert.equal(JSON.parse(fs.readFileSync(file)).version,1);assert.match(fs.readFileSync(`${file}.sha256`,'utf8'),/^[a-f0-9]{64}\n$/);const target={};assert.equal(x.store.hydrate(target),true);assert.equal(target.version,1);assert.equal(x.store.status().verified,true)}finally{x.close()}});
test('corrupt current generation automatically recovers previous generation',()=>{const x=fixture();try{x.store.persist({version:1,stable:true});x.store.persist({version:2});fs.writeFileSync(x.store.path(),'{partial');const recovered={},fresh=createPersistence(x.root);assert.equal(fresh.hydrate(recovered),true);assert.deepEqual(recovered,{version:1,stable:true});assert.equal(fresh.status().state,'recovered');assert.equal(JSON.parse(fs.readFileSync(fresh.path())).version,1)}finally{x.close()}});
test('checksum mismatch is treated as corruption even when JSON parses',()=>{const x=fixture();try{x.store.persist({version:1});x.store.persist({version:2});fs.writeFileSync(x.store.path(),'{"version":999}');const target={};createPersistence(x.root).hydrate(target);assert.equal(target.version,1)}finally{x.close()}});
test('startup fails closed when current and previous generations are corrupt',()=>{const x=fixture();try{x.store.persist({version:1});x.store.persist({version:2});fs.writeFileSync(x.store.path(),'bad');fs.writeFileSync(`${x.store.path()}.previous`,'also bad');assert.throws(()=>createPersistence(x.root).hydrate({}),error=>error.code==='PERSISTENCE_UNRECOVERABLE')}finally{x.close()}});
