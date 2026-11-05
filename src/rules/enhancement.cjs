'use strict';
const MATERIALS = ['gold','iron','enhancementStone'];
const integer = n => Number.isSafeInteger(n) && n >= 0;
function validateRules(r) {
  if (!r || r.schemaVersion !== 1) throw Error('Unsupported rules');
  for (const k of ['chance',...MATERIALS,'pityCap']) if (!Array.isArray(r[k]) || r[k].length !== 15) throw Error('Invalid '+k);
  for (let i=0;i<15;i++) {
    if (!Number.isFinite(r.chance[i]) || r.chance[i]<=0 || r.chance[i]>1) throw Error('Invalid chance');
    for (const k of MATERIALS) if (!integer(r[k][i])) throw Error('Invalid cost '+k);
    if (r.pityCap[i]!==null && (!integer(r.pityCap[i]) || r.pityCap[i]<1)) throw Error('Invalid pity cap');
  }
  return true;
}
function attackBonus(n) {
  if (!integer(n) || n>15) throw Error('Invalid enhancement level');
  return 4*n+Math.floor(n**1.6);
}
function getRule(r,n) {
  validateRules(r);
  if (!integer(n) || n>=15) throw Error('Max enhancement level reached');
  return {chance:r.chance[n],gold:r.gold[n],iron:r.iron[n],enhancementStone:r.enhancementStone[n],pityCap:r.pityCap[n]};
}
function validateAttempt({rules,inventory,equipment,useProtection=false}) {
  if (!inventory || !equipment) return {ok:false,reason:'INVALID_STATE'};
  const n=equipment.enhancementLevel, highest=equipment.highestEnhancementLevel;
  if (!integer(n) || n>15 || !integer(highest) || highest<n || highest>15) return {ok:false,reason:'INVALID_EQUIPMENT'};
  if (n===15) return {ok:false,reason:'MAX_LEVEL'};
  const failures=equipment.failuresByLevel;
  if (!failures || typeof failures!=='object' || Array.isArray(failures) || Object.values(failures).some(v=>!integer(v))) return {ok:false,reason:'INVALID_PITY'};
  if ([...MATERIALS,'protectionStone'].some(k=>!integer(inventory[k]))) return {ok:false,reason:'INVALID_INVENTORY'};
  const rule=getRule(rules,n);
  for (const k of MATERIALS) if (inventory[k]<rule[k]) return {ok:false,reason:'INSUFFICIENT_'+k.toUpperCase()};
  if (useProtection && inventory.protectionStone<1) return {ok:false,reason:'INSUFFICIENT_PROTECTION'};
  return {ok:true,rule};
}
function getPreview(args) {
  const result=validateAttempt(args);
  if (!result.ok) return result;
  const {equipment,useProtection=false}=args, n=equipment.enhancementLevel, r=result.rule;
  const failures=equipment.failuresByLevel[n]||0;
  return {ok:true,level:n,targetLevel:n+1,chance:r.chance,guaranteed:r.pityCap!==null && failures>=r.pityCap-1,
    cost:{gold:r.gold,iron:r.iron,enhancementStone:r.enhancementStone,protectionStone:useProtection?1:0},
    downgradeOnFailure:n>=5 && !useProtection};
}
function executeAttempt({rules,inventory,equipment,useProtection=false,rng=Math.random}) {
  const preview=getPreview({rules,inventory,equipment,useProtection});
  if (!preview.ok) return {...preview,inventory,equipment};
  const value=preview.guaranteed?null:rng();
  if (!preview.guaranteed && (!Number.isFinite(value) || value<0 || value>=1)) throw Error('RNG must return [0,1)');
  const success=preview.guaranteed || value<preview.chance;
  const nextInventory={...inventory};
  for (const [k,v] of Object.entries(preview.cost)) nextInventory[k]-=v;
  const previousLevel=preview.level, failures={...equipment.failuresByLevel};
  let nextLevel=previousLevel;
  if (success) { nextLevel++; failures[previousLevel]=0; }
  else { failures[previousLevel]=(failures[previousLevel]||0)+1; if (preview.downgradeOnFailure) nextLevel--; }
  const nextEquipment={...equipment,enhancementLevel:nextLevel,highestEnhancementLevel:Math.max(equipment.highestEnhancementLevel,nextLevel),failuresByLevel:failures};
  return {ok:true,success,guaranteed:preview.guaranteed,previousLevel,nextLevel,inventory:nextInventory,equipment:nextEquipment,cost:preview.cost};
}
module.exports={validateRules,attackBonus,getRule,validateAttempt,getPreview,executeAttempt};
