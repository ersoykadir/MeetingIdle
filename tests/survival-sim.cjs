const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const src=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const KEY='meetingidle.hearthroot.v1',DAY_MS=16500,NOW=1800000000000;
const clone=x=>JSON.parse(JSON.stringify(x));
const crops=['grain','roots','berries'];
const plantCost={grain:2,roots:3,berries:4};
const price={grain:1,roots:2,berries:3};
function boot(saved,extras={}){
 const els=new Map(),store=new Map(Object.entries(extras)),events=new Map();let frame,now=NOW;
 if(saved)store.set(KEY,JSON.stringify(saved));
 const ctx=new Proxy({createLinearGradient(){return{addColorStop(){}}},createRadialGradient(){return{addColorStop(){}}}},{
  get(target,k){return k in target?target[k]:()=>{}},set(target,k,v){target[k]=v;return true}
 });
 function el(id){
  if(els.has(id))return els.get(id);
  const classes=new Set(),attrs=new Map(),handlers=new Map();
  const a={id,textContent:'',value:'',style:{},hidden:false,disabled:false,dataset:{},
   classList:{add(c){classes.add(c)},remove(c){classes.delete(c)},toggle(c,force){const v=force===undefined?!classes.has(c):force;if(v)classes.add(c);else classes.delete(c);return v},contains(c){return classes.has(c)}},
   setAttribute(k,v){attrs.set(k,String(v))},getAttribute(k){return attrs.get(k)},
   addEventListener(k,fn){handlers.set(k,fn)},emit(k,e={}){handlers.get(k)?.(e)},
   onclick:null,focus(){},getContext(){return ctx},setPointerCapture(){}};
  els.set(id,a);return a;
 }
 const document={getElementById:el,querySelectorAll(s){
  if(s==='[data-upgrade]')return crops.map(c=>Object.assign(el('buy-'+c+'-speed'),{dataset:{upgrade:'speed',crop:c}}));
  if(s==='[data-sell]')return crops.flatMap(c=>[1,5].map(n=>Object.assign(el('sell-'+c+'-'+n),{dataset:{sell:c,quantity:String(n)}})));
  if(s==='.tool')return ['grain','roots','berries','clear','inspect'].map(c=>Object.assign(el(c),{dataset:{tool:c}}));
  throw Error('Unknown selector '+s);
 },addEventListener(){}};
 const sandbox={document,window:{devicePixelRatio:1,innerWidth:390,innerHeight:844,addEventListener(k,fn){events.set(k,fn)}},
  localStorage:{getItem(k){return store.get(k)??null},setItem(k,v){store.set(k,v)},removeItem(k){store.delete(k)}},
  Date:class extends Date{static now(){return now}},Math,Map,console,setTimeout(){},requestAnimationFrame(fn){frame=fn},performance:{now:()=>now}};
 vm.createContext(sandbox);vm.runInContext(src,sandbox);
 const v=sandbox.window.__hearthroot;assert(v,'Game exported');
 return{v,el,store,events,render(){frame(1000)},clock(value){now=value}};
}
function noCrops(v){for(const c of v.game.map)c.kind='home'}
function days(v,n){for(let i=0;i<n;i++)v.advanceDay(true)}
function invariant(g){
 assert.equal(g.food,g.rations+crops.reduce((sum,c)=>sum+g.resources[c],0),'pantry = rations + harvested produce');
 assert(g.food>=0&&g.rations>=0);
 for(const crop of crops)assert(g.resources[crop]>=0,'nonnegative '+crop);
}
// Starting fields exist but no free resources, planting or upgrades.
const b=boot(),v=b.v;
assert(v.game.map.length>60);assert.equal(v.game.version,3);
assert.equal(v.game.settlers,5);assert.equal(v.dailyNeed(),10);assert.equal(v.fiveDayNeed(),50);
assert.equal(v.game.food,12);assert.equal(v.game.rations,12);assert.equal(v.game.coins,0);
assert.deepEqual(clone(v.game.resources),{grain:0,roots:0,berries:0});
for(const crop of crops)assert.equal(b.el(crop).disabled,true,'no free '+crop);
assert.equal(b.el('missionToggle').getAttribute('aria-expanded'),'false');
v.updateUI();assert(b.el('missionSummary').textContent.includes('5 settlers · 10 food/day'));
assert(b.el('supplyHint').textContent.includes('no extra bill'));
b.el('missionToggle').emit('click');assert.equal(b.el('missionToggle').getAttribute('aria-expanded'),'true');
// Meals consume the reserve first, then crop inventories in a fixed order. No double spending.
const meals=boot();noCrops(meals.v);meals.v.setRations(7);
Object.assign(meals.v.game.resources,{grain:5,roots:4,berries:3});meals.v.refreshFood(meals.v.game);
meals.v.advanceDay(true);
assert.deepEqual(clone(meals.v.game.lastDay.consumed),{rations:7,grain:3,roots:0,berries:0});
assert.deepEqual(clone(meals.v.game.resources),{grain:2,roots:4,berries:3});
assert.equal(meals.v.game.food,9);invariant(meals.v.game);
meals.v.advanceDay(true);assert.equal(meals.v.game.food,0);
assert.equal(meals.v.game.lastDay.shortfall,1);invariant(meals.v.game);
const hungry=boot();noCrops(hungry.v);hungry.v.setRations(7);
hungry.v.advanceDay();assert.equal(hungry.v.game.lastDay.shortfall,3);assert.equal(hungry.v.game.hope,70);
assert(hungry.el('message').textContent.includes('Missing 3; hope -5'));
hungry.v.setRations(10);hungry.v.advanceDay(true);assert.equal(hungry.v.game.hope,71);
for(const [reserve,expected] of [[110,6],[109,5]]){
 const a=boot();noCrops(a.v);a.v.setRations(reserve);days(a.v,5);
 assert.equal(a.v.game.settlers,expected,'arrival requires five days of food for new population');
 assert.equal(a.v.game.food,reserve-50);
}
// Each harvest adds matching crop units (not separate planting stock, Seeds or extra food).
for(const crop of crops){
 const h=boot();noCrops(h.v);h.v.setRations(100);
 const field=h.v.game.map[0];Object.assign(field,{kind:'crop',crop,growth:.99,weed:0,quality:0});
 h.v.advanceDay(true);const amount=h.v.game.lastDay.harvestByCrop[crop];
 assert(amount>0);assert.equal(h.v.game.resources[crop],amount);
 assert.equal(h.v.game.food,90+amount);
 assert.equal(h.v.game.lastDay.eaten,10);invariant(h.v.game);
 assert(!('seeds' in h.v.game));assert(!('plantingStock' in h.v.game));
}
// Harvested crop pays for planting, and selling reduces the SAME pantry.
for(const crop of crops){
 const h=boot();noCrops(h.v);h.v.setRations(100);
 const producer=h.v.game.map[0];Object.assign(producer,{kind:'crop',crop,growth:.99,weed:0,quality:0});
 const meadow=h.v.game.map[1];Object.assign(meadow,{kind:'meadow',crop:null,growth:0,weed:0});
 h.el(crop).emit('click');assert.equal(h.v.act(meadow),false,'cannot plant without produce');
 h.v.advanceDay(true);
 const gained=h.v.game.resources[crop],pantryBefore=h.v.game.food;
 assert(gained>=plantCost[crop]);h.v.updateUI();
 assert.equal(h.el(crop+'Stock').textContent,String(gained));
 assert.equal(h.el(crop).disabled,false);
 h.el(crop).emit('click');assert.equal(h.v.act(producer),false,'same crop click does not spend');
 assert(h.v.act(meadow));assert.equal(meadow.crop,crop);
 assert.equal(h.v.game.resources[crop],gained-plantCost[crop]);
 assert.equal(h.v.game.food,pantryBefore-plantCost[crop]);invariant(h.v.game);
 const foodBeforeSale=h.v.game.food,coinsBefore=h.v.game.coins;
 if(h.v.game.resources[crop]>=1){
  assert(h.v.sellCrop(crop,1));assert.equal(h.v.game.coins,coinsBefore+price[crop]);
  assert.equal(h.v.game.food,foodBeforeSale-1);invariant(h.v.game);
 }
 assert.equal(h.v.sellCrop(crop,5),false,'cannot oversell inventory');
 const stock=h.v.game.resources[crop];h.el('clear').emit('click');
 assert(h.v.act(meadow));assert.equal(h.v.game.resources[crop],stock,'clearing does not refund a crop');
}
// Selling is a player choice: earn coins, improve crop growth or individual field quality.
const market=boot();market.v.setRations(200);
market.v.game.resources.berries=20;market.v.refreshFood(market.v.game);market.v.updateUI();
market.v.setShopOpen(true);assert.equal(market.el('upgradeShade').hidden,false);
market.el('sell-berries-5').onclick();
assert.equal(market.v.game.resources.berries,15);assert.equal(market.v.game.coins,15);
market.el('sell-berries-1').onclick();assert.equal(market.v.game.coins,18);
assert.equal(market.v.buyUpgrade('berries'),false,'need enough coins for growth upgrade');
market.v.game.coins=100;market.v.updateUI();assert(market.v.buyUpgrade('berries'));
assert.equal(market.v.game.cropUpgrades.berries,1);assert.equal(market.v.upgradeCost('berries'),58);
assert.equal(market.el('berriesSpeedLevel').textContent,'1/5');
market.v.setShopOpen(false);assert.equal(market.el('upgradeShade').hidden,true);
const field=market.v.game.map.find(c=>c.kind==='crop');
market.el('inspect').emit('click');market.v.act(field);
assert.equal(market.el('improveField').hidden,false);
assert.equal(field.quality,0);assert.equal(market.v.fieldUpgradeCost(field),8);
const beforeQualityCoins=market.v.game.coins;market.el('improveField').onclick();
assert.equal(field.quality,1);assert.equal(market.v.game.coins,beforeQualityCoins-8);
assert.equal(market.el('detailText').textContent.includes('Field quality 1/5'),true);
const qualityYield=boot();noCrops(qualityYield.v);qualityYield.v.setRations(100);
const q=qualityYield.v.game.map[0];Object.assign(q,{kind:'crop',crop:'grain',growth:.99,weed:0,quality:2});
qualityYield.v.advanceDay(true);assert.equal(qualityYield.v.game.lastDay.harvest,8,'individual field quality boosts yield');
const base=boot(),faster=boot();noCrops(base.v);noCrops(faster.v);
Object.assign(base.v.game.map[0],{kind:'crop',crop:'grain',growth:0,weed:0,quality:0});
Object.assign(faster.v.game.map[0],{kind:'crop',crop:'grain',growth:0,weed:0,quality:0});
faster.v.game.cropUpgrades.grain=1;base.v.advanceDay(true);faster.v.advanceDay(true);
assert(faster.v.game.map[0].growth>base.v.game.map[0].growth,'crop speed upgrade accelerates growth');
// Forecast uses the same harvest and meal ledger and never grants resources to live game.
for(const startDay of [1,4,8,13]){
 const f=boot();f.v.game.day=startDay;f.v.setRations(10);f.v.game.cropUpgrades.roots=2;
 const before=JSON.stringify(f.v.game),pred=clone(f.v.forecastFood());
 assert.equal(JSON.stringify(f.v.game),before,'forecast does not mutate real crops');
 let harvest=0,shortfall=0,firstShortfall=null;
 for(let i=0;i<5;i++){f.v.advanceDay(true);const r=f.v.game.lastDay;harvest+=r.harvest;shortfall+=r.shortfall;if(r.shortfall&&firstShortfall===null)firstShortfall=r.day}
 assert.equal(pred.harvest,harvest);assert.equal(pred.food,f.v.game.food);
 assert.equal(pred.shortfall,shortfall);assert.equal(pred.firstShortfall,firstShortfall);
}
// Long-run conservation with planting and sales: no resources created by transactions.
const long=boot();let sold=0,spent=0;
for(let day=0;day<120;day++){
 const beforeFood=long.v.game.food;
 long.v.advanceDay(true);const report=long.v.game.lastDay;
 assert.equal(long.v.game.food,beforeFood+report.harvest-report.eaten);
 invariant(long.v.game);
 for(const crop of crops){
  if(day%7===0&&long.v.game.resources[crop]>plantCost[crop]+5){
   const old=long.v.game.food;long.v.sellCrop(crop,5);sold+=5;
   assert.equal(long.v.game.food,old-5);
  }
  if(day%11===0&&long.v.game.resources[crop]>=plantCost[crop]){
   const tile=long.v.game.map.find(c=>c.kind==='meadow');if(!tile)continue;
   long.el(crop).emit('click');const old=long.v.game.food;
   if(long.v.act(tile)){spent+=plantCost[crop];assert.equal(long.v.game.food,old-plantCost[crop])}
  }
 }
 invariant(long.v.game);
}
assert(sold>=0&&spent>=0);
// Developer console edits inventory and rations atomically.
const dev=boot();dev.el('devToggle').onclick();assert.equal(dev.el('devShade').hidden,false);
const edit={rations:250,coins:90,settlers:8,hope:50,grain:2,roots:3,berries:4};
for(const [key,id] of Object.entries({rations:'devFood',coins:'devCoins',settlers:'devSettlers',hope:'devHope',grain:'devGrain',roots:'devRoots',berries:'devBerries'}))dev.el(id).value=String(edit[key]);
let prevented=false;dev.el('devForm').onsubmit({preventDefault(){prevented=true}});assert(prevented);
assert.equal(dev.v.game.food,259);assert.equal(dev.v.game.coins,90);assert.equal(dev.v.game.settlers,8);
assert.deepEqual(clone(dev.v.game.resources),{grain:2,roots:3,berries:4});
assert.equal(dev.el('grainStock').textContent,'2');assert.equal(dev.el('coinCount').textContent,'90');
const snapshot=JSON.stringify(dev.v.game);
for(const bad of [{...edit,coins:-1},{...edit,roots:1.5},{...edit,hope:101},{...edit,rations:NaN},{...edit,settlers:0}]){
 assert.equal(dev.v.applyDevValues(bad),false);assert.equal(JSON.stringify(dev.v.game),snapshot);
}
dev.el('devFood').value='12345';dev.v.updateUI();assert.equal(dev.el('devFood').value,'12345');
dev.el('devRefresh').onclick();assert.equal(dev.el('devFood').value,'250');
dev.events.get('keydown')({key:'Escape',target:{tagName:'INPUT'}});
assert.equal(dev.el('devShade').hidden,true);
// Zoom, rotation, speed, day skipping and reset still work.
v.setZoom(1.5);assert.equal(v.getZoom(),1.5);v.turn(1);assert.equal(v.game.angle,1);
v.setZoom(50);assert.equal(v.getZoom(),2.25);v.setZoom(.1);assert.equal(v.getZoom(),.6);
b.el('zoomReset').onclick();assert.equal(v.getZoom(),1);
b.el('scene').emit('wheel',{deltaY:-100,deltaMode:0,preventDefault(){}});assert(v.getZoom()>1);
v.turn(-1);assert.equal(v.game.angle,0);b.render();
assert(/%$/.test(b.el('dayProgress').style.width));
const clock=boot();noCrops(clock.v);clock.v.setRations(500);
clock.clock(NOW+DAY_MS/2);clock.render();assert.equal(clock.v.game.day,1);
assert(clock.v.setGameSpeed(10));clock.render();
assert.equal(Number.parseFloat(clock.el('dayProgress').style.width),50);
clock.clock(NOW+DAY_MS/2+825);clock.render();assert.equal(clock.v.game.day,2);assert.equal(clock.v.game.food,490);
clock.el('devPause').onclick();assert.equal(clock.v.getGameSpeed(),0);
clock.clock(NOW+1000000);clock.render();assert.equal(clock.v.game.day,2);
clock.el('devPause').onclick();assert.equal(clock.v.getGameSpeed(),1);
const skip=boot(),normal=boot();skip.v.setGameSpeed(0);
assert(skip.v.skipDays(30));days(normal.v,30);
for(const key of ['day','food','rations','coins','resources','cropUpgrades','settlers','hope','reviewDays','cycleShortfall','map','lastDay'])
 assert.deepEqual(clone(skip.v.game[key]),clone(normal.v.game[key]),'day skipping '+key);
skip.el('devReset').onclick();assert.deepEqual(clone(skip.v.game),clone(skip.v.initial()));
assert.equal(skip.v.getGameSpeed(),1);assert.equal(skip.el('devCoins').value,'0');
assert(/<button[^>]*id="resetGame"[^>]*>Reset game<\/button>/.test(html));
const reset=boot(),identity=reset.v.game;
days(reset.v,6);reset.v.game.coins=100;reset.v.turn(1);reset.v.setZoom(1.7);
reset.el('resetGame').onclick();
assert.strictEqual(identity,reset.v.game);assert.deepEqual(clone(identity),clone(reset.v.initial()));
assert.equal(reset.v.getZoom(),1.7);assert.equal(reset.el('coinCount').textContent,'0');
assert.equal(reset.el('food').textContent,'12');assert.equal(reset.el('upgradeShade').hidden,true);
// Reload deliberately starts fresh while camera/panel preferences are retained.
for(const version of [1,2,3]){
 const old=clone(long.v.game);Object.assign(old,{version,day:124,food:9000,coins:400,hope:25,angle:3,tick:NOW-20*DAY_MS});
 const reload=boot(old,{'meetingidle.hearthroot.zoom':'1.7','meetingidle.hearthroot.missionOpen':'1','unrelated.setting':'keep'});
 assert.deepEqual(clone(reload.v.game),clone(reload.v.initial()));
 assert.equal(reload.store.has(KEY),false);assert.equal(reload.v.getZoom(),1.7);
 assert.equal(reload.el('missionToggle').getAttribute('aria-expanded'),'true');
 assert.equal(reload.store.get('unrelated.setting'),'keep');
}
const same=boot();same.clock(NOW+20*DAY_MS);same.render();
assert.equal(same.v.game.day,11);same.render();assert.equal(same.v.game.day,11);
console.log('PASS: resource accounting, harvest inventories, planting/selling choices, individual quality, irrigation, forecast, 120-day ledger, shortage, arrivals, dev console, camera, speed, resets and catch-up.');
