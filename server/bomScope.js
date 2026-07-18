export function projectBom(db,projectId,{revision}={}){
  const rows=(db.bom||[]).filter(x=>x.projectId===projectId),activeRevision=revision??Math.max(0,...rows.map(x=>Number(x.revision)||1));
  return rows.filter(x=>(Number(x.revision)||1)===activeRevision);
}

export function organizationSuppliers(db,organizationId){return(db.suppliers||[]).filter(x=>x.organizationId===organizationId)}

export function bomSummary(db,projectId){const rows=(db.bom||[]).filter(x=>x.projectId===projectId),revisions=[...new Set(rows.map(x=>Number(x.revision)||1))].sort((a,b)=>b-a),activeRevision=revisions[0]||0;return{projectId,activeRevision,revisions,itemCount:rows.filter(x=>(Number(x.revision)||1)===activeRevision).length}}
