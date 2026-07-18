import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ArtifactStore } from './artifacts.js';
import { createEngineRequest, executeEngine, validateEngineResponse } from './engineProtocol.js';
import { SandboxRunner } from './sandbox.js';

test('engine protocol validates correlated response',()=>{const request=createEngineRequest({engine:'cad',action:'generate',projectId:'p'});assert.throws(()=>validateEngineResponse({protocol:'wrong'},request),/engine_response_invalid/);assert.equal(validateEngineResponse({protocol:'autoforge-engine',version:'1.0',requestId:request.id,status:'succeeded'},request).status,'succeeded')});
test('sandbox engine response stores declared artifacts',async()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'af-engine-test-'));try{const script='let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{let r=JSON.parse(d);process.stdout.write(JSON.stringify({protocol:"autoforge-engine",version:"1.0",requestId:r.id,status:"succeeded",metrics:{cells:1},artifacts:[{name:"mesh.vtk",contentBase64:"VkRL",mimeType:"model/vtk"}]}))})',sandbox=new SandboxRunner().register('wrapper',process.execPath,['-e',script]),store=new ArtifactStore({root});const request=createEngineRequest({engine:'cfd',action:'mesh',projectId:'p'}),result=await executeEngine({sandbox,artifactStore:store,command:'wrapper',request,organizationId:'o'});assert.equal(result.execution.status,'succeeded');assert.equal(result.execution.artifactIds.length,1);assert.equal(fs.readFileSync(store.pathFor(store.find(result.execution.artifactIds[0])),'utf8'),'VDK')}finally{fs.rmSync(root,{recursive:true,force:true})}});
