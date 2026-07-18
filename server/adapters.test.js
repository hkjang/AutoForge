import test from 'node:test';
import assert from 'node:assert/strict';
import { AdapterRegistry } from './adapters.js';

test('adapter registry exposes engineering capabilities',()=>{const r=new AdapterRegistry();assert.equal(r.list().length,4);assert.ok(r.list().some(x=>x.capabilities.includes('simulation.aero')))});
test('robot adapter refuses execution without S4 approval',async()=>{const r=new AdapterRegistry();await assert.rejects(()=>r.execute('robot.ros2','robot.test',{}),e=>e.type==='safety_failure')});
test('robot adapter accepts approved interlocked dry run',async()=>{const r=new AdapterRegistry();const out=await r.execute('robot.ros2','robot.test',{approval:{grade:'S4',status:'approved'},interlocks:{emergencyStop:true,cellClear:true}});assert.equal(out.status,'accepted');assert.equal(out.dryRun,true)});
