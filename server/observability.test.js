import test from 'node:test';
import assert from 'node:assert/strict';
import { platformMetrics, readiness } from './observability.js';

test('metrics aggregate queue reliability',()=>{const db={jobs:[{status:'complete',startedAt:'2026-01-01T00:00:00Z',completedAt:'2026-01-01T00:00:01Z'},{status:'failed'}],jobEvents:[],runs:[],calibrations:[],knowledge:[],audit:[]};const m=platformMetrics(db);assert.equal(m.queue.successRate,.5);assert.equal(m.queue.avgDurationMs,1000)});
test('readiness requires project and active model',()=>{assert.equal(readiness({projects:[],modelRegistry:[],jobs:[]}).ready,false);assert.equal(readiness({projects:[{}],modelRegistry:[{status:'active'}],jobs:[]}).ready,true)});
