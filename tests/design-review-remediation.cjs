'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const files={
 save:fs.readFileSync('design/gdd/save-load-system.md','utf8'),
 enhancement:fs.readFileSync('design/gdd/enhancement-system.md','utf8'),
 combat:fs.readFileSync('design/gdd/auto-combat-system.md','utf8')
};
for(const [name,doc] of Object.entries(files)){
 assert.match(doc,/Review Remediation/);
 assert.match(doc,/re-review pending/);
 assert.match(doc,/Review gate:/);
 assert.match(doc,/INTENT UNKNOWN|approval|approved|approval-dependent/i);
}
for(const phrase of ['v3 write succeeds/v2 write fails','malformed nested `progression`','full-fidelity v3 backup','Real-browser reload'])assert.ok(files.save.includes(phrase),phrase);
for(const phrase of ['0…14','protected success','protected failure','insufficient resources','level 15','browser HUD'])assert.ok(files.enhancement.includes(phrase),phrase);
for(const phrase of ['Manual movement input','combat','gather','85 world units','115','38','Real devices'])assert.ok(files.combat.toLowerCase().includes(phrase.toLowerCase()),phrase);
const game=fs.readFileSync('game.js','utf8');
assert.match(game,/function attemptEnhancement\(\)/);
assert.match(game,/function autoMoveTarget\(\)/);
assert.match(game,/localStorage\.setItem\(KEY_V3/);
console.log('Design-review remediation evidence checks passed (documentation only)');
