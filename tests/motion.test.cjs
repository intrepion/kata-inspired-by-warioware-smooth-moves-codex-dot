const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup({secure=true,api={},permission,unsupported=false}={}){
 let now=1000,timeout,requests=0;const handlers={},elements={};
 function element(id){return elements[id]??={textContent:'',style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+':'+type]=fn},querySelector(){return element(id+' child')},setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:800,height:500}},getContext(){return new Proxy({},{get:(o,k)=>o[k]||(()=>{})})}}}
 const window={isSecureContext:secure,DeviceMotionEvent:unsupported?undefined:api,addEventListener(type,fn){handlers[type]=fn},removeEventListener(type){delete handlers[type]}};
 if(permission)api.requestPermission=()=>{requests++;return permission()};
 const c={window,document:{querySelector:element},performance:{now:()=>now},requestAnimationFrame(){},setTimeout(fn){timeout=fn;return 1},clearTimeout(){timeout=null},Math,console};vm.createContext(c);
 vm.runInContext(fs.readFileSync('game.js','utf8')+`\nthis.test={get:()=>({motionState,game,state}),setGame:(id)=>{game={id,progress:0};state='play'},sensor:onDeviceMotion};`,c);
 return {t:c.test,handlers,elements,click:()=>handlers['#motionButton:click'](),tick:n=>now+=n,timeout:()=>timeout?.(),requests:()=>requests};
}
(async()=>{
 let h=setup({secure:false});await h.click();assert.equal(h.t.get().motionState,'unavailable');assert.match(h.elements['#motionStatus'].textContent,/secure/);
 h=setup({unsupported:true});await h.click();assert.equal(h.t.get().motionState,'unavailable');assert.match(h.elements['#motionStatus'].textContent,/not supported/);
 h=setup({permission:()=>Promise.resolve('denied')});assert.equal(h.requests(),0);await h.click();assert.equal(h.requests(),1);assert.equal(h.t.get().motionState,'denied');assert.equal(h.handlers.devicemotion,undefined);
 h=setup({permission:()=>Promise.reject(Error('blocked'))});await h.click();assert.equal(h.t.get().motionState,'error');
 h=setup({permission:()=>Promise.resolve('granted')});await h.click();assert.equal(h.t.get().motionState,'waiting');assert.equal(typeof h.handlers.devicemotion,'function');h.timeout();assert.equal(h.t.get().motionState,'unavailable');assert.equal(h.handlers.devicemotion,undefined);
 h=setup();h.t.setGame('shake');h.handlers['#game:pointerdown']({pointerId:1,clientX:200,clientY:200});for(const x of [230,200,230,200,230,200])h.handlers['#game:pointermove']({clientX:x,clientY:200});assert.equal(h.t.get().game.win,true);
 h=setup({permission:()=>Promise.resolve('granted')});await h.click();h.t.setGame('shake');const sample=x=>h.handlers.devicemotion({accelerationIncludingGravity:{x,y:0,z:9.8}});for(let i=0;i<10;i++)sample(0);assert.equal(h.t.get().motionState,'ready');assert.equal(h.t.get().game.progress,0);sample(10);assert.equal(h.t.get().game.progress,1);sample(-10);assert.equal(h.t.get().game.progress,1);h.tick(151);sample(-10);assert.equal(h.t.get().game.progress,2);h.t.setGame('tap');h.tick(151);sample(10);assert.equal(h.t.get().state,'play');
 console.log('Motion checks passed: opt-in, permission outcomes, missing data, calibration, debounce and game isolation.');
})().catch(e=>{console.error(e);process.exitCode=1});
