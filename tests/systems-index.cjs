'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const index=fs.readFileSync('design/gdd/systems-index.md','utf8');
const rows=index.split('\n').filter(line=>/^\| \d+ \|/.test(line));
const enumStart=index.indexOf('## Systems Enumeration');
const enumEnd=index.indexOf('## Categories',enumStart);
const table=index.slice(enumStart,enumEnd);
const systems=table.split('\n').filter(line=>/^\| \d+ \|/.test(line));
assert.equal(systems.length,22,'expected mapped systems');
const names=new Set();
const dependencies=new Map();
for(let i=0;i<systems.length;i++){
 const cells=systems[i].split('|').slice(1,-1).map(x=>x.trim());
 assert.equal(cells.length,7,'fixed studio systems-index table columns');
 assert.equal(Number(cells[0]),i+1,'stable sequential system ids');
 const [id,name,category,priority,status,designDoc,depends]=cells;
 assert.ok(name&&!names.has(name),'unique nonempty system name');
 names.add(name);
 assert.ok(['Core','Gameplay','Progression','Economy','Persistence','UI','Meta','Audio'].includes(category),'known category');
 assert.ok(['MVP','Vertical Slice','Alpha','Full Vision'].includes(priority),'known priority');
 assert.ok(['Implemented','Not Started'].includes(status),'observed implementation status');
 if(designDoc!=='—')assert.ok(fs.existsSync(designDoc),'design doc must exist');
 dependencies.set(name,depends==='—'?[]:depends.split(',').map(s=>s.trim()));
}
for(const [name,deps] of dependencies){
 for(const dep of deps)assert.ok(names.has(dep),name+' has unknown dependency '+dep);
}
const state=new Map();
function visit(name){
 if(state.get(name)===1)throw Error('Circular dependency at '+name);
 if(state.get(name)===2)return;
 state.set(name,1);
 for(const dep of dependencies.get(name))visit(dep);
 state.set(name,2);
}
for(const name of names)visit(name);
const orderStart=index.indexOf('## Recommended Design Order');
const orderEnd=index.indexOf('## Circular Dependencies',orderStart);
const orderRows=index.slice(orderStart,orderEnd).split('\n').filter(line=>/^\| \d+ \|/.test(line));
assert.equal(orderRows.length,systems.length,'every system has a design order');
const orderNames=orderRows.map(line=>line.split('|')[2].trim());
assert.equal(new Set(orderNames).size,systems.length,'design order unique');
for(const name of names)assert.ok(orderNames.includes(name),'missing design order '+name);
assert.match(index,/TD-SYSTEM-BOUNDARY:\*\* NOT ASSESSED/,'honest gate status');
console.log('Studio systems index: 22 systems, 22 design priorities, valid dependency DAG');
