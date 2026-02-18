'use strict';
// ═══════════════════════════════════════════════════════════════
//  GTA 6 — ExiWin Edition  •  Full City Sandbox
// ═══════════════════════════════════════════════════════════════
window.GTA6 = (function () {

// ── Math helpers ───────────────────────────────────────────────
const abs=Math.abs,sqrt=Math.sqrt,sin=Math.sin,cos=Math.cos,
      atan2=Math.atan2,PI=Math.PI,floor=Math.floor,min=Math.min,max=Math.max;
const clamp=(v,a,b)=>max(a,min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dst=(ax,ay,bx,by)=>sqrt((ax-bx)**2+(ay-by)**2);
const rnd=(a,b)=>Math.random()*(b-a)+a;
const pick=arr=>arr[floor(Math.random()*arr.length)];
const lerpA=(a,b,t)=>{
  let d=b-a; while(d>PI)d-=PI*2; while(d<-PI)d+=PI*2; return a+d*t;
};
// hash for stable random
const hash=(x,y)=>{let h=(x*374761393+y*668265263);h=((h^(h>>13))*1274126177);return abs(h%1000)/1000;};

// ── World constants ────────────────────────────────────────────
const TILE=48, MAP_W=110, MAP_H=110;
const ROAD=0,SIDEWALK=1,BUILDING=2,PARK=3,WATER=4;

// ── Palettes ───────────────────────────────────────────────────
const CAR_COLORS=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
  '#3498db','#9b59b6','#ff69b4','#ecf0f1','#2c3e50','#95a5a6',
  '#c0392b','#27ae60','#2980b9','#8e44ad','#d35400','#16a085',
  '#f39c12','#7f8c8d','#bdc3c7'];
const SKIN=['#f5cba7','#e59866','#d4a574','#c07a4a','#a0522d','#f0e0c8','#e8c9a0'];
const SHIRTS=['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22',
  '#1abc9c','#ff69b4','#95a5a6','#c0392b','#27ae60','#2980b9','#16a085'];
const PANTS=['#2c3e50','#1a252f','#34495e','#5d6d7e','#4a4a6a','#1a1a2e'];
const BZONE={
  downtown:['#5a6b7a','#6b7c8b','#4a5b6a','#7a8b9a','#8a9baa','#3a4b5a'],
  midtown: ['#b8945a','#a07840','#c8a870','#907030','#d4b070','#806028','#9a8050'],
  uptown:  ['#8b7a6a','#9a8a7a','#7a6a5a','#aa9a8a','#6a5a4a','#ba9a7a'],
  industry:['#707070','#808080','#606060','#787878','#6a6a6a','#757575'],
};

// ── Entity IDs ─────────────────────────────────────────────────
let _eid=1;
class Entity{constructor(x,y){this.x=x;this.y=y;this.vx=0;this.vy=0;this.angle=0;this.alive=true;this.id=_eid++;}}

// ── Player ─────────────────────────────────────────────────────
class Player extends Entity{
  constructor(x,y){
    super(x,y); this.w=14;this.h=14;
    this.speed=150; this.health=100; this.maxHealth=100;
    this.inCar=null; this.money=2500;
    this.skinColor=pick(SKIN); this.shirtColor=pick(SHIRTS); this.pantsColor=pick(PANTS);
    this.animFrame=0; this.animTimer=0;
    this._fCool=0; this._gCool=0;
  }
}

// ── Car ────────────────────────────────────────────────────────
class Car extends Entity{
  constructor(x,y,color,type){
    super(x,y); this.color=color||pick(CAR_COLORS); this.type=type||'sedan';
    this.w=type==='truck'?38:type==='suv'?34:30;
    this.h=type==='truck'?20:type==='suv'?18:16;
    this.speed=0;
    this.maxSpeed=type==='sports'?280:type==='truck'?120:type==='suv'?200:210;
    this.accel=type==='sports'?220:type==='truck'?80:160;
    this.handling=type==='sports'?3.8:type==='truck'?1.4:type==='suv'?2.8:2.6;
    this.driver=null; this.passenger=null;
    this.isParked=true; this.aiState='parked';
    this.aiTimer=rnd(1,5); this.aiAngle=this.angle;
    this.health=100; this.isPolice=(type==='police');
    this.brakeLight=false; this.sirenOn=false;
    this.colorNum=floor(Math.random()*10000);
  }
}

// ── NPC ────────────────────────────────────────────────────────
class NPC extends Entity{
  constructor(x,y){
    super(x,y); this.w=10;this.h=10;
    this.speed=rnd(45,85);
    this.skinColor=pick(SKIN); this.shirtColor=pick(SHIRTS); this.pantsColor=pick(PANTS);
    this.dir={x:0,y:1}; this.aiState='walk';
    this.aiTimer=rnd(2,6); this.turnTimer=rnd(1,5);
    this.health=100; this.isPolice=false;
    this.animFrame=0; this.animTimer=0;
    this.fleeing=false;
  }
}

// ── Police officer ─────────────────────────────────────────────
class Officer extends NPC{
  constructor(x,y){
    super(x,y); this.isPolice=true;
    this.speed=170; this.shirtColor='#1a3a6b'; this.pantsColor='#0d1f3a';
    this.skinColor=pick(SKIN); this.aiState='patrol'; this.chasing=false;
  }
}

// ── World generation ───────────────────────────────────────────
function makeWorld(){
  const map=Array.from({length:MAP_H},()=>new Uint8Array(MAP_W).fill(BUILDING));
  const bColors=[]; for(let y=0;y<MAP_H;y++){bColors[y]=[];}

  // Road grid — major arteries every 13 tiles (2-lane = 2 tiles wide)
  const roadX=[], roadY=[];
  for(let x=10;x<MAP_W-4;x+=13){roadX.push(x,x+1);}
  for(let y=10;y<MAP_H-4;y+=13){roadY.push(y,y+1);}
  // Extra diagonal cross roads
  for(let x=16;x<MAP_W-4;x+=13){roadX.push(x,x+1);}

  for(let y=0;y<MAP_H;y++)
    for(let x=0;x<MAP_W;x++)
      if(roadX.includes(x)||roadY.includes(y)) map[y][x]=ROAD;

  // Sidewalks (1 tile border around road blocks)
  for(let y=1;y<MAP_H-1;y++)
    for(let x=1;x<MAP_W-1;x++)
      if(map[y][x]===BUILDING){
        let adj=false;
        for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]])
          if(map[y+dy]?.[x+dx]===ROAD){adj=true;break;}
        if(adj) map[y][x]=SIDEWALK;
      }

  // Water zone (top-left corner)
  for(let y=0;y<12;y++) for(let x=0;x<12;x++) map[y][x]=WATER;

  // Parks
  for(let y=0;y<MAP_H;y++)
    for(let x=0;x<MAP_W;x++)
      if(map[y][x]===BUILDING && hash(x*3,y*3)<0.04)
        map[y][x]=PARK;

  // Building colors
  function zonePal(x,y){
    const cx=MAP_W/2,cy=MAP_H/2,d=dst(x,y,cx,cy);
    if(d<18) return BZONE.downtown;
    if(d<35) return BZONE.midtown;
    if(d<50) return BZONE.uptown;
    return BZONE.industry;
  }
  for(let y=0;y<MAP_H;y++)
    for(let x=0;x<MAP_W;x++)
      if(map[y][x]===BUILDING){
        const p=zonePal(x,y);
        bColors[y][x]=p[floor(hash(x*7,y*7)*p.length)];
      }

  // Building heights (for visual depth)
  const bHeight=[];
  for(let y=0;y<MAP_H;y++){
    bHeight[y]=[];
    for(let x=0;x<MAP_W;x++)
      bHeight[y][x]=map[y][x]===BUILDING?floor(hash(x*11,y*13)*5+1):0;
  }

  return {map,bColors,bHeight,roadX,roadY};
}

// ── Game state ─────────────────────────────────────────────────
let S={
  canvas:null,ctx:null,W:800,H:600,
  running:false,initialized:false,
  world:null,
  cam:{x:0,y:0},
  player:null,
  cars:[],npcs:[],officers:[],
  wantedLevel:0,wantedCooldown:0,
  score:0,keys:{},mouse:{x:0,y:0},
  lastTime:0,frameCount:0,gameTime:0,
  spawnCooldown:0,policeCooldown:0,
  notifs:[],
  hud:null,mmCanvas:null,
  _listeners:[],
  nightMode:false,
  dayTime:8, // hour 0-24
  totalKills:0,
};

// ── Initialise ─────────────────────────────────────────────────
function init(rootEl){
  if(!rootEl) return;
  // Clean
  if(S.canvas&&S.canvas.parentNode) S.canvas.parentNode.removeChild(S.canvas);
  if(S.mmCanvas&&S.mmCanvas.parentNode) S.mmCanvas.parentNode.removeChild(S.mmCanvas);
  for(const[el,ev,fn] of S._listeners) el.removeEventListener(ev,fn);
  S._listeners=[];
  rootEl.innerHTML='';
  rootEl.style.cssText='position:relative;overflow:hidden;background:#000;';

  // Main canvas
  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;cursor:crosshair;';
  canvas.tabIndex=0;
  rootEl.appendChild(canvas);

  // HUD overlay
  const hud=document.createElement('div');
  hud.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:5;font-family:\'Segoe UI\',sans-serif;';
  rootEl.appendChild(hud);

  // Minimap canvas
  const mm=document.createElement('canvas');
  mm.style.cssText='position:absolute;bottom:56px;right:10px;width:140px;height:140px;border-radius:50%;border:2px solid rgba(255,255,255,.35);box-shadow:0 0 12px rgba(0,0,0,.8);z-index:6;pointer-events:none;';
  mm.width=140;mm.height=140;
  rootEl.appendChild(mm);

  // On-screen buttons
  const btns=document.createElement('div');
  btns.style.cssText='position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:10;pointer-events:all;';
  btns.innerHTML=`
    <button id="gta6-spawn-btn" style="background:rgba(0,80,200,.88);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:11.5px;cursor:pointer;font-family:inherit;font-weight:600;">🚗 Спавн машины [G]</button>
    <button id="gta6-sports-btn" style="background:rgba(200,80,0,.88);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:11.5px;cursor:pointer;font-family:inherit;font-weight:600;">🏎️ Спорткар [T]</button>
    <button id="gta6-clear-btn" style="background:rgba(50,50,50,.88);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:11.5px;cursor:pointer;font-family:inherit;font-weight:600;">⭐ Снять розыск</button>
    <button id="gta6-health-btn" style="background:rgba(0,150,80,.88);color:#fff;border:none;border-radius:8px;padding:6px 14px;font-size:11.5px;cursor:pointer;font-family:inherit;font-weight:600;">❤️ Аптечка [$100]</button>
  `;
  rootEl.appendChild(btns);
  btns.querySelector('#gta6-spawn-btn').onclick=()=>spawnCarNearPlayer('sedan');
  btns.querySelector('#gta6-sports-btn').onclick=()=>spawnCarNearPlayer('sports');
  btns.querySelector('#gta6-clear-btn').onclick=clearWanted;
  btns.querySelector('#gta6-health-btn').onclick=buyHealth;

  S.canvas=canvas; S.ctx=canvas.getContext('2d');
  S.hud=hud; S.mmCanvas=mm;

  // Resize
  function resize(){
    const r=rootEl.getBoundingClientRect();
    canvas.width=max(400,r.width||800);
    canvas.height=max(300,r.height-36||560);
    S.W=canvas.width; S.H=canvas.height;
  }
  resize();
  const ro=new ResizeObserver(resize);
  ro.observe(rootEl);
  S._listeners.push([window,'resize',resize]);

  // Keys
  const kd=e=>{S.keys[e.code]=true; if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();};
  const ku=e=>{ S.keys[e.code]=false; };
  const addL=(el,ev,fn)=>{ el.addEventListener(ev,fn); S._listeners.push([el,ev,fn]); };
  addL(window,'keydown',kd); addL(window,'keyup',ku);
  canvas.addEventListener('click',()=>canvas.focus());

  // Generate world
  S.world=makeWorld();

  // Player at city center
  const startX=(MAP_W/2)*TILE+TILE/2, startY=(MAP_H/2)*TILE+TILE/2;
  S.player=new Player(startX,startY);
  S.cars=[]; S.npcs=[]; S.officers=[];
  S.wantedLevel=0; S.wantedCooldown=0;
  S.score=0; S.spawnCooldown=0; S.policeCooldown=0;
  S.frameCount=0; S.gameTime=0; S.dayTime=10;
  S.notifs=[];

  spawnInitialCars();
  spawnInitialNPCs();

  S.cam={x:startX-S.W/2,y:startY-S.H/2};
  S.running=true; S.initialized=true;
  S.lastTime=performance.now();

  notify('🎮 WASD — движение • F — войти/выйти из авто • G — спавн машины',4500);
  setTimeout(()=>notify('🚗 Подойдите к любой машине и нажмите F!',3000),1800);
  setTimeout(()=>notify('🌆 Добро пожаловать в GTA 6 — ExiWin Edition!',3000),200);

  canvas.focus();
  requestAnimationFrame(gameLoop);
}

// ── Spawn helpers ──────────────────────────────────────────────
function findRoadPos(){
  for(let i=0;i<500;i++){
    const rx=pick(S.world.roadX),ry=floor(rnd(2,MAP_H-2));
    if(S.world.map[ry]?.[rx]===ROAD)
      return{x:(rx+0.5)*TILE,y:(ry+0.5)*TILE};
  }
  return{x:MAP_W/2*TILE,y:MAP_H/2*TILE};
}
function findSidewalkPos(){
  for(let i=0;i<500;i++){
    const x=floor(rnd(2,MAP_W-2)),y=floor(rnd(2,MAP_H-2));
    if(S.world.map[y]?.[x]===SIDEWALK)
      return{x:(x+0.5)*TILE,y:(y+0.5)*TILE};
  }
  return{x:(MAP_W/2+5)*TILE,y:MAP_H/2*TILE};
}

function spawnInitialCars(){
  const types=['sedan','sedan','sedan','sedan','sports','suv','suv','truck'];
  let n=0;
  for(let attempt=0;attempt<3000&&n<80;attempt++){
    const p=findRoadPos();
    if(carOverlapAt(p.x,p.y,30,null)){continue;}
    const c=new Car(p.x,p.y,pick(CAR_COLORS),pick(types));
    // Snap to road angle
    if(S.world.roadX.includes(floor(p.x/TILE))) c.angle=PI/2; else c.angle=0;
    if(Math.random()<0.4){c.aiState='driving';c.isParked=false;}
    S.cars.push(c); n++;
  }
  // Spawn some police cars
  for(let i=0;i<4;i++){
    const p=findRoadPos();
    const c=new Car(p.x,p.y,pick(['#1e3a8a','#152c6b']),'police');
    c.aiState='patrol'; c.isParked=false;
    S.cars.push(c);
  }
}

function spawnInitialNPCs(){
  for(let i=0;i<100;i++){
    const p=findSidewalkPos();
    const ang=Math.random()*PI*2;
    const npc=new NPC(p.x,p.y);
    npc.dir={x:cos(ang),y:sin(ang)};
    S.npcs.push(npc);
  }
  for(let i=0;i<6;i++){
    const p=findSidewalkPos();
    S.officers.push(new Officer(p.x,p.y));
  }
}

function carOverlapAt(x,y,r,exclude){
  for(const c of S.cars){
    if(c===exclude) continue;
    if(dst(c.x,c.y,x,y)<r) return true;
  }
  return false;
}

// ── Game loop ──────────────────────────────────────────────────
function gameLoop(ts){
  if(!S.running||!S.canvas||!S.canvas.isConnected){S.running=false;return;}
  const dt=min((ts-S.lastTime)/1000,0.05);
  S.lastTime=ts; S.frameCount++; S.gameTime+=dt;
  S.dayTime=(S.dayTime+dt*0.015)%24; // 1 real min = ~1 game hour

  update(dt);
  render();
  drawHUD();
  drawMinimap();

  requestAnimationFrame(gameLoop);
}

// ── Update ────────────────────────────────────────────────────
function update(dt){
  const K=S.keys, p=S.player;
  if(S.spawnCooldown>0) S.spawnCooldown-=dt;
  if(S.policeCooldown>0) S.policeCooldown-=dt;

  // ── Player ──────────────────────────────────────────────────
  if(p.inCar) updateDriving(dt);
  else        updateWalk(dt);

  // ── F key: enter/exit ────────────────────────────────────────
  p._fCool=max(0,p._fCool-dt);
  if(K['KeyF']&&p._fCool<=0){
    p._fCool=0.35;
    if(p.inCar){ exitCar(p); }
    else {
      const nc=nearestCar();
      if(nc&&!nc.driver&&dst(p.x,p.y,nc.x,nc.y)<55){
        enterCar(p,nc);
      } else if(nc){
        notify('🚗 Подойдите ближе к машине!',1200);
      }
    }
  }

  // ── G key: spawn sedan ───────────────────────────────────────
  p._gCool=max(0,p._gCool-dt);
  if(K['KeyG']&&p._gCool<=0){
    p._gCool=0.4;
    spawnCarNearPlayer('sedan');
  }
  // T key: sports
  if(K['KeyT']&&p._gCool<=0){
    p._gCool=0.4;
    spawnCarNearPlayer('sports');
  }

  // ── Camera ──────────────────────────────────────────────────
  const tx=p.inCar?p.inCar.x:p.x, ty=p.inCar?p.inCar.y:p.y;
  S.cam.x=lerp(S.cam.x,tx-S.W/2,0.12);
  S.cam.y=lerp(S.cam.y,ty-S.H/2,0.12);
  S.cam.x=clamp(S.cam.x,0,MAP_W*TILE-S.W);
  S.cam.y=clamp(S.cam.y,0,MAP_H*TILE-S.H);

  // ── Cars ─────────────────────────────────────────────────────
  for(const c of S.cars){
    if(c.driver===p) continue;
    updateCarAI(c,dt);
  }

  // ── NPCs ─────────────────────────────────────────────────────
  for(const n of S.npcs) updateNPC(n,dt);
  for(const o of S.officers) updateOfficer(o,dt);

  // ── Wanted: spawn police ─────────────────────────────────────
  if(S.wantedLevel>0){
    S.wantedCooldown-=dt;
    if(S.wantedCooldown<=0){
      S.wantedLevel=max(0,S.wantedLevel-1);
      S.wantedCooldown=S.wantedLevel>0?18:0;
      if(S.wantedLevel===0){
        notify('⭐ Полиция вас потеряла!',2000);
        // Stand down police
        for(const c of S.cars) if(c.isPolice&&c.aiState==='chase') c.aiState='patrol';
        for(const o of S.officers) o.chasing=false;
      }
    }
    if(S.policeCooldown<=0&&S.wantedLevel>0){
      S.policeCooldown=8/S.wantedLevel;
      spawnPoliceUnit();
    }
  }

  // ── Cleanup dead ─────────────────────────────────────────────
  if(S.frameCount%300===0){
    const px=p.inCar?p.inCar.x:p.x, py=p.inCar?p.inCar.y:p.y;
    // Remove faraway npcs
    S.npcs=S.npcs.filter(n=>!n.alive?dst(n.x,n.y,px,py)<600:true);
    // Replenish
    if(S.npcs.filter(n=>n.alive).length<80){
      for(let i=0;i<5;i++){
        const sp=findSidewalkPos(); S.npcs.push(new NPC(sp.x,sp.y));
      }
    }
    if(S.cars.filter(c=>!c.isPolice&&c.aiState!=='player').length<60){
      for(let i=0;i<4;i++){
        const p2=findRoadPos();
        if(!carOverlapAt(p2.x,p2.y,35,null)){
          const c=new Car(p2.x,p2.y,pick(CAR_COLORS),pick(['sedan','suv']));
          c.aiState='driving'; c.isParked=false;
          S.cars.push(c);
        }
      }
    }
  }

  // ── Notifications ────────────────────────────────────────────
  S.notifs=S.notifs.filter(n=>{n.t-=dt;return n.t>0;});
}

function updateWalk(dt){
  const K=S.keys,p=S.player;
  let dx=0,dy=0;
  if(K['ArrowUp']   ||K['KeyW']) dy=-1;
  if(K['ArrowDown'] ||K['KeyS']) dy=1;
  if(K['ArrowLeft'] ||K['KeyA']) dx=-1;
  if(K['ArrowRight']||K['KeyD']) dx=1;
  const run=K['ShiftLeft']||K['ShiftRight'];
  const sp=p.speed*(run?1.75:1);
  if(dx||dy){
    const len=sqrt(dx*dx+dy*dy);
    dx/=len; dy/=len;
    p.angle=atan2(dy,dx);
    p.animTimer+=dt; if(p.animTimer>0.13){p.animFrame=(p.animFrame+1)%4;p.animTimer=0;}
  }
  const nx=p.x+dx*sp*dt, ny=p.y+dy*sp*dt;
  if(!solidAt(nx,p.y)) p.x=clamp(nx,8,MAP_W*TILE-8);
  if(!solidAt(p.x,ny)) p.y=clamp(ny,8,MAP_H*TILE-8);
}

function updateDriving(dt){
  const K=S.keys,p=S.player,c=p.inCar;
  let thr=0,str=0;
  if(K['ArrowUp']   ||K['KeyW']) thr=1;
  if(K['ArrowDown'] ||K['KeyS']) thr=-0.6;
  if(K['ArrowLeft'] ||K['KeyA']) str=-1;
  if(K['ArrowRight']||K['KeyD']) str=1;
  const brake=K['Space'];

  c.speed+=thr*c.accel*dt;
  if(!thr){ c.speed*=Math.pow(0.82,dt*60/60); if(abs(c.speed)<1)c.speed=0; }
  if(brake){ c.speed*=Math.pow(0.65,dt*60/60); c.brakeLight=true; } else c.brakeLight=thr<0;
  c.speed=clamp(c.speed,-c.maxSpeed*0.45,c.maxSpeed);

  if(abs(c.speed)>8){
    c.angle+=str*c.handling*dt*(abs(c.speed)/c.maxSpeed);
  }

  const nx=c.x+cos(c.angle)*c.speed*dt;
  const ny=c.y+sin(c.angle)*c.speed*dt;
  if(!carSolid(nx,c.y,c)){c.x=nx;}else{c.speed*=-0.3;}
  if(!carSolid(c.x,ny,c)){c.y=ny;}else{c.speed*=-0.3;}
  c.x=clamp(c.x,20,MAP_W*TILE-20); c.y=clamp(c.y,20,MAP_H*TILE-20);

  // Car-car collision
  for(const o of S.cars){
    if(o===c||!o.isParked) continue;
    if(dst(c.x,c.y,o.x,o.y)<36){
      const ang=atan2(c.y-o.y,c.x-o.x);
      c.x+=cos(ang)*2; c.y+=sin(ang)*2;
      o.x-=cos(ang)*1; o.y-=sin(ang)*1;
      if(abs(c.speed)>60){ gainWanted(1); c.speed*=0.4; }
      c.speed*=0.3;
    }
  }

  // Hit NPCs
  if(abs(c.speed)>55){
    for(const n of S.npcs){
      if(!n.alive) continue;
      if(dst(c.x,c.y,n.x,n.y)<28){
        n.alive=false; S.totalKills++; gainWanted(2);
        p.money=max(0,p.money); S.score+=150;
        notify('💀 Наезд! Розыск ↑↑',1800);
      }
    }
    // Hit officer
    for(const o of S.officers){
      if(!o.alive) continue;
      if(dst(c.x,c.y,o.x,o.y)<28){
        gainWanted(3); o.alive=false;
        notify('🚨 Наезд на полицейского! ВНИМАНИЕ!',2500);
      }
    }
  }

  p.x=c.x+sin(c.angle)*12; p.y=c.y-cos(c.angle)*12;

  // Police catch
  if(S.wantedLevel>0){
    for(const pc of S.cars){
      if(!pc.isPolice||pc.driver===p) continue;
      if(dst(pc.x,pc.y,c.x,c.y)<40){
        bustedPlayer();
        return;
      }
    }
    for(const o of S.officers){
      if(dst(o.x,o.y,p.x,p.y)<25&&o.chasing){
        bustedPlayer();
        return;
      }
    }
  }
}

function enterCar(p,c){
  p.inCar=c; c.driver=p; c.isParked=false; c.aiState='player';
  c.speed=0;
  notify('🚗 Едем на '+carName(c)+'! Удачи!',1500);
}
function exitCar(p){
  const c=p.inCar; if(!c) return;
  c.driver=null; c.speed*=0.2; c.isParked=true; c.aiState='parked';
  // Place player beside car
  p.x=c.x+cos(c.angle+PI/2)*32; p.y=c.y+sin(c.angle+PI/2)*32;
  p.inCar=null;
  notify('🚶 Вышли из машины',1000);
}

function updateCarAI(car,dt){
  if(car.aiState==='parked') return;
  car.aiTimer-=dt;

  if(car.aiState==='patrol'||car.aiState==='driving'){
    car.speed=lerp(car.speed,70,dt*1.5);
    if(car.aiTimer<=0){
      car.aiTimer=rnd(2,6);
      // Turn at random
      car.angle+=pick([-PI/2,0,PI/2,PI]);
    }
    const nx=car.x+cos(car.angle)*car.speed*dt;
    const ny=car.y+sin(car.angle)*car.speed*dt;
    if(!carSolid(nx,car.y,car)){car.x=nx;}
    else{car.angle+=PI/2;car.aiTimer=rnd(1,2);}
    if(!carSolid(car.x,ny,car)){car.y=ny;}
    else{car.angle+=PI/2;car.aiTimer=rnd(1,2);}
    car.x=clamp(car.x,20,MAP_W*TILE-20);
    car.y=clamp(car.y,20,MAP_H*TILE-20);
  }

  if(car.aiState==='chase'){
    const p=S.player;
    const tx=p.inCar?p.inCar.x:p.x, ty=p.inCar?p.inCar.y:p.y;
    const ta=atan2(ty-car.y,tx-car.x);
    car.angle=lerpA(car.angle,ta,dt*3.5);
    car.speed=lerp(car.speed,car.maxSpeed*0.85,dt*2.5);
    const nx=car.x+cos(car.angle)*car.speed*dt;
    const ny=car.y+sin(car.angle)*car.speed*dt;
    if(!carSolid(nx,car.y,car)) car.x=nx;
    if(!carSolid(car.x,ny,car)) car.y=ny;
    car.x=clamp(car.x,20,MAP_W*TILE-20);
    car.y=clamp(car.y,20,MAP_H*TILE-20);
    car.sirenOn=true;
    if(dst(car.x,car.y,tx,ty)<42) bustedPlayer();
  }
}

function updateNPC(n,dt){
  if(!n.alive) return;
  n.aiTimer-=dt; n.turnTimer-=dt;

  const p=S.player;
  const px=p.inCar?p.inCar.x:p.x,py=p.inCar?p.inCar.y:p.y;
  const pd=dst(n.x,n.y,px,py);

  // Flee from player if close and running
  if(pd<80&&S.wantedLevel>2){
    n.fleeing=true;
  } else if(pd>200) n.fleeing=false;

  if(n.fleeing){
    const fa=atan2(n.y-py,n.x-px);
    n.dir={x:cos(fa),y:sin(fa)};
    n.aiTimer=0.5;
  } else if(n.turnTimer<=0){
    n.turnTimer=rnd(2,7);
    const a=Math.random()*PI*2;
    n.dir={x:cos(a),y:sin(a)};
  }

  const sp=n.fleeing?n.speed*1.6:n.speed;
  const nx=n.x+n.dir.x*sp*dt;
  const ny=n.y+n.dir.y*sp*dt;
  const tx2=floor(nx/TILE),ty2=floor(ny/TILE);
  const tile=S.world.map[ty2]?.[tx2];
  if(tile===SIDEWALK||tile===ROAD||tile===PARK){
    n.x=clamp(nx,4,MAP_W*TILE-4);
    n.y=clamp(ny,4,MAP_H*TILE-4);
  } else { n.turnTimer=0; }

  n.animTimer+=dt; if(n.animTimer>0.18){n.animFrame=(n.animFrame+1)%4;n.animTimer=0;}
}

function updateOfficer(o,dt){
  if(!o.alive) return;
  const p=S.player;
  const px=p.inCar?p.inCar.x:p.x,py=p.inCar?p.inCar.y:p.y;
  const pd=dst(o.x,o.y,px,py);

  if(S.wantedLevel>0){ o.chasing=true; o.aiState='chase'; }
  else { o.chasing=false; o.aiState='patrol'; }

  if(o.chasing){
    const ta=atan2(py-o.y,px-o.x);
    o.dir={x:cos(ta),y:sin(ta)};
    // Walk fast toward player
    const sp=o.speed;
    const nx=o.x+o.dir.x*sp*dt;
    const ny=o.y+o.dir.y*sp*dt;
    if(!solidAt(nx,o.y)) o.x=clamp(nx,4,MAP_W*TILE-4);
    if(!solidAt(o.x,ny)) o.y=clamp(ny,4,MAP_H*TILE-4);
    if(pd<28) bustedPlayer();
  } else {
    // Patrol
    o.aiTimer-=dt; o.turnTimer-=dt;
    if(o.turnTimer<=0){
      o.turnTimer=rnd(3,8);
      const a=Math.random()*PI*2;
      o.dir={x:cos(a),y:sin(a)};
    }
    const nx=o.x+o.dir.x*60*dt, ny=o.y+o.dir.y*60*dt;
    const tx2=floor(nx/TILE),ty2=floor(ny/TILE);
    const tile=S.world.map[ty2]?.[tx2];
    if(tile===SIDEWALK||tile===ROAD){
      o.x=clamp(nx,4,MAP_W*TILE-4);
      o.y=clamp(ny,4,MAP_H*TILE-4);
    } else o.turnTimer=0;
  }
  o.animTimer=(o.animTimer||0)+dt;
  if(o.animTimer>0.14){o.animFrame=(o.animFrame||0+1)%4;o.animTimer=0;}
}

function gainWanted(n){
  S.wantedLevel=clamp(S.wantedLevel+n,0,5);
  S.wantedCooldown=20+S.wantedLevel*5;
  for(const c of S.cars) if(c.isPolice) c.aiState='chase';
  for(const o of S.officers) o.chasing=true;
}
function clearWanted(){
  S.wantedLevel=0; S.wantedCooldown=0;
  for(const c of S.cars) if(c.isPolice&&c.aiState==='chase') c.aiState='patrol';
  for(const o of S.officers) o.chasing=false;
  notify('⭐ Розыск снят!',1500);
}
function buyHealth(){
  const p=S.player;
  if(p.money<100){notify('💸 Недостаточно денег!',1500);return;}
  p.money-=100; p.health=min(p.maxHealth,p.health+50);
  notify('❤️ +50 здоровья',1200);
}
function bustedPlayer(){
  const p=S.player;
  if(p.inCar) exitCar(p);
  p.money=max(0,p.money-500);
  clearWanted();
  p.x=(MAP_W/2)*TILE; p.y=(MAP_H/2)*TILE;
  S.score=max(0,S.score-1000);
  notify('🚔 ЗАДЕРЖАН! Штраф: $500. Перемещён в центр.',4000);
}
function spawnPoliceUnit(){
  const p=S.player;
  const px=p.inCar?p.inCar.x:p.x, py=p.inCar?p.inCar.y:p.y;
  const ang=Math.random()*PI*2, r=rnd(400,700);
  const x=clamp(px+cos(ang)*r,40,MAP_W*TILE-40);
  const y=clamp(py+sin(ang)*r,40,MAP_H*TILE-40);
  // Police car
  const pc=new Car(x,y,pick(['#1e3a8a','#152c6b']),'police');
  pc.aiState='chase'; pc.isParked=false; pc.sirenOn=true;
  S.cars.push(pc);
  // Officer on foot
  const o=new Officer(x+rnd(-30,30),y+rnd(-30,30));
  o.chasing=true; o.aiState='chase';
  S.officers.push(o);
  if(S.officers.length>S.wantedLevel*4+4)
    S.officers=S.officers.filter((_,i)=>i>S.officers.length-S.wantedLevel*4-4);
}

function spawnCarNearPlayer(type){
  if(S.spawnCooldown>0){notify(`⏳ Подождите ${S.spawnCooldown.toFixed(1)}с`,800);return;}
  const p=S.player;
  const ang=(p.inCar?p.inCar.angle:p.angle)+PI/2;
  const r=55;
  const x=clamp((p.inCar?p.inCar.x:p.x)+cos(ang)*r,20,MAP_W*TILE-20);
  const y=clamp((p.inCar?p.inCar.y:p.y)+sin(ang)*r,20,MAP_H*TILE-20);
  const c=new Car(x,y,pick(CAR_COLORS),type);
  c.angle=p.inCar?p.inCar.angle:p.angle;
  c.isParked=true; c.aiState='parked';
  S.cars.push(c);
  S.spawnCooldown=3;
  notify('🚗 Заспавнен '+carName(c)+'!',1500);
}

// ── Collision ─────────────────────────────────────────────────
function solidAt(wx,wy){
  const tx=floor(wx/TILE),ty=floor(wy/TILE);
  if(tx<0||ty<0||tx>=MAP_W||ty>=MAP_H) return true;
  const t=S.world.map[ty][tx];
  return t===BUILDING||t===WATER;
}
function carSolid(wx,wy,car){
  const pts=[[-car.w/2,-car.h/2],[car.w/2,-car.h/2],[-car.w/2,car.h/2],[car.w/2,car.h/2]];
  for(const[ox,oy] of pts){
    const rx=wx+ox*cos(car.angle)-oy*sin(car.angle);
    const ry=wy+ox*sin(car.angle)+oy*cos(car.angle);
    if(solidAt(rx,ry)) return true;
  }
  return false;
}

function nearestCar(){
  const p=S.player;
  let best=null,bd=9999;
  for(const c of S.cars){
    if(c.driver) continue;
    const d=dst(p.x,p.y,c.x,c.y);
    if(d<bd){bd=d;best=c;}
  }
  return best;
}

// ── Rendering ─────────────────────────────────────────────────
function render(){
  const ctx=S.ctx,W=S.W,H=S.H;
  const cx=S.cam.x,cy=S.cam.y;
  // Night overlay
  const isNight=S.dayTime<6||S.dayTime>20;
  const nightAlpha=isNight?0.45:max(0,(abs(S.dayTime-13)-6)/4*0.3);

  ctx.clearRect(0,0,W,H);
  ctx.save();
  ctx.translate(-cx,-cy);

  const tx0=max(0,floor(cx/TILE)-1);
  const ty0=max(0,floor(cy/TILE)-1);
  const tx1=min(MAP_W,tx0+ceil(W/TILE)+2);
  const ty1=min(MAP_H,ty0+ceil(H/TILE)+2);

  // ── Tiles ──────────────────────────────────────────────────
  for(let ty=ty0;ty<ty1;ty++){
    for(let tx=tx0;tx<tx1;tx++){
      const tile=S.world.map[ty][tx];
      const px=tx*TILE, py=ty*TILE;
      switch(tile){
        case ROAD:
          ctx.fillStyle='#454545';
          ctx.fillRect(px,py,TILE,TILE);
          break;
        case SIDEWALK:
          ctx.fillStyle='#8a8a8a';
          ctx.fillRect(px,py,TILE,TILE);
          // Curb line
          ctx.fillStyle='rgba(200,200,200,.15)';
          ctx.fillRect(px,py,TILE,1); ctx.fillRect(px,py,1,TILE);
          break;
        case BUILDING:{
          const bc=S.world.bColors[ty][tx]||'#667';
          ctx.fillStyle=bc;
          ctx.fillRect(px,py,TILE,TILE);
          // Roof shadow
          ctx.fillStyle='rgba(0,0,0,0.2)';
          ctx.fillRect(px+1,py+1,TILE-2,TILE-2);
          // Windows — stable hash-based
          const wCols=3,wRows=3;
          for(let wr=0;wr<wRows;wr++){
            for(let wc=0;wc<wCols;wc++){
              const wx2=px+5+wc*(TILE-10)/(wCols);
              const wy2=py+5+wr*(TILE-10)/(wRows);
              const lit=hash(tx*31+wc*7,ty*37+wr*11)>0.4;
              if(isNight){
                ctx.fillStyle=lit?'rgba(255,240,160,0.85)':'rgba(0,0,0,0.5)';
              } else {
                ctx.fillStyle=lit?'rgba(160,200,255,0.55)':'rgba(0,0,0,0.25)';
              }
              ctx.fillRect(wx2,wy2,5,5);
            }
          }
          // Rooftop detail
          ctx.fillStyle='rgba(0,0,0,0.1)';
          ctx.fillRect(px+2,py+2,4,TILE-4);
          break;
        }
        case PARK:
          ctx.fillStyle='#2a6e2a';
          ctx.fillRect(px,py,TILE,TILE);
          ctx.fillStyle='#236023';
          ctx.fillRect(px+4,py+4,TILE-8,TILE-8);
          // Trees dots
          if(hash(tx*5,ty*5)>0.5){
            ctx.fillStyle='#1a5a1a';
            ctx.beginPath();
            ctx.arc(px+TILE/2,py+TILE/2,8,0,PI*2);
            ctx.fill();
          }
          break;
        case WATER:
          ctx.fillStyle='#1a4a6a';
          ctx.fillRect(px,py,TILE,TILE);
          ctx.fillStyle='rgba(30,100,160,0.4)';
          ctx.fillRect(px+2,py+2,TILE-4,TILE-4);
          // Ripple
          if((S.frameCount+tx+ty)%8<4){
            ctx.strokeStyle='rgba(80,150,220,0.25)';
            ctx.lineWidth=1;
            ctx.beginPath();
            ctx.arc(px+TILE/2+sin(S.gameTime+tx)*6,py+TILE/2,6,0,PI*2);
            ctx.stroke();
          }
          break;
        default:
          ctx.fillStyle='#333';
          ctx.fillRect(px,py,TILE,TILE);
      }
    }
  }

  // ── Road markings ──────────────────────────────────────────
  ctx.setLineDash([10,10]);
  ctx.lineWidth=1.2;
  ctx.strokeStyle='rgba(255,240,0,0.35)';
  for(let ty=ty0;ty<ty1;ty++){
    for(let tx=tx0;tx<tx1;tx++){
      if(S.world.map[ty][tx]!==ROAD) continue;
      const px=tx*TILE, py=ty*TILE;
      const isVert=S.world.roadX.includes(tx);
      ctx.beginPath();
      if(isVert){ ctx.moveTo(px+TILE/2,py); ctx.lineTo(px+TILE/2,py+TILE); }
      else       { ctx.moveTo(px,py+TILE/2); ctx.lineTo(px+TILE,py+TILE/2); }
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);

  // ── Skid marks ────────────────────────────────────────────
  // (dynamic, not stored per tile — just visual flicker)
  if(S.player.inCar&&abs(S.player.inCar.speed)>80&&S.keys['Space']){
    const c=S.player.inCar;
    ctx.strokeStyle='rgba(0,0,0,0.35)';
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(c.x-cos(c.angle)*20,c.y-sin(c.angle)*20);
    ctx.lineTo(c.x-cos(c.angle)*40,c.y-sin(c.angle)*40);
    ctx.stroke();
  }

  // ── Dead NPCs ─────────────────────────────────────────────
  for(const n of S.npcs){
    if(n.alive) continue;
    ctx.save();
    ctx.translate(n.x,n.y);
    ctx.fillStyle='rgba(180,0,0,0.7)';
    ctx.beginPath(); ctx.ellipse(0,0,10,6,0,0,PI*2); ctx.fill();
    ctx.restore();
  }

  // ── Parked cars ──────────────────────────────────────────
  for(const c of S.cars) if(c.isParked&&c.driver!==S.player) drawCar(ctx,c);
  // ── Moving cars ──────────────────────────────────────────
  for(const c of S.cars) if(!c.isParked&&c.driver!==S.player) drawCar(ctx,c);
  // ── Player car ───────────────────────────────────────────
  if(S.player.inCar) drawCar(ctx,S.player.inCar);

  // ── NPCs ─────────────────────────────────────────────────
  for(const n of S.npcs) if(n.alive) drawHuman(ctx,n);
  for(const o of S.officers) if(o.alive) drawHuman(ctx,o);

  // ── Player ───────────────────────────────────────────────
  if(!S.player.inCar) drawPlayer(ctx,S.player);

  // ── Enter-car prompt ─────────────────────────────────────
  if(!S.player.inCar){
    const nc=nearestCar();
    if(nc&&dst(S.player.x,S.player.y,nc.x,nc.y)<55){
      ctx.save();
      ctx.translate(nc.x,nc.y);
      ctx.fillStyle='rgba(0,0,0,0.7)';
      ctx.beginPath(); ctx.roundRect(-28,-26,56,18,5); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 10px Segoe UI';
      ctx.textAlign='center'; ctx.fillText('[F] Войти в машину',0,-14);
      ctx.restore();
    }
  }

  // ── Night overlay ─────────────────────────────────────────
  if(nightAlpha>0.05){
    ctx.fillStyle=`rgba(0,10,30,${nightAlpha})`;
    ctx.fillRect(cx,cy,W,H);
    // Headlights cones
    if(S.player.inCar){
      const c=S.player.inCar;
      const grd=ctx.createRadialGradient(c.x,c.y,5,
        c.x+cos(c.angle)*60,c.y+sin(c.angle)*60,90);
      grd.addColorStop(0,'rgba(255,255,200,0.18)');
      grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd;
      ctx.beginPath();ctx.arc(c.x+cos(c.angle)*60,c.y+sin(c.angle)*60,90,0,PI*2);ctx.fill();
    }
  }

  ctx.restore();
}

function drawCar(ctx,car){
  ctx.save();
  ctx.translate(car.x,car.y);
  ctx.rotate(car.angle);
  const w=car.w,h=car.h;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.28)';
  ctx.fillRect(-w/2+2,h/2,w,3);
  // Body
  ctx.fillStyle=car.color;
  ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(-w/2,-h/2,w,h,4);
  else ctx.rect(-w/2,-h/2,w,h);
  ctx.fill();
  // Stripe (for variety)
  const dark=darken(car.color,0.2);
  ctx.fillStyle=dark;
  ctx.fillRect(-w/2+3,-2,w-6,4);
  // Cabin
  ctx.fillStyle=darken(car.color,0.3);
  const cw=w*0.5,ch=h*0.55;
  if(ctx.roundRect) ctx.beginPath(),ctx.roundRect(-cw/2,-ch/2,cw,ch,3),ctx.fill();
  else ctx.fillRect(-cw/2,-ch/2,cw,ch);
  // Windshield
  ctx.fillStyle='rgba(100,180,255,0.55)';
  ctx.fillRect(w/2-9,-h/2+2,6,h-4);
  ctx.fillStyle='rgba(100,180,255,0.35)';
  ctx.fillRect(-w/2+3,-h/2+2,6,h-4);
  // Headlights
  ctx.fillStyle='rgba(255,255,180,0.9)';
  ctx.fillRect(w/2-2,-h/2+2,2,3);
  ctx.fillRect(w/2-2,h/2-5,2,3);
  // Tail
  ctx.fillStyle=car.brakeLight?'rgba(255,0,0,0.95)':'rgba(200,30,30,0.7)';
  ctx.fillRect(-w/2,-h/2+2,2,3);
  ctx.fillRect(-w/2,h/2-5,2,3);
  // Wheels
  ctx.fillStyle='#111';
  for(const[wx2,wy2] of [[w/2-8,-h/2-2],[w/2-8,h/2-1],[-w/2+2,-h/2-2],[-w/2+2,h/2-1]]){
    ctx.fillRect(wx2,wy2,6,3);
  }
  // Police extras
  if(car.isPolice){
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.font='bold 5px Arial';ctx.textAlign='center';
    ctx.fillText('POLICE',0,h/2+2);
    // Siren lights
    if(car.sirenOn||S.wantedLevel>0){
      ctx.fillStyle=S.frameCount%14<7?'#f00':'#00f';
      ctx.fillRect(-4,-h/2-4,4,3);
      ctx.fillStyle=S.frameCount%14<7?'#00f':'#f00';
      ctx.fillRect(1,-h/2-4,4,3);
    }
  }
  // Type label
  if(car.type==='truck'){
    ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.font='5px Arial'; ctx.textAlign='center';
    ctx.fillText('TRUCK',0,1);
  }
  if(car.type==='sports'){
    // Low spoiler
    ctx.fillStyle=darken(car.color,0.1);
    ctx.fillRect(-w/2-2,h/2-1,4,2);
  }
  ctx.restore();
}

function drawHuman(ctx,n){
  ctx.save();
  ctx.translate(n.x,n.y);
  const ang=atan2(n.dir.y||0,n.dir.x||1)+PI/2;
  ctx.rotate(ang);
  const lo=n.animFrame<2?2:-2;
  // Legs
  ctx.fillStyle=n.pantsColor;
  ctx.fillRect(-3,1,2,5+lo); ctx.fillRect(1,1,2,5-lo);
  // Arms (swing)
  ctx.fillStyle=n.skinColor;
  ctx.fillRect(-6,-3,2,4+lo); ctx.fillRect(4,-3,2,4-lo);
  // Body
  ctx.fillStyle=n.shirtColor;
  if(ctx.roundRect) ctx.beginPath(),ctx.roundRect(-4,-5,8,8,2),ctx.fill();
  else ctx.fillRect(-4,-5,8,8);
  // Head
  ctx.fillStyle=n.skinColor;
  ctx.beginPath(); ctx.arc(0,-9,4,0,PI*2); ctx.fill();
  // Police hat
  if(n.isPolice){
    ctx.fillStyle='#1a3a6b';
    ctx.fillRect(-5,-14,10,3);
    ctx.fillStyle='#ffd700';
    ctx.font='bold 5px Arial'; ctx.textAlign='center';
    ctx.fillText('👮',0,-20);
  }
  ctx.restore();
}

function drawPlayer(ctx,p){
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.rotate(p.angle+PI/2);
  const lo=p.animFrame<2?3:-3;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(0,3,7,3,0,0,PI*2); ctx.fill();
  // Legs
  ctx.fillStyle=p.pantsColor;
  ctx.fillRect(-4,2,3,7+lo); ctx.fillRect(1,2,3,7-lo);
  // Arms
  ctx.fillStyle=p.skinColor;
  ctx.fillRect(-7,-4,3,5+lo); ctx.fillRect(4,-4,3,5-lo);
  // Body
  ctx.fillStyle=p.shirtColor;
  if(ctx.roundRect) ctx.beginPath(),ctx.roundRect(-5,-7,10,11,2),ctx.fill();
  else ctx.fillRect(-5,-7,10,11);
  // Head
  ctx.fillStyle=p.skinColor;
  ctx.beginPath(); ctx.arc(0,-11,5,0,PI*2); ctx.fill();
  // Eyes
  ctx.fillStyle='#222';
  ctx.fillRect(-2,-13,1.5,1.5); ctx.fillRect(1,-13,1.5,1.5);
  // Arrow "YOU"
  ctx.fillStyle='rgba(255,255,255,0.9)';
  ctx.font='bold 8px Arial'; ctx.textAlign='center';
  ctx.fillText('▼ ВЫ',0,-20);
  ctx.restore();
}

// ── HUD ───────────────────────────────────────────────────────
function drawHUD(){
  const hud=S.hud; if(!hud) return;
  const p=S.player;
  const night=S.dayTime<6||S.dayTime>20;
  const hour=floor(S.dayTime),min2=floor((S.dayTime%1)*60);
  const timeStr=`${hour.toString().padStart(2,'0')}:${min2.toString().padStart(2,'0')}`;
  const timeEmoji=night?'🌙':S.dayTime<12?'🌅':'☀️';

  const stars=Array.from({length:5},(_,i)=>i<S.wantedLevel?'⭐':'☆').join('');

  let html=`
  <!-- Health + money -->
  <div style="position:absolute;top:10px;left:10px;display:flex;flex-direction:column;gap:5px;pointer-events:none;">
    <div style="background:rgba(0,0,0,.78);border-radius:9px;padding:6px 12px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:13px;">❤️</span>
      <div style="width:90px;height:7px;background:rgba(255,255,255,.15);border-radius:4px;overflow:hidden;">
        <div style="width:${p.health}%;height:100%;background:${p.health>60?'#2ecc71':p.health>30?'#f1c40f':'#e74c3c'};border-radius:4px;transition:width .4s;"></div>
      </div>
      <span style="color:#fff;font-size:11px;">${p.health}</span>
    </div>
    <div style="background:rgba(0,0,0,.78);border-radius:9px;padding:5px 12px;color:#f1c40f;font-size:13px;font-weight:700;">💰 $${p.money.toLocaleString()}</div>
    <div style="background:rgba(0,0,0,.78);border-radius:9px;padding:5px 12px;color:#95a5a6;font-size:11px;">🏆 ${S.score.toLocaleString()} pts</div>
    <div style="background:rgba(0,0,0,.78);border-radius:9px;padding:5px 12px;color:#aaa;font-size:11px;">${timeEmoji} ${timeStr}</div>
  </div>

  <!-- Wanted -->
  <div style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.78);border-radius:9px;padding:8px 14px;text-align:right;pointer-events:none;">
    <div style="color:#aaa;font-size:9px;letter-spacing:1px;margin-bottom:3px;">РОЗЫСК</div>
    <div style="font-size:17px;letter-spacing:3px;color:${S.wantedLevel===0?'#444':S.wantedLevel<3?'#f1c40f':'#e74c3c'};">${stars}</div>
    ${S.wantedLevel>0?`<div style="color:#e74c3c;font-size:9px;margin-top:3px;animation:blink 0.8s ease infinite;">⚠️ Полиция активна!</div>`:''}
  </div>`;

  // Speedometer (driving)
  if(p.inCar){
    const spd=abs(floor(p.inCar.speed));
    const gear=spd<2?'P':p.inCar.speed<0?'R':'D';
    html+=`<div style="position:absolute;bottom:50px;left:10px;background:rgba(0,0,0,.85);border-radius:14px;padding:10px 18px;text-align:center;pointer-events:none;">
      <div style="color:#fff;font-size:30px;font-weight:200;line-height:1;">${spd}</div>
      <div style="color:#888;font-size:8px;letter-spacing:1px;">КМ/Ч</div>
      <div style="color:${gear==='R'?'#e74c3c':gear==='P'?'#f1c40f':'#2ecc71'};font-size:13px;font-weight:700;margin-top:2px;">${gear}</div>
      <div style="color:#666;font-size:9px;margin-top:1px;">${carName(p.inCar)}</div>
    </div>`;
  }

  // Notifications
  if(S.notifs.length>0){
    html+=`<div style="position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;gap:5px;align-items:center;pointer-events:none;">`;
    S.notifs.slice(-4).forEach(n=>{
      const op=min(1,n.t*2);
      html+=`<div style="background:rgba(0,0,0,.87);border-radius:10px;padding:8px 20px;color:#fff;font-size:12.5px;opacity:${op};white-space:nowrap;border:1px solid rgba(255,255,255,.1);">${n.msg}</div>`;
    });
    html+='</div>';
  }

  // Controls (collapsed)
  const inCar=!!p.inCar;
  html+=`<div style="position:absolute;top:42%;right:10px;background:rgba(0,0,0,.65);border-radius:9px;padding:8px 12px;font-size:9.5px;color:rgba(255,255,255,.6);line-height:1.9;pointer-events:none;text-align:right;">
    <div>WASD — движение</div>
    <div>F — ${inCar?'выйти из машины':'войти в машину'}</div>
    <div>G — спавн авто</div>
    <div>T — спорткар</div>
    ${inCar?'<div>Space — тормоз</div>':'<div>Shift — бег</div>'}
  </div>`;

  // NPC / car counter
  html+=`<div style="position:absolute;bottom:50px;right:155px;background:rgba(0,0,0,.6);border-radius:8px;padding:5px 10px;font-size:10px;color:#888;pointer-events:none;">
    🚗 ${S.cars.length}  👥 ${S.npcs.filter(n=>n.alive).length}  👮 ${S.officers.filter(o=>o.alive).length}
  </div>`;

  hud.innerHTML=html;
}

// ── Minimap ───────────────────────────────────────────────────
function drawMinimap(){
  const mm=S.mmCanvas; if(!mm) return;
  const ctx=mm.getContext('2d');
  const SZ=140, SC=0.11;
  ctx.clearRect(0,0,SZ,SZ);

  // Clip circle
  ctx.save();
  ctx.beginPath(); ctx.arc(SZ/2,SZ/2,SZ/2,0,PI*2); ctx.clip();

  // Background
  ctx.fillStyle='#222';
  ctx.fillRect(0,0,SZ,SZ);

  const p=S.player;
  const px=p.inCar?p.inCar.x:p.x, py=p.inCar?p.inCar.y:p.y;
  const ox=SZ/2-px*SC, oy=SZ/2-py*SC;

  // Draw tiles
  for(let ty=0;ty<MAP_H;ty++){
    for(let tx=0;tx<MAP_W;tx++){
      const sx=tx*TILE*SC+ox, sy=ty*TILE*SC+oy;
      const sw=TILE*SC+0.5;
      if(sx<-sw||sy<-sw||sx>SZ||sy>SZ) continue;
      const tile=S.world.map[ty][tx];
      ctx.fillStyle=tile===ROAD?'#666':tile===SIDEWALK?'#999':tile===BUILDING?(S.world.bColors[ty][tx]||'#445'):tile===PARK?'#2a6a2a':'#1a3a5a';
      ctx.fillRect(sx,sy,sw,sw);
    }
  }

  // Cars
  for(const c of S.cars){
    const sx=c.x*SC+ox, sy=c.y*SC+oy;
    ctx.fillStyle=c.isPolice?'#3af':'red';
    ctx.fillRect(sx-1.5,sy-1.5,3,3);
  }

  // NPCs
  ctx.fillStyle='rgba(255,220,0,0.7)';
  for(const n of S.npcs) if(n.alive){
    ctx.fillRect(n.x*SC+ox-0.8,n.y*SC+oy-0.8,1.6,1.6);
  }

  // Officers (blue)
  ctx.fillStyle='#1af';
  for(const o of S.officers) if(o.alive){
    ctx.beginPath(); ctx.arc(o.x*SC+ox,o.y*SC+oy,2,0,PI*2); ctx.fill();
  }

  // Player dot
  ctx.fillStyle='#e74c3c';
  ctx.beginPath(); ctx.arc(SZ/2,SZ/2,4.5,0,PI*2); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();

  ctx.restore();

  // Compass
  ctx.fillStyle='rgba(255,255,255,0.8)';
  ctx.font='bold 9px Arial'; ctx.textAlign='center';
  ctx.fillText('С',SZ/2,8);
}

// ── Helpers ───────────────────────────────────────────────────
function carName(c){
  return{sedan:'Sedan',sports:'Sports',suv:'SUV',truck:'Truck',police:'Police'}[c.type]||'Car';
}
function darken(hex,t){
  try{
    hex=hex.replace('#','');
    const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
    return`rgb(${floor(r*(1-t))},${floor(g*(1-t))},${floor(b*(1-t))})`;
  }catch(e){return hex;}
}
function ceil(x){return Math.ceil(x);}
function notify(msg,ms=2000){S.notifs.push({msg,t:ms/1000});}

// ── Public ────────────────────────────────────────────────────
function stop(){
  S.running=false;
  for(const[el,ev,fn] of S._listeners) el.removeEventListener(ev,fn);
  S._listeners=[];
}

return{init,stop,spawnCar:spawnCarNearPlayer,clearWanted,state:S,_started:false};
})();
