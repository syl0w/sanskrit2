// ============================================================
// MANTRA: THE RESONANT WORLD — 2D RPG Engine & Game Logic
// ============================================================

// ─── STATE ───
let canvas, ctx;
let map = [];
let player = { x:40.5, y:32.5, dir:0, speed:4.5, moving:false, stepTimer:0, bobPhase:0 };
let camera = { x:0, y:0 };
let keys = {}, prevKeys = {};
let inventory = [];
let discoveredWords = new Set();
let flags = {};
let groundItemState = [];
let dialogueState = null;
let wordPopup = null;
let wordPopupQueue = [];
let showInventory = false;
let showLexicon = false;
let time = 0;
let gameStarted = false;
let titleFade = 0;        // 0→1 fade from title to game
let particles = [];
let screenFlash = { alpha:0, color:'#ffd700' };
let currentArea = '';
let cameraShake = { x:0, y:0, intensity:0 };
let ambientHue = { r:0, g:0, b:0, a:0 };  // area tint
let dialogueSlide = 0;    // 0→1 slide-up
let minimap = null;        // offscreen canvas

// ─── INIT ───
function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', e => { keys[e.code]=true; if(!e.metaKey&&!e.ctrlKey) e.preventDefault(); });
  window.addEventListener('keyup', e => { keys[e.code]=false; });
  map = generateMap();
  groundItemState = GROUND_ITEMS.map(()=>false);
  buildMinimap();
  // Seed title particles
  for(let i=0;i<80;i++) particles.push(makeTitleParticle());
  gameLoop(performance.now());
}

function resize() {
  canvas.width = 960;
  canvas.height = 640;
}

// ─── INPUT ───
function isDown(c) { return !!keys[c]; }
function justPressed(c) { return keys[c]&&!prevKeys[c]; }
function hasItem(id) { return inventory.includes(id); }
function stateObj() { return { flags, inventory, has:id=>inventory.includes(id) }; }

// ─── GAME LOOP ───
let lastTime = 0;
function gameLoop(ts) {
  const dt = Math.min((ts-lastTime)/1000, 0.05);
  lastTime = ts;
  update(dt);
  render();
  prevKeys = {...keys};
  requestAnimationFrame(gameLoop);
}

// ─── UPDATE ───
function update(dt) {
  time += dt;

  // Title
  if(!gameStarted) {
    updateParticles(dt);
    if(justPressed('Enter')||justPressed('Space')||justPressed('KeyE')) {
      gameStarted = true;
      titleFade = 0;
      particles = [];
    }
    return;
  }

  // Fade in from title
  if(titleFade < 1) titleFade = Math.min(1, titleFade + dt * 1.5);

  // Screen flash decay
  if(screenFlash.alpha > 0) screenFlash.alpha = Math.max(0, screenFlash.alpha - dt * 2);

  // Camera shake decay
  if(cameraShake.intensity > 0) {
    cameraShake.intensity *= 0.9;
    cameraShake.x = (Math.random()-0.5) * cameraShake.intensity;
    cameraShake.y = (Math.random()-0.5) * cameraShake.intensity;
    if(cameraShake.intensity < 0.1) { cameraShake.intensity=0; cameraShake.x=0; cameraShake.y=0; }
  }

  // Dialogue slide
  if(dialogueState) {
    dialogueSlide = Math.min(1, dialogueSlide + dt * 5);
  } else {
    dialogueSlide = Math.max(0, dialogueSlide - dt * 6);
  }

  // Update area + ambient
  updateArea();

  // Dialogue
  if(dialogueState) { updateDialogue(); updateParticles(dt); return; }

  // Panels
  if(justPressed('KeyI')||justPressed('Tab')) { showInventory=!showInventory; showLexicon=false; }
  if(justPressed('KeyL')) { showLexicon=!showLexicon; showInventory=false; }
  if(showInventory||showLexicon) { if(justPressed('Escape')) { showInventory=false; showLexicon=false; } updateParticles(dt); return; }

  // Movement
  let dx=0,dy=0;
  if(isDown('KeyW')||isDown('ArrowUp'))    dy=-1;
  if(isDown('KeyS')||isDown('ArrowDown'))  dy=1;
  if(isDown('KeyA')||isDown('ArrowLeft'))  dx=-1;
  if(isDown('KeyD')||isDown('ArrowRight')) dx=1;
  if(dx!==0||dy!==0) {
    const len=Math.sqrt(dx*dx+dy*dy); dx/=len; dy/=len;
    const spd=player.speed*dt;
    const nx=player.x+dx*spd, ny=player.y+dy*spd;
    if(canMoveTo(nx,player.y)) player.x=nx;
    if(canMoveTo(player.x,ny)) player.y=ny;
    player.dir=Math.atan2(dy,dx);
    player.moving=true;
    player.bobPhase+=dt*10;
    player.stepTimer+=dt;
    // Footstep dust
    if(player.stepTimer>0.2) {
      player.stepTimer=0;
      spawnParticle(player.x*TILE_SIZE,player.y*TILE_SIZE+6,'dust_step');
    }
  } else {
    player.moving=false;
    player.bobPhase+=dt*2;
  }

  // Interact
  if(justPressed('KeyE')) tryInteract();

  // Camera
  const tx=player.x*TILE_SIZE-canvas.width/2, ty=player.y*TILE_SIZE-canvas.height/2;
  camera.x+=(tx-camera.x)*0.1;
  camera.y+=(ty-camera.y)*0.1;
  camera.x=Math.max(0,Math.min(MAP_W*TILE_SIZE-canvas.width,camera.x));
  camera.y=Math.max(0,Math.min(MAP_H*TILE_SIZE-canvas.height,camera.y));

  // Word popup
  if(wordPopup) {
    wordPopup.timer-=dt;
    wordPopup.slide=Math.min(1,wordPopup.slide+dt*4);
    if(wordPopup.timer<=0) {
      wordPopup=null;
      if(wordPopupQueue.length>0) wordPopup=wordPopupQueue.shift();
    }
  }

  // Ambient particles
  spawnAmbientParticles(dt);
  updateParticles(dt);
}

// ─── AREA ATMOSPHERE ───
function updateArea() {
  const a = getLocationName(player.x,player.y);
  if(a!==currentArea) currentArea=a;
  // Smooth tint lerp
  let tr=0,tg=0,tb=0,ta=0;
  if(currentArea.includes('Jaṅgala'))        { tr=0;tg=20;tb=0;ta=0.12; }
  else if(currentArea.includes('Monastery')) { tr=20;tg=15;tb=0;ta=0.08; }
  else if(currentArea.includes('Lake'))      { tr=0;tg=5;tb=25;ta=0.08; }
  else if(currentArea.includes('Sumeru'))    { tr=10;tg=10;tb=20;ta=0.1; }
  else if(currentArea.includes('Farm'))      { tr=10;tg=10;tb=0;ta=0.04; }
  const s=0.03;
  ambientHue.r+=(tr-ambientHue.r)*s;
  ambientHue.g+=(tg-ambientHue.g)*s;
  ambientHue.b+=(tb-ambientHue.b)*s;
  ambientHue.a+=(ta-ambientHue.a)*s;
}

// ─── PARTICLES ───
function makeTitleParticle() {
  return { x:Math.random()*960, y:Math.random()*640, vx:(Math.random()-0.5)*20, vy:-Math.random()*15-5,
    life:Math.random()*6+2, maxLife:8, size:Math.random()*2+0.5, color:'#ffd700', type:'title' };
}

function spawnParticle(wx,wy,type) {
  const sx=wx-camera.x, sy=wy-camera.y;
  let p;
  switch(type) {
    case 'dust_step':
      p={x:sx+(Math.random()-0.5)*8,y:sy,vx:(Math.random()-0.5)*10,vy:-Math.random()*8-4,
        life:0.4+Math.random()*0.3,maxLife:0.7,size:1.5+Math.random(),color:'rgba(180,160,120,0.6)',type:'world'};
      break;
    case 'sparkle':
      p={x:sx,y:sy,vx:(Math.random()-0.5)*30,vy:-Math.random()*25-10,
        life:0.5+Math.random()*0.5,maxLife:1,size:1+Math.random()*2,color:'#ffd700',type:'world'};
      break;
    case 'item_sparkle':
      p={x:sx+(Math.random()-0.5)*16,y:sy+(Math.random()-0.5)*16,vx:(Math.random()-0.5)*6,vy:-Math.random()*8,
        life:0.8+Math.random()*0.5,maxLife:1.3,size:1+Math.random(),color:'#ffd700',type:'world'};
      break;
    default: return;
  }
  if(p) particles.push(p);
}

function spawnAmbientParticles(dt) {
  const cx=camera.x, cy=camera.y, cw=canvas.width, ch=canvas.height;
  const rate = currentArea.includes('Jaṅgala') ? 3
    : currentArea.includes('Monastery') ? 1.5
    : currentArea.includes('Lake') ? 2
    : currentArea.includes('Sumeru') ? 4
    : 0.8;
  if(Math.random() < rate*dt) {
    const rx=Math.random()*cw, ry=Math.random()*ch;
    let p;
    if(currentArea.includes('Jaṅgala')) {
      // Fireflies & falling leaves
      if(Math.random()<0.6)
        p={x:rx,y:ry,vx:Math.sin(time+rx)*8,vy:Math.cos(time+ry)*5,life:4+Math.random()*4,maxLife:8,size:1.5+Math.random(),color:'#aade55',type:'ambient',glow:true};
      else
        p={x:rx,y:-5,vx:Math.random()*12-6,vy:Math.random()*15+10,life:3+Math.random()*3,maxLife:6,size:2+Math.random()*2,color:'#6a9a3a',type:'ambient',spin:Math.random()*6};
    } else if(currentArea.includes('Monastery')) {
      // Incense smoke
      p={x:rx,y:ch,vx:(Math.random()-0.5)*4,vy:-Math.random()*12-8,life:3+Math.random()*3,maxLife:6,size:1+Math.random()*1.5,color:'#daa52080',type:'ambient'};
    } else if(currentArea.includes('Lake')) {
      // Water sparkles
      p={x:rx,y:ry,vx:0,vy:-Math.random()*3,life:1+Math.random()*2,maxLife:3,size:1+Math.random(),color:'#87ceeb',type:'ambient',glow:true};
    } else if(currentArea.includes('Sumeru')) {
      // Snow
      p={x:rx,y:-5,vx:Math.random()*8-4,vy:Math.random()*20+15,life:5+Math.random()*4,maxLife:9,size:1.5+Math.random()*1.5,color:'#ddeeff',type:'ambient'};
    } else {
      // Gentle dust motes
      p={x:rx,y:ry,vx:(Math.random()-0.5)*6,vy:-Math.random()*4-1,life:4+Math.random()*4,maxLife:8,size:0.8+Math.random()*0.8,color:'#daa52050',type:'ambient'};
    }
    if(p) particles.push(p);
  }
}

function updateParticles(dt) {
  for(let i=particles.length-1;i>=0;i--) {
    const p=particles[i];
    p.x+=p.vx*dt;
    p.y+=p.vy*dt;
    p.life-=dt;
    if(p.spin!==undefined) p.spin+=dt*2;
    // Firefly wobble
    if(p.glow) { p.vx=Math.sin(time*2+i)*10; p.vy=Math.cos(time*1.5+i)*6; }
    if(p.life<=0) { particles.splice(i,1); continue; }
  }
  // Cap particles
  if(particles.length>300) particles.splice(0,particles.length-300);
}

function renderParticles() {
  for(const p of particles) {
    const alpha=Math.min(1,p.life/Math.max(p.maxLife*0.3,0.01));
    ctx.globalAlpha=alpha * (p.type==='title'?0.4:0.7);
    if(p.glow) {
      const grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*3);
      grad.addColorStop(0,p.color);
      grad.addColorStop(1,'transparent');
      ctx.fillStyle=grad;
      ctx.fillRect(p.x-p.size*3,p.y-p.size*3,p.size*6,p.size*6);
    }
    ctx.fillStyle=p.color;
    if(p.spin!==undefined) {
      // Leaf shape
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.spin);
      ctx.fillRect(-p.size,-p.size*0.4,p.size*2,p.size*0.8);
      ctx.restore();
    } else {
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.globalAlpha=1;
}

// ─── COLLISION ───
function isSolid(tx,ty) {
  if(tx<0||ty<0||tx>=MAP_W||ty>=MAP_H) return true;
  return SOLID.has(map[ty][tx]);
}
function canMoveTo(x,y) {
  const hw=0.3,hh=0.35;
  return !isSolid(Math.floor(x-hw),Math.floor(y-hh))&&!isSolid(Math.floor(x+hw),Math.floor(y-hh))&&
         !isSolid(Math.floor(x-hw),Math.floor(y+hh))&&!isSolid(Math.floor(x+hw),Math.floor(y+hh));
}

// ─── INTERACTION ───
function tryInteract() {
  const nearby=getNearby();
  if(!nearby) return;
  if(nearby.type==='npc') {
    const dlg=getDialogue(nearby.target.id,stateObj());
    dlg.speaker=nearby.target.name;
    dlg.speakerColor=nearby.target.color;
    startDialogue(dlg);
  } else if(nearby.type==='item') {
    const gi=nearby.target, item=ITEMS[gi.itemId];
    inventory.push(gi.itemId);
    groundItemState[gi.index]=true;
    discoverWord(item.word);
    for(let i=0;i<8;i++) spawnParticle(gi.x*TILE_SIZE+TILE_SIZE/2,gi.y*TILE_SIZE+TILE_SIZE/2,'sparkle');
    startDialogue({lines:[`Picked up {g}${item.name}{/}!\n{d}${item.desc}{/}`],words:[],give:[],take:[]});
  } else if(nearby.type==='point') {
    startDialogue(getPointDialogue(nearby.target.id,stateObj()));
  }
}

function getNearby() {
  let best=null,bestDist=2.0;
  for(const npc of NPCS) {
    const d=dist(player.x,player.y,npc.x+0.5,npc.y+0.5);
    if(d<bestDist){bestDist=d;best={type:'npc',target:npc};}
  }
  for(let i=0;i<GROUND_ITEMS.length;i++) {
    if(groundItemState[i])continue;
    const gi=GROUND_ITEMS[i];
    const d=dist(player.x,player.y,gi.x+0.5,gi.y+0.5);
    if(d<bestDist){bestDist=d;best={type:'item',target:{...gi,index:i}};}
  }
  for(const pt of INTERACT_POINTS) {
    const d=dist(player.x,player.y,pt.x+0.5,pt.y+0.5);
    if(d<bestDist){bestDist=d;best={type:'point',target:pt};}
  }
  return best;
}

function dist(x1,y1,x2,y2){return Math.sqrt((x1-x2)**2+(y1-y2)**2);}

// ─── DIALOGUE ───
function startDialogue(dlg) {
  if(!dlg||!dlg.lines||!dlg.lines.length) return;
  dialogueState={lines:dlg.lines,index:0,charIndex:0,fullText:dlg.lines[0],
    visLen:richLen(dlg.lines[0]),
    speaker:dlg.speaker||null, speakerColor:dlg.speakerColor||'#ffd700',
    words:dlg.words||[],give:dlg.give||[],take:dlg.take||[],setFlags:dlg.setFlags||[],applied:false};
  dialogueSlide=0;
}

function updateDialogue() {
  if(!dialogueState)return;
  const ds=dialogueState;
  // Typing with punctuation-aware pauses
  if(ds.charIndex<ds.visLen) {
    const stripped=stripTags(ds.fullText);
    const ci=Math.max(0,Math.floor(ds.charIndex)-1);
    const ch=stripped[ci]||'';
    let spd=0.6;
    if('.!?'.includes(ch)) spd=0.06;
    else if(',;:—–…'.includes(ch)) spd=0.16;
    else if(ch==='\n') spd=0.08;
    ds.charIndex+=spd;
  }
  if(justPressed('KeyE')||justPressed('Space')||justPressed('Enter')) {
    if(ds.charIndex<ds.visLen) { ds.charIndex=ds.visLen; }
    else {
      ds.index++;
      if(ds.index>=ds.lines.length) {
        if(!ds.applied) {
          ds.applied=true;
          for(const w of ds.words) discoverWord(w);
          for(const g of ds.give) {
            if(!inventory.includes(g)) inventory.push(g);
            if(g.includes('_dye')){screenFlash={alpha:0.6,color:ITEMS[g]?ITEMS[g].color:'#ffd700'};cameraShake.intensity=8;}
          }
          for(const t of ds.take){const idx=inventory.indexOf(t);if(idx>=0)inventory.splice(idx,1);}
          for(const f of ds.setFlags){
            flags[f]=true;
            if(f==='gameComplete'){screenFlash={alpha:1,color:'#ffd700'};cameraShake.intensity=15;}
          }
        }
        dialogueState=null;
      } else {
        ds.fullText=ds.lines[ds.index];
        ds.visLen=richLen(ds.fullText);
        ds.charIndex=0;
      }
    }
  }
}

// ─── WORD DISCOVERY ───
function discoverWord(wordId) {
  if(!wordId||discoveredWords.has(wordId))return;
  const w=WORDS[wordId];
  if(!w)return;
  discoveredWords.add(wordId);
  const popup={word:w,id:wordId,timer:5,slide:0};
  if(wordPopup) wordPopupQueue.push(popup);
  else wordPopup=popup;
}

// ─── MINIMAP ───
function buildMinimap() {
  const mc=document.createElement('canvas');
  mc.width=MAP_W; mc.height=MAP_H;
  const mx=mc.getContext('2d');
  const c={[T.GRASS]:'#4a8c3f',[T.GRASS2]:'#3f7a35',[T.PATH]:'#c4a76c',[T.WATER]:'#3a80c4',[T.TREE]:'#2a6a1a',
    [T.WALL]:'#7a7068',[T.FLOOR]:'#c8b896',[T.SAND]:'#e0d48c',[T.MOUNTAIN]:'#5a5a5a',[T.BRIDGE]:'#9a7b5b',
    [T.FLOWERS]:'#e88aac',[T.TALL_GRASS]:'#3a7a2f',[T.CROPS]:'#8B7355',[T.DOOR]:'#8a6a3a',[T.FENCE]:'#7a5a2a',[T.BUSH]:'#2a5a1a'};
  for(let y=0;y<MAP_H;y++) for(let x=0;x<MAP_W;x++) {
    mx.fillStyle=c[map[y][x]]||'#111';
    mx.fillRect(x,y,1,1);
  }
  minimap=mc;
}

// ═══════════════════════════════════════
//                 RENDER
// ═══════════════════════════════════════
function render() {
  ctx.fillStyle='#0a0a1a';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(!gameStarted) { renderTitle(); return; }

  // Save for camera transform
  ctx.save();
  ctx.translate(-cameraShake.x,-cameraShake.y);

  renderMap();
  renderGroundItems();
  renderInteractPoints();
  renderNPCs();
  renderPlayer();

  ctx.restore();

  // Overlays (screen-space)
  renderAmbientOverlay();
  renderVignette();
  renderParticles();
  renderInteractPrompt();
  renderHUD();
  renderMinimap();
  renderDialogueBox();
  renderWordPopup();
  if(showInventory) renderInventoryPanel();
  if(showLexicon) renderLexiconPanel();
  renderScreenFlash();

  // Title fade
  if(titleFade<1) {
    ctx.fillStyle=`rgba(10,10,26,${1-titleFade})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}

// ─── TITLE SCREEN ───
function renderTitle() {
  // Animated background gradient
  const grad = ctx.createRadialGradient(480,300,50,480,300,500);
  grad.addColorStop(0,'#1a1428');
  grad.addColorStop(0.5,'#0f0f1a');
  grad.addColorStop(1,'#050510');
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,960,640);

  // Particles
  renderParticles();

  // Decorative lines
  ctx.strokeStyle='rgba(255,215,0,0.08)';
  ctx.lineWidth=1;
  for(let i=0;i<5;i++) {
    const y=140+i*90;
    ctx.beginPath();ctx.moveTo(100,y);ctx.lineTo(860,y);ctx.stroke();
  }

  // Mandala-like circle
  ctx.strokeStyle='rgba(255,215,0,0.12)';
  ctx.lineWidth=1;
  for(let i=0;i<3;i++) {
    ctx.beginPath();ctx.arc(480,280,120+i*40,0,Math.PI*2);ctx.stroke();
  }
  // Rotating dots on circles
  for(let i=0;i<12;i++) {
    const a = time*0.3+i*Math.PI/6;
    const r = 120+Math.sin(time+i)*10;
    ctx.fillStyle='rgba(255,215,0,0.3)';
    ctx.beginPath();ctx.arc(480+Math.cos(a)*r, 280+Math.sin(a)*r, 2, 0, Math.PI*2);ctx.fill();
  }

  ctx.textAlign='center';
  // Sanskrit
  ctx.fillStyle='#ffd700';
  ctx.font='52px serif';
  ctx.fillText('मन्त्र',480,200);
  // Glow on title
  ctx.shadowColor='#ffd700';ctx.shadowBlur=30;
  ctx.fillStyle='#e8e6e3';
  ctx.font='bold 60px "Cinzel",serif';
  ctx.fillText('MANTRA',480,280);
  ctx.shadowBlur=0;
  ctx.font='18px "Cinzel",serif';
  ctx.fillStyle='#9e9e9e';
  ctx.fillText('T H E   R E S O N A N T   W O R L D',480,315);
  // Tagline
  ctx.font='italic 16px serif';
  ctx.fillStyle='#b8960f';
  ctx.fillText('"To speak is to create. To understand the Root is to control the World."',480,370);
  // Controls
  ctx.font='13px sans-serif';
  ctx.fillStyle='#555';
  ctx.fillText('WASD  ·  E to interact  ·  I inventory  ·  L lexicon',480,430);
  // Pulsing prompt
  const a=0.5+0.5*Math.sin(time*3);
  ctx.globalAlpha=a;
  ctx.fillStyle='#ffd700';
  ctx.font='bold 20px sans-serif';
  ctx.fillText('Press E or ENTER to begin',480,490);
  ctx.globalAlpha=1;
  ctx.font='11px sans-serif';
  ctx.fillStyle='#444';
  ctx.fillText('A gamified exploration of Sanskrit\'s influence on English & Chinese',480,560);
  ctx.textAlign='left';
}

// ─── MAP ───
function renderMap() {
  const sc=Math.floor(camera.x/TILE_SIZE)-1, sr=Math.floor(camera.y/TILE_SIZE)-1;
  const ec=Math.ceil((camera.x+canvas.width)/TILE_SIZE)+1, er=Math.ceil((camera.y+canvas.height)/TILE_SIZE)+1;
  for(let row=sr;row<=er;row++) for(let col=sc;col<=ec;col++) {
    if(col<0||col>=MAP_W||row<0||row>=MAP_H) continue;
    const sx=Math.floor(col*TILE_SIZE-camera.x), sy=Math.floor(row*TILE_SIZE-camera.y);
    drawTile(map[row][col],sx,sy,col,row);
  }
}

function drawTile(tile,x,y,col,row) {
  const s=TILE_SIZE;
  switch(tile) {
    case T.GRASS:
      ctx.fillStyle='#4a8c3f';ctx.fillRect(x,y,s,s);
      // Subtle grass detail
      ctx.fillStyle='rgba(90,170,75,0.4)';
      if((col+row)%5===0){ctx.fillRect(x+8,y+12,2,4);ctx.fillRect(x+20,y+6,2,5);}
      break;
    case T.GRASS2:
      ctx.fillStyle='#3f7a35';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='rgba(60,100,50,0.3)';
      if((col*3+row*7)%4===0) ctx.fillRect(x+14,y+10,2,4);
      break;
    case T.TALL_GRASS:
      ctx.fillStyle='#3f7a35';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='#5aa04f';
      const sw=Math.sin(time*1.5+col*0.5)*2; // sway
      for(let i=0;i<3;i++){
        const gx=x+6+i*10+sw,gy=y+6;
        ctx.fillRect(gx,gy,2,18);
        ctx.fillRect(gx-2,gy,6,2);
        ctx.fillRect(gx-1,gy+6,4,2);
      }
      break;
    case T.PATH:
      ctx.fillStyle='#c4a76c';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='rgba(160,130,80,0.3)';
      ctx.fillRect(x+((col*7)%12)+2, y+((row*5)%10)+2, 4, 3);
      ctx.fillStyle='rgba(0,0,0,0.04)';
      ctx.fillRect(x+((col*11)%16)+4, y+((row*13)%14)+6, 3, 3);
      break;
    case T.WATER: {
      // Animated water
      const wd=Math.sin(time*1.5+col*0.7+row*0.3)*0.08;
      const b1=`rgb(${50+wd*60},${120+wd*40},${190+wd*30})`;
      ctx.fillStyle=b1;ctx.fillRect(x,y,s,s);
      // Waves
      ctx.strokeStyle='rgba(180,220,255,0.2)';ctx.lineWidth=1;
      for(let w=0;w<2;w++){
        ctx.beginPath();
        const wy=y+8+w*14;
        ctx.moveTo(x,wy+Math.sin(time*2+col+w)*2);
        ctx.quadraticCurveTo(x+s/2,wy-3+Math.sin(time*2+col+w+1)*2,x+s,wy+Math.sin(time*2+col+w+2)*2);
        ctx.stroke();
      }
      // Sparkle
      if((col+row*3+Math.floor(time*2))%11===0) {
        ctx.fillStyle='rgba(255,255,255,0.5)';
        ctx.beginPath();ctx.arc(x+16+Math.sin(time*3)*4,y+16,1.5,0,Math.PI*2);ctx.fill();
      }
      break;
    }
    case T.TREE:
      ctx.fillStyle='#4a8c3f';ctx.fillRect(x,y,s,s);
      // Shadow
      ctx.fillStyle='rgba(0,0,0,0.15)';
      ctx.beginPath();ctx.ellipse(x+16,y+28,9,4,0,0,Math.PI*2);ctx.fill();
      // Trunk
      ctx.fillStyle='#5a3a1a';ctx.fillRect(x+13,y+18,6,12);
      ctx.fillStyle='#4a2a10';ctx.fillRect(x+13,y+18,2,12);
      // Crown with layers
      ctx.fillStyle='#2a6a1a';
      ctx.beginPath();ctx.arc(x+16,y+13,11,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#35801f';
      ctx.beginPath();ctx.arc(x+13,y+11,7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#40902a';
      ctx.beginPath();ctx.arc(x+18,y+10,5,0,Math.PI*2);ctx.fill();
      break;
    case T.WALL:
      ctx.fillStyle='#7a7068';ctx.fillRect(x,y,s,s);
      // Brick pattern
      ctx.fillStyle='rgba(0,0,0,0.08)';
      ctx.fillRect(x,y+s/2,s,1);
      ctx.fillRect(x+s/2,y,1,s/2);
      ctx.fillRect(x+s/4,y+s/2,1,s/2);
      ctx.fillStyle='rgba(0,0,0,0.12)';
      ctx.fillRect(x,y+s-3,s,3);
      // Highlight
      ctx.fillStyle='rgba(255,255,255,0.06)';
      ctx.fillRect(x,y,s,2);
      break;
    case T.FLOOR:
      ctx.fillStyle='#c8b896';ctx.fillRect(x,y,s,s);
      ctx.strokeStyle='rgba(0,0,0,0.06)';ctx.lineWidth=1;
      ctx.strokeRect(x+1,y+1,s-2,s-2);
      // Wood grain
      ctx.fillStyle='rgba(160,130,80,0.15)';
      ctx.fillRect(x+4,y+8,s-8,1);
      ctx.fillRect(x+6,y+20,s-12,1);
      break;
    case T.SAND:
      ctx.fillStyle='#e0d48c';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='rgba(210,190,120,0.4)';
      ctx.fillRect(x+((col*7)%16)+2, y+((row*11)%14)+4, 3, 2);
      ctx.fillStyle='rgba(0,0,0,0.03)';
      ctx.fillRect(x+((col*13)%18), y+((row*17)%20), 4, 3);
      break;
    case T.MOUNTAIN:
      ctx.fillStyle='#5a5a5a';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='#686868';
      ctx.beginPath();ctx.moveTo(x,y+s);ctx.lineTo(x+s/2,y+2);ctx.lineTo(x+s,y+s);ctx.fill();
      // Snow cap
      ctx.fillStyle='#dde';
      ctx.beginPath();ctx.moveTo(x+s/2-6,y+10);ctx.lineTo(x+s/2,y+2);ctx.lineTo(x+s/2+6,y+10);ctx.fill();
      // Texture
      ctx.fillStyle='rgba(0,0,0,0.08)';
      ctx.fillRect(x+8,y+18,3,3);ctx.fillRect(x+20,y+22,4,2);
      break;
    case T.BRIDGE:
      ctx.fillStyle='#3a80c4';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='#9a7b5b';ctx.fillRect(x+1,y+1,s-2,s-2);
      // Planks
      ctx.fillStyle='rgba(0,0,0,0.1)';
      for(let i=0;i<4;i++) ctx.fillRect(x+1,y+2+i*8,s-2,1);
      // Rails
      ctx.fillStyle='#7a5a3b';
      ctx.fillRect(x,y,3,s);ctx.fillRect(x+s-3,y,3,s);
      break;
    case T.FLOWERS: {
      ctx.fillStyle='#4a8c3f';ctx.fillRect(x,y,s,s);
      const cols=['#e74c3c','#f39c12','#9b59b6','#3498db','#e91e63','#ff69b4'];
      for(let i=0;i<5;i++){
        const fc=cols[(col*3+row*7+i)%cols.length];
        const fx=x+4+((i*11+col*5)%22),fy=y+4+((i*7+row*3)%22);
        const sway=Math.sin(time*2+col+i)*1;
        ctx.fillStyle=fc;
        ctx.beginPath();ctx.arc(fx+sway,fy,2.5,0,Math.PI*2);ctx.fill();
        // Stem
        ctx.fillStyle='#3a7a2f';
        ctx.fillRect(fx+sway-0.5,fy+2,1,4);
      }
      break;
    }
    case T.CROPS: {
      ctx.fillStyle='#8B7355';ctx.fillRect(x,y,s,s);
      // Rows of crops
      const csway=Math.sin(time*1.2+col*0.3)*1;
      ctx.fillStyle='#5a9e4b';
      for(let i=0;i<4;i++) ctx.fillRect(x+4+i*7+csway,y+3,2,s-6);
      // Tops
      ctx.fillStyle='#7aba6a';
      for(let i=0;i<4;i++){
        ctx.fillRect(x+2+i*7+csway,y+3,6,2);
        ctx.fillRect(x+3+i*7+csway,y+1,4,2);
      }
      break;
    }
    case T.DOOR:
      ctx.fillStyle='#7a5a2a';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='#6a4a1a';ctx.fillRect(x+6,y+2,20,s-2);
      ctx.fillStyle='#8a6a3a';ctx.fillRect(x+8,y+4,16,s-4);
      ctx.fillStyle='#ffd700';ctx.beginPath();ctx.arc(x+20,y+s/2,2,0,Math.PI*2);ctx.fill();
      break;
    case T.FENCE:
      ctx.fillStyle='#4a8c3f';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='#8a6a3a';
      ctx.fillRect(x+2,y+8,s-4,3);ctx.fillRect(x+2,y+20,s-4,3);
      ctx.fillRect(x+6,y+3,3,26);ctx.fillRect(x+22,y+3,3,26);
      ctx.fillStyle='rgba(0,0,0,0.1)';
      ctx.fillRect(x+6,y+4,1,24);ctx.fillRect(x+22,y+4,1,24);
      break;
    case T.BUSH:
      ctx.fillStyle='#4a8c3f';ctx.fillRect(x,y,s,s);
      ctx.fillStyle='rgba(0,0,0,0.1)';
      ctx.beginPath();ctx.ellipse(x+16,y+26,10,3,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#2a5a1a';
      ctx.beginPath();ctx.arc(x+16,y+18,10,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#358025';
      ctx.beginPath();ctx.arc(x+12,y+16,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#40903a';
      ctx.beginPath();ctx.arc(x+20,y+15,5,0,Math.PI*2);ctx.fill();
      break;
    default:
      ctx.fillStyle='#0a0a1a';ctx.fillRect(x,y,s,s);
  }
}

// ─── ENTITIES ───
function renderGroundItems() {
  for(let i=0;i<GROUND_ITEMS.length;i++){
    if(groundItemState[i])continue;
    const gi=GROUND_ITEMS[i], item=ITEMS[gi.itemId];
    if(!item)continue;
    const sx=gi.x*TILE_SIZE-camera.x+TILE_SIZE/2;
    const sy=gi.y*TILE_SIZE-camera.y+TILE_SIZE/2+Math.sin(time*2.5+i)*4;
    // Outer glow
    const grad=ctx.createRadialGradient(sx,sy,0,sx,sy,16);
    grad.addColorStop(0,item.color+'50');
    grad.addColorStop(1,'transparent');
    ctx.fillStyle=grad;
    ctx.fillRect(sx-16,sy-16,32,32);
    // Ring
    ctx.strokeStyle=item.color+'60';
    ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(sx,sy,8+Math.sin(time*3+i)*2,0,Math.PI*2);ctx.stroke();
    // Core
    ctx.fillStyle=item.color;
    ctx.beginPath();ctx.arc(sx,sy,5,0,Math.PI*2);ctx.fill();
    // Highlight
    ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.beginPath();ctx.arc(sx-1.5,sy-1.5,1.8,0,Math.PI*2);ctx.fill();
    // Sparkle particles (occasional)
    if(Math.random()<0.02) spawnParticle(gi.x*TILE_SIZE+TILE_SIZE/2,gi.y*TILE_SIZE+TILE_SIZE/2,'item_sparkle');
  }
}

function renderInteractPoints() {
  for(const pt of INTERACT_POINTS) {
    const sx=pt.x*TILE_SIZE-camera.x+TILE_SIZE/2;
    const sy=pt.y*TILE_SIZE-camera.y+TILE_SIZE/2;
    // Pulsing glow
    const pulse=0.5+0.5*Math.sin(time*2);
    const grad=ctx.createRadialGradient(sx,sy,0,sx,sy,18);
    grad.addColorStop(0,`rgba(255,215,0,${0.15+pulse*0.1})`);
    grad.addColorStop(1,'transparent');
    ctx.fillStyle=grad;
    ctx.fillRect(sx-18,sy-18,36,36);
    ctx.font='18px sans-serif';
    ctx.textAlign='center';
    ctx.fillText(pt.icon,sx,sy+6);
  }
  ctx.textAlign='left';
}

function renderNPCs() {
  for(const npc of NPCS) {
    const sx=npc.x*TILE_SIZE-camera.x;
    const sy=npc.y*TILE_SIZE-camera.y;
    const bob=Math.sin(time*2+npc.x)*1;
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath();ctx.ellipse(sx+16,sy+28,8,3,0,0,Math.PI*2);ctx.fill();
    // Body
    ctx.fillStyle=npc.color;
    const bodyY=sy+14+bob;
    // Body shape (rounded)
    ctx.beginPath();
    ctx.moveTo(sx+10,bodyY+14);ctx.lineTo(sx+10,bodyY+4);
    ctx.quadraticCurveTo(sx+10,bodyY,sx+14,bodyY);
    ctx.lineTo(sx+18,bodyY);
    ctx.quadraticCurveTo(sx+22,bodyY,sx+22,bodyY+4);
    ctx.lineTo(sx+22,bodyY+14);ctx.fill();
    // Belt/detail
    ctx.fillStyle='rgba(0,0,0,0.15)';
    ctx.fillRect(sx+10,bodyY+8,12,2);
    // Head
    ctx.fillStyle=npc.headColor;
    ctx.beginPath();ctx.arc(sx+16,sy+9+bob,6,0,Math.PI*2);ctx.fill();
    // Eyes
    ctx.fillStyle='#333';
    const ed=dist(player.x,player.y,npc.x+0.5,npc.y+0.5);
    const ea=Math.atan2(player.y-(npc.y+0.5),player.x-(npc.x+0.5));
    const ex=Math.cos(ea)*1.5, ey=Math.sin(ea)*1;
    ctx.fillRect(sx+13+ex,sy+8+bob+ey,2,2);
    ctx.fillRect(sx+17+ex,sy+8+bob+ey,2,2);
    // Name + quest marker
    if(ed<5) {
      // Name bg
      ctx.font='bold 10px sans-serif';
      const tw=ctx.measureText(npc.name).width+8;
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(sx+16-tw/2,sy-8,tw,14);
      ctx.fillStyle='#fff';
      ctx.textAlign='center';
      ctx.fillText(npc.name,sx+16,sy+2);
      ctx.textAlign='left';
    }
    // Quest exclamation mark for NPCs with quests
    if(hasQuestAvailable(npc.id)) {
      const qy=sy-12+Math.sin(time*4)*3;
      ctx.fillStyle='#ffd700';
      ctx.font='bold 16px sans-serif';
      ctx.textAlign='center';
      ctx.fillText('!',sx+16,qy);
      ctx.textAlign='left';
    }
  }
}

function hasQuestAvailable(npcId) {
  if(npcId==='guru' && !flags.metGuru) return true;
  if(npcId==='vrihi' && !flags.metVrihi) return true;
  if(npcId==='vrihi' && hasItem('khandah') && !hasItem('krmija_dye')) return true;
  if(npcId==='bodhi' && !flags.metBodhi) return true;
  if(npcId==='bodhi' && flags.offeringPlaced && !hasItem('nila_dye')) return true;
  if(npcId==='chitra' && !flags.metChitra) return true;
  if(npcId==='elder' && !flags.metElder) return true;
  if(npcId==='pippali' && !flags.metPippali) return true;
  if(npcId==='makara' && !flags.metMakara) return true;
  return false;
}

function renderPlayer() {
  const sx=Math.floor(player.x*TILE_SIZE-camera.x);
  const sy=Math.floor(player.y*TILE_SIZE-camera.y);
  const bob=player.moving?Math.sin(player.bobPhase)*2:Math.sin(time*2)*0.5;
  const legPhase=player.moving?Math.sin(player.bobPhase*1.2):0;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.25)';
  ctx.beginPath();ctx.ellipse(sx,sy+10,7,3,0,0,Math.PI*2);ctx.fill();
  // Legs
  ctx.fillStyle='#3a4a6a';
  ctx.fillRect(sx-3,sy+5+bob,3,6+legPhase*2);
  ctx.fillRect(sx+1,sy+5+bob,3,6-legPhase*2);
  // Body
  ctx.fillStyle='#4a6fa5';
  ctx.beginPath();
  ctx.moveTo(sx-5,sy+6+bob);ctx.lineTo(sx-5,sy-3+bob);
  ctx.quadraticCurveTo(sx-5,sy-6+bob,sx,sy-6+bob);
  ctx.quadraticCurveTo(sx+5,sy-6+bob,sx+5,sy-3+bob);
  ctx.lineTo(sx+5,sy+6+bob);ctx.fill();
  // Belt
  ctx.fillStyle='#c8a84a';
  ctx.fillRect(sx-5,sy+2+bob,10,2);
  // Head
  ctx.fillStyle='#f0d0a0';
  ctx.beginPath();ctx.arc(sx,sy-10+bob,5.5,0,Math.PI*2);ctx.fill();
  // Hair
  ctx.fillStyle='#4a3020';
  ctx.beginPath();ctx.arc(sx,sy-12+bob,5,Math.PI*0.8,Math.PI*2.2);ctx.fill();
  // Eyes
  const fdx=Math.cos(player.dir),fdy=Math.sin(player.dir);
  ctx.fillStyle='#333';
  ctx.fillRect(sx-2+fdx*2,sy-11+bob+fdy*1,2,2);
  ctx.fillRect(sx+1+fdx*2,sy-11+bob+fdy*1,2,2);
}

// ─── ATMOSPHERE ───
function renderAmbientOverlay() {
  if(ambientHue.a<0.005) return;
  ctx.fillStyle=`rgba(${Math.floor(ambientHue.r)},${Math.floor(ambientHue.g)},${Math.floor(ambientHue.b)},${ambientHue.a.toFixed(3)})`;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function renderVignette() {
  const grad=ctx.createRadialGradient(canvas.width/2,canvas.height/2,200,canvas.width/2,canvas.height/2,520);
  grad.addColorStop(0,'transparent');
  grad.addColorStop(1,'rgba(0,0,0,0.35)');
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function renderScreenFlash() {
  if(screenFlash.alpha<=0)return;
  ctx.fillStyle=screenFlash.color;
  ctx.globalAlpha=screenFlash.alpha*0.4;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.globalAlpha=1;
}

// ─── INTERACT PROMPT ───
function renderInteractPrompt() {
  if(dialogueState)return;
  const nearby=getNearby();
  if(!nearby)return;
  let tx,ty,label;
  if(nearby.type==='npc'){tx=nearby.target.x;ty=nearby.target.y;label=nearby.target.name;}
  else if(nearby.type==='item'){const it=ITEMS[nearby.target.itemId];tx=nearby.target.x;ty=nearby.target.y;label=it?it.name:'Item';}
  else{tx=nearby.target.x;ty=nearby.target.y;label=nearby.target.name;}
  const sx=tx*TILE_SIZE-camera.x+TILE_SIZE/2+cameraShake.x;
  const sy=ty*TILE_SIZE-camera.y-14+Math.sin(time*3)*2+cameraShake.y;
  ctx.textAlign='center';ctx.font='bold 11px sans-serif';
  const tw=ctx.measureText(`[E] ${label}`).width+16;
  // Rounded bg
  const bx=sx-tw/2, by=sy-12;
  ctx.fillStyle='rgba(0,0,0,0.75)';
  roundRect(ctx,bx,by,tw,20,6);ctx.fill();
  ctx.strokeStyle='#ffd700';ctx.lineWidth=1;
  roundRect(ctx,bx,by,tw,20,6);ctx.stroke();
  ctx.fillStyle='#ffd700';
  ctx.fillText(`[E] ${label}`,sx,sy+2);
  ctx.textAlign='left';
}

function roundRect(ctx,x,y,w,h,r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

// ─── HUD ───
function renderHUD() {
  // Top bar gradient
  const hg=ctx.createLinearGradient(0,0,0,32);
  hg.addColorStop(0,'rgba(0,0,0,0.6)');hg.addColorStop(1,'transparent');
  ctx.fillStyle=hg;ctx.fillRect(0,0,canvas.width,32);

  const loc=getLocationName(player.x,player.y);
  ctx.fillStyle='#ffd700';ctx.font='bold 13px sans-serif';
  ctx.fillText(`📍 ${loc}`,12,19);

  // Dye progress — nice circles
  const dx=canvas.width-210;
  ctx.fillStyle='#aaa';ctx.font='11px sans-serif';
  ctx.fillText('Sacred Dyes:',dx,19);
  const dyes=[
    {id:'krmija_dye',c:'#dc143c',x:dx+84},
    {id:'nila_dye',c:'#4040c0',x:dx+104},
    {id:'naranga_dye',c:'#ff8c00',x:dx+124}
  ];
  for(const d of dyes){
    if(hasItem(d.id)){
      ctx.fillStyle=d.c;
      ctx.shadowColor=d.c;ctx.shadowBlur=6;
      ctx.beginPath();ctx.arc(d.x,15,5,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
    } else {
      ctx.strokeStyle='#555';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(d.x,15,5,0,Math.PI*2);ctx.stroke();
    }
  }
  ctx.fillStyle='#888';ctx.font='11px sans-serif';
  ctx.fillText(`📖 ${discoveredWords.size}/${Object.keys(WORDS).length}`,dx+148,19);

  // Bottom bar
  const bg=ctx.createLinearGradient(0,canvas.height-24,0,canvas.height);
  bg.addColorStop(0,'transparent');bg.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=bg;ctx.fillRect(0,canvas.height-24,canvas.width,24);
  ctx.fillStyle='#666';ctx.font='11px sans-serif';
  ctx.fillText('WASD: Move  ·  E: Interact  ·  I: Inventory  ·  L: Lexicon',12,canvas.height-7);

  // Quest panel
  if(flags.metGuru&&!flags.gameComplete) {
    const qw=220,qh=86,qx=canvas.width-qw-6,qy=34;
    ctx.fillStyle='rgba(10,10,30,0.75)';
    roundRect(ctx,qx,qy,qw,qh,6);ctx.fill();
    ctx.strokeStyle='rgba(255,215,0,0.3)';ctx.lineWidth=1;
    roundRect(ctx,qx,qy,qw,qh,6);ctx.stroke();
    ctx.fillStyle='#ffd700';ctx.font='bold 11px sans-serif';
    ctx.fillText('⚔ Active Quests',qx+10,qy+16);
    ctx.font='10px sans-serif';
    let qyy=qy+32;
    const quests=[
      {done:hasItem('krmija_dye'),name:'Kṛmija: Help Farmer Vrīhi',c:'#dc143c'},
      {done:hasItem('nila_dye'),name:'Nīla: Offering for Monk Bodhi',c:'#6a6aff'},
      {done:hasItem('naranga_dye'),name:'Nāraṅga: Explore the jungle',c:'#ff8c00'}
    ];
    for(const q of quests){
      ctx.fillStyle=q.done?'#6a6':'rgba(255,255,255,0.5)';
      ctx.fillText(q.done?`✓ ${q.name.split(':')[0]} dye obtained`:`○ ${q.name}`,qx+10,qyy);
      if(!q.done){ctx.fillStyle=q.c+'60';ctx.fillRect(qx+4,qyy-8,3,10);}
      qyy+=16;
    }
  }
}

function getLocationName(px,py) {
  if(px>30&&px<52&&py>24&&py<38) return 'Siṃhapura Village';
  if(px>4&&px<28&&py>22&&py<42) return "Vrīhi's Farm";
  if(px>30&&px<54&&py>4&&py<20) return 'Bodhi Monastery';
  if(px>54&&px<76&&py>20&&py<50) return 'The Jaṅgala (Jungle)';
  if(py>42&&px>26&&px<56) return 'Taḍāga Lake';
  if(py<7&&px>34&&px<48) return 'Mount Sumeru';
  return 'Siṃhapura Rājya';
}

// ─── MINIMAP ───
function renderMinimap() {
  if(!minimap||!gameStarted) return;
  const mw=100,mh=75,mx=canvas.width-mw-8,my=canvas.height-mh-28;
  // Bg
  ctx.fillStyle='rgba(0,0,0,0.5)';
  roundRect(ctx,mx-3,my-3,mw+6,mh+6,4);ctx.fill();
  ctx.strokeStyle='rgba(255,215,0,0.2)';ctx.lineWidth=1;
  roundRect(ctx,mx-3,my-3,mw+6,mh+6,4);ctx.stroke();
  // Map image
  ctx.drawImage(minimap,0,0,MAP_W,MAP_H,mx,my,mw,mh);
  // Player dot
  const px=mx+player.x/MAP_W*mw, py=my+player.y/MAP_H*mh;
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4a6fa5';
  ctx.beginPath();ctx.arc(px,py,1.5,0,Math.PI*2);ctx.fill();
  // NPC dots
  for(const npc of NPCS) {
    const nx=mx+npc.x/MAP_W*mw, ny=my+npc.y/MAP_H*mh;
    ctx.fillStyle=npc.color;
    ctx.fillRect(nx-1,ny-1,2,2);
  }
}

// ─── DIALOGUE BOX ───
function renderDialogueBox() {
  if(dialogueSlide<=0.01)return;
  const ds=dialogueState;
  const slide=easeOutCubic(dialogueSlide);
  const bh=180;
  const by=canvas.height-bh*slide-6;
  const bx=24,bw=canvas.width-48;

  // Backdrop dim
  if(ds){ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(0,0,canvas.width,canvas.height);}

  // Box gradient bg
  const bgGrad=ctx.createLinearGradient(bx,by,bx,by+bh);
  bgGrad.addColorStop(0,'rgba(16,14,38,0.96)');
  bgGrad.addColorStop(1,'rgba(10,10,24,0.98)');
  ctx.fillStyle=bgGrad;
  roundRect(ctx,bx,by,bw,bh,12);ctx.fill();
  // Border
  ctx.strokeStyle='#ffd700';ctx.lineWidth=2;
  roundRect(ctx,bx,by,bw,bh,12);ctx.stroke();
  // Inner line
  ctx.strokeStyle='rgba(255,215,0,0.1)';ctx.lineWidth=1;
  roundRect(ctx,bx+4,by+4,bw-8,bh-8,10);ctx.stroke();
  // Corner accents
  ctx.fillStyle='#ffd700';
  ctx.fillRect(bx+8,by+8,14,2);ctx.fillRect(bx+8,by+8,2,14);
  ctx.fillRect(bx+bw-22,by+8,14,2);ctx.fillRect(bx+bw-10,by+8,2,14);
  ctx.fillRect(bx+8,by+bh-10,14,2);ctx.fillRect(bx+8,by+bh-22,2,14);
  ctx.fillRect(bx+bw-22,by+bh-10,14,2);ctx.fillRect(bx+bw-10,by+bh-22,2,14);

  if(!ds)return;

  // Speaker name
  let textY=by+38;
  if(ds.speaker){
    ctx.fillStyle=ds.speakerColor||'#ffd700';
    ctx.font='bold 14px sans-serif';
    ctx.fillText(ds.speaker,bx+24,by+24);
    const nw=ctx.measureText(ds.speaker).width;
    ctx.fillStyle='rgba(255,215,0,0.15)';
    ctx.fillRect(bx+24,by+29,nw,1);
    textY=by+48;
  }

  // Rich text with typing
  const visText=richSubstr(ds.fullText,Math.floor(ds.charIndex));
  ctx.font='17px serif';
  drawRichText(ctx,visText,bx+24,textY,bw-48,24);

  // Page indicator
  ctx.fillStyle='#555';ctx.font='10px sans-serif';ctx.textAlign='right';
  ctx.fillText(`${ds.index+1}/${ds.lines.length}`,bx+bw-16,by+bh-14);ctx.textAlign='left';
  // Continue prompt
  if(ds.charIndex>=ds.visLen){
    const a=0.5+0.5*Math.sin(time*4);
    ctx.fillStyle=`rgba(255,215,0,${a})`;ctx.font='12px sans-serif';
    ctx.fillText('▼ E to continue',bx+24,by+bh-14);
  }
}

function wrapText(ctx,text,x,y,maxW,lineH) {
  const words=text.split(' ');let line='',ly=y;
  for(const w of words){
    const test=line+w+' ';
    if(ctx.measureText(test).width>maxW&&line.length>0){ctx.fillText(line.trim(),x,ly);line=w+' ';ly+=lineH;}
    else line=test;
  }
  ctx.fillText(line.trim(),x,ly);
}

function easeOutCubic(t){return 1-Math.pow(1-t,3);}

// ─── RICH TEXT SYSTEM ───
// Markup: {g}gold{/}, {c}cyan{/}, {r}red{/}, {b}blue{/}, {o}orange{/}, {w}white{/}, {d}dim{/}, {p}purple{/}
// Use \n for explicit line breaks
const RICH={g:'#ffd700',c:'#4fc3f7',r:'#dc143c',b:'#6a8aff',o:'#ff8c00',w:'#ffffff',d:'#888',p:'#c084fc',n:'#6aba6a',y:'#e8d44d'};
function stripTags(t){return t.replace(/\{[a-z]?\/?}/g,'');}
function richLen(t){return stripTags(t).length;}
function richSubstr(text,n){
  let r='',c=0,i=0;
  while(i<text.length){
    if(text[i]==='{'){const e=text.indexOf('}',i);if(e!==-1){r+=text.substring(i,e+1);i=e+1;continue;}}
    if(c>=n)break; r+=text[i];c++;i++;
  }
  return r;
}
function drawRichText(ctx,raw,x,y,mw,lh,dc){
  dc=dc||'#e8e6e3';
  const segs=[];let col=dc;
  const re=/\{([a-z])\}|\{\/\}|(\n)|([^{\n]+)/g;let m;
  while((m=re.exec(raw))!==null){
    if(m[1])col=RICH[m[1]]||dc;
    else if(m[0]==='{/}')col=dc;
    else if(m[2])segs.push({t:'\n',c:col});
    else if(m[3])segs.push({t:m[3],c:col});
  }
  let cx=x,cy=y;
  for(const s of segs){
    if(s.t==='\n'){cx=x;cy+=lh;continue;}
    ctx.fillStyle=s.c;
    const parts=s.t.split(/( )/);
    for(const p of parts){
      if(!p)continue;
      const w=ctx.measureText(p).width;
      if(cx+w>x+mw&&cx>x&&p.trim()){cx=x;cy+=lh;}
      ctx.fillText(p,cx,cy);
      cx+=w;
    }
  }
}

// ─── WORD POPUP ───
function renderWordPopup() {
  if(!wordPopup) return;
  const w=wordPopup.word;
  const slide=easeOutCubic(Math.min(1,wordPopup.slide));
  const fadeOut=Math.min(1,wordPopup.timer*2);
  const alpha=slide*fadeOut;
  const pw=440,ph=80;
  const px=(canvas.width-pw)/2, py=34-20*(1-slide);

  ctx.globalAlpha=alpha;
  // Glow behind
  const grad=ctx.createLinearGradient(px,py,px+pw,py);
  grad.addColorStop(0,'transparent');grad.addColorStop(0.1,'rgba(255,215,0,0.1)');
  grad.addColorStop(0.9,'rgba(255,215,0,0.1)');grad.addColorStop(1,'transparent');
  ctx.fillStyle=grad;ctx.fillRect(px-10,py-2,pw+20,ph+4);
  // Box
  ctx.fillStyle='rgba(12,12,30,0.94)';
  roundRect(ctx,px,py,pw,ph,8);ctx.fill();
  ctx.strokeStyle='#ffd700';ctx.lineWidth=1.5;
  roundRect(ctx,px,py,pw,ph,8);ctx.stroke();
  // Content
  ctx.fillStyle='#ffd700';ctx.font='bold 14px sans-serif';
  ctx.fillText(`✦ Word Discovered: ${w.s}`,px+14,py+22);
  ctx.fillStyle='#4fc3f7';ctx.font='12px sans-serif';
  ctx.fillText(`→ English: "${w.en}"${w.zh?'  ·  Chinese: '+w.zh:''}`,px+14,py+42);
  ctx.fillStyle='#aaa';ctx.font='11px sans-serif';
  const note=w.note.length>68?w.note.substring(0,68)+'…':w.note;
  ctx.fillText(note,px+14,py+60);
  ctx.globalAlpha=1;
}

// ─── INVENTORY PANEL ───
function renderInventoryPanel() {
  const pw=420,ph=360,px=(canvas.width-pw)/2,py=(canvas.height-ph)/2;
  // Backdrop
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,canvas.width,canvas.height);
  // Panel
  ctx.fillStyle='rgba(12,12,30,0.96)';roundRect(ctx,px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle='#ffd700';ctx.lineWidth=2;roundRect(ctx,px,py,pw,ph,10);ctx.stroke();
  // Header
  ctx.fillStyle='rgba(255,215,0,0.1)';ctx.fillRect(px+1,py+1,pw-2,36);
  ctx.fillStyle='#ffd700';ctx.font='bold 16px sans-serif';
  ctx.fillText('🎒 Inventory',px+16,py+25);
  ctx.fillStyle='#666';ctx.font='11px sans-serif';
  ctx.fillText('[I] close',px+pw-70,py+25);
  if(inventory.length===0){
    ctx.fillStyle='#555';ctx.font='italic 14px serif';
    ctx.fillText('Your pack is empty. Explore and collect items!',px+20,py+80);
    return;
  }
  let iy=py+50;
  for(const itemId of inventory){
    const item=ITEMS[itemId];if(!item)continue;
    // Item row bg
    ctx.fillStyle='rgba(255,255,255,0.03)';
    roundRect(ctx,px+10,iy-6,pw-20,32,4);ctx.fill();
    // Color dot
    ctx.fillStyle=item.color;
    ctx.beginPath();ctx.arc(px+28,iy+8,6,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(px+28,iy+8,7,0,Math.PI*2);ctx.stroke();
    // Text
    ctx.fillStyle='#e8e6e3';ctx.font='bold 13px sans-serif';
    ctx.fillText(item.name,px+44,iy+6);
    ctx.fillStyle='#888';ctx.font='11px sans-serif';
    ctx.fillText(item.desc,px+44,iy+20);
    iy+=36;
  }
}

// ─── LEXICON PANEL ───
function renderLexiconPanel() {
  const pw=620,ph=460,px=(canvas.width-pw)/2,py=(canvas.height-ph)/2;
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='rgba(12,12,30,0.96)';roundRect(ctx,px,py,pw,ph,10);ctx.fill();
  ctx.strokeStyle='#ffd700';ctx.lineWidth=2;roundRect(ctx,px,py,pw,ph,10);ctx.stroke();
  // Header
  ctx.fillStyle='rgba(255,215,0,0.1)';ctx.fillRect(px+1,py+1,pw-2,36);
  ctx.fillStyle='#ffd700';ctx.font='bold 16px sans-serif';
  ctx.fillText(`📖 Lexicon (${discoveredWords.size}/${Object.keys(WORDS).length})`,px+16,py+25);
  ctx.fillStyle='#666';ctx.font='11px sans-serif';
  ctx.fillText('[L] close',px+pw-70,py+25);
  if(discoveredWords.size===0){
    ctx.fillStyle='#555';ctx.font='italic 14px serif';
    ctx.fillText('No words discovered yet. Talk to people and explore!',px+20,py+80);
    return;
  }
  let iy=py+52;const cols=2,colW=(pw-40)/cols;let col=0;
  for(const wId of discoveredWords){
    const w=WORDS[wId];if(!w)continue;
    const cx=px+20+col*colW;
    // Row bg
    ctx.fillStyle='rgba(255,255,255,0.02)';
    ctx.fillRect(cx-4,iy-12,colW-8,30);
    ctx.fillStyle='#ffd700';ctx.font='bold 12px sans-serif';
    ctx.fillText(w.s,cx,iy);
    ctx.fillStyle='#4fc3f7';ctx.font='11px sans-serif';
    ctx.fillText(`→ ${w.en}${w.zh?' · '+w.zh:''}`,cx,iy+14);
    col++;if(col>=cols){col=0;iy+=34;}
  }
}

// ─── START ───
window.addEventListener('load',init);
