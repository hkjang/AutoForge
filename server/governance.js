export const transitions={
  goal_definition:['designing'], designing:['virtual_validation'], virtual_validation:['designing','manufacturing_review'], manufacturing_review:['designing','prototyping'], prototyping:['physical_test'], physical_test:['designing','approval_pending'], approval_pending:['designing','released'], released:['field_learning'], field_learning:['next_generation'], next_generation:['designing']
};
export const safetyGrades={S0:{approvals:0,label:'문서'},S1:{approvals:0,label:'UI·비핵심'},S2:{approvals:1,label:'설계 계산'},S3:{approvals:2,label:'안전 설계'},S4:{approvals:1,label:'로봇·실차',role:'site_manager'},S5:{approvals:3,label:'인증·양산',role:'official_committee'}};
export function canTransition(current,next,context={}){
  if(!transitions[current]?.includes(next)) return {allowed:false,reasons:['허용되지 않은 상태 전환']};
  const checks={
    designing:()=>context.goalsApproved,
    virtual_validation:()=>context.cadComplete&&context.bomComplete&&context.controlModelComplete,
    manufacturing_review:()=>context.mandatoryTestsPassed,
    prototyping:()=>context.manufacturable&&context.costPassed,
    physical_test:()=>context.prototypeQualityPassed,
    approval_pending:()=>context.physicalTestsPassed,
    released:()=>context.responsibleApproval
  };
  const ok=checks[next]?checks[next]():true;return {allowed:Boolean(ok),reasons:ok?[]:[`전환 조건 미충족: ${next}`]};
}
export function assessSimToReal(predicted,actual){const error=Math.abs(actual-predicted)/Math.max(Math.abs(actual),1)*100;return {errorPercent:Number(error.toFixed(2)),level:error<=3?'trusted':error<=7?'calibrate':error<=15?'additional_test':'investigate',systematicBias:false};}
export function safetyDecision({grade='S0',approvals=0,violations=[]}){const policy=safetyGrades[grade];const critical=violations.some(v=>v.severity==='critical');return {allowed:!critical&&approvals>=policy.approvals,grade,requiredApprovals:policy.approvals,criticalViolation:critical};}
export function completionAssessment({goals=[],simulations=[],approvals=[],manufacturable=false,physicalTestsPassed=false,traceability=.0}){
  const mandatory=goals.filter(g=>['critical','must'].includes(g.priority));const checks={requirements:mandatory.length>0&&mandatory.every(g=>g.status==='pass'),safety:goals.filter(g=>g.id?.startsWith('SAFETY')).every(g=>g.actual===0),simulation:simulations.some(s=>s.status==='complete'),manufacturing:manufacturable,physical:physicalTestsPassed,traceability:traceability>=1,approval:approvals.some(a=>a.status==='approved')};return {complete:Object.values(checks).every(Boolean),checks,failed:Object.entries(checks).filter(([,v])=>!v).map(([k])=>k)};
}
