import test from 'node:test';
import assert from 'node:assert/strict';
import { createVehiclePreview } from './designPreview.js';
test('vehicle preview is self-contained SVG with dimensions',()=>{const svg=createVehiclePreview({id:'D',name:'Urban',parameters:{length:3990,wheelbase:2630,height:1570,wheel:19}});assert.match(svg,/^<svg/);assert.match(svg,/LENGTH 3990 mm/);assert.match(svg,/WHEELBASE 2630 mm/);assert.doesNotMatch(svg,/<script/)});
test('preview escapes design labels',()=>assert.ok(createVehiclePreview({id:'<x>',name:'A&B'}).includes('A&amp;B')));
