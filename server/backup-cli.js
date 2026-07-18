#!/usr/bin/env node
import path from 'node:path';
import { createBackup, restoreBackup, verifyBackup } from './backup.js';

const [command,target,...flags]=process.argv.slice(2),dataDir=path.resolve(process.env.AUTOFORGE_DATA_DIR||'data'),artifactDir=path.resolve(process.env.AUTOFORGE_ARTIFACT_DIR||path.join(dataDir,'artifacts')),dataFile=path.join(dataDir,'autoforge.json');
try{let result;if(command==='create'&&target)result=createBackup({dataFile,artifactDir,destination:path.resolve(target)});else if(command==='verify'&&target)result=verifyBackup(path.resolve(target));else if(command==='restore'&&target)result=restoreBackup({source:path.resolve(target),dataDir,artifactDir,force:flags.includes('--force')});else throw new Error('usage: backup-cli.js <create|verify|restore> <path> [--force]');console.log(JSON.stringify(result,null,2));if(result.valid===false)process.exitCode=1}catch(error){console.error(error.message);process.exitCode=1}
