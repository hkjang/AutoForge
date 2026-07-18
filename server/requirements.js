const patterns=[
  {category:'dimension',title:'전장',unit:'mm',re:/전장[^0-9]*(\d+(?:\.\d+)?)\s*(미터|m|mm)?\s*(이하|미만)/i,convert:(v,u)=>u==='미터'||u==='m'?v*1000:v,operator:'≤'},
  {category:'performance',title:'1회 충전 주행거리',unit:'km',re:/(?:주행거리|1회 충전)[^0-9]*(\d+(?:\.\d+)?)\s*(?:킬로미터|km)?\s*(이상|초과)/i,operator:'≥'},
  {category:'cost',title:'제조원가',unit:'M KRW',re:/(?:제조원가|원가)[^0-9]*(\d+(?:\.\d+)?)\s*(천만|백만|만)?원?\s*(이하|미만)/i,convert:(v,u)=>u==='천만'?v*10:u==='만'?v/100:v,operator:'≤'},
  {category:'package',title:'좌석 수',unit:'seat',re:/(\d+)\s*인승/i,operator:'='}
];
export function refineRequirements(text,projectId='urban-e04'){
  const requirements=[];
  for(const p of patterns){const m=text.match(p.re);if(!m)continue;let target=Number(m[1]);if(p.convert)target=p.convert(target,m[2]);requirements.push({projectId,category:p.category,title:p.title,operator:p.operator,target,unit:p.unit,priority:'must',confidence:.94,verification:suggestVerification(p.category),sourceText:m[0]})}
  const ambiguities=[];
  if(/적당|충분|좋은|빠른|저렴/.test(text)) ambiguities.push({type:'non_quantified',message:'정량화되지 않은 표현이 있습니다.'});
  if(!requirements.some(r=>r.category==='performance')) ambiguities.push({type:'missing_performance',message:'핵심 성능 목표가 없습니다.'});
  return {requirements,ambiguities,confidence:requirements.length?Math.max(.5,.96-ambiguities.length*.08):.25};
}
const suggestVerification=category=>({dimension:{method:'virtual_and_physical',simulation:'cad_measurement',physicalTest:'dimensional_scan'},performance:{method:'virtual_and_physical',simulation:'energy_consumption_cycle',physicalTest:'certified_drive_cycle'},cost:{method:'evidence',simulation:'bom_cost_rollup',physicalTest:'supplier_quote'},package:{method:'virtual_and_physical',simulation:'occupant_package_check',physicalTest:'ergonomic_buck'}}[category]);
export function detectConflicts(requirements){
  const conflicts=[];
  for(let i=0;i<requirements.length;i++)for(let j=i+1;j<requirements.length;j++){const a=requirements[i],b=requirements[j];if(a.category!==b.category||a.unit!==b.unit)continue;if(a.operator==='≤'&&b.operator==='≥'&&b.target>a.target||a.operator==='≥'&&b.operator==='≤'&&a.target>b.target)conflicts.push({type:'hard_conflict',a:a.id||a.title,b:b.id||b.title,message:`${a.title}의 허용 범위가 충돌합니다.`})}
  const range=requirements.find(r=>r.category==='performance'),cost=requirements.find(r=>r.category==='cost');if(range?.target>=500&&cost?.target<=25)conflicts.push({type:'tradeoff_risk',a:range.id||range.title,b:cost.id||cost.title,message:'주행거리와 제조원가 목표가 강하게 상충할 가능성이 있습니다.'});return conflicts;
}
