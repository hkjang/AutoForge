import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32, createZip } from './zip.js';
test('CRC32 matches canonical vector',()=>assert.equal(crc32(Buffer.from('123456789')).toString(16),'cbf43926'));
test('ZIP contains local, central and end records',()=>{const zip=createZip([{name:'a.txt',data:'hello'},{name:'b.json',data:'{}'}]);assert.equal(zip.readUInt32LE(0),0x04034b50);assert.ok(zip.includes(Buffer.from('a.txt')));assert.equal(zip.readUInt32LE(zip.length-22),0x06054b50);assert.equal(zip.readUInt16LE(zip.length-14),2)});
