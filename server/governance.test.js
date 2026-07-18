import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSimToReal, canTransition, completionAssessment, safetyDecision } from './governance.js';

test('state transition rejects missing evidence',()=>{assert.equal(canTransition('virtual_validation','manufacturing_review',{mandatoryTestsPassed:false}).allowed,false)});
test('S3 requires two approvals and rejects critical violations',()=>{assert.equal(safetyDecision({grade:'S3',approvals:1}).allowed,false);assert.equal(safetyDecision({grade:'S3',approvals:2,violations:[{severity:'critical'}]}).allowed,false)});
test('sim-to-real error selects calibration response',()=>{assert.equal(assessSimToReal(100,105).level,'calibrate')});
test('completion cannot pass without physical evidence',()=>{const x=completionAssessment({goals:[{priority:'must',status:'pass'}],simulations:[{status:'complete'}],approvals:[{status:'approved'}],manufacturable:true,physicalTestsPassed:false,traceability:1});assert.equal(x.complete,false);assert.ok(x.failed.includes('physical'))});
