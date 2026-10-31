const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup({secure=true,unsupported=false,permission}={}){
 let now=1000,timeout,requests=0;const handlers={},elements={},api={};
 function element(id){return elements[id]??={textContent:'',style:{},classList:{add(){},remove(){}},addEventListener(type,fn){handlers[id+':'+type]=fn},querySelector(){return element(id+' child')},getContext(){return new Proxy({},{get:(o,k)=>o[k]||(()=>{})})}}}
 if(permission)api.requestPermission=()=>{requests++;return permission()};
 const window={isSecureContext:secure,DeviceOrientationEvent:unsupported?undefined:api,screen:{orientation:{angle:0}},addEventListener(type,fn){handlers[type]=fn},removeEventListener(type){delete handlers[type]}};
 const c={window,document:{querySelector:element},performance:{now:()=>now},requestAnimationFrame(){},setTimeout(fn){timeout=fn;return 1},clearTimeout(){timeout=null},Math,console};vm.createContext(c);
 vm.runInContext(fs.readFileSync('game.js','utf8')+`\nthis.test={get:()=>({tiltState,tiltValue,tiltNeutral,tiltAngle,game,state}),setGame:(id)=>{game={id,progress:0,elapsed:0,ball:0,vel:0};state='play';phaseStart=1000;duration=5000},frame};`,c);
 return {t:c.test,window,handlers,elements,click:()=>handlers['#tiltButton:click'](),advance:n=>now+=n,timeout:()=>timeout?.(),requests:()=>requests,send:(beta,gamma)=>handlers.deviceorientation({beta,gamma})};
}
(async()=>{
 let h=setup({secure:false});await h.click();assert.equal(h.t.get().tiltState,'unavailable');assert.match(h.elements['#tiltStatus'].textContent,/secure/);
 h=setup({unsupported:true});await h.click();assert.equal(h.t.get().tiltState,'unavailable');
 h=setup({permission:()=>Promise.resolve('denied')});assert.equal(h.requests(),0);await h.click();assert.equal(h.requests(),1);assert.equal(h.t.get().tiltState,'denied');assert.equal(h.handlers.deviceorientation,undefined);
 h=setup({permission:()=>Promise.reject(Error('blocked'))});await h.click();assert.equal(h.t.get().tiltState,'error');
 h=setup();await h.click();h.send(null,0);assert.equal(h.t.get().tiltState,'waiting');h.timeout();assert.equal(h.t.get().tiltState,'unavailable');assert.equal(h.handlers.deviceorientation,undefined);
 h=setup({permission:()=>Promise.resolve('granted')});await h.click();h.send(0,10);assert.equal(h.t.get().tiltState,'ready');assert.equal(h.t.get().tiltValue,0);h.send(0,12);assert.equal(h.t.get().tiltValue,0);h.send(0,20);assert.ok(h.t.get().tiltValue>0);h.send(0,0);assert.ok(h.t.get().tiltValue<0);
 h.t.setGame('balance');h.send(0,30);h.t.frame(1016);assert.ok(h.t.get().game.vel>0);await h.click();h.send(0,30);assert.equal(h.t.get().tiltValue,0);
 for(const [angle,beta,gamma,change] of [[90,10,0,20],[180,0,10,20],[270,10,0,20]]){h.window.screen.orientation.angle=angle;h.send(beta,gamma);assert.equal(h.t.get().tiltValue,0);if(angle===180)h.send(beta,change);else h.send(change,gamma);assert.equal(Math.sign(h.t.get().tiltValue),angle===90?1:-1)}
 h.t.setGame('balance');h.advance(1100);h.t.frame(2120);assert.equal(h.t.get().game.vel,0);
 console.log('Tilt checks passed: permission, no data, calibration, screen rotations, balance steering and stale readings.');
})().catch(e=>{console.error(e);process.exitCode=1});
