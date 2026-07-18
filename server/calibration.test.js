import test from 'node:test';
import assert from 'node:assert/strict';
import { calibrateModel } from './calibration.js';

const fresh=()=>({modelRegistry:[{id:'m',domain:'aero',parameters:{bias:0,scale:1},confidence:.8}],calibrations:[],knowledge:[]});
test('calibration updates bias and records provenance',()=>{const db=fresh(),r=calibrateModel(db,{modelId:'m',predicted:100,actual:105,testId:'t'});assert.equal(r.decision,'calibrate');assert.ok(db.modelRegistry[0].parameters.bias>0);assert.equal(db.calibrations.length,1);assert.equal(db.knowledge.length,1)});
test('trusted measurement improves confidence without large correction',()=>{const db=fresh(),r=calibrateModel(db,{modelId:'m',predicted:100,actual:101});assert.equal(r.decision,'trusted');assert.equal(db.modelRegistry[0].confidence,.82)});
test('invalid measurement is rejected',()=>assert.throws(()=>calibrateModel(fresh(),{modelId:'m',predicted:NaN,actual:1}),/finite/));
