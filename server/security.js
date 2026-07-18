import { randomUUID } from 'node:crypto';

const permissions={
  viewer:[], designer:['project.create','requirement.write','goal.write','design.write','run.execute','simulation.execute','manufacturing.evaluate','loop.step','artifact.write','improvement.create'],
  reviewer:['approval.create','approval.review','transition.execute','improvement.manage'],
  safety_officer:['approval.create','approval.review','transition.execute','safety.execute','improvement.manage'],
  site_manager:['approval.create','approval.review','robot.execute','sensor.write','transition.execute','safety.execute','improvement.manage'],
  admin:['*']
};
export const hasPermission=(actor,permission)=>{const allowed=permissions[actor?.role]||[];return allowed.includes('*')||allowed.includes(permission)};
export function actorMiddleware(db,authenticate){return(req,res,next)=>{
  const production=process.env.AUTOFORGE_REQUIRE_AUTH==='true';
  const bearer=req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1],identity=authenticate(db,bearer);
  if(identity){const requestedOrg=req.header('x-autoforge-organization')||identity.user.memberships[0]?.organizationId,membership=identity.user.memberships.find(x=>x.organizationId===requestedOrg);req.actor={id:identity.user.id,role:membership?.role||'viewer',organizationId:requestedOrg,authenticated:true,sessionId:identity.session.id};return next()}
  const role=production?'anonymous':(req.header('x-autoforge-role')||'admin');req.actor={id:production?'anonymous':(req.header('x-autoforge-user')||'local-lead'),role,organizationId:req.header('x-autoforge-organization')||'org-autoforge',authenticated:false};next();
}}
export const requirePermission=permission=>(req,res,next)=>{
  if(!hasPermission(req.actor,permission)) return res.status(403).json({error:'forbidden',permission,role:req.actor?.role});
  next();
};
export const canAccessProject=(db,actor,projectId)=>{const project=db.projects.find(x=>x.id===projectId);return Boolean(project&&((!actor.authenticated&&actor.role==='admin')||project.organizationId===actor.organizationId))};
export const requireProjectAccess=(db,param='id')=>(req,res,next)=>canAccessProject(db,req.actor,req.params[param])?next():res.status(404).json({error:'project_not_found'});
export function auditMiddleware(db){return (req,res,next)=>{
  const started=Date.now(),original=res.json.bind(res);
  res.json=body=>{if(req.path.startsWith('/api')&&req.path!=='/api/audit'){db.audit??=[];db.audit.unshift({id:randomUUID(),at:new Date().toISOString(),actor:req.actor?.id,role:req.actor?.role,method:req.method,path:req.path,status:res.statusCode,durationMs:Date.now()-started,requestId:req.header('x-request-id')||randomUUID()});db.audit=db.audit.slice(0,2000)}return original(body)};next();};}
