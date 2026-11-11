const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const src=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const KEY='meetingidle.hearthroot.v1',DAY_MS=16500,NOW=1800000000000;
const clone=x=>JSON.parse(JSON.stringify(x));
function boot(saved,extras={}){
 const els=new Map(),store=new Map(Object.entries(extras)),events=new Map();let frame,now=NOW;
 if(saved)store.set(KEY,JSON.stringify(saved));
 const ctx=new Proxy({createLinearGradient(){return{addColorStop(){}}},createRadialGradient(){return{addColorStop(){}}}},{
  get(target,k){return k in target?target[k]:()=>{}},set(target,k,v){target[k]=v;return true}
 });
 function el(id){
  if(els.has(id))return els.get(id);
  const classes=new Set(),attrs=new Map(),handlers=new Map();
  const a={id,textContent:'',style:{},hidden:false,disabled:false,dataset:{},
   classList:{add(c){classes.add(c)},remove(c){classes.delete(c)},toggle(c,force){const v=force===undefined?!classes.has(c):force;if(v)classes.add(c);else classes.delete(c);return v},contains(c){return classes.has(c)}},
   setAttribute(k,v){attrs.set(k,String(v))},getAttribute(k){return attrs.get(k)},
   addEventListener(k,fn){handlers.set(k,fn)},emit(k,e={}){handlers.get(k)?.(e)},onclick:null,focus(){},getContext(){return ctx},setPointerCapture(){}};
  els.set(id,a);return a;
 }
 const document={getElementById:el,querySelectorAll(s){
  if(s==='[data-upgrade]')return ['soil','water','baskets','glass'].map(n=>Object.assign(el('buy-'+n),{dataset:{upgrade:n}}));
  return ['grain','roots','berries','clear','inspect'].map(n=>Object.assign(el(n),{dataset:{tool:n}}));
 },addEventListener(){}};
 const sandbox={document,window:{devicePixelRatio:1,innerWidth:390,innerHeight:844,addEventListener(k,fn){events.set(k,fn)}},
  localStorage:{getItem(k){return store.get(k)??null},setItem(k,v){store.set(k,v)},removeItem(k){store.delete(k)}},
  Date:class extends Date{static now(){return now}},Math,Map,console,setTimeout(){},requestAnimationFrame(fn){frame=fn},performance:{now:()=>now}};
 vm.createContext(sandbox);vm.runInContext(src,sandbox);
 const api=sandbox.window.__hearthroot;assert(api,'Game exported');
 return{v:api,el,store,events,render(){frame(1000)},clock(value){now=value},save(){api.save();return store.has(KEY)?JSON.parse(store.get(KEY)):null}};
}
function noCrops(v){for(const c of v.game.map)c.kind='home'}
function days(v,n){for(let i=0;i<n;i++)v.advanceDay(true)}
const b=boot(),v=b.v;
assert(v.game.map.length>60);assert.equal(v.game.version,2);
assert.equal(v.game.settlers,5);assert.equal(v.dailyNeed(),10);assert.equal(v.fiveDayNeed(),50);
assert.equal(v.game.food,12);assert.equal(v.game.seeds,0);
assert.equal(b.el('missionToggle').getAttribute('aria-expanded'),'false');
v.updateUI();assert(b.el('missionSummary').textContent.includes('5 settlers · 10 food/day · 1.2d stored'));
assert(b.el('supplyHint').textContent.includes('no extra bill'));
assert(b.el('forecast').textContent.includes('Forecast'));
b.el('missionToggle').emit('click');assert.equal(b.el('missionToggle').getAttribute('aria-expanded'),'true');

// Daily meals consume storage even without harvest; boundaries never charge again.
const pantry=boot();noCrops(pantry.v);pantry.v.game.food=500;
for(let i=1;i<=5;i++){
 pantry.v.advanceDay(true);assert.equal(pantry.v.game.food,500-10*i,`meal ${i}`);
 assert.equal(pantry.v.game.lastDay.eaten,10);
}
assert.equal(pantry.v.game.day,6);assert.equal(pantry.v.game.rationCycle,1);
assert.equal(pantry.v.game.settlers,6);assert(pantry.v.game.lastDay.arrived);
assert.equal(pantry.v.game.food,450,'arrival neither spends food nor eats early');
pantry.v.advanceDay(true);assert.equal(pantry.v.game.food,438,'arrival eats from following day');
pantry.v.updateUI();assert(pantry.el('missionSummary').textContent.includes('6 settlers · 12 food/day'));
assert(pantry.el('supplyHint').textContent.includes('60 food total'));
pantry.v.act(pantry.v.game.map.find(c=>c.x===5&&c.y===4));
assert(pantry.el('detailText').textContent.includes('6 settlers'));

// Harvest comes first: an empty pantry is safe when two ready grain fields cover dinner.
const harvest=boot();noCrops(harvest.v);harvest.v.game.food=0;
for(const c of harvest.v.game.map.slice(0,2))Object.assign(c,{kind:'crop',crop:'grain',growth:.99,weed:0});
harvest.v.advanceDay(true);assert.equal(harvest.v.game.lastDay.harvest,10);
assert.equal(harvest.v.game.lastDay.shortfall,0);assert.equal(harvest.v.game.food,0);
assert.equal(harvest.v.game.hope,76);assert.equal(harvest.v.game.seeds,4);

// Shortfalls have a proportional, rounded-up hope cost; never negative food or death.
const hungry=boot();noCrops(hungry.v);hungry.v.game.food=7;
hungry.v.advanceDay();assert.equal(hungry.v.game.food,0);
assert.equal(hungry.v.game.lastDay.shortfall,3);assert.equal(hungry.v.game.hope,70);
assert(hungry.el('message').textContent.includes('Missing 3; hope -5'));
hungry.v.advanceDay(true);assert.equal(hungry.v.game.hope,55);
days(hungry.v,10);assert.equal(hungry.v.game.hope,5);assert.equal(hungry.v.game.settlers,5);
hungry.v.game.food=10;hungry.v.advanceDay(true);assert.equal(hungry.v.game.hope,6);
assert.equal(hungry.v.game.lastDay.shortfall,0,'no outstanding food debt');

// Arrival gates: pantry threshold checked after dinner, hope threshold, entire period fed.
for(const [food,hope,shortfall,expected] of [[110,75,0,6],[109,75,0,5],[110,64,0,5],[110,65,0,6],[110,75,1,5]]){
 const a=boot();noCrops(a.v);Object.assign(a.v.game,{food,hope,cycleShortfall:shortfall});days(a.v,5);
 assert.equal(a.v.game.settlers,expected,`arrival gates ${food},${hope},${shortfall}`);
 assert.equal(a.v.game.food,food-50,'milestone is not a bill');
}
const postponed=boot();noCrops(postponed.v);postponed.v.game.food=0;postponed.v.advanceDay(true);
Object.assign(postponed.v.game,{food:500,hope:75});days(postponed.v,4);
assert.equal(postponed.v.game.settlers,5,'one missed meal postpones this review');
days(postponed.v,5);assert.equal(postponed.v.game.settlers,6,'next healthy period can grow');

// Forecast uses crops, weather, weeds and upgrades; never mutates the real game.
for(const startDay of [1,4,8,13]){
 const f=boot();Object.assign(f.v.game,{day:startDay,food:10,hope:5});
 Object.assign(f.v.game.upgrades,{soil:2,water:2,baskets:1,glass:1});
 const before=JSON.stringify(f.v.game),forecast=clone(f.v.forecastFood());
 assert.equal(JSON.stringify(f.v.game),before,'forecast leaves live state intact');
 let harvest=0,shortfall=0,firstShortfall=null;
 for(let i=0;i<5;i++){
  f.v.advanceDay(true);harvest+=f.v.game.lastDay.harvest;shortfall+=f.v.game.lastDay.shortfall;
  if(f.v.game.lastDay.shortfall&&firstShortfall===null)firstShortfall=f.v.game.day;
 }
 assert.equal(forecast.food,f.v.game.food);assert.equal(forecast.harvest,harvest);
 assert.equal(forecast.shortfall,shortfall);assert.equal(forecast.firstShortfall,firstShortfall);
 assert.equal(forecast.need,50);
}
const dry=boot();noCrops(dry.v);dry.v.game.food=12;
const forecast=dry.v.forecastFood();assert.equal(forecast.food,0);
assert.equal(forecast.shortfall,38);assert.equal(forecast.firstShortfall,3);
dry.v.updateUI();assert(dry.el('forecast').textContent.includes('first shortfall on day 3'));

// Seed improvements, crop planting, camera controls, renderer and UI remain usable.
assert.equal(v.buyUpgrade('soil'),false);v.game.seeds=20000;
for(const key of ['soil','water','baskets','glass'])assert(v.buyUpgrade(key));
assert.equal(v.game.upgrades.soil,1);assert.equal(v.upgradeCost('soil'),19);
assert.equal(v.buyUpgrade('glass'),false);assert.equal(b.el('buy-glass').disabled,true);
v.setShopOpen(true);assert.equal(b.el('upgradeShade').hidden,false);
v.setShopOpen(false);assert.equal(b.el('upgradeShade').hidden,true);
const patch=v.game.map.find(c=>c.kind==='meadow');v.act(patch);assert.equal(patch.kind,'crop');
v.setZoom(1.5);assert.equal(v.getZoom(),1.5);v.turn(1);assert.equal(v.game.angle,1);
v.setZoom(50);assert.equal(v.getZoom(),2.25);v.setZoom(.1);assert.equal(v.getZoom(),.6);
b.el('zoomReset').onclick();assert.equal(v.getZoom(),1);
b.el('scene').emit('wheel',{deltaY:-100,deltaMode:0,preventDefault(){}});assert(v.getZoom()>1);
b.el('scene').emit('pointerdown',{pointerId:1,clientX:100,clientY:200});
b.el('scene').emit('pointerdown',{pointerId:2,clientX:150,clientY:200});
b.el('scene').emit('pointermove',{pointerId:2,clientX:200,clientY:200});assert.equal(v.getZoom(),2.25);
b.el('scene').emit('pointerup',{pointerId:2,clientX:200,clientY:200});
b.el('scene').emit('pointerup',{pointerId:1,clientX:100,clientY:200});
v.turn(-1);assert.equal(v.game.angle,0);b.render();
assert(/%$/.test(b.el('dayProgress').style.width));
assert.equal(b.el('seedCount').textContent,String(v.game.seeds));
assert(b.el('soilLevel').textContent.includes('1/6'));
const withSoil=boot();noCrops(withSoil.v);withSoil.v.game.food=0;
Object.assign(withSoil.v.game.map[0],{kind:'crop',crop:'grain',growth:.99,weed:0});
withSoil.v.game.upgrades.soil=2;withSoil.v.advanceDay(true);
assert.equal(withSoil.v.game.lastDay.harvest,8,'soil increases actual food');

// Speed, frost protection and basket upgrades affect the real harvest simulation.
const speed=boot();noCrops(speed.v);Object.assign(speed.v.game.map[0],{kind:'crop',crop:'grain',growth:0,weed:0});
speed.v.game.upgrades.water=1;speed.v.advanceDay(true);assert.equal(speed.v.game.map[0].growth,.6);
const basket=boot();noCrops(basket.v);Object.assign(basket.v.game.map[0],{kind:'crop',crop:'grain',growth:.99,weed:0});
basket.v.game.upgrades.baskets=1;basket.v.advanceDay(true);assert.equal(basket.v.game.seeds,3);
const weatherProbe=boot();while(weatherProbe.v.game.weather!=='frost'&&weatherProbe.v.game.day<50)weatherProbe.v.advanceDay(true);
assert.equal(weatherProbe.v.game.weather,'frost');
const frostDay=weatherProbe.v.game.day;
for(const glass of [0,1]){
 const frost=boot();noCrops(frost.v);frost.v.game.day=frostDay-1;frost.v.game.upgrades.glass=glass;
 Object.assign(frost.v.game.map[0],{kind:'crop',crop:'grain',growth:0,weed:0});
 frost.v.advanceDay(true);assert.equal(frost.v.game.map[0].growth,glass?.375:.08);
}

// A 120-day run balances food exactly and invests harvest Seeds into all improvements.
const long=boot();let arrivals=0,totalHarvest=0,totalEaten=0,shortDays=0;
for(const c of long.v.game.map)if(c.kind==='meadow')long.v.act(c);
for(let i=0;i<120;i++){
 long.v.advanceDay(true);const r=long.v.game.lastDay;
 totalHarvest+=r.harvest;totalEaten+=r.eaten;arrivals+=Number(r.arrived);shortDays+=Number(r.shortfall>0);
 assert.equal(long.v.game.food,12+totalHarvest-totalEaten,`120-day food ledger ${i}`);
 assert(long.v.game.hope>=5&&long.v.game.hope<=100);
 assert(long.v.game.food>=0);assert.equal(long.v.game.settlers,5+arrivals);
 for(const key of ['soil','water','baskets','glass'])if(long.v.game.seeds>=long.v.upgradeCost(key))long.v.buyUpgrade(key);
}
assert(arrivals>=2,'production improvements support settlement growth');
for(const key of ['soil','water','baskets','glass'])assert(long.v.game.upgrades[key]>0);
console.log(`120-day simulation: ${long.v.game.settlers} settlers, ${long.v.game.food} food, ${shortDays} shortfall days; ledger balanced.`);

// Developer console resource edits are atomic, bounded and immediately reflected in meals/forecasts.
const dev=boot();assert.equal(dev.v.getGameSpeed(),1);
dev.el('devToggle').onclick();assert.equal(dev.el('devShade').hidden,false);
assert.equal(dev.el('devToggle').getAttribute('aria-expanded'),'true');
assert.equal(dev.el('devFood').value,'12');
const edited={food:250,seeds:90,settlers:8,hope:50};
for(const [key,id] of Object.entries({food:'devFood',seeds:'devSeeds',settlers:'devSettlers',hope:'devHope'}))dev.el(id).value=String(edited[key]);
let prevented=false;dev.el('devForm').onsubmit({preventDefault(){prevented=true}});assert(prevented);
for(const key of Object.keys(edited))assert.equal(dev.v.game[key],edited[key]);
assert.equal(dev.v.dailyNeed(),16);assert.equal(dev.v.fiveDayNeed(),80);
assert(dev.el('missionSummary').textContent.includes('8 settlers · 16 food/day'));
assert.equal(dev.el('seedCount').textContent,90);assert.equal(dev.el('buy-soil').disabled,false);
assert(dev.v.buyUpgrade('soil'),'edited Seeds can buy upgrades');
dev.el('devFood').value='12345';dev.v.updateUI();assert.equal(dev.el('devFood').value,'12345','live UI does not overwrite typed values');
dev.el('devRefresh').onclick();assert.equal(dev.el('devFood').value,'250');
const beforeInvalid=JSON.stringify(dev.v.game);
for(const invalid of [{...edited,food:-1},{...edited,seeds:Infinity},{...edited,settlers:0},{...edited,settlers:1.5},{...edited,hope:101},{...edited,food:1000000001},{...edited,food:NaN}]){
 assert.equal(dev.v.applyDevValues(invalid),false);assert.equal(JSON.stringify(dev.v.game),beforeInvalid,'invalid edit changes nothing');
}
dev.el('devFood').value='';dev.el('devForm').onsubmit({preventDefault(){}});assert.equal(JSON.stringify(dev.v.game),beforeInvalid,'blank input rejected');
assert(dev.v.applyDevValues({food:0,seeds:0,settlers:1,hope:5}));assert.equal(dev.v.dailyNeed(),2);
assert(Number.isFinite(dev.v.forecastFood().food));
const cameraBefore={zoom:dev.v.getZoom(),angle:dev.v.game.angle};
for(const key of ['ArrowLeft','ArrowRight','0','-','+'])dev.events.get('keydown')({key,target:{tagName:'INPUT'}});
assert.equal(dev.v.getZoom(),cameraBefore.zoom);assert.equal(dev.v.game.angle,cameraBefore.angle);
dev.events.get('keydown')({key:'Escape',target:{tagName:'INPUT'}});assert.equal(dev.el('devShade').hidden,true);

// Speed changes preserve the fraction of the day; pause freezes it without accumulating meals.
const clock=boot();noCrops(clock.v);clock.v.game.food=500;
clock.clock(NOW+DAY_MS/2);clock.render();assert.equal(clock.v.game.day,1);
assert(clock.v.setGameSpeed(10));assert.equal(clock.v.getGameSpeed(),10);
clock.render();assert.equal(Number.parseFloat(clock.el('dayProgress').style.width),50);
clock.clock(NOW+DAY_MS/2+824);clock.render();assert.equal(clock.v.game.day,1);
clock.clock(NOW+DAY_MS/2+825);clock.render();assert.equal(clock.v.game.day,2);assert.equal(clock.v.game.food,490);
clock.clock(NOW+DAY_MS/2+825+330);clock.render();
clock.el('devPause').onclick();assert.equal(clock.v.getGameSpeed(),0);clock.render();
const frozen=clock.el('dayProgress').style.width;
clock.clock(NOW+1000000);clock.render();assert.equal(clock.v.game.day,2);assert.equal(clock.el('dayProgress').style.width,frozen);
assert.equal(clock.el('speedBadge').textContent,'Paused');
clock.el('devPause').onclick();assert.equal(clock.v.getGameSpeed(),1);clock.render();
assert.equal(clock.v.game.day,2,'resuming does not bill paused time');
clock.clock(NOW+1000000+13200);clock.render();assert.equal(clock.v.game.day,3);
assert.equal(clock.v.setGameSpeed(-1),false);assert.equal(clock.v.setGameSpeed(1000),false);
clock.el('devSpeed').value='100';clock.el('devSpeed').onchange();assert.equal(clock.v.getGameSpeed(),100);
clock.v.resetGame();assert.equal(clock.v.getGameSpeed(),1);assert.equal(clock.el('devSpeed').value,'1');
const fast=boot();noCrops(fast.v);fast.v.game.food=500;fast.v.setGameSpeed(100);
fast.clock(NOW+165);fast.render();assert.equal(fast.v.game.day,2);assert.equal(fast.v.game.food,490);
fast.clock(NOW+16500);fast.render();assert.equal(fast.v.game.day,12,'fast suspended-tab catch-up still capped at ten');
fast.render();assert.equal(fast.v.game.day,12);

// Day skipping runs the normal multi-day economy even while paused, and synchronizes the editor.
const skipped=boot(),normal=boot();skipped.v.setGameSpeed(0);
assert(skipped.v.skipDays(30));days(normal.v,30);
for(const key of ['day','food','seeds','settlers','hope','reviewDays','cycleShortfall','map','lastDay'])assert.deepEqual(clone(skipped.v.game[key]),clone(normal.v.game[key]),'day skipping '+key);
assert.equal(skipped.v.getGameSpeed(),0);assert.equal(skipped.el('devFood').value,String(skipped.v.game.food));
assert.equal(skipped.v.skipDays(0),false);assert.equal(skipped.v.skipDays(366),false);
assert.equal(skipped.v.skipDays(1.5),false);
for(const count of [1,5,10,30]){const before=skipped.v.game.day;skipped.el('devDay'+count).onclick();assert.equal(skipped.v.game.day,before+count)}
skipped.v.setDevOpen(true);skipped.el('devReset').onclick();
assert.equal(skipped.el('devShade').hidden,false,'console reset keeps tools open');
assert.deepEqual(clone(skipped.v.game),clone(skipped.v.initial()));
assert.equal(skipped.v.getGameSpeed(),1);assert.equal(skipped.el('devSeeds').value,'0');
assert(skipped.el('devFeedback').textContent.includes('Settlement reset'));
skipped.el('closeDev').onclick();assert.equal(skipped.el('devShade').hidden,true);

// The visible Reset game button replaces the live settlement immediately, without reloading.
assert(/<button[^>]*id="resetGame"[^>]*>Reset game<\/button>/.test(html));
const manual=boot(),identity=manual.v.game,oldTile=identity.map[0];
days(manual.v,8);Object.assign(identity,{food:700,seeds:1000,hope:15,settlers:9});
manual.v.buyUpgrade('soil');manual.v.turn(1);manual.v.setZoom(1.7);manual.v.setShopOpen(true);
manual.el('roots').emit('click');manual.v.act(identity.map.find(c=>c.kind==='home'));
manual.el('scene').emit('pointerdown',{pointerId:1,clientX:100,clientY:100});
manual.store.set(KEY,JSON.stringify(identity));manual.clock(NOW+1000);
manual.el('resetGame').onclick();
assert.strictEqual(manual.v.game,identity,'exported reference stays live');
assert.deepEqual(clone(identity),clone(manual.v.initial()),'all settlement state and timer reset');
assert.notStrictEqual(manual.v.get(oldTile.x,oldTile.y),oldTile,'tile lookup points at the fresh map');
assert.equal(manual.v.getZoom(),1.7,'view preference retained');
assert.equal(manual.store.has(KEY),false,'old gameplay save cleared');
assert.equal(manual.el('seedCount').textContent,0);assert.equal(manual.el('food').textContent,12);
assert.equal(manual.el('dayProgress').style.width,'0%');
assert.equal(manual.el('dayProgressTrack').getAttribute('aria-valuenow'),'0');
assert.equal(manual.el('upgradeShade').hidden,true);assert(!manual.el('detail').classList.contains('visible'));
assert(manual.el('dailyReport').textContent.includes('First meal'));
assert(manual.el('message').textContent.includes('Progress reset'));
manual.el('scene').emit('pointerup',{pointerId:1,clientX:200,clientY:100});
assert.equal(identity.angle,0,'pre-reset drag cannot affect the new island');
const freshPatch=identity.map.find(c=>c.kind==='meadow');manual.v.act(freshPatch);
assert.equal(freshPatch.crop,'grain','planting still works with the default tool');
manual.v.advanceDay(true);assert.equal(identity.day,2);assert.equal(identity.lastDay.need,10);
manual.el('resetGame').onclick();assert.deepEqual(clone(identity),clone(manual.v.initial()),'repeated resets work');
manual.render();

// Every open/reload starts fresh, regardless of the saved version or elapsed time.
for(const version of [1,2]){
 const old=clone(long.v.game);
 Object.assign(old,{version,day:124,food:9000,seeds:400,hope:25,angle:3,tick:NOW-20*DAY_MS});
 const reset=boot(old,{'meetingidle.hearthroot.zoom':'1.7','meetingidle.hearthroot.missionOpen':'1','unrelated.setting':'keep'});
 assert.deepEqual(clone(reset.v.game),clone(reset.v.initial()),'saved progress is ignored entirely');
 assert.equal(reset.store.has(KEY),false,'obsolete game save removed');
 assert.equal(reset.v.getZoom(),1.7,'camera preference retained');
 assert.equal(reset.el('missionToggle').getAttribute('aria-expanded'),'true');
 assert.equal(reset.store.get('unrelated.setting'),'keep','unrelated storage untouched');
 days(reset.v,3);reset.v.game.seeds=100;assert(reset.v.buyUpgrade('soil'));
 reset.v.turn(1);reset.v.save();reset.events.get('pagehide')();
 assert.equal(reset.store.has(KEY),false,'gameplay and leaving the page do not save progress');
 const reopened=boot(null,Object.fromEntries(reset.store));
 assert.deepEqual(clone(reopened.v.game),clone(reopened.v.initial()),'subsequent opening also resets');
}
const malformed=boot(null,{[KEY]:'not valid JSON'});
assert.equal(malformed.v.game.food,12);assert.equal(malformed.v.game.day,1);
assert.equal(malformed.store.has(KEY),false);

// Keeping the same page open still runs daily meals and capped suspended-tab catch-up.
const online=boot();days(online.v,10);
const inPage=boot();inPage.clock(NOW+20*DAY_MS);inPage.render();
assert.equal(inPage.v.game.day,11);inPage.render();assert.equal(inPage.v.game.day,11,'cap also discards excess time in a background tab');
assert.equal(inPage.v.game.food,online.v.game.food);
console.log('PASS: daily food, harvest order, no cycle bill, arrivals, proportional shortages, forecasts, 120-day progression, developer edits, speed/pause, day skipping, manual reset button, reset on every load, suspended-tab simulation, Seeds, zoom, rotation and UI.');
