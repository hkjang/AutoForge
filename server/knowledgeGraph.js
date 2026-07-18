const node=(id,type,label,data={})=>({id,type,label,data});
const edge=(from,to,type,data={})=>({from,to,type,data});

export function buildKnowledgeGraph(db,projectId){
  const nodes=[],edges=[],seen=new Set(),add=n=>{if(n?.id&&!seen.has(n.id)){seen.add(n.id);nodes.push(n)}};
  const requirements=(db.requirements||[]).filter(x=>x.projectId===projectId),baseline=(db.requirementBaselines||[]).find(x=>x.projectId===projectId&&x.status==='active'),activeIds=new Set(baseline?.requirementIds||requirements.filter(x=>!['draft','superseded'].includes(x.lifecycleStatus)).map(x=>x.id));
  const project=(db.projects||[]).find(x=>x.id===projectId);if(project)add(node(project.id,'project',project.name,project));
  for(const r of requirements){add(node(r.id,'requirement',r.title,{...r,active:activeIds.has(r.id),activeBaseline:Boolean(baseline)}));edges.push(edge(projectId,r.id,'contains'))}
  for(const g of (db.goals||[]).filter(x=>x.projectId===projectId)){add(node(g.id,'goal',g.name,g));edges.push(edge(g.parentId||projectId,g.id,'decomposes_to'))}
  for(const d of (db.designs||[]).filter(x=>x.projectId===projectId)){add(node(d.id,'design',d.name,d));edges.push(edge(projectId,d.id,'has_version'));if(d.parentDesignId)edges.push(edge(d.parentDesignId,d.id,'derived_into',{method:d.lineage?.method}));for(const r of requirements)edges.push(edge(d.id,r.id,'satisfies',{status:r.status}))}
  for(const architecture of (db.architectures||[]).filter(x=>x.projectId===projectId)){add(node(architecture.id,'architecture',`${architecture.name} · Rev ${architecture.revision}`,architecture));edges.push(edge(projectId,architecture.id,'has_architecture'));if(architecture.parentId)edges.push(edge(architecture.parentId,architecture.id,'derived_into',{method:'visual_architecture_revision'}));for(const component of architecture.nodes||[]){const componentId=`${architecture.id}:${component.id}`;add(node(componentId,'component',component.title,{...component,architectureId:architecture.id}));edges.push(edge(architecture.id,componentId,'contains_component'))}for(const link of architecture.links||[])edges.push(edge(`${architecture.id}:${link.from}`,`${architecture.id}:${link.to}`,'interfaces_with',{interface:link.interface}))}
  for(const run of (db.optimizationRuns||[]).filter(x=>x.projectId===projectId)){add(node(run.id,'optimization',`${run.algorithm} · ${run.candidateCount} candidates`,{algorithm:run.algorithm,seed:run.seed,candidateCount:run.candidateCount,paretoCount:run.paretoCount,recommendedCandidateId:run.recommendedCandidateId}));edges.push(edge(run.parentDesignId,run.id,'optimized_by'));for(const promotion of run.promotions||[])edges.push(edge(run.id,promotion.designId,'promoted_to',{candidateId:promotion.candidateId}))}
  for(const s of (db.simulations||[]).filter(x=>x.projectId===projectId)){add(node(s.id,'simulation',s.name,s));edges.push(edge(s.designId,s.id,'verified_by'));for(const e of (db.evidence||[]).filter(x=>x.sourceId===s.id)){add(node(e.id,'evidence',e.claim,e));edges.push(edge(s.id,e.id,'produces'))}}
  for(const x of (db.engineExecutions||[]).filter(x=>x.projectId===projectId))add(node(x.id,'engine_execution',x.action,x));
  for(const x of (db.manufacturingEvaluations||[]).filter(x=>x.projectId===projectId))add(node(x.id,'manufacturing_evidence','Manufacturing evaluation',x));
  for(const x of (db.physicalTests||[]).filter(x=>x.projectId===projectId))add(node(x.id,'physical_evidence',x.type,x));
  for(const x of (db.complianceAssessments||[]).filter(x=>x.projectId===projectId)){add(node(x.id,'compliance_assessment',`${x.policyVersion} · ${x.compliant?'PASS':'BLOCKED'}`,x));edges.push(edge(x.designId,x.id,'assessed_by'));for(const evidenceId of x.rules?.flatMap(rule=>rule.evidenceIds)||[])if(seen.has(evidenceId))edges.push(edge(x.id,evidenceId,'supported_by'))}
  for(const v of (db.requirementVerifications||[]).filter(x=>x.projectId===projectId)){add(node(v.id,'requirement_verification',`${v.status} · ${v.evidenceType}`,v));edges.push(edge(v.requirementId,v.id,'verified_by_evidence',{status:v.status}));if(seen.has(v.evidenceId))edges.push(edge(v.id,v.evidenceId,'supported_by',{evidenceType:v.evidenceType}))}
  for(const c of (db.changes||[]).filter(x=>x.projectId===projectId)){add(node(c.id,'change',c.type,c));if(c.target)edges.push(edge(c.id,c.target,'changes'))}
  for(const a of (db.approvals||[]).filter(x=>!x.projectId||x.projectId===projectId)){add(node(a.id,'approval',a.grade||'Approval',a));if(a.targetId)edges.push(edge(a.targetId,a.id,'requires_approval'))}
  for(const k of (db.knowledge||[]).filter(x=>x.sourceProjectId===projectId)){add(node(k.id,'knowledge',k.title,k));edges.push(edge(projectId,k.id,'learned'))}
  return{projectId,nodes,edges,stats:{nodes:nodes.length,edges:edges.length,traceability:traceabilityScore(nodes,edges)}};
}

export function traceabilityScore(nodes,edges){
  const requirements=nodes.filter(n=>n.type==='requirement'&&n.data.active!==false);if(!requirements.length)return 0;
  const traced=requirements.filter(requirement=>{
    if(requirement.data.activeBaseline){
      if(requirement.data.status!=='pass')return false;
      return edges.some(link=>link.from===requirement.id&&link.type==='verified_by_evidence'&&link.data.status==='pass'&&edges.some(support=>support.from===link.to&&support.type==='supported_by'&&nodes.some(n=>n.id===support.to)));
    }
    return edges.some(link=>link.to===requirement.id&&link.type==='satisfies')&&edges.some(link=>{const design=nodes.find(n=>n.id===link.from&&n.type==='design');return design&&edges.some(x=>x.from===design.id&&x.type==='verified_by')});
  });
  return Number((traced.length/requirements.length).toFixed(3));
}

export function impactAnalysis(graph,nodeId,maxDepth=4){const visited=new Set([nodeId]),queue=[{id:nodeId,depth:0}],impacts=[];while(queue.length){const cur=queue.shift();if(cur.depth>=maxDepth)continue;for(const e of graph.edges.filter(x=>x.from===cur.id||x.to===cur.id)){const next=e.from===cur.id?e.to:e.from;if(visited.has(next))continue;visited.add(next);const n=graph.nodes.find(x=>x.id===next);if(n){impacts.push({...n,via:e.type,depth:cur.depth+1});queue.push({id:next,depth:cur.depth+1})}}}return{source:graph.nodes.find(x=>x.id===nodeId),impacts,count:impacts.length}}
