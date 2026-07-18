import test from 'node:test';
import assert from 'node:assert/strict';
import { SandboxRunner } from './sandbox.js';

test('sandbox rejects unregistered commands',async()=>{const s=new SandboxRunner();await assert.rejects(()=>s.run('bash',['-c','echo unsafe']),e=>e.type==='safety_failure')});
test('sandbox executes allowlisted binary without shell',async()=>{const s=new SandboxRunner().register('node',process.execPath,['-e','process.stdout.write(process.argv[1])']);const out=await s.run('node',['safe-value']);assert.equal(out.success,true);assert.equal(out.stdout,'safe-value')});
test('sandbox enforces output limit',async()=>{const s=new SandboxRunner({maxOutputBytes:10}).register('node',process.execPath,['-e','process.stdout.write("x".repeat(100))']);await assert.rejects(()=>s.run('node'),/output limit/)});
