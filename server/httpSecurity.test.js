import test from 'node:test';
import assert from 'node:assert/strict';
import { apiErrorHandler, createRateLimiter, securityHeaders } from './httpSecurity.js';

const response=()=>({headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v},status(code){this.statusCode=code;return this},json(body){this.body=body;return this}});

test('security headers attach policy and a request correlation id',()=>{const req={header:()=>undefined},res=response();let next=false;securityHeaders(req,res,()=>next=true);assert.equal(next,true);assert.equal(res.headers['X-Frame-Options'],'DENY');assert.match(res.headers['Content-Security-Policy'],/object-src 'none'/);assert.ok(res.headers['X-Request-Id'])});
test('rate limiter blocks requests above the configured window allowance',()=>{let now=0;const limit=createRateLimiter({windowMs:1000,max:2,clock:()=>now,key:()=> 'client'}),req={},one=response(),two=response(),three=response();let calls=0;limit(req,one,()=>calls++);limit(req,two,()=>calls++);limit(req,three,()=>calls++);assert.equal(calls,2);assert.equal(three.statusCode,429);assert.equal(three.body.error,'rate_limit_exceeded');now=1001;const reset=response();limit(req,reset,()=>calls++);assert.equal(calls,3)});
test('malformed JSON receives a stable API error envelope',()=>{const error=Object.assign(new SyntaxError('bad'),{status:400,body:'{'}),req={requestId:'req-1'},res=response();apiErrorHandler(error,req,res,()=>{});assert.equal(res.statusCode,400);assert.deepEqual(res.body,{error:'invalid_json',requestId:'req-1'})});
