const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),src=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const els=new Map();function el(id){if(els.has(id))return els.get(id);const a={id,textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},onclick:null,getContext(){return ctx},setPointerCapture(){},dataset:{}};els.set(id,a);return a}
const canvas=el('scene');const ctx=new Proxy({createLinearGradient(){return{addColorStop(){}}},createRadialGradient(){return{addColorStop(){}}}}, {get(target,k){return k in target?target[k]:()=>{}},set(target,k,v){target[k]=v;return true}});
const document={getElementById:el,querySelectorAll(s){return['grain','roots','berries','clear','inspect'].map(n=>Object.assign(el(n),{dataset:{tool:n}}))},addEventListener(){}};
const store=new Map();let lastFrame;const sandbox={document,window:{devicePixelRatio:1,innerWidth:1280,innerHeight:720,addEventListener(){}},localStorage:{getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)}},Date,Math,Map,console,setTimeout(fn){},requestAnimationFrame(fn){lastFrame=fn},performance:{now:()=>Date.now()}};
vm.createContext(sandbox);vm.runInContext(src,sandbox);const v=sandbox.window.__hearthroot;
assert(v,'Game exposed');assert(v.game.map.length>60,'island tiles');assert.equal(v.game.day,1);assert.equal(v.game.weather,'sun');
assert(v.game.map.some(x=>x.kind==='tree'));assert(v.game.map.filter(x=>x.kind==='crop').length>=4);
const t=v.game.map.find(x=>x.kind==='meadow');v.act(t);assert.equal(t.kind,'crop');assert.equal(t.crop,'grain');
for(let d=0;d<5;d++)v.advanceDay(true);assert.equal(v.game.day,6,'five days pass');assert(v.game.food>=0,'food nonnegative');assert(v.game.hope>=5,'hope stays bounded');
v.turn(1);assert.equal(v.game.angle,1);v.turn(-1);assert.equal(v.game.angle,0);
try{lastFrame(1000);console.log('Frame simulated successfully')}catch(e){console.warn('Frame error',e);process.exitCode=1}
console.log('All simulation checks passed',JSON.stringify({tiles:v.game.map.length,crops:v.game.map.filter(x=>x.kind==='crop').length,day:v.game.day,food:v.game.food,hope:v.game.hope}));