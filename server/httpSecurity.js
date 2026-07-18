import { randomUUID } from 'node:crypto';

export function securityHeaders(req,res,next){
  const requestId=String(req.header?.('x-request-id')||randomUUID()).replace(/[^a-zA-Z0-9._:-]/g,'').slice(0,128)||randomUUID();
  req.requestId=requestId;
  res.setHeader('X-Request-Id',requestId);
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
  if(req.secure||req.header?.('x-forwarded-proto')==='https')res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
  next();
}

export function createRateLimiter({windowMs=60_000,max=300,key=req=>req.ip||req.socket?.remoteAddress||'unknown',clock=Date.now}={}){
  const buckets=new Map();
  return (req,res,next)=>{
    const now=clock(),id=key(req),current=buckets.get(id);
    const bucket=!current||current.resetAt<=now?{count:0,resetAt:now+windowMs}:current;
    bucket.count++;buckets.set(id,bucket);
    res.setHeader('RateLimit-Limit',max);res.setHeader('RateLimit-Remaining',Math.max(0,max-bucket.count));res.setHeader('RateLimit-Reset',Math.ceil(bucket.resetAt/1000));
    if(bucket.count>max){res.setHeader('Retry-After',Math.max(1,Math.ceil((bucket.resetAt-now)/1000)));return res.status(429).json({error:'rate_limit_exceeded',requestId:req.requestId})}
    if(buckets.size>10_000)for(const [entryId,value] of buckets)if(value.resetAt<=now)buckets.delete(entryId);
    next();
  };
}

export function apiErrorHandler(error,req,res,next){
  if(res.headersSent)return next(error);
  if(error?.type==='entity.too.large')return res.status(413).json({error:'payload_too_large',requestId:req.requestId});
  if(error instanceof SyntaxError&&error.status===400&&'body' in error)return res.status(400).json({error:'invalid_json',requestId:req.requestId});
  console.error('Unhandled API error',req.requestId,error);
  res.status(500).json({error:'internal_error',requestId:req.requestId});
}
