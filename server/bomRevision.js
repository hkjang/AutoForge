import crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';
import { bomSummary, organizationSuppliers, projectBom } from './bomScope.js';

const allowedSystems=new Set(['Energy','Drive','Body','Thermal','E/E','Chassis','Interior','Software']);
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])])):value;
const canonical=value=>JSON.stringify(ordered(value));
export function validateBomItems(items,supplierIds){
  const errors=[],seen=new Set();if(!Array.isArray(items)||!items.length)errors.push({field:'items',code:'items_required'});
  for(const[itemIndex,item]of(items||[]).entries()){
    const partNo=String(item.partNo||'').trim().toUpperCase();if(!/^[A-Z0-9][A-Z0-9._-]{1,39}$/.test(partNo))errors.push({itemIndex,field:'partNo',code:'invalid_part_number'});if(seen.has(partNo))errors.push({itemIndex,field:'partNo',code:'duplicate_part_number'});seen.add(partNo);
    if(!String(item.description||'').trim())errors.push({itemIndex,field:'description',code:'description_required'});if(!allowedSystems.has(item.system))errors.push({itemIndex,field:'system',code:'invalid_system'});
    if(!Number.isInteger(Number(item.qty))||Number(item.qty)<=0)errors.push({itemIndex,field:'qty',code:'positive_integer_required'});if(!Number.isFinite(Number(item.unitCost))||Number(item.unitCost)<0)errors.push({itemIndex,field:'unitCost',code:'nonnegative_cost_required'});
    for(const id of item.supplierIds||[])if(!supplierIds.has(id))errors.push({itemIndex,field:'supplierIds',code:'supplier_unavailable',value:id});
  }return errors;
}
export function createBomRevision(db,{projectId,items,changeNote},{actor='system',organizationId,clock=()=>new Date().toISOString()}={}){
  const project=(db.projects||[]).find(x=>x.id===projectId&&(!organizationId||x.organizationId===organizationId));if(!project)throw Object.assign(new Error('project_not_found'),{code:'project_not_found'});
  const suppliers=organizationSuppliers(db,project.organizationId),errors=validateBomItems(items,new Set(suppliers.map(x=>x.id)));if(errors.length)throw Object.assign(new Error('bom_invalid'),{code:'bom_invalid',details:errors});
  const summary=bomSummary(db,projectId),parent=(db.bomRevisions||[]).find(x=>x.projectId===projectId&&x.revision===summary.activeRevision),revision=summary.activeRevision+1,normalized=items.map(x=>({partNo:String(x.partNo).trim().toUpperCase(),projectId,revision,description:String(x.description).trim(),system:x.system,qty:Number(x.qty),unitCost:Number(x.unitCost),status:['approved','review','risk'].includes(x.status)?x.status:'review',supplierIds:[...new Set(x.supplierIds||[])]})).sort((a,b)=>a.partNo.localeCompare(b.partNo));
  const record={id:`BOMREV-${randomUUID().slice(0,8)}`,projectId,revision,parentId:parent?.id||null,parentSha256:parent?.sha256||null,itemCount:normalized.length,directCost:normalized.reduce((n,x)=>n+x.qty*x.unitCost,0),changeNote:String(changeNote||'BOM revision').trim().slice(0,240),createdAt:clock(),createdBy:actor};record.sha256=crypto.createHash('sha256').update(canonical({projectId,revision,parentSha256:record.parentSha256,items:normalized.map(({projectId:_,...x})=>x)})).digest('hex');
  db.bom??=[];db.bom.push(...normalized);db.bomRevisions??=[];db.bomRevisions.unshift(record);return{revision:record,items:projectBom(db,projectId)};
}
