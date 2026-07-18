import { randomUUID } from 'node:crypto';
import { assessSimToReal } from './governance.js';

export function calibrateModel(db,{projectId='urban-e04',domain='aero',modelId,predicted,actual,testId,designId}){
  if(!Number.isFinite(predicted)||!Number.isFinite(actual))throw new TypeError('predicted and actual must be finite numbers');
  const assessment=assessSimToReal(predicted,actual),model=db.modelRegistry.find(m=>m.id===modelId)||db.modelRegistry.find(m=>m.domain===domain);if(!model)throw new Error(`model_not_found:${domain}`);
  const residual=actual-predicted,learningRate=assessment.level==='trusted'?.05:assessment.level==='calibrate'?.25:assessment.level==='additional_test'?.1:0;
  const previous={...model.parameters};if(learningRate>0)model.parameters.bias=Number(((model.parameters.bias||0)+residual*learningRate).toFixed(6));
  model.confidence=Number(Math.max(.1,Math.min(.99,model.confidence+(assessment.level==='trusted'?.02:assessment.level==='calibrate'?.005:-.05))).toFixed(3));model.updatedAt=new Date().toISOString();
  const record={id:randomUUID(),projectId,domain,modelId:model.id,designId,testId,predicted,actual,residual,errorPercent:assessment.errorPercent,decision:assessment.level,previousParameters:previous,newParameters:{...model.parameters},confidence:model.confidence,createdAt:model.updatedAt};db.calibrations.unshift(record);
  if(assessment.level!=='trusted')db.knowledge.unshift({id:`KN-${randomUUID().slice(0,8)}`,type:'model_calibration',title:`${domain} 모델 ${assessment.level}`,tags:[domain,'sim-to-real'],confidence:model.confidence,reuseCount:0,sourceProjectId:projectId,calibrationId:record.id});return record;
}
