import test from 'node:test';
import assert from 'node:assert/strict';
import { bomSummary, organizationSuppliers, projectBom } from './bomScope.js';
const db={bom:[{partNo:'a',projectId:'p1',revision:1},{partNo:'a2',projectId:'p1',revision:2},{partNo:'b',projectId:'p2',revision:1}],suppliers:[{id:'s1',organizationId:'o1'},{id:'s2',organizationId:'o2'}]};
test('active BOM selects latest revision inside exact project',()=>{assert.deepEqual(projectBom(db,'p1').map(x=>x.partNo),['a2']);assert.deepEqual(projectBom(db,'p2').map(x=>x.partNo),['b']);assert.deepEqual(projectBom(db,'unknown'),[])});
test('BOM summary exposes revision lineage without cross-project rows',()=>assert.deepEqual(bomSummary(db,'p1'),{projectId:'p1',activeRevision:2,revisions:[2,1],itemCount:1}));
test('supplier catalog is isolated by organization',()=>assert.deepEqual(organizationSuppliers(db,'o2').map(x=>x.id),['s2']));
