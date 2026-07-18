import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const spec=fs.readFileSync(new URL('../openapi.yaml',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('./index.js',import.meta.url),'utf8');
const lifecycleRoutes=[
  ['post','/api/requirements/drafts','/requirements/drafts:'],
  ['patch','/api/requirements/:id/approve','/requirements/{id}/approve:'],
  ['post','/api/requirements/:id/revisions','/requirements/{id}/revisions:'],
  ['patch','/api/requirements/:id/verification','/requirements/{id}/verification:'],
  ['get','/api/requirement-baselines','/requirement-baselines:'],
  ['post','/api/requirement-baselines','/requirement-baselines:'],
  ['get','/api/verification-tasks','/verification-tasks:']
  ,['post','/api/runs/:id/resume','/runs/{id}/resume:']
  ,['get','/api/robot/cells','/robot/cells:']
  ,['get','/api/robot/commands','/robot/commands:']
  ,['post','/api/robot/actions','/robot/actions:']
  ,['post','/api/robot/commands/:commandId/ack','/robot/commands/{commandId}/ack:']
  ,['post','/api/robot/cells/:cellId/interlocks','/robot/cells/{cellId}/interlocks:']
  ,['post','/api/robot/cells/:cellId/emergency-stop','/robot/cells/{cellId}/emergency-stop:']
  ,['get','/api/bom','/bom:']
  ,['get','/api/suppliers','/suppliers:']
  ,['get','/api/manufacturing/evaluations','/manufacturing/evaluations:']
  ,['post','/api/manufacturing/evaluate','/manufacturing/evaluate:']
  ,['get','/api/calibrations','/calibrations:']
  ,['post','/api/calibrations','/calibrations:']
  ,['get','/api/physical-tests','/physical-tests:']
  ,['post','/api/physical-tests','/physical-tests:']
  ,['get','/api/telemetry/streams','/telemetry/streams:']
  ,['get','/api/telemetry/latest','/telemetry/latest:']
  ,['get','/api/architectures','/architectures:']
  ,['post','/api/architectures','/architectures:']
  ,['get','/api/loops','/loops:']
  ,['post','/api/loops/:id/step','/loops/{id}/step:']
  ,['post','/api/designs/:designId/variants','/designs/{designId}/variants:']
  ,['get','/api/agents','/agents:']
  ,['post','/api/agents','/agents:']
  ,['get','/api/agents/catalog','/agents/catalog:']
  ,['patch','/api/agents/:agentId','/agents/{agentId}:']
  ,['get','/api/compliance/assessments','/compliance/assessments:']
  ,['post','/api/compliance/assess','/compliance/assess:']
];

test('requirement lifecycle REST routes stay represented in OpenAPI',()=>{
  for(const[method,route,path]of lifecycleRoutes){
    assert.match(source,new RegExp(`app\\.${method}\\('${route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}'`),`${method.toUpperCase()} ${route} is not implemented`);
    const block=spec.slice(spec.indexOf(`  ${path}`),spec.indexOf('\n  /',spec.indexOf(`  ${path}`)+3)<0?spec.length:spec.indexOf('\n  /',spec.indexOf(`  ${path}`)+3));
    assert.ok(block.includes(`    ${method}:`),`${method.toUpperCase()} ${path} is missing from OpenAPI`);
  }
});

test('verification contract requires status and evidence and baseline requires unique IDs',()=>{
  assert.match(spec,/required: \[status, evidenceId\]/);
  assert.match(spec,/requirementIds: \{ type: array, minItems: 1, uniqueItems: true/);
  assert.match(spec,/lifecycleStatus: \{ type: string, enum: \[draft, approved, baselined, superseded\] \}/);
});
