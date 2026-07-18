import test from 'node:test';
import assert from 'node:assert/strict';
import { createBomRevision, validateBomItems } from './bomRevision.js';
const db=()=>({projects:[{id:'p',organizationId:'o'}],bom:[],bomRevisions:[],suppliers:[{id:'s',organizationId:'o'}]});
const items=[{partNo:'BAT-1',description:'Battery',system:'Energy',qty:1,unitCost:100,status:'approved',supplierIds:['s']}];
test('BOM revisions are immutable, hashed and linked to their parent',()=>{const x=db(),a=createBomRevision(x,{projectId:'p',items,changeNote:'base'},{actor:'u',organizationId:'o',clock:()=> '2026-01-01T00:00:00Z'}),b=createBomRevision(x,{projectId:'p',items:[{...items[0],unitCost:90}],changeNote:'quote'},{actor:'u',organizationId:'o'});assert.equal(a.revision.revision,1);assert.equal(b.revision.parentId,a.revision.id);assert.equal(b.revision.parentSha256,a.revision.sha256);assert.match(b.revision.sha256,/^[a-f0-9]{64}$/);assert.equal(x.bom.length,2);assert.equal(b.items[0].unitCost,90)});
test('BOM validation rejects duplicates, invalid values and unavailable suppliers',()=>{const errors=validateBomItems([{...items[0],qty:0,supplierIds:['bad']},{...items[0]}],new Set(['s']));assert.ok(errors.some(x=>x.code==='duplicate_part_number'));assert.ok(errors.some(x=>x.code==='positive_integer_required'));assert.ok(errors.some(x=>x.code==='supplier_unavailable'))});
