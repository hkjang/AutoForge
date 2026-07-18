import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateVehicle, supportedSimulationTypes } from './vehicleSimulation.js';

test('all mandatory simulation domains produce finite metrics and CSV evidence',()=>{for(const type of supportedSimulationTypes){const run=simulateVehicle(type,{parameters:{length:3990,wheelbase:2630,width:1820,height:1570,wheel:19,capacity:78.4}});assert.equal(run.type,type);assert.equal(run.fidelity,'reduced_order_physics');assert.match(run.csv,/\n/);assert.ok(Object.values(run.result).filter(x=>typeof x==='number').every(Number.isFinite));assert.ok(run.result.confidence>0&&run.result.confidence<1)}});
test('aero drag rises quadratically with speed',()=>{const rows=simulateVehicle('aero',{parameters:{}}).csv.trim().split('\n').slice(1).map(x=>x.split(',').map(Number)),d50=rows.find(x=>x[0]===50)[1],d100=rows.find(x=>x[0]===100)[1];assert.ok(d100/d50>3.9&&d100/d50<4.1)});
test('thermal model reports a bounded fast-charge temperature rise',()=>{const result=simulateVehicle('thermal',{parameters:{},options:{ambientC:25,chargeKw:180}}).result;assert.ok(result.peakCellTempC>25&&result.peakCellTempC<60)});
test('range model returns viable baseline range with explicit uncertainty',()=>{const result=simulateVehicle('range',{parameters:{capacity:78.4}}).result;assert.ok(result.wltpKm>350);assert.equal(result.uncertaintyPercent,10)});
test('unsupported domain fails explicitly',()=>assert.throws(()=>simulateVehicle('crash',{parameters:{}}),error=>error.code==='simulation_type_unsupported'));
