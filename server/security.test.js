import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessProject } from './security.js';

const db={projects:[{id:'a',organizationId:'org-a'},{id:'b',organizationId:'org-b'}]};
test('authenticated organization admin cannot cross tenant boundary',()=>{assert.equal(canAccessProject(db,{authenticated:true,role:'admin',organizationId:'org-a'},'a'),true);assert.equal(canAccessProject(db,{authenticated:true,role:'admin',organizationId:'org-a'},'b'),false)});
test('local development admin can inspect seed projects',()=>assert.equal(canAccessProject(db,{authenticated:false,role:'admin'},'b'),true));
