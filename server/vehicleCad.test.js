import test from 'node:test';
import assert from 'node:assert/strict';
import { createObj, createOpenScad, meshMetrics, normalizeVehicleParameters } from './vehicleCad.js';

test('vehicle parameters are bounded to manufacturable envelope',()=>{const p=normalizeVehicleParameters({length:99999,wheelbase:-1,wheel:100});assert.equal(p.length,6000);assert.equal(p.wheelbase,1800);assert.equal(p.wheel,26)});
test('OpenSCAD output is parametric and contains wheel cutouts',()=>{const cad=createOpenScad({length:3990,wheelbase:2630});assert.match(cad,/length=3990/);assert.match(cad,/wheelbase=2630/);assert.match(cad,/difference\(\)/);assert.doesNotMatch(cad,/undefined|NaN/)});
test('OBJ output is a nonempty triangulated closed body mesh',()=>{const obj=createObj({length:3990,width:1820,height:1570}),metrics=meshMetrics(obj);assert.equal(metrics.vertices,110);assert.equal(metrics.triangles,216);assert.equal(metrics.watertight,true);assert.match(obj,/^v -/m);assert.match(obj,/^f \d+ \d+ \d+$/m)});
