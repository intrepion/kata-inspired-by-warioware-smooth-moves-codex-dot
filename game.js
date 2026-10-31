const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const $=s=>document.querySelector(s), overlay=$('#overlay'), announce=$('#announcement');
const W=800,H=500, colors=['#ffc95c','#86d9cd','#f5a4a0','#b5c1ed','#f7b76b','#a7d278','#f6db78'];
let state='menu', round=0,lives=4, score=0, game=null, phaseStart=0, duration=0, last=0, sound=true, audio, held={};
const forms=[
 {id:'tap',form:'THE POINTER',verb:'POP!',hint:'Tap the balloon · or press Space',icon:'☝'},
 {id:'drag',form:'THE SLIDE',verb:'DELIVER!',hint:'Drag the star to the box · or use ← →',icon:'↔'},
 {id:'shake',form:'THE SHAKE',verb:'SHAKE!',hint:'Shake phone, swipe back and forth, or tap ACTION',icon:'✋'},
 {id:'balance',form:'THE TILT',verb:'BALANCE!',hint:'Tilt phone, drag, or use ← → to balance',icon:'⚖'},
 {id:'swipe',form:'THE SWEEP',verb:'SWEEP!',hint:'Swipe across the crumbs · or press Space',icon:'➜'},
 {id:'timing',form:'THE PRESS',verb:'STOP!',hint:'Stop the needle in the green · tap or Space',icon:'✊'},
 {id:'count',form:'THE POKE',verb:'FEED!',hint:'Tap three times · or press Space three times',icon:'☝'}
];
const boss={id:'boss',form:'THE GRAND FINALE',verb:'DEFEAT IT!',hint:'Tap five times, then stop the needle in green!',icon:'★'};
let deck=[];
function shuffle(){deck=[...forms].sort(()=>Math.random()-.5)}
function tone(freq=440,seconds=.08){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)(); if(audio.state==='suspended')audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(.04,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+seconds);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+seconds)}catch{}}
function start(){round=0;lives=4;score=0;deck=[];overlay.classList.add('hidden');next()}
function next(){round++;if(round%8===0)game={...boss};else {if(!deck.length)shuffle();game={...deck.pop()}};Object.assign(game,{x:120, progress:0,dir:0,ball:0,vel:(Math.random()<.5?-2:2),elapsed:0,stage:0});state='form';phaseStart=performance.now();duration=1450;$('#round').textContent=String(round).padStart(2,'0');$('#lives').textContent='♥ '.repeat(lives)+'♡ '.repeat(4-lives);$('#controlTitle').textContent=game.form;$('#controlHint').textContent=game.hint;announce.textContent=game.form+'. '+game.verb+' '+game.hint;tone(330)}
function begin(){state='play';phaseStart=performance.now();duration=(game.id==='boss'?10500:Math.max(2800,5200-(Math.floor((round-1)/7)*350)));tone(660)}
function finish(win){if(state!=='play')return;state='result';phaseStart=performance.now();duration=900;game.win=win;if(win){score++;tone(740,.15)}else{lives--;tone(150,.24)}$('#lives').textContent='♥ '.repeat(lives)+'♡ '.repeat(4-lives);announce.textContent=win?'Nice!':'Miss!';}
function gameOver(){state='over';overlay.classList.remove('hidden');overlay.querySelector('.card').innerHTML=`<span class="eyebrow">THE RITUAL IS COMPLETE</span><h2>Nice <em>moves!</em></h2><p>You cleared ${score} tiny tasks and reached round ${round}.</p><button id="restart" class="primary">PLAY AGAIN <span>↗</span></button><p class="fine">Every run shuffles the microgames.</p>`;$('#restart').addEventListener('click',start)}
function action(){if(state!=='play')return;switch(game.id){case 'tap':finish(true);break;case 'swipe':game.progress++;if(game.progress>=3)finish(true);break;case 'shake':game.progress++;if(game.progress>=6)finish(true);break;case 'count':game.progress++;tone(450+game.progress*90);if(game.progress>=3)finish(true);break;case 'timing':finish(Math.abs(Math.sin(game.elapsed*2.5))<.25);break;case 'boss':if(game.stage===0){game.progress++;tone(400+game.progress*70);if(game.progress>=5){game.stage=1;game.elapsed=0}}else finish(Math.abs(Math.sin(game.elapsed*2.5))<.3);break;}}
function move(dir){if(state!=='play')return;if(game.id==='drag'){game.x=Math.max(80,Math.min(650,game.x+dir*65));if(game.x>=600)finish(true)}else if(game.id==='shake'){if(dir!==game.dir){game.dir=dir;game.progress++;tone(300+game.progress*35);if(game.progress>=6)finish(true)}}else if(game.id==='swipe'){game.progress++;if(game.progress>=3)finish(true)}else if(game.id==='balance'){game.vel+=dir*1.1}}
let pointer=null;canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);let r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height,last:e.clientX};if(game?.id!=='drag'&&game?.id!=='shake'&&game?.id!=='balance'&&game?.id!=='swipe')action()});canvas.addEventListener('pointermove',e=>{if(!pointer||state!=='play')return;let r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,dx=e.clientX-pointer.last;if(game.id==='drag'){game.x=Math.max(80,Math.min(650,x));if(game.x>=600)finish(true)}if(game.id==='shake'&&Math.abs(dx)>15){move(Math.sign(dx));pointer.last=e.clientX}if(game.id==='swipe'&&Math.abs(dx)>25){move(Math.sign(dx));pointer.last=e.clientX}if(game.id==='balance'&&Math.abs(dx)>8){move(Math.sign(dx));pointer.last=e.clientX}});canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' ','Enter'].includes(e.key))e.preventDefault();if(e.repeat)return;if(e.key==='ArrowLeft'||e.key==='a'){held.left=true;move(-1)}if(e.key==='ArrowRight'||e.key==='d'){held.right=true;move(1)}if(e.key===' '||e.key==='Enter')action()});window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')held.left=false;if(e.key==='ArrowRight'||e.key==='d')held.right=false});
$('#left').addEventListener('pointerdown',()=>{held.left=true;move(-1)});$('#right').addEventListener('pointerdown',()=>{held.right=true;move(1)});for(const id of ['left','right'])for(const ev of ['pointerup','pointerleave','pointercancel'])$('#'+id).addEventListener(ev,()=>{held.left=false;held.right=false});$('#action').addEventListener('click',action);$('#start').addEventListener('click',start);$('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').textContent=`♫ SOUND: ${sound?'ON':'OFF'}`});
// Both permission requests start in the toggle gesture; each sensor can succeed independently.
let motionEnabled=false, motionGeneration=0, motionState='off', tiltState='off';
let motionSamples=0, motionBaseline=null, lastShake=-Infinity, motionTimer=null;
let tiltNeutral=null, tiltAngle=null, tiltValue=0, tiltLast=0, tiltTimer=null;
function updateMotionUI(){
 const label={requesting:'requesting permission',waiting:'waiting for sensor',ready:'ready',denied:'permission denied',unavailable:'unavailable',error:'error',off:'off'};
 const failed=motionEnabled&&['denied','unavailable','error'].includes(motionState)&&['denied','unavailable','error'].includes(tiltState);
 if(failed)motionEnabled=false;
 const button=$('#motionToggle');button.setAttribute('aria-pressed',String(motionEnabled));button.textContent=`MOTION CONTROLS: ${motionEnabled?'ON':'OFF'}`;
 if(failed){$('#motionStatus').textContent=`Shake: ${label[motionState]}. Tilt: ${label[tiltState]}. Swipe, tap ACTION, or use arrows.`;return}
 if(!motionEnabled){$('#motionStatus').textContent='Shake and tilt are off. Swipe, tap ACTION, or use arrows.';return}
 $('#motionStatus').textContent=`Shake: ${label[motionState]}. Tilt: ${label[tiltState]}. Hold phone normally to calibrate; swipe, tap ACTION, or use arrows anytime.`;
}
function stopMotion(){
 motionEnabled=false;motionGeneration++;window.removeEventListener('devicemotion',onDeviceMotion);window.removeEventListener('deviceorientation',onDeviceOrientation);
 if(motionTimer)clearTimeout(motionTimer);if(tiltTimer)clearTimeout(tiltTimer);motionTimer=tiltTimer=null;
 motionState=tiltState='off';motionSamples=0;motionBaseline=null;lastShake=-Infinity;tiltNeutral=null;tiltValue=0;updateMotionUI();
}
function onDeviceMotion(event){
 if(!motionEnabled)return;
 const valid=v=>v&&[v.x,v.y,v.z].every(Number.isFinite);
 const source=valid(event.accelerationIncludingGravity)?event.accelerationIncludingGravity:event.acceleration;
 if(!valid(source))return;
 if(motionTimer){clearTimeout(motionTimer);motionTimer=null}
 if(motionState!=='ready'){motionState='ready';updateMotionUI()}
 const sample=[source.x,source.y,source.z];
 if(!motionBaseline){motionBaseline=sample.slice();motionSamples=1;return}
 const delta=sample.map((v,i)=>v-motionBaseline[i]);motionBaseline=motionBaseline.map((v,i)=>v*.8+sample[i]*.2);
 if(motionSamples++<8)return;
 const now=performance.now();if(Math.hypot(...delta)>4.5&&now-lastShake>=150){lastShake=now;if(state==='play'&&game?.id==='shake')action()}
}
function screenAngle(){const value=window.screen?.orientation?.angle??window.orientation??0;return ((Number(value)||0)%360+360)%360}
function onDeviceOrientation(event){
 if(!motionEnabled||!Number.isFinite(event.beta)||!Number.isFinite(event.gamma))return;
 const angle=screenAngle(), radians=angle*Math.PI/180, horizontal=event.gamma*Math.cos(radians)+event.beta*Math.sin(radians);
 if(tiltTimer){clearTimeout(tiltTimer);tiltTimer=null}
 if(tiltNeutral===null||angle!==tiltAngle){tiltNeutral=horizontal;tiltAngle=angle;tiltValue=0;tiltState='ready';updateMotionUI()}
 const delta=horizontal-tiltNeutral;tiltValue=Math.abs(delta)<3?0:Math.max(-1,Math.min(1,delta/25));tiltLast=performance.now();
}
function requestSensor(api){
 if(!window.isSecureContext||typeof api==='undefined')return Promise.resolve('unavailable');
 try{return typeof api.requestPermission==='function'?Promise.resolve(api.requestPermission()).then(p=>p==='granted'?'granted':'denied',()=> 'error'):Promise.resolve('granted')}
 catch{return Promise.resolve('error')}
}
function startSensor(kind,result,generation){
 if(!motionEnabled||generation!==motionGeneration)return;
 const isShake=kind==='shake',eventName=isShake?'devicemotion':'deviceorientation',handler=isShake?onDeviceMotion:onDeviceOrientation;
 if(result!=='granted'){if(isShake)motionState=result;else tiltState=result;updateMotionUI();return}
 if(isShake)motionState='waiting';else tiltState='waiting';window.addEventListener(eventName,handler);updateMotionUI();
 const timer=setTimeout(()=>{if(!motionEnabled||generation!==motionGeneration)return;if((isShake?motionState:tiltState)==='waiting'){window.removeEventListener(eventName,handler);if(isShake)motionState='unavailable';else tiltState='unavailable';updateMotionUI()}},4000);
 if(isShake)motionTimer=timer;else tiltTimer=timer;
}
function toggleMotion(){
 if(motionEnabled){stopMotion();return}
 motionEnabled=true;const generation=++motionGeneration;motionState=tiltState='requesting';motionSamples=0;motionBaseline=null;lastShake=-Infinity;tiltNeutral=null;tiltValue=0;updateMotionUI();
 const shake=requestSensor(window.DeviceMotionEvent),tilt=requestSensor(window.DeviceOrientationEvent);
 shake.then(result=>startSensor('shake',result,generation));tilt.then(result=>startSensor('tilt',result,generation));
}
$('#motionToggle').addEventListener('click',toggleMotion);
function text(t,x,y,size=40,color='#291638',align='center'){ctx.fillStyle=color;ctx.textAlign=align;ctx.font=`900 ${size}px system-ui`;ctx.fillText(t,x,y)}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function frame(now){requestAnimationFrame(frame);let dt=Math.min((now-last)/1000,.05);last=now;ctx.clearRect(0,0,W,H);if(state==='menu'||state==='over'){rect(0,0,W,H,'#f4bc59');return}let elapsed=now-phaseStart;$('#time').style.width=`${Math.max(0,100-elapsed/duration*100)}%`;$('#phaseLabel').textContent=state==='form'?'GET INTO FORM':state==='play'?'HURRY!':game.win?'NICE!':'OOPS!';if(state==='form'){rect(0,0,W,H,'#542c72');for(let i=0;i<12;i++){ctx.save();ctx.translate((i*91+elapsed*.03)%900,60+i%3*170);ctx.rotate(.5);rect(-12,-12,24,24,'#ffffff16');ctx.restore()}text('GET READY FOR',400,100,19,'#f6c94c');text(game.icon,400,235,112,'#fff1d9');text(game.form,400,310,48,'#fff1d9');text(game.hint,400,360,19,'#e0c4dd');if(elapsed>=duration)begin();return}if(state==='result'){rect(0,0,W,H,game.win?'#a5d675':'#f48a79');text(game.win?'NICE!':'OOPS!',400,245,100);text(game.win?'YOU DID THE THING!':'YOU’LL GET THE NEXT ONE.',400,300,20);if(elapsed>=duration){if(lives<=0)gameOver();else next()}return}game.elapsed+=dt;if(elapsed>=duration){if(game.id==='balance')finish(Math.abs(game.ball)<90);else finish(false);return}rect(0,0,W,H,colors[(round-1)%colors.length]);for(let i=0;i<12;i++)circle((i*147+50)%W,(i*97+45)%H,4,'#ffffff55');text(game.verb,400,70,52);text(game.hint,400,105,17);
if(game.id==='tap'){circle(400,270,105,'#e95557');circle(370,240,14,'#ffb5ab');ctx.strokeStyle='#43304a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(400,375);ctx.quadraticCurveTo(440,410,400,470);ctx.stroke();text('POP ME',400,285,23,'#fff')}
if(game.id==='drag'){rect(590,240,140,130,'#76479a');rect(605,220,110,30,'#573369');text('BOX',660,320,20,'#fff');text('★',game.x,330,115,'#f75f49');text('→ → →',390,300,35,'#704c67')}
if(game.id==='shake'){ctx.save();ctx.translate(400+Math.sin(game.elapsed*12)*game.progress*3,275);ctx.rotate(Math.sin(game.elapsed*10)*.1);rect(-58,-100,116,200,'#f8eee0');rect(-65,-120,130,35,'#6b3b83');text('✦',0,25,70,'#e55a4e');ctx.restore();text('SHAKES '+game.progress+'/6',400,430,22)}
if(game.id==='balance'){game.vel+=(held.left?-1:0)*dt*5+(held.right?1:0)*dt*5; if(tiltState==='ready'&&now-tiltLast<1000)game.vel+=tiltValue*dt*5;game.vel+=game.ball*dt*.018;game.vel*=.99;game.ball+=game.vel*dt*40;game.ball=Math.max(-250,Math.min(250,game.ball));rect(180,320,440,20,'#694277');rect(325,317,150,26,'#8acb73');circle(400+game.ball,285,35,'#f05f4e');text('KEEP IT IN THE GREEN!',400,415,20)}
if(game.id==='swipe'){for(let i=0;i<3;i++){if(i>=game.progress)text('✦',230+i*170,305,95,'#ce644a');else text('✓',230+i*170,305,80,'#4c8b66')}text('TAP 3 TIMES / SWIPE WITH ARROWS',400,415,17)}
if(game.id==='count'){circle(400,275,115,'#ffe4b1');circle(365,245,10,'#3c2440');circle(435,245,10,'#3c2440');ctx.fillStyle='#3c2440';ctx.beginPath();ctx.ellipse(400,310,50,25+game.progress*8,0,0,Math.PI*2);ctx.fill();text('SNACKS '+game.progress+'/3',400,430,22)}
if(game.id==='timing'||(game.id==='boss'&&game.stage===1)){rect(180,250,440,50,'#ed6f5c');rect(350,250,100,50,'#77c879');let x=400+Math.sin(game.elapsed*2.5)*210;rect(x-5,225,10,100,'#2b193c');text('STOP IN THE GREEN!',400,385,22)}
if(game.id==='boss'&&game.stage===0){circle(400,275,115,'#74469b');circle(365,255,24,'#fff');circle(435,255,24,'#fff');circle(365,255,10,'#24143d');circle(435,255,10,'#24143d');text('WOBBLE KING',400,420,22);text('HITS '+game.progress+'/5',400,325,20,'#fff')}
}
requestAnimationFrame(frame);
