import test from 'node:test';
import assert from 'node:assert/strict';
import {taskPayload,coursePayload} from '../server/validate.js';
test('taskPayload accepts valid CRUD payload',()=>assert.equal(taskPayload({title:'Finish assignment',status:'todo',priority:'high',dueDate:'2026-11-10'}).title,'Finish assignment'));
test('taskPayload rejects invalid status',()=>assert.throws(()=>taskPayload({title:'Hello world',status:'bad'}),/status/));
test('taskPayload rejects invalid date',()=>assert.throws(()=>taskPayload({title:'Hello world',dueDate:'2026-02-30'}),/valid due date/));
test('coursePayload normalizes code',()=>assert.equal(coursePayload({name:'Software Engineering',code:'cs101'}).code,'CS101'));
