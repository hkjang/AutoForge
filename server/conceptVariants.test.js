import test from 'node:test';
import assert from 'node:assert/strict';
import { generateConceptVariants } from './conceptVariants.js';
const parent={id:'d',projectId:'p',version:'0.8',iteration:4,parameters:{length:3990,wheelbase:2630,height:1570,wheel:19,capacity:78.4}};
test('concept exploration creates six diverse, bounded and traceable design revisions',()=>{const db={designs:[],changes:[]},result=generateConceptVariants(db,parent,{actor:'u'});assert.equal(result.count,6);assert.equal(new Set(result.variants.map(x=>JSON.stringify(x.parameters))).size,6);assert.ok(result.variants.every(x=>x.parentDesignId==='d'&&x.projectId==='p'&&x.metrics.range>0));assert.ok(result.variants.every(x=>x.parameters.wheelbase<=x.parameters.length-600));assert.equal(db.changes.length,6)});
test('concept exploration is bounded to supported diversity profiles',()=>{const db={designs:[],changes:[]};assert.equal(generateConceptVariants(db,parent,{count:99}).count,6);assert.equal(generateConceptVariants(db,parent,{count:2}).count,2)});
