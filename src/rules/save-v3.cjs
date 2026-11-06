'use strict';
const BOSS_IDS = new Set(['boss0','boss1','boss2']);
const LEGACY_FIELDS = ['x','y','level','xp','atk','def','hp','currentHp','kills','gold','wood','stone','iron','workbench','forge','pick','axe','blade','club','armor','relics','relicBlade','bossKills'];
const FLAGS = new Set(['workbench','forge','pick','axe','blade','club','armor','relicBlade']);
const COUNTS = new Set(['level','xp','atk','def','hp','currentHp','kills','gold','wood','stone','iron','relics']);
const defaults = {x:0,y:0,level:1,xp:0,atk:10,def:5,hp:100,currentHp:100,kills:0,gold:0,wood:0,stone:0,iron:0,workbench:false,forge:false,pick:false,axe:false,blade:false,club:false,armor:false,relics:0,relicBlade:false,bossKills:[]};
const object = v => v!==null && typeof v==='object' && !Array.isArray(v);
const safeInt = (v,d=0) => Number.isSafeInteger(v) && v>=0 ? v : d;
function normalizeLegacy(source) {
  const raw=object(source)?source:{};
  const legacy={};
  for(const k of LEGACY_FIELDS) {
    if(k==='bossKills') legacy[k]=Array.isArray(raw[k])?[...new Set(raw[k].filter(v=>BOSS_IDS.has(v)))]:[];
    else if(FLAGS.has(k)) legacy[k]=raw[k]===true;
    else if(COUNTS.has(k)) legacy[k]=safeInt(raw[k],defaults[k]);
    else legacy[k]=Number.isFinite(raw[k])?raw[k]:defaults[k];
  }
  legacy.level=Math.max(1,legacy.level);
  legacy.atk=Math.max(1,legacy.atk);
  legacy.hp=Math.max(1,legacy.hp);
  legacy.currentHp=Math.min(legacy.hp,Math.max(1,legacy.currentHp));
  return legacy;
}
function normalizeProgression(source) {
  const p=object(source)?source:{},inv=object(p.inventory)?p.inventory:{};
  const e=object(p.equipment)&&object(p.equipment.mainWeapon)?p.equipment.mainWeapon:{};
  const level=Math.min(15,safeInt(e.enhancementLevel));
  const highest=Math.min(15,Math.max(level,safeInt(e.highestEnhancementLevel)));
  const failures={};
  if(object(e.failuresByLevel)) for(const [key,value] of Object.entries(e.failuresByLevel)) {
    if(/^(0|[1-9]|1[0-4])$/.test(key) && Number.isSafeInteger(value) && value>=0) failures[key]=value;
  }
  const pity=object(p.rewardPity)?p.rewardPity:{};
  return {inventory:{
    enhancementStone:safeInt(inv.enhancementStone),
    protectionStone:safeInt(inv.protectionStone),
    awakeningStone:safeInt(inv.awakeningStone),
    evolutionStone:safeInt(inv.evolutionStone),
    ancientWood:safeInt(inv.ancientWood)
  },equipment:{mainWeapon:{enhancementLevel:level,highestEnhancementLevel:highest,failuresByLevel:failures}},
  rewardPity:{normalKills:safeInt(pity.normalKills),logging:safeInt(pity.logging),mining:safeInt(pity.mining),rareVein:safeInt(pity.rareVein)}};
}
function migrateSave(raw) {
  if(!object(raw)) throw Error('INVALID_SAVE');
  if(raw.schemaVersion===3) {
    if(!object(raw.legacy)) throw Error('INVALID_V3_LEGACY');
    return {schemaVersion:3,revision:safeInt(raw.revision),legacy:normalizeLegacy(raw.legacy),progression:normalizeProgression(raw.progression)};
  }
  if(raw.schemaVersion!==undefined && raw.schemaVersion!==2 && raw.schemaVersion!==1) throw Error('UNSUPPORTED_SCHEMA');
  return {schemaVersion:3,revision:0,legacy:normalizeLegacy(raw),progression:normalizeProgression(null)};
}
function decodeSave(json) {
  return migrateSave(JSON.parse(json));
}
function encodeSave(save) {
  const normalized=migrateSave(save);
  return JSON.stringify(normalized);
}
module.exports={LEGACY_FIELDS,normalizeLegacy,normalizeProgression,migrateSave,decodeSave,encodeSave};
