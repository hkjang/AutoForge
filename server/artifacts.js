import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export class ArtifactStore{
  constructor({root=process.env.AUTOFORGE_ARTIFACT_DIR||path.resolve('data','artifacts'),metadata=[]}={}){this.root=root;this.metadata=metadata;fs.mkdirSync(root,{recursive:true})}
  put(buffer,{projectId,organizationId,name='artifact.bin',mimeType='application/octet-stream',kind='generic',createdBy='system'}={}){if(!Buffer.isBuffer(buffer))throw new TypeError('artifact content must be a Buffer');const sha256=crypto.createHash('sha256').update(buffer).digest('hex'),dir=path.join(this.root,sha256.slice(0,2)),file=path.join(dir,sha256);fs.mkdirSync(dir,{recursive:true});if(!fs.existsSync(file)){const tmp=`${file}.${process.pid}.tmp`;fs.writeFileSync(tmp,buffer,{flag:'wx'});fs.renameSync(tmp,file)}let item=this.metadata.find(x=>x.sha256===sha256&&x.projectId===projectId);if(!item){item={id:randomUUID(),projectId,organizationId,name,mimeType,kind,size:buffer.length,sha256,createdBy,createdAt:new Date().toISOString()};this.metadata.unshift(item)}return item}
  find(id){return this.metadata.find(x=>x.id===id)}
  pathFor(item){if(!item||!/^[a-f0-9]{64}$/.test(item.sha256))throw new Error('invalid_artifact');return path.join(this.root,item.sha256.slice(0,2),item.sha256)}
  verify(item){const file=this.pathFor(item);if(!fs.existsSync(file))return false;return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')===item.sha256}
  stream(item){return fs.createReadStream(this.pathFor(item))}
}
