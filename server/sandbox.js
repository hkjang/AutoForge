import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export class SandboxRunner{
  constructor({commands={},timeoutMs=30000,maxOutputBytes=1024*1024}={}){this.commands=new Map(Object.entries(commands));this.timeoutMs=timeoutMs;this.maxOutputBytes=maxOutputBytes}
  register(name,executable,fixedArgs=[]){if(!path.isAbsolute(executable))throw new Error('sandbox executable must be absolute');this.commands.set(name,{executable,fixedArgs});return this}
  list(){return[...this.commands.keys()]}
  run(name,args=[],{stdin='',env={}}={}){const spec=this.commands.get(name);if(!spec)return Promise.reject(Object.assign(new Error(`sandbox command not allowed: ${name}`),{type:'safety_failure'}));if(!Array.isArray(args)||args.some(x=>typeof x!=='string'||x.includes('\0')))return Promise.reject(new Error('invalid arguments'));const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'autoforge-sandbox-'));return new Promise((resolve,reject)=>{const child=spawn(spec.executable,[...(spec.fixedArgs||[]),...args],{cwd,shell:false,env:{PATH:process.env.PATH,LANG:'C.UTF-8',...env},stdio:['pipe','pipe','pipe']});let stdout='',stderr='',size=0,killed=false;const collect=target=>chunk=>{size+=chunk.length;if(size>this.maxOutputBytes){killed=true;child.kill('SIGKILL');return}target(chunk.toString())};child.stdout.on('data',collect(x=>stdout+=x));child.stderr.on('data',collect(x=>stderr+=x));const timer=setTimeout(()=>{killed=true;child.kill('SIGKILL')},this.timeoutMs);child.on('error',error=>{clearTimeout(timer);fs.rmSync(cwd,{recursive:true,force:true});reject(error)});child.on('close',(code,signal)=>{clearTimeout(timer);fs.rmSync(cwd,{recursive:true,force:true});if(killed)return reject(Object.assign(new Error(size>this.maxOutputBytes?'sandbox output limit exceeded':'sandbox timeout'),{type:'platform_failure'}));resolve({name,code,signal,stdout,stderr,success:code===0})});child.stdin.end(stdin)})}
}
