import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { downsample, TimeSeriesStore } from './timeSeries.js';

const calibration={id:'CAL-SENSOR',validUntil:'2099-01-01T00:00:00Z'};
test('telemetry ingest validates, deduplicates and persists samples',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'af-ts-test-'));try{const streams=[],store=new TimeSeriesStore({root,streams}),input={projectId:'p',vehicleId:'v',sensorId:'temp-1',signal:'battery.temp',unit:'C',calibration,samples:[{timestamp:'2026-01-01T00:00:00Z',value:30,sequence:1},{timestamp:'2026-01-01T00:00:01Z',value:31,sequence:2}]};assert.equal(store.ingest(input).accepted,2);const duplicate=store.ingest({...input,samples:[input.samples[0]]});assert.equal(duplicate.rejected[0].reason,'duplicate');const result=store.query({projectId:'p',vehicleId:'v',signal:'battery.temp'});assert.equal(result.total,2);assert.equal(result.summary.avg,30.5);assert.equal(streams[0].sampleCount,2)}finally{fs.rmSync(root,{recursive:true,force:true})}});
test('expired calibration rejects sensor batch',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'af-ts-test-'));try{const store=new TimeSeriesStore({root});assert.throws(()=>store.ingest({projectId:'p',vehicleId:'v',sensorId:'s',signal:'x',calibration:{validUntil:'2020-01-01'},samples:[{timestamp:'2026-01-01',value:1}]}),/expired/)}finally{fs.rmSync(root,{recursive:true,force:true})}});
test('downsampling preserves extrema metadata',()=>{const samples=Array.from({length:100},(_,i)=>({timestamp:new Date(1767225600000+i*1000).toISOString(),value:i,quality:{valid:true}}));const result=downsample(samples,10);assert.ok(result.length<=10);assert.equal(result[0].min,0);assert.equal(result.at(-1).max,99)});
