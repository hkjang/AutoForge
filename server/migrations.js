export const CURRENT_SCHEMA_VERSION=15;
const migrations=[
  {version:1,name:'initialize-runtime-collections',up:db=>{for(const key of ['jobs','jobEvents','audit','calibrations','artifacts','sessions','users','organizations'])db[key]??=[];db.migrationHistory??=[]}},
  {version:2,name:'add-organization-tenancy',up:db=>{if(!db.organizations.length)db.organizations.push({id:'org-autoforge',name:'AutoForge Mobility Lab',slug:'autoforge'});for(const p of db.projects||[])p.organizationId??='org-autoforge'}},
  {version:3,name:'add-model-registry',up:db=>{db.modelRegistry??=[{id:'MODEL-AERO-001',domain:'aero',version:'1.0.0',parameters:{bias:0,scale:1},confidence:.88,status:'active',updatedAt:new Date().toISOString()}];db.knowledge??=[];db.evidence??=[]}},
  {version:4,name:'add-physical-test-data',up:db=>{db.sensorStreams??=[];db.robotCommands??=[];db.robotCells??=[{id:'CELL-A-01',projectId:'urban-e04',name:'Prototype Cell A',state:'idle',interlocks:{emergencyStop:true,cellClear:true,guardClosed:true,sensorsHealthy:true},updatedAt:new Date().toISOString()}];db.physicalTests??=[]}},
  {version:5,name:'add-manufacturing-and-approval-ops',up:db=>{db.notifications??=[];db.manufacturingEvaluations??=[];db.suppliers??=[];for(const a of db.approvals||[]){a.grade??='S2';a.requester??=a.createdBy;a.decisions??=[];a.requiredApprovals??=a.grade==='S3'?2:a.grade==='S5'?3:['S2','S4'].includes(a.grade)?1:0}}},
  {version:6,name:'add-platform-improvement-pipeline',up:db=>{db.improvementRuns??=[];db.platformReleases??=[]}},
  {version:7,name:'add-design-release-packaging',up:db=>{db.designReleases??=[];db.engineExecutions??=[]}},
  {version:8,name:'add-multi-objective-optimization',up:db=>{db.optimizationRuns??=[]}},
  {version:9,name:'add-requirement-baselines',up:db=>{db.requirementBaselines??=[];db.requirementVerifications??=[];db.verificationTasks??=[];for(const requirement of db.requirements||[]){requirement.logicalId??=requirement.id;requirement.revision??=1}}},
  {version:10,name:'add-vehicle-architecture-revisions',up:db=>{db.architectures??=[]}},
  {version:11,name:'scope-development-loops-to-projects',up:db=>{for(const loop of db.loops||[]){loop.projectId??='urban-e04';loop.kind??=loop.id}}},
  {version:12,name:'scope-agent-registry-to-organizations',up:db=>{for(const agent of db.agents||[]){agent.organizationId??='org-autoforge';agent.role=({architecture:'chief_architect'}[agent.role]||agent.role);agent.tools=(agent.tools||[]).map(x=>x==='simulation.cfd'?'simulation.aero':x);agent.enabled??=true;agent.modelRef??='engineering-agent-v1';agent.promptVersion??='1.0.0';agent.canGenerate??=!['safety','quality'].includes(agent.role);agent.canReview??=['safety','quality'].includes(agent.role)}}},
  {version:13,name:'add-internal-precompliance-evidence',up:db=>{db.complianceAssessments??=[]}},
  {version:14,name:'scope-bom-and-suppliers',up:db=>{for(const item of db.bom||[]){item.projectId??='urban-e04';item.revision??=1}for(const supplier of db.suppliers||[])supplier.organizationId??='org-autoforge'}},
  {version:15,name:'add-bom-revision-lineage',up:db=>{db.bomRevisions??=[]}}
];
export function migrate(db,{clock=()=>new Date().toISOString()}={}){let version=Number(db.schemaVersion||0);const applied=[];for(const migration of migrations){if(migration.version<=version)continue;migration.up(db);db.schemaVersion=migration.version;db.migrationHistory??=[];const record={version:migration.version,name:migration.name,appliedAt:clock()};db.migrationHistory.push(record);applied.push(record);version=migration.version}if(version>CURRENT_SCHEMA_VERSION)throw new Error(`database schema ${version} is newer than supported ${CURRENT_SCHEMA_VERSION}`);return{from:Number(db.schemaVersion||CURRENT_SCHEMA_VERSION)-applied.length,to:db.schemaVersion,applied}}
export function schemaStatus(db){return{current:Number(db.schemaVersion||0),supported:CURRENT_SCHEMA_VERSION,compatible:Number(db.schemaVersion||0)===CURRENT_SCHEMA_VERSION,history:db.migrationHistory||[]}}
