import test from 'node:test';
import assert from 'node:assert/strict';
import { detectConflicts, refineRequirements } from './requirements.js';

test('Korean natural language becomes structured requirements',()=>{
  const result=refineRequirements('4인승 도심형 전기차. 전장은 4미터 이하, 주행거리 450km 이상, 제조원가 3천만원 이하.');
  assert.equal(result.requirements.length,4);
  assert.equal(result.requirements.find(x=>x.category==='dimension').target,4000);
  assert.equal(result.requirements.find(x=>x.category==='cost').target,30);
});
test('ambiguous adjectives are flagged',()=>assert.ok(refineRequirements('충분히 빠르고 저렴한 자동차').ambiguities.length>=2));
test('hard range conflict is detected',()=>{
  const conflicts=detectConflicts([{id:'a',category:'dimension',unit:'mm',operator:'≤',target:3900,title:'전장'},{id:'b',category:'dimension',unit:'mm',operator:'≥',target:4100,title:'전장'}]);
  assert.equal(conflicts[0].type,'hard_conflict');
});
test('extreme range and cost tradeoff is surfaced',()=>assert.equal(detectConflicts([{category:'performance',target:500},{category:'cost',target:25}])[0].type,'tradeoff_risk'));
