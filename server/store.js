import { randomUUID } from 'node:crypto';

export const now = () => new Date().toISOString();
export const db = {
  organizations: [{id:'org-autoforge',name:'AutoForge Mobility Lab',slug:'autoforge'}], users: [], sessions: [], artifacts: [], sensorStreams: [], robotCommands: [], notifications: [], manufacturingEvaluations: [], complianceAssessments: [], bomRevisions: [], improvementRuns: [], platformReleases: [], designReleases: [], engineExecutions: [], optimizationRuns: [], requirementBaselines: [], requirementVerifications: [], verificationTasks: [], architectures: [],
  robotCells: [{id:'CELL-A-01',projectId:'urban-e04',name:'Prototype Cell A',state:'idle',interlocks:{emergencyStop:true,cellClear:true,guardClosed:true,sensorsHealthy:true},updatedAt:now()}],
  projects: [{ id:'urban-e04', organizationId:'org-autoforge', code:'URBAN E04', name:'Urban Flow', status:'active', version:'0.8', updatedAt:now() }],
  requirements: [
    {id:'REQ-001',projectId:'urban-e04',category:'package',title:'4인승 도심형 전기차',operator:'=',target:4,unit:'seat',actual:4,status:'pass',priority:'must'},
    {id:'REQ-002',projectId:'urban-e04',category:'dimension',title:'전장',operator:'≤',target:4000,unit:'mm',actual:3990,status:'pass',priority:'must'},
    {id:'REQ-003',projectId:'urban-e04',category:'performance',title:'1회 충전 주행거리',operator:'≥',target:400,unit:'km',actual:418,status:'pass',priority:'must'},
    {id:'REQ-004',projectId:'urban-e04',category:'cost',title:'제조원가',operator:'≤',target:30,unit:'M KRW',actual:28.6,status:'pass',priority:'must'},
    {id:'REQ-005',projectId:'urban-e04',category:'aero',title:'공기저항 계수',operator:'≤',target:.235,unit:'Cd',actual:.231,status:'pass',priority:'should'}
  ],
  designs: [{id:'AF-C04',projectId:'urban-e04',version:'0.8',name:'Balanced',iteration:8,parameters:{length:3990,wheelbase:2630,height:1570,wheel:19},metrics:{range:418,cost:28.6,cd:.231,weight:1628},score:91,status:'candidate',createdAt:now()}],
  simulations: [
    {id:'SIM-CFD-024',projectId:'urban-e04',designId:'AF-C04',type:'aero',name:'외부 유동 CFD',status:'running',progress:76,result:null},
    {id:'SIM-THM-018',projectId:'urban-e04',designId:'AF-C04',type:'thermal',name:'배터리 급속 충전',status:'running',progress:43,result:null},
    {id:'SIM-FEA-031',projectId:'urban-e04',designId:'AF-C04',type:'structure',name:'차체 비틀림 강성',status:'complete',progress:100,result:{stiffness:28740,unit:'Nm/deg'}}
  ],
  agents: [
    {id:'chief',name:'수석 설계',role:'architecture',status:'idle',tools:['design.graph','requirements.read']},
    {id:'package',name:'패키징',role:'package',status:'idle',tools:['cad.parameters','package.solve']},
    {id:'aero',name:'공력',role:'aero',status:'idle',tools:['simulation.cfd']},
    {id:'cost',name:'제조·원가',role:'manufacturing',status:'idle',tools:['bom.read','cost.estimate']}
  ],
  runs: [], jobs: [], jobEvents: [], approvals: [], changes: [], audit: [], calibrations: [],
  modelRegistry: [{id:'MODEL-AERO-001',domain:'aero',version:'1.0.0',parameters:{bias:0,scale:1},confidence:.88,status:'active',updatedAt:now()}],
  goals: [
    {id:'MISSION-001',projectId:'urban-e04',level:'L0',name:'자동차 개발 자율화',status:'active',parentId:null,progress:68},
    {id:'VEHICLE-001',projectId:'urban-e04',level:'L1',name:'도심형 전기차 개발',status:'active',parentId:'MISSION-001',progress:68},
    {id:'RANGE-001',projectId:'urban-e04',level:'L2',name:'1회 충전 주행거리',target:450,minimumAcceptance:420,actual:418,unit:'km',priority:'critical',weight:.18,confidenceRequired:.95,confidence:.89,ownerAgent:'energy_architect',humanApprovalRequired:true,parentId:'VEHICLE-001',status:'at_risk',verification:{method:'virtual_and_physical',simulation:'energy_consumption_cycle',physicalTest:'certified_drive_cycle'}},
    {id:'COST-001',projectId:'urban-e04',level:'L2',name:'제조원가',target:30,minimumAcceptance:30,actual:28.6,unit:'M KRW',priority:'critical',weight:.16,confidenceRequired:.9,confidence:.92,ownerAgent:'cost_architect',humanApprovalRequired:true,parentId:'VEHICLE-001',status:'pass'},
    {id:'SAFETY-001',projectId:'urban-e04',level:'L2',name:'중대 안전 위반',target:0,minimumAcceptance:0,actual:0,unit:'case',priority:'critical',weight:0,confidenceRequired:.99,confidence:.97,ownerAgent:'safety_reviewer',humanApprovalRequired:true,parentId:'VEHICLE-001',status:'pass'},
    {id:'BATTERY-001',projectId:'urban-e04',level:'L3',name:'배터리 팩 중량',target:450,minimumAcceptance:470,actual:462,unit:'kg',priority:'must',weight:.08,confidenceRequired:.9,confidence:.91,ownerAgent:'battery_architect',parentId:'RANGE-001',status:'pass'},
    {id:'AERO-001',projectId:'urban-e04',level:'L3',name:'공기저항 계수',target:.225,minimumAcceptance:.235,actual:.231,unit:'Cd',priority:'must',weight:.09,confidenceRequired:.9,confidence:.91,ownerAgent:'aero_engineer',parentId:'RANGE-001',status:'pass'},
    {id:'TASK-AERO-020',projectId:'urban-e04',level:'L4',name:'공력 후보 20개 생성',target:20,actual:14,unit:'candidate',priority:'work',ownerAgent:'aero_engineer',parentId:'AERO-001',status:'running'}
  ],
  loops: [
    {id:'requirements',name:'요구사항 루프',speed:'event',status:'complete',progress:100,exitCondition:'요구사항 승인',iteration:3,maxIterations:5},
    {id:'generation',name:'설계 생성 루프',speed:'inner',status:'running',progress:72,exitCondition:'후보 다양성과 품질 충족',iteration:8,maxIterations:20},
    {id:'virtual',name:'가상 검증 루프',speed:'middle',status:'running',progress:63,exitCondition:'가상 검증 통과',iteration:4,maxIterations:12},
    {id:'manufacturing',name:'제조 검증 루프',speed:'middle',status:'waiting',progress:28,exitCondition:'제조 규칙 통과',iteration:1,maxIterations:6},
    {id:'robot',name:'로봇 시험 루프',speed:'outer',status:'blocked',progress:0,exitCondition:'실물 시험 통과',iteration:0,maxIterations:5,blocker:'S4 현장 승인 필요'},
    {id:'twin',name:'디지털 트윈 루프',speed:'outer',status:'waiting',progress:12,exitCondition:'오차 5% 이하',iteration:2,maxIterations:10},
    {id:'field',name:'운행 학습 루프',speed:'outer',status:'waiting',progress:0,exitCondition:'차세대 설계 반영',iteration:0,maxIterations:null},
    {id:'platform',name:'플랫폼 개선 루프',speed:'middle',status:'waiting',progress:0,exitCondition:'품질 게이트 통과',iteration:0,maxIterations:5},
    {id:'safety',name:'안전 거버넌스 루프',speed:'continuous',status:'running',progress:100,exitCondition:'위험 허용 기준 충족',iteration:142,maxIterations:null}
  ],
  projectStates: {'urban-e04':{state:'virtual_validation',history:[{from:'designing',to:'virtual_validation',at:now(),evidence:['AF-C04','SIM-FEA-031']}]}},
  evidence: [{id:'EVD-001',projectId:'urban-e04',type:'simulation',sourceId:'SIM-FEA-031',claim:'차체 비틀림 강성 목표 충족',confidence:.94,createdAt:now()}],
  knowledge: [{id:'KN-001',type:'simulation_bias',title:'컴팩트 EV CFD 항력 편향',tags:['aero','urban-ev'],confidence:.88,reuseCount:4,sourceProjectId:'urban-e04'}],
  bom: [
    {partNo:'AF-BAT-001',projectId:'urban-e04',revision:1,description:'Battery pack assembly',system:'Energy',qty:1,unitCost:8420000,status:'approved',supplierIds:['SUP-001']},
    {partNo:'AF-DRV-014',projectId:'urban-e04',revision:1,description:'Front e-Axle 160kW',system:'Drive',qty:1,unitCost:3180000,status:'approved',supplierIds:['SUP-002','SUP-003']},
    {partNo:'AF-BDY-108',projectId:'urban-e04',revision:1,description:'Front subframe',system:'Body',qty:1,unitCost:486000,status:'review',supplierIds:['SUP-003']},
    {partNo:'AF-THM-032',projectId:'urban-e04',revision:1,description:'Integrated heat pump',system:'Thermal',qty:1,unitCost:728000,status:'risk',supplierIds:['SUP-004']}
  ],
  suppliers: [{id:'SUP-001',organizationId:'org-autoforge',name:'K-Cell Systems',country:'KR',risk:'medium',leadTimeDays:84,qualityPpm:42},{id:'SUP-002',organizationId:'org-autoforge',name:'Motive Drive',country:'KR',risk:'low',leadTimeDays:56,qualityPpm:18},{id:'SUP-003',organizationId:'org-autoforge',name:'Hanul Mobility Parts',country:'KR',risk:'low',leadTimeDays:42,qualityPpm:24},{id:'SUP-004',organizationId:'org-autoforge',name:'ThermaX',country:'DE',risk:'high',leadTimeDays:126,qualityPpm:67}]
};

export function createRun(projectId, prompt) {
  const run={id:randomUUID(),projectId,prompt,status:'running',progress:8,stage:'requirements',startedAt:now(),events:[{at:now(),type:'run.started',message:'요구사항 분석 시작'}]};
  db.runs.unshift(run); db.agents.filter(a=>a.enabled!==false).forEach(a=>a.status='running'); return run;
}
export function advanceRun(run){
  if(!run||run.status!=='running') return run;
  run.progress=Math.min(100,run.progress+23);
  const stages=['requirements','architecture','generation','simulation','review','complete'];
  run.stage=stages[Math.min(stages.length-1,Math.floor(run.progress/20))];
  run.events.push({at:now(),type:`run.${run.stage}`,message:`${run.stage} 단계 처리 완료`});
  if(run.progress===100){run.status='complete';run.completedAt=now();db.agents.filter(a=>a.enabled!==false).forEach(a=>a.status='idle');}
  return run;
}
