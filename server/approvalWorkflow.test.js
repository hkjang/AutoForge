import test from 'node:test';
import assert from 'node:assert/strict';
import { approvalProgress, createApprovalRequest, decideApproval } from './approvalWorkflow.js';

test('S1 request is automatically approved',()=>assert.equal(createApprovalRequest({grade:'S1',requester:'u'}).status,'approved'));
test('S3 requires two people including safety officer',()=>{const a=createApprovalRequest({grade:'S3',requester:'owner'});decideApproval(a,{actorId:'r',role:'reviewer',decision:'approved'});assert.equal(a.status,'pending');decideApproval(a,{actorId:'s',role:'safety_officer',decision:'approved'});assert.equal(a.status,'approved');assert.equal(approvalProgress(a).received,2)});
test('requester cannot approve own change',()=>{const a=createApprovalRequest({grade:'S2',requester:'owner'});assert.throws(()=>decideApproval(a,{actorId:'owner',role:'reviewer',decision:'approved'}),e=>e.code==='separation_of_duties')});
test('one rejection closes approval',()=>{const a=createApprovalRequest({grade:'S5',requester:'owner'});decideApproval(a,{actorId:'r',role:'reviewer',decision:'rejected'});assert.equal(a.status,'rejected')});
test('S4 only accepts site manager role',()=>{const a=createApprovalRequest({grade:'S4',requester:'owner'});assert.throws(()=>decideApproval(a,{actorId:'r',role:'reviewer',decision:'approved'}),e=>e.code==='role_not_eligible');decideApproval(a,{actorId:'site',role:'site_manager',decision:'approved'});assert.equal(a.status,'approved')});
