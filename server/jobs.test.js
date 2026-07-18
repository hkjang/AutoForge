import test from 'node:test';
import assert from 'node:assert/strict';
import { JobQueue } from './jobs.js';

test('dependency jobs execute in order',async()=>{const order=[];const q=new JobQueue();q.register('a',async()=>{order.push('a');return 1}).register('b',async()=>{order.push('b');return 2});const a=q.enqueue({type:'a'});q.enqueue({type:'b',dependsOn:[a.id]});await q.tick();await q.tick();assert.deepEqual(order,['a','b']);assert.ok(q.jobs.every(x=>x.status==='complete'))});
test('retryable failure is retried and completes',async()=>{let attempt=0;const q=new JobQueue();q.register('flaky',async()=>{if(attempt++===0){const e=new Error('temporary');e.type='simulation_failure';throw e}return'ok'});const j=q.enqueue({type:'flaky',maxAttempts:2});await q.tick();assert.equal(j.status,'queued');await q.tick();assert.equal(j.status,'complete');assert.equal(j.attempts,2)});
test('failed dependency blocks downstream work',async()=>{const q=new JobQueue();q.register('bad',async()=>{const e=new Error('unsafe');e.type='safety_failure';e.retryable=false;throw e});const a=q.enqueue({type:'bad'});const b=q.enqueue({type:'missing',dependsOn:[a.id]});await q.tick();await q.tick();assert.equal(a.status,'blocked');assert.equal(b.status,'blocked');assert.equal(b.error.type,'dependency_failure')});
test('running jobs recover to queue after restart',()=>{const jobs=[{id:'1',status:'running'}];new JobQueue({jobs});assert.equal(jobs[0].status,'queued');assert.ok(jobs[0].recoveredAt)});
