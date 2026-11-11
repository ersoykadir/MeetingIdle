const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const src=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const els=new Map();
function el(id){
 if(els.has(id))return els.get(id);
 const classes=new Set(),attrs=new Map();
 const a={id,textContent:'',style:{},hidden:false,disabled:false,dataset:{},
  classList:{add(c){classes.add(c)},remove(c){classes.delete(c)},toggle(c,force){const v=force===undefined?!classes.has(c):force;if(v)classes.add(c);else classes.delete(c);return v},contains(c){return classes.has(c)}},
  setAttribute(k,v){attrs.set(k,String(v))},getAttribute(k){return attrs.get(k)},
  addEventListener(){},onclick:null,getContext(){return ctx},setPointerCapture(){}};
 els.set(id,a);return a;
}
const ctx=new Proxy({createLinearGradient(){return{addColorStop(){}}},createRadialGradient(){return{addColorStop(){}}}},{
 get(target,k){return k in target?target[k]:()=>{}},set(target,k,v){target[k]=v;return true}
});
const document={
 getElementById:el,
 querySelectorAll(s){
  if(s==='[data-upgrade]')return ['soil','water','baskets','glass'].map(n=>Object.assign(el('buy-'+n),{dataset:{upgrade:n}}));
  return ['grain','roots','berries','clear','inspect'].map(n=>Object.assign(el(n),{dataset:{tool:n}}));
 },
 addEventListener(){}
};
const store=new Map();
let frame;
const sandbox={document,window:{devicePixelRatio:1,innerWidth:390,innerHeight:844,addEventListener(){}},
 localStorage:{getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)}},
 Date,Math,Map,console,setTimeout(){},requestAnimationFrame(fn){frame=fn},performance:{now:()=>Date.now()}};
vm.createContext(sandbox);vm.runInContext(src,sandbox);
const v=sandbox.window.__hearthroot;assert(v,'Game exported');
assert(v.game.map.length>60,'terrain loaded');
assert.equal(v.rationTarget(0),55);
assert.equal(v.rationTarget(1),67);
assert.equal(v.rationTarget(2),79);
assert.equal(v.game.rationCycle,0);
assert.equal(v.game.seeds,0);
assert.equal(el('missionToggle').getAttribute('aria-expanded'),'false');
assert.equal(v.getZoom(),1);
v.setZoom(1.5);assert.equal(v.getZoom(),1.5);
v.setZoom(1);
assert.equal(v.buyUpgrade('soil'),false,'cannot spend without seeds');
const firstCost=v.upgradeCost('soil');
assert.equal(firstCost,10);
const crops=v.game.map.filter(c=>c.kind==='crop');
assert(crops.length>=4);
for(const crop of crops)crop.growth=.96;
const beforeFood=v.game.food;
v.advanceDay(true);
assert(v.game.food>beforeFood,'automatic harvest produces food');
assert(v.game.seeds>0,'automatic harvest produces seeds');
v.game.seeds=100;
assert.equal(v.buyUpgrade('soil'),true);
assert.equal(v.game.upgrades.soil,1);
assert.equal(v.game.seeds,90);
assert(v.upgradeCost('soil')>firstCost,'higher levels cost more');
assert.equal(v.buyUpgrade('water'),true);
assert.equal(v.game.upgrades.water,1);
assert.equal(v.buyUpgrade('baskets'),true);
assert.equal(v.game.upgrades.baskets,1);
v.setShopOpen(true);assert.equal(el('upgradeShade').hidden,false);
v.setShopOpen(false);assert.equal(el('upgradeShade').hidden,true);
v.game.food=500;
while(v.game.day<6)v.advanceDay(true);
assert.equal(v.game.rationCycle,1,'first ration completed');
assert.equal(v.rationTarget(v.game.rationCycle),67,'quota increased');
assert(v.game.food<500&&v.game.food>0,'ration deducted');
v.turn(1);assert.equal(v.game.angle,1);
v.turn(-1);assert.equal(v.game.angle,0);
frame(1000);
assert(el('missionSummary').textContent.includes('/ 67'),'updated ration displayed');
assert.equal(el('seedCount').textContent,String(v.game.seeds));
assert(el('soilLevel').textContent.includes('1/6'),'upgrade shown in UI');
assert(/%$/.test(el('dayProgress').style.width),'day timer stays active');
v.game.seeds=20000;
while(v.game.upgrades.glass<1)assert.equal(v.buyUpgrade('glass'),true);
assert.equal(v.buyUpgrade('glass'),false,'unique improvement cannot be rebought');
assert.equal(el('buy-glass').disabled,true,'locked at max level');
v.save();
const saved=JSON.parse(store.get('meetingidle.hearthroot.v1'));
assert.equal(saved.upgrades.glass,1);assert(saved.rationCycle===1);
console.log('PASS: escalating targets, resources, compounding upgrades, UI, canvas, saves');
