import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateManufacturing, suggestAlternatives } from './manufacturing.js';

const suppliers=[{id:'a',risk:'high',leadTimeDays:120},{id:'b',risk:'low',leadTimeDays:30,name:'B'}];
test('manufacturing evaluation rolls up cost and supply risk',()=>{const e=evaluateManufacturing({bom:[{partNo:'p',system:'Body',qty:2,unitCost:100,supplierIds:['a'],status:'risk'}],suppliers,targetCost:1000});assert.equal(e.cost.direct,200);assert.ok(e.cost.total>200);assert.ok(e.issues.some(x=>x.code==='single_source'));assert.ok(e.supplyRiskScore>0)});
test('critical DFM failure rejects candidate',()=>{const e=evaluateManufacturing({bom:[],suppliers,parameters:{length:4100},targetCost:1000});assert.equal(e.manufacturable,false);assert.ok(e.issues.some(x=>x.severity==='critical'))});
test('alternative supplier suggestions exclude current and high risk',()=>{const bom=[{partNo:'p',supplierIds:['a']}],e=evaluateManufacturing({bom,suppliers,targetCost:1});const alt=suggestAlternatives(e,bom,suppliers);assert.equal(alt[0].alternatives[0].supplierId,'b')});
