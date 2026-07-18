import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const checksum=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const safeUnlink=file=>{try{fs.unlinkSync(file)}catch(error){if(error.code!=='ENOENT')throw error}};

export function createPersistence(root=process.env.AUTOFORGE_DATA_DIR||path.resolve('data')){
  const dataDir=path.resolve(root),dataFile=path.join(dataDir,'autoforge.json'),sumFile=`${dataFile}.sha256`,previousFile=`${dataFile}.previous`,previousSum=`${previousFile}.sha256`;
  let status={state:'empty',path:dataFile,recovered:false,verified:false};
  const writeDurable=(file,bytes)=>{const fd=fs.openSync(file,'w',0o600);try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd)}finally{fs.closeSync(fd)}};
  const syncDirectory=()=>{try{const fd=fs.openSync(dataDir,'r');try{fs.fsyncSync(fd)}finally{fs.closeSync(fd)}}catch(error){if(!['EINVAL','EPERM','EISDIR'].includes(error.code))throw error}};
  const readGeneration=(file,sum)=>{const bytes=fs.readFileSync(file),expected=fs.existsSync(sum)?fs.readFileSync(sum,'utf8').trim():null,actual=checksum(bytes);if(expected&&expected!==actual){const error=new Error(`persistence checksum mismatch: ${path.basename(file)}`);error.code='PERSISTENCE_CHECKSUM_MISMATCH';throw error}return{data:JSON.parse(bytes.toString('utf8')),verified:Boolean(expected),checksum:actual}};
  const commit=(data,{rotate=true}={})=>{fs.mkdirSync(dataDir,{recursive:true});const bytes=Buffer.from(JSON.stringify(data,null,2)),id=`${process.pid}.${crypto.randomUUID()}`,temp=`${dataFile}.${id}.tmp`,tempSum=`${sumFile}.${id}.tmp`;writeDurable(temp,bytes);writeDurable(tempSum,`${checksum(bytes)}\n`);try{if(rotate&&fs.existsSync(dataFile)){safeUnlink(previousFile);safeUnlink(previousSum);fs.renameSync(dataFile,previousFile);if(fs.existsSync(sumFile))fs.renameSync(sumFile,previousSum)}else if(!rotate){safeUnlink(dataFile);safeUnlink(sumFile)}fs.renameSync(temp,dataFile);fs.renameSync(tempSum,sumFile);syncDirectory();status={state:'healthy',path:dataFile,recovered:false,verified:true,checksum:checksum(bytes),updatedAt:new Date().toISOString()}}finally{safeUnlink(temp);safeUnlink(tempSum)}};
  return{
    hydrate(target){
      if(!fs.existsSync(dataFile)&&!fs.existsSync(previousFile)){status={state:'empty',path:dataFile,recovered:false,verified:false};return false}
      try{const current=readGeneration(dataFile,sumFile);Object.assign(target,current.data);status={state:'healthy',path:dataFile,recovered:false,verified:current.verified,checksum:current.checksum};return true}catch(primaryError){
        try{const previous=readGeneration(previousFile,previousSum);Object.assign(target,previous.data);commit(previous.data,{rotate:false});status={...status,state:'recovered',recovered:true,recoveredFrom:previousFile,primaryError:primaryError.code||primaryError.name};return true}catch(recoveryError){const error=new Error('AutoForge persistence is corrupt and no valid previous generation exists',{cause:recoveryError});error.code='PERSISTENCE_UNRECOVERABLE';error.primary=primaryError;throw error}
      }
    },
    persist:data=>commit(data),
    path:()=>dataFile,
    status:()=>({...status})
  };
}

const defaultPersistence=createPersistence();
export const hydrate=target=>defaultPersistence.hydrate(target);
export const persist=data=>defaultPersistence.persist(data);
export const persistencePath=()=>defaultPersistence.path();
export const persistenceStatus=()=>defaultPersistence.status();
export function persistenceMiddleware(data){return(req,res,next)=>{if(!['POST','PATCH','PUT','DELETE'].includes(req.method))return next();const original=res.json.bind(res);res.json=body=>{if(res.statusCode<400)persist(data);return original(body)};next()}}
