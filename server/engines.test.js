import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateVehicle, simulationResult } from './engines.js';

test('baseline Urban E04 estimate stays inside requirements',()=>{
  const result=estimateVehicle({length:3990,wheelbase:2630,height:1570,wheel:19,capacity:78.4});
  assert.equal(result.range,418); assert.ok(result.cost<=30); assert.ok(result.cd<=.235); assert.ok(result.score>=85);
});
test('larger wheels reduce range and increase cost',()=>{
  const base=estimateVehicle({wheel:19}); const large=estimateVehicle({wheel:21});
  assert.ok(large.range<base.range); assert.ok(large.cost>base.cost);
});
test('simulation adapter returns typed result',()=>{
  const result=simulationResult('aero',estimateVehicle({}));
  assert.equal(result.cd,.231); assert.ok(result.confidence>.8);
});
