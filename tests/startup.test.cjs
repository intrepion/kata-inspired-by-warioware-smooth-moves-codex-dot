const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('game.js','utf8');
function run(markup){
 const handlers={},els={},present=new Set(['#game','#overlay','#announcement','#round','#lives','#controlTitle','#controlHint','#left','#right','#action','#start','#sound','#time','#phaseLabel',...markup]);let raf=0;
 function el(id){if(!present.has(id))return null;return els[id]??={textContent:'',style:{},attrs:{},classList:{add(){},remove(){}},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,v){handlers[id+':'+k]=v},getContext(){return new Proxy({},{get:(o,k)=>o[k]||(()=>{})})}}}
 const window={isSecureContext:true,DeviceMotionEvent:undefined,DeviceOrientationEvent:undefined,addEventListener(){},removeEventListener(){}};
 const c={window,document:{querySelector:el},performance:{now:()=>1000},requestAnimationFrame(){raf++},setTimeout(){return 1},clearTimeout(){},Math,console};vm.createContext(c);vm.runInContext(code+'\nthis.getState=()=>state;',c);
 assert.equal(raf,1,'initial animation scheduled');handlers['#start:click']();assert.equal(c.getState(),'form','start works');return {handlers,els,c};
}
(async()=>{
 let h=run(['#motionToggle','#motionStatus']);h.handlers['#motionToggle:click']();await Promise.resolve();await Promise.resolve();assert.equal(h.els['#motionToggle'].attrs['aria-pressed'],'false');assert.match(h.els['#motionStatus'].textContent,/unavailable/);
 h=run(['#motionButton','#tiltButton','#motionStatus','#tiltStatus']);h.handlers['#motionButton:click']();await Promise.resolve();await Promise.resolve();assert.match(h.els['#tiltStatus'].textContent,/unavailable/);assert.equal(h.els['#tiltButton'].attrs['aria-pressed'],'false');
 run([]); // Even a page with no motion controls must still start the game.
 const html=fs.readFileSync('index.html','utf8');assert.match(html,/game\.js\?v=2/);assert.match(html,/style\.css\?v=2/);
 console.log('Startup checks passed: current, cached previous, and missing motion markup.');
})().catch(e=>{console.error(e);process.exitCode=1});
