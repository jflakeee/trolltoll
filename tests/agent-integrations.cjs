'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const modules=fs.readFileSync('.gitmodules','utf8');
const sources=[
 ['awesome-gamedev-agent-skills','gamedev-skills/awesome-gamedev-agent-skills'],
 ['claude-gamedev-kit','dudwns0921/claude-gamedev-kit'],
 ['dream-loop','achimala/dream-loop'],
 ['plinkfx','maximilianfeix/plinkfx']
];
for(const [name,repository] of sources){
 assert.ok(modules.includes('path = tools/agent-sources/'+name),'missing submodule '+name);
 assert.ok(modules.includes('url = https://github.com/'+repository+'.git'),'missing source '+repository);
}
const skills=['ai-behavior-trees-utility-ai','game-ai','game-feel','game-ui-ux','input-systems','save-systems','rpg','survival-crafting','dream-loop','plinkfx'];
for(const skill of skills){
 const path='.claude/skills/'+skill+'/SKILL.md';
 assert.match(fs.readFileSync(path,'utf8'),/^---\s*\nname:/,'invalid skill frontmatter '+path);
}
assert.ok(fs.existsSync('.claude/skills/dream-loop/references/plus-mode/workflow.md'));
assert.ok(fs.existsSync('.claude/skills/dream-loop/references/pro-mode/workflow.md'));
assert.ok(fs.existsSync('.claude/skills/plinkfx/reference.md'));
assert.ok(fs.existsSync('.claude/skills/pixelfx/SKILL.md'),'original PixelFX skill was lost');
assert.ok(fs.existsSync('.claude/skills/start/SKILL.md'),'original Game Studios skill was lost');
assert.ok(fs.existsSync('project.yaml'),'Game Studios config was lost');
assert.ok(fs.readFileSync('package.json','utf8').includes('github:patch-gg/pixelfx'),'PixelFX runtime dependency was lost');
assert.ok(fs.existsSync('scripts/install-game-dev-tools.sh'));
console.log('Additional game dev tools are mapped and existing game tools remain intact');
