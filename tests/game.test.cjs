const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const elements={};function element(id){return elements[id]??={textContent:'',style:{},classList:{add(){},remove(){}},addEventListener(){},querySelector(){return element(id+' child')},getBoundingClientRect(){return {left:0,top:0,width:800,height:500}},getContext(){return new Proxy({},{get:(o,k)=>o[k]||(()=>{})})}}}
const context={document:{querySelector:element},window:{addEventListener(){}},performance:{now:()=>1000},requestAnimationFrame(){},console,Math};vm.createContext(context);
vm.runInContext(fs.readFileSync('game.js','utf8')+'\nthis.test={start,next,begin,finish,action,move,frame,get:()=>({state,round,lives,score,game,duration}),setGame:(id)=>{game={id,progress:0,dir:0,x:120,elapsed:0,stage:0,ball:0,vel:0};state="play"},setElapsed:(v)=>game.elapsed=v};',context);
const t=context.test;t.start();assert.equal(t.get().state,'form');assert.equal(t.get().round,1);assert.equal(t.get().lives,4);t.begin();t.finish(false);assert.equal(t.get().lives,3);assert.equal(t.get().state,'result');t.finish(false);assert.equal(t.get().lives,3);
for(const [id,count] of [['tap',1],['count',3],['swipe',3],['shake',6]]){t.setGame(id);for(let i=0;i<count;i++)t.action();assert.equal(t.get().state,'result',id);assert.equal(t.get().game.win,true,id)}
t.setGame('drag');for(let i=0;i<8;i++)t.move(1);assert.equal(t.get().game.win,true);
t.setGame('shake');for(let i=0;i<6;i++)t.move(i%2?1:-1);assert.equal(t.get().game.win,true);
t.setGame('timing');t.setElapsed(0);t.action();assert.equal(t.get().game.win,true);t.setGame('timing');t.setElapsed(Math.PI/5);t.action();assert.equal(t.get().game.win,false);
t.setGame('balance');t.frame(7000);assert.equal(t.get().game.win,true);
t.setGame('boss');for(let i=0;i<5;i++)t.action();assert.equal(t.get().game.stage,1);assert.equal(t.get().state,'play');t.action();assert.equal(t.get().game.win,true);
t.start();for(let i=0;i<7;i++)t.next();assert.equal(t.get().game.id,'boss');assert.equal(t.get().round,8);
console.log('Game logic checks passed: progression, lives, seven interaction paths, timing, and boss.');
