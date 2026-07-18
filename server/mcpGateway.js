import { randomUUID } from 'node:crypto';
import { hasPermission } from './security.js';

export const MCP_PROTOCOL_VERSION='2025-11-25';
const rpcError=(id,code,message,data)=>({jsonrpc:'2.0',id:id??null,error:{code,message,...(data===undefined?{}:{data})}});
const rpcResult=(id,result)=>({jsonrpc:'2.0',id,result});
const toolResult=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value,isError:false});
const toolFailure=error=>({content:[{type:'text',text:error.message||String(error)}],structuredContent:{error:error.code||'tool_execution_failed',details:error.details},isError:true});

export const mcpToolCatalog=[
  {name:'autoforge_project_list',title:'프로젝트 목록',description:'현재 조직에서 접근 가능한 차량 개발 프로젝트를 조회합니다.',permission:null,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{},additionalProperties:false}},
  {name:'autoforge_requirement_refine',title:'요구사항 정제',description:'한국어 자연어 차량 목표를 수치 요구사항과 모호성으로 구조화합니다.',permission:'requirement.write',annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{projectId:{type:'string'},text:{type:'string',minLength:1}},required:['projectId','text'],additionalProperties:false}},
  {name:'autoforge_requirement_draft',title:'요구사항 초안 생성',description:'자연어 목표를 추적 가능한 요구사항 초안 배치로 저장합니다. 별도 인간 검토와 베이스라인 승인이 필요합니다.',permission:'requirement.write',annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:false},inputSchema:{type:'object',properties:{projectId:{type:'string'},text:{type:'string',minLength:1}},required:['projectId','text'],additionalProperties:false}},
  {name:'autoforge_design_estimate',title:'차량 성능 산정',description:'파라메트릭 차량 입력으로 주행거리, 공력, 중량, 제조원가를 빠르게 산정합니다.',permission:null,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{length:{type:'number'},wheelbase:{type:'number'},height:{type:'number'},wheel:{type:'number'},batteryKwh:{type:'number'}},additionalProperties:false}},
  {name:'autoforge_cad_generate',title:'파라메트릭 3D CAD 생성',description:'설계 버전에서 재생성 가능한 OpenSCAD 모델과 표준 OBJ 삼각 메시를 생성하고 해시 아티팩트로 저장합니다.',permission:'design.write',annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{projectId:{type:'string'},designId:{type:'string'}},required:['projectId','designId'],additionalProperties:false}},
  {name:'autoforge_workflow_start',title:'자율 설계 루프 시작',description:'요구사항 분석부터 설계·가상검증·제조검토까지 비동기 개발 워크플로를 시작합니다.',permission:'run.execute',annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:false},inputSchema:{type:'object',properties:{projectId:{type:'string'},prompt:{type:'string'},parameters:{type:'object'}},required:['projectId','prompt'],additionalProperties:false}},
  {name:'autoforge_simulation_run',title:'차량 물리 시뮬레이션',description:'공력·열·구조·주행거리 reduced-order 물리 모델을 실행하고 CSV 및 JSON 증거를 저장합니다.',permission:'simulation.execute',annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{projectId:{type:'string'},designId:{type:'string'},type:{type:'string',enum:['aero','thermal','structure','range']},options:{type:'object'}},required:['projectId','designId','type'],additionalProperties:false}},
  {name:'autoforge_optimize',title:'다목적 설계 최적화',description:'설계 변수 후보를 생성하고 필수 제약을 적용한 뒤 주행거리·원가·중량·공간 Pareto 전선을 계산합니다.',permission:'design.write',annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{projectId:{type:'string'},designId:{type:'string'},sampleSize:{type:'number'},seed:{type:'number'},weights:{type:'object'}},required:['projectId','designId'],additionalProperties:false}},
  {name:'autoforge_run_get',title:'설계 실행 상태',description:'자율 설계 실행과 하위 작업의 최신 상태를 조회합니다.',permission:null,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{runId:{type:'string'}},required:['runId'],additionalProperties:false}},
  {name:'autoforge_run_resume',title:'설계 실행 재개',description:'기준선 승인 또는 전문가 보정 후 중단된 실행의 계보를 유지하며 새 실행을 시작합니다.',permission:'run.execute',annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:false},inputSchema:{type:'object',properties:{runId:{type:'string'},parameters:{type:'object'},reason:{type:'string'}},required:['runId'],additionalProperties:false}},
  {name:'autoforge_knowledge_graph',title:'설계 지식 그래프',description:'요구사항, 설계, 시뮬레이션과 시험 증거의 추적성 그래프를 조회합니다.',permission:null,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{projectId:{type:'string'}},required:['projectId'],additionalProperties:false}},
  {name:'autoforge_release_assess',title:'릴리스 게이트 평가',description:'물리 시험, 제조성, 승인, 추적성 증거를 평가하고 누락 게이트를 반환합니다.',permission:null,annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},inputSchema:{type:'object',properties:{projectId:{type:'string'},designId:{type:'string'}},required:['projectId','designId'],additionalProperties:false}},
  {name:'autoforge_robot_command',title:'승인된 로봇 명령',description:'S4 승인과 물리 인터록을 확인한 뒤 로봇 작업을 제출합니다. 인간 현장 승인 없이는 실행되지 않습니다.',permission:'robot.execute',annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:true,openWorldHint:true},inputSchema:{type:'object',properties:{projectId:{type:'string'},cellId:{type:'string'},action:{type:'string'},approvalId:{type:'string'},idempotencyKey:{type:'string'}},required:['projectId','cellId','action','approvalId','idempotencyKey'],additionalProperties:false}}
];

function validateArguments(schema,args){
  if(!args||typeof args!=='object'||Array.isArray(args))return 'arguments must be an object';
  for(const key of schema.required||[])if(args[key]===undefined||args[key]==='')return `${key} is required`;
  if(schema.additionalProperties===false)for(const key of Object.keys(args))if(!schema.properties?.[key])return `${key} is not allowed`;
  for(const[key,value]of Object.entries(args)){const rule=schema.properties?.[key],expected=rule?.type;if(expected&&expected==='number'&&!Number.isFinite(value))return `${key} must be a number`;if(expected==='object'&&(typeof value!=='object'||value===null||Array.isArray(value)))return `${key} must be an object`;if(expected&&expected!=='number'&&expected!=='object'&&typeof value!==expected)return `${key} must be a ${expected}`;if(rule?.enum&&!rule.enum.includes(value))return `${key} must be one of ${rule.enum.join(', ')}`;if(expected==='string'&&rule.minLength&&value.length<rule.minLength)return `${key} is too short`}
  return null;
}

export class McpGateway{
  constructor({execute,clock=()=>new Date().toISOString(),sessionTtlMs=12*3600_000}={}){this.execute=execute;this.clock=clock;this.sessionTtlMs=sessionTtlMs;this.sessions=new Map()}
  initialize(actor,client={}){const id=randomUUID(),createdAt=this.clock();this.sessions.set(id,{id,actorId:actor.id,organizationId:actor.organizationId,client,createdAt,expiresAt:new Date(Date.parse(createdAt)+this.sessionTtlMs).toISOString(),initialized:false});return{id,result:{protocolVersion:MCP_PROTOCOL_VERSION,capabilities:{tools:{listChanged:false}},serverInfo:{name:'autoforge-mcp',title:'AutoForge Engineering MCP Gateway',version:'0.1.0',description:'안전 게이트가 적용된 자율 자동차 개발 도구'},instructions:'읽기 도구로 증거를 확인하고 변경 도구는 사용자의 명시적 의도와 승인 등급을 준수하십시오.'}}}
  session(id,actor){const item=this.sessions.get(id);if(!item||Date.parse(item.expiresAt)<=Date.now()||item.actorId!==actor.id||item.organizationId!==actor.organizationId)return null;return item}
  terminate(id,actor){const item=this.session(id,actor);if(!item)return false;this.sessions.delete(id);return true}
  async handle(message,{actor,sessionId}={}){
    if(!message||message.jsonrpc!=='2.0'||typeof message.method!=='string')return rpcError(message?.id,-32600,'Invalid Request');
    if(message.method==='initialize'){const init=this.initialize(actor,message.params?.clientInfo);return{...rpcResult(message.id,init.result),sessionId:init.id}}
    const session=this.session(sessionId,actor);if(!session)return rpcError(message.id,-32001,'MCP session is missing or expired');
    if(message.method==='notifications/initialized'){session.initialized=true;return null}
    if(message.method==='ping')return rpcResult(message.id,{});
    if(!session.initialized)return rpcError(message.id,-32002,'MCP session is not initialized');
    if(message.method==='tools/list')return rpcResult(message.id,{tools:mcpToolCatalog.filter(x=>!x.permission||hasPermission(actor,x.permission)).map(({permission,...tool})=>tool)});
    if(message.method!=='tools/call')return rpcError(message.id,-32601,'Method not found');
    const tool=mcpToolCatalog.find(x=>x.name===message.params?.name);if(!tool)return rpcError(message.id,-32602,'Unknown tool');
    if(tool.permission&&!hasPermission(actor,tool.permission))return rpcError(message.id,-32603,'Tool permission denied',{permission:tool.permission});
    const args=message.params?.arguments||{},invalid=validateArguments(tool.inputSchema,args);if(invalid)return rpcError(message.id,-32602,'Invalid tool arguments',{reason:invalid});
    try{return rpcResult(message.id,toolResult(await this.execute(tool.name,args,actor)))}catch(error){return rpcResult(message.id,toolFailure(error))}
  }
}

export function validateMcpOrigin(origin,{allowedOrigins=[],host}={}){if(!origin)return true;try{const url=new URL(origin);return allowedOrigins.includes(url.origin)||url.host===host}catch{return false}}
