import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSseFrames } from '../src/api.js';

test('authenticated fetch stream parser preserves partial SSE frames',()=>{const events=[];let remainder=parseSseFrames('event: job\ndata: {"id":1}\n\nevent: ru',(...args)=>events.push(args));assert.deepEqual(events,[[{id:1},'job']]);remainder=parseSseFrames(`${remainder}n\ndata: {"status":"needs_review"}\n\n`,(...args)=>events.push(args));assert.deepEqual(events[1],[{status:'needs_review'},'run']);assert.equal(remainder,'')});
test('SSE parser joins multiple data lines',()=>{const events=[];parseSseFrames('event: snapshot\ndata: {"ok":\ndata: true}\n\n',(...args)=>events.push(args));assert.deepEqual(events,[[{ok:true},'snapshot']])});
