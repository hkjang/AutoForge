import { randomUUID } from 'node:crypto';
import { assessRelease } from './release.js';

const stateSequence=['goal_definition','designing','virtual_validation','manufacturing_review','prototyping','physical_test','approval_pending','released'];

export function assessProject(db,projectId,designId){
  const candidates=db.designs.filter(x=>x.projectId===projectId),releasedDesignId=db.designReleases.filter(x=>x.projectId===projectId&&x.status==='released').at(-1)?.designId,rank=design=>db.simulations.filter(x=>x.projectId===projectId&&x.designId===design.id&&x.status==='complete').length+(db.manufacturingEvaluations.some(x=>x.projectId===projectId&&x.designId===design.id&&x.manufacturable)?10:0)+(db.physicalTests.some(x=>x.projectId===projectId&&x.designId===design.id&&x.status==='complete')?20:0)+(db.approvals.some(x=>x.projectId===projectId&&x.targetId===design.id&&x.grade==='S5'&&x.status==='approved')?40:0),design=designId?candidates.find(x=>x.id===designId):candidates.find(x=>x.id===releasedDesignId)||candidates.map((x,index)=>({x,index,rank:rank(x)})).sort((a,b)=>b.rank-a.rank||b.index-a.index)[0]?.x;
  if(!design)return{projectId,designId:null,complete:false,score:0,checks:{requirements:false,safety:false,simulation:false,manufacturing:false,physical:false,traceability:false,approval:false},failed:['requirements','safety','simulation','manufacturing','physical','traceability','approval'],evidence:{}};
  const release=assessRelease(db,projectId,design.id),checks={requirements:release.checks.requirements,safety:release.checks.safety,simulation:release.checks.simulations,manufacturing:release.checks.manufacturing,physical:release.checks.physical,traceability:release.checks.traceability,approval:release.checks.approval},passed=Object.values(checks).filter(Boolean).length;
  return{projectId,designId:design.id,complete:Object.values(checks).every(Boolean),score:Math.round(passed/Object.keys(checks).length*100),checks,failed:Object.entries(checks).filter(([,value])=>!value).map(([key])=>key),evidence:{requirements:db.requirements.filter(x=>x.projectId===projectId&&['must','critical'].includes(x.priority)).map(x=>x.id),simulations:release.simulations.filter(x=>x.status==='complete').map(x=>x.id),manufacturing:release.manufacturing?[release.manufacturing.id]:[],physical:release.physical.map(x=>x.id),approval:release.approval?[release.approval.id]:[],traceability:release.graph.stats.traceability},releaseReady:release.releasable};
}

export function synchronizeProjectState(db,projectId,designId,{actor='system:evidence-sync',at=()=>new Date().toISOString()}={}){
  const assessment=assessProject(db,projectId,designId),machine=db.projectStates[projectId]??={state:'goal_definition',history:[]};let target='goal_definition';
  if(assessment.designId)target='virtual_validation';
  if(assessment.checks.simulation)target='manufacturing_review';
  if(assessment.checks.manufacturing)target='prototyping';
  if(assessment.checks.physical)target='approval_pending';
  if(db.designReleases.some(x=>x.projectId===projectId&&x.designId===assessment.designId&&x.status==='released'))target='released';
  let currentIndex=stateSequence.indexOf(machine.state),targetIndex=stateSequence.indexOf(target);if(currentIndex<0)currentIndex=0;
  while(currentIndex<targetIndex){const from=stateSequence[currentIndex],to=stateSequence[currentIndex+1],evidence=evidenceForTransition(to,assessment);machine.history.push({id:randomUUID(),from,to,at:at(),actor,evidence,automatic:true});machine.state=to;currentIndex++}
  machine.assessment={designId:assessment.designId,score:assessment.score,checks:assessment.checks,synchronizedAt:at()};return{machine,assessment};
}

function evidenceForTransition(state,assessment){
  if(state==='designing'||state==='virtual_validation')return[assessment.designId].filter(Boolean);
  if(state==='manufacturing_review')return assessment.evidence.simulations;
  if(state==='prototyping')return assessment.evidence.manufacturing;
  if(state==='physical_test'||state==='approval_pending')return assessment.evidence.physical;
  if(state==='released')return assessment.evidence.approval;
  return[];
}
