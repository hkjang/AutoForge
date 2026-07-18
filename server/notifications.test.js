import test from 'node:test';
import assert from 'node:assert/strict';
import { NotificationService } from './notifications.js';

test('notifications respect organization, user and role audience',()=>{const n=new NotificationService();n.create({organizationId:'a',roles:['reviewer'],type:'x',title:'Review'});n.create({organizationId:'b',roles:[],type:'x',title:'Other'});assert.equal(n.list({id:'u',organizationId:'a',role:'reviewer'}).length,1);assert.equal(n.list({id:'u',organizationId:'a',role:'viewer'}).length,0)});
test('read state is per user',()=>{const n=new NotificationService(),item=n.create({organizationId:'a',type:'x',title:'X'}),actor={id:'u',organizationId:'a',role:'admin'};n.markRead(item.id,actor);assert.equal(n.list(actor,{unreadOnly:true}).length,0);assert.ok(item.readBy.includes('u'))});
