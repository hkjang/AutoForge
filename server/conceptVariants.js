import { randomUUID } from 'node:crypto';
import { estimateVehicle } from './engines.js';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Math.round(value)));
const profiles=[
  {key:'balanced',name:'Balanced Evolution',delta:{length:0,wheelbase:0,height:-10,wheel:0,capacity:0}},
  {key:'long_range',name:'Long Range',delta:{length:5,wheelbase:20,height:-35,wheel:-1,capacity:7}},
  {key:'value',name:'Value Engineering',delta:{length:-35,wheelbase:-15,height:5,wheel:-2,capacity:-6}},
  {key:'space',name:'Space First',delta:{length:10,wheelbase:80,height:45,wheel:-1,capacity:0}},
  {key:'lightweight',name:'Lightweight',delta:{length:-70,wheelbase:-25,height:-20,wheel:-1,capacity:-3}},
  {key:'aero',name:'Aero Efficiency',delta:{length:0,wheelbase:15,height:-70,wheel:-1,capacity:2}}
];
export function generateConceptVariants(db,parent,{actor,count=6}={}){if(!parent)throw failure('parent_design_required');const base={length:Number(parent.parameters?.length||3990),wheelbase:Number(parent.parameters?.wheelbase||2630),height:Number(parent.parameters?.height||1570),wheel:Number(parent.parameters?.wheel||19),capacity:Number(parent.parameters?.capacity||78.4),width:Number(parent.parameters?.width||1820)},createdAt=new Date().toISOString(),variants=profiles.slice(0,Math.max(1,Math.min(6,Number(count)||6))).map((profile,index)=>{const parameters={...parent.parameters,length:clamp(base.length+profile.delta.length,3000,6000),wheelbase:clamp(base.wheelbase+profile.delta.wheelbase,1800,Math.min(3400,base.length+profile.delta.length-600)),height:clamp(base.height+profile.delta.height,1100,2500),wheel:clamp(base.wheel+profile.delta.wheel,14,26),capacity:Number(Math.max(35,Math.min(140,base.capacity+profile.delta.capacity)).toFixed(1)),width:base.width},metrics=estimateVehicle(parameters);return{id:`AF-V${randomUUID().slice(0,8)}`,projectId:parent.projectId,parentDesignId:parent.id,version:`${parent.version||'0.1'}-V${index+1}`,name:profile.name,philosophy:profile.key,iteration:(parent.iteration||0)+1,parameters,metrics,score:metrics.score,status:'concept_variant',lineage:{method:'concept_diversity_profile',profile:profile.key,parentDesignId:parent.id},createdBy:actor,createdAt}});db.designs.push(...variants);for(const variant of variants)db.changes.unshift({id:randomUUID(),projectId:variant.projectId,type:'concept.variant_generated',target:variant.id,source:parent.id,at:createdAt,actor});return{parentDesignId:parent.id,count:variants.length,variants,createdAt}}
const failure=code=>Object.assign(new Error(code),{code});
