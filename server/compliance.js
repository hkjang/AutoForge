import crypto from 'node:crypto';
import { randomUUID } from 'node:crypto';
import { buildKnowledgeGraph } from './knowledgeGraph.js';
import { activeRequirements } from './requirementLifecycle.js';

export const PRECOMPLIANCE_NOTICE='AutoForge 내부 사전 적합성 평가이며 공인 인증, 형식 승인 또는 법적 적합성 인증을 대체하지 않습니다.';
const status=(available,pass)=>available?(pass?'pass':'fail'):'unverified';
const rule=(id,title,severity,actual,threshold,evidenceIds,available,pass)=>({id,title,severity,status:status(available,pass),actual:available?actual:null,threshold,evidenceIds:[...new Set(evidenceIds.filter(Boolean))]});

export function evaluateCompliance(db,{projectId,designId}){
  const design=(db.designs||[]).find(x=>x.projectId===projectId&&x.id===designId);
  if(!design)throw Object.assign(new Error('design_not_found'),{code:'design_not_found'});
  const simulations=(db.simulations||[]).filter(x=>x.projectId===projectId&&x.designId===designId&&x.status==='complete');
  const byType=type=>simulations.filter(x=>x.type===type).at(-1),thermal=byType('thermal'),structure=byType('structure');
  const length=Number(design.parameters?.length),temperature=Number(thermal?.result?.peakCellTempC),stiffness=Number(structure?.result?.torsionalStiffnessNmPerDeg??structure?.result?.stiffness);
  const requiredTypes=['aero','thermal','structure','range'],missingTypes=requiredTypes.filter(type=>!byType(type));
  const requirements=activeRequirements(db,projectId).filter(x=>['must','critical'].includes(x.priority)),graph=buildKnowledgeGraph(db,projectId);
  const requirementEvidence=(db.requirementVerifications||[]).filter(x=>x.projectId===projectId&&requirements.some(r=>r.id===x.requirementId)&&x.status==='pass').flatMap(x=>[x.id,x.evidenceId]);
  const rules=[
    rule('AF-PRE-DIM-001','차량 전장 패키징 한계','critical',length,'≤ 4000 mm',[design.id],Number.isFinite(length),length<=4000),
    rule('AF-PRE-SIM-001','필수 가상 검증 증거 완전성','critical',missingTypes.length?`누락: ${missingTypes.join(', ')}`:'4/4 완료','aero · thermal · structure · range 완료',requiredTypes.map(type=>byType(type)?.id),true,missingTypes.length===0),
    rule('AF-PRE-THM-001','배터리 열 안전 여유','critical',temperature,'≤ 55 °C',[thermal?.id],Number.isFinite(temperature),temperature<=55),
    rule('AF-PRE-STR-001','차체 비틀림 강성','high',stiffness,'≥ 25,000 Nm/deg',[structure?.id],Number.isFinite(stiffness),stiffness>=25000),
    rule('AF-PRE-TRC-001','필수 요구사항 충족 및 추적성','critical',`${requirements.filter(x=>x.status==='pass').length}/${requirements.length} · trace ${graph.stats.traceability}`,'필수 요구사항 100% · trace 1.0',[...requirements.map(x=>x.id),...requirementEvidence],requirements.length>0,requirements.length>0&&requirements.every(x=>x.status==='pass')&&graph.stats.traceability===1)
  ];
  return{kind:'internal_precompliance',policyVersion:'AF-PRE-1.0',projectId,designId,notice:PRECOMPLIANCE_NOTICE,rules,compliant:rules.every(x=>x.status==='pass'),criticalFailures:rules.filter(x=>x.severity==='critical'&&x.status!=='pass').length,summary:{pass:rules.filter(x=>x.status==='pass').length,fail:rules.filter(x=>x.status==='fail').length,unverified:rules.filter(x=>x.status==='unverified').length,total:rules.length}};
}

export function createComplianceAssessment(db,input,{actor='system',clock=()=>new Date().toISOString()}={}){
  const result=evaluateCompliance(db,input),assessment={id:`CMP-${randomUUID().slice(0,8)}`,...result,createdAt:clock(),createdBy:actor};
  assessment.sha256=crypto.createHash('sha256').update(JSON.stringify({...assessment,sha256:undefined})).digest('hex');
  db.complianceAssessments??=[];db.complianceAssessments.unshift(assessment);return assessment;
}

export function latestCompliance(db,projectId,designId){return(db.complianceAssessments||[]).find(x=>x.projectId===projectId&&x.designId===designId)||null}
