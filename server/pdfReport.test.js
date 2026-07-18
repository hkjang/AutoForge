import test from 'node:test';
import assert from 'node:assert/strict';
import { createProjectPdf } from './pdfReport.js';
test('report generator returns valid PDF envelope and cross-reference',()=>{const pdf=createProjectPdf({project:{code:'P',name:'Project'},design:{id:'D',name:'Design',metrics:{range:420}},requirements:[]});assert.equal(pdf.subarray(0,8).toString(),'%PDF-1.4');assert.match(pdf.toString(),/xref/);assert.match(pdf.toString(),/%%EOF\n$/);assert.ok(pdf.length>500)});
