// ============================================================
// MANTRA: THE RESONANT WORLD — 2D RPG Engine & Game Logic
// ============================================================

// ─── STATE ───
let canvas, ctx;
let map = [];
let player = { x: SPAWN_ROOM.player.x, y: SPAWN_ROOM.player.y, dir:0, speed:4.5, moving:false, stepTimer:0, bobPhase:0 };
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
let showEtymologyBook = false;
let etymologyBookScroll = 0;
let discoveredEtymology = new Set();
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
let glitchState = { timer: 8, active: false, duration: 0 }; // world-glitch effect
let touch = { active: false, worldX: 0, worldY: 0, tapX: 0, tapY: 0, dx: 0, dy: 0 };
let mainMap = null;
let mapW = MAP_W, mapH = MAP_H;
let introActive = false;
let quizState = null;
let introMsg = null;

const SPAWN_ZOOM = 3.4;
let renderInWorldSpace = false;

const intro = {
  motherDone: false,
  doorNorthOpen: false,
  brotherDone: false,
  sisterDone: false,
  fatherVisible: false,
  fatherDone: false,
  exitOpen: false,
  bonuses: { quilt: false, matrix: false, mammal: false },
  brother: { x: 5, y: 9, sliding: false, t: 0 },
  sister: { x: 14, y: 9, sliding: false, t: 0 },
};

const INTRO_QUIZ = {
  mother: {
    q: "Which Sanskrit word means 'mother'?",
    opts: ['mātṛ-', 'pitṛ-', 'bhrātar-'],
    ok: ['mātṛ-'],
    etym: "English 'mother' and Sanskrit 'mātṛ' share the exact same 5,000-year-old root.",
    word: 'matri',
  },
  father: {
    q: "Which Sanskrit word means 'father'?",
    opts: ['pitṛ-', 'mātṛ-', 'bhrātar-'],
    ok: ['pitṛ-'],
    etym: "This word is nearly identical across every Indo-European language from Iceland to India.",
    word: 'pitri',
  },
};

const INTRO_ETYM = {
  brother: "bhrātar- → From *bhrā- 'to carry', as brothers carry each other's burdens.",
  sister: 'svasar- → The word \'sister\' has changed less in 5,000 years than most words change in 100. Cognate across nearly all Indo-European languages. Sister derives directly from this ancient word for female sibling.',
};

const INTRO_SAVE_KEY = 'mantra_intro_complete';
const SPAWN_SAVE_KEY = 'mantra_spawn_mother_done';

const MOTHER_QUIZ = {
  q: "Which Sanskrit word means 'mother'?",
  opts: ['mātṛ-', 'pitṛ-', 'bhrātar-'],
  ok: ['mātṛ-'],
  etym: "English 'mother' and Sanskrit 'mātṛ' share the exact same 5,000-year-old root.",
  wrongHint: "Listen to how the word sounds… does it echo something you already know?",
  word: 'matri',
};

const SPAWN_TUTORIAL = {
  welcome:
    "You wake in cold stone.\n\n" +
    "Hong Kong, 2225 — two centuries after the last teacher left the Sanskrit school beneath Siṃhapura. " +
    "A program called MANTRA slept in the ruins… until something woke it. And you.\n\n" +
    "The world outside is vast. But first — this chamber.",
  controls:
    "You remember how to move.\n\n" +
    "WASD or touch — walk the room.\n" +
    "E or tap — speak, examine, or act on any statue or inscription.\n\n" +
    "When you're ready, find the sealed door to the south.",
  doorFail:
    "The stone door will not budge. Runes older than the city trace its frame.\n\n" +
    "In the corner, a Mother of stone watches in silence. She has heard every word spoken here for five thousand years. Press E at the statue — she may know the password.",
  hallGuide1: 'Press E at any statue to speak, examine, or push it back.',
  hallGuide2: 'The Brother and Sister stand off the grooves in the floor. Push them along the tracks to the niches on the left wall.',
  hallGuide3: 'When the whole family stands together again, the Father will emerge from the stone.',
  hallGuide4: 'Paintings hang on the hall walls — press E to read their mātṛ- root stories. Press B for your Etymology Book.',
  motherEarly:
    "The statue waits, patient as stone. Try the sealed door first — you'll understand why you're still here.",
};

let spawnTutorial = { step: 'done', doorTried: false };

let spawnFamily = {
  brotherDone: false,
  sisterDone: false,
  fatherVisible: false,
  fatherDone: false,
  brother: { x: 0, y: 0, sliding: false, pathIdx: 0, segT: 0, path: null },
  sister: { x: 0, y: 0, sliding: false, pathIdx: 0, segT: 0, path: null },
};

let spawnCamera = { mode: 'player' };
const STATUE_TRACK_SPEED = 1.15;

const FATHER_QUIZ = {
  q: INTRO_QUIZ.father.q,
  opts: INTRO_QUIZ.father.opts,
  ok: INTRO_QUIZ.father.ok,
  etym: INTRO_QUIZ.father.etym,
  word: INTRO_QUIZ.father.word,
};

function loadIntroComplete() {
  try { return localStorage.getItem(INTRO_SAVE_KEY) === '1'; } catch { return false; }
}

function saveIntroComplete() {
  try { localStorage.setItem(INTRO_SAVE_KEY, '1'); } catch { /* file:// or private mode */ }
}

function loadSpawnComplete() {
  try { return localStorage.getItem(SPAWN_SAVE_KEY) === '1'; } catch { return false; }
}

function saveSpawnComplete() {
  try { localStorage.setItem(SPAWN_SAVE_KEY, '1'); } catch { /* file:// or private mode */ }
}

function spawnRoomInteriorBounds() {
  const R = SPAWN_ROOM;
  return { x: R.x + 1, y: R.y + 1, w: R.iw, h: R.ih };
}

const PLAYER_HW = 0.3;
const PLAYER_HH = 0.35;

function playerInSpawnRoom() {
  const b = spawnRoomInteriorBounds();
  return player.x - PLAYER_HW >= b.x && player.x + PLAYER_HW < b.x + b.w &&
         player.y - PLAYER_HH >= b.y && player.y + PLAYER_HH < b.y + b.h;
}

function playerInFamilyHall() {
  const b = familyHallInteriorBounds();
  return player.x - PLAYER_HW >= b.x && player.x + PLAYER_HW < b.x + b.w &&
         player.y - PLAYER_HH >= b.y && player.y + PLAYER_HH < b.y + b.h;
}

function playerInSpawnTutorial() {
  return playerInSpawnRoom() || playerInFamilyHall();
}

function isSpawnChamberZoom() {
  return !introActive && !flags.spawnTutorialDone;
}

function isInSpawnTutorial() {
  return !introActive && !flags.spawnTutorialDone;
}

function getWorldZoom() {
  return isSpawnChamberZoom() ? SPAWN_ZOOM : 1;
}

function snapCameraToTarget() {
  if (!canvas) return;
  const z = getWorldZoom();
  const vw = canvas.width / z, vh = canvas.height / z;
  const focus = getSpawnCameraTile();
  const px = focus.x * TILE_SIZE;
  const py = focus.y * TILE_SIZE;
  camera.x = Math.max(0, Math.min(mapW * TILE_SIZE - vw, px - vw / 2));
  camera.y = Math.max(0, Math.min(mapH * TILE_SIZE - vh, py - vh / 2));
}

function shouldPlayIntro(urlParams) {
  if (urlParams.has('skipIntro')) return false;
  // Full open world by default; add ?intro to play the Family Shrine first.
  return urlParams.has('intro');
}

function beginIntroMap() {
  map = generateIntroMap();
  introActive = true;
  mapW = INTRO_MAP_W;
  mapH = INTRO_MAP_H;
  player.x = INTRO_SPAWN.x;
  player.y = INTRO_SPAWN.y;
  player.dir = -Math.PI / 2;
  minimap = null;
}

function beginMainWorld() {
  map = mainMap;
  introActive = false;
  mapW = MAP_W;
  mapH = MAP_H;
  applySpawnChambers(map, {
    motherDoorOpen: !!flags.spawnMotherDone,
    hallDoorOpen: !!flags.spawnTutorialDone,
  });
  player.x = SPAWN_ROOM.player.x;
  player.y = SPAWN_ROOM.player.y;
  player.dir = Math.PI / 2;
  initSpawnFamilyState();
  clampPlayerToSpawnRoom();
  snapCameraToTarget();
  buildMinimap();
  if (!flags.spawnTutorialDone) resetSpawnTutorial();
  else spawnTutorial = { step: 'done', doorTried: true };
}

function initSpawnFamilyState() {
  const B = FAMILY_HALL.brother, S = FAMILY_HALL.sister;
  if (flags.spawnTutorialDone) {
    spawnFamily.brotherDone = true;
    spawnFamily.sisterDone = true;
    spawnFamily.fatherVisible = true;
    spawnFamily.fatherDone = true;
    spawnFamily.brother = { x: B.targetX, y: B.targetY, sliding: false, pathIdx: 0, segT: 0, path: null };
    spawnFamily.sister = { x: S.targetX, y: S.targetY, sliding: false, pathIdx: 0, segT: 0, path: null };
  } else {
    spawnFamily.brotherDone = false;
    spawnFamily.sisterDone = false;
    spawnFamily.fatherVisible = false;
    spawnFamily.fatherDone = false;
    spawnFamily.brother = { x: B.homeX, y: B.homeY, sliding: false, pathIdx: 0, segT: 0, path: null };
    spawnFamily.sister = { x: S.homeX, y: S.homeY, sliding: false, pathIdx: 0, segT: 0, path: null };
  }
  spawnCamera = { mode: 'player' };
}

function isStatueSliding() {
  return spawnFamily.brother.sliding || spawnFamily.sister.sliding;
}

function getSpawnCameraTile() {
  if (spawnCamera.mode === 'statue') return { x: spawnCamera.x, y: spawnCamera.y };
  return { x: player.x, y: player.y };
}

function updateGameCamera(dt) {
  const z = getWorldZoom();
  const vw = canvas.width / z, vh = canvas.height / z;
  const focus = getSpawnCameraTile();
  const px = focus.x * TILE_SIZE;
  const py = focus.y * TILE_SIZE;
  const tx = px - vw / 2;
  const ty = py - vh / 2;
  const lerp = isSpawnChamberZoom() ? (spawnCamera.mode === 'statue' ? 0.18 : 0.14) : 0.1;
  camera.x += (tx - camera.x) * lerp;
  camera.y += (ty - camera.y) * lerp;
  camera.x = Math.max(0, Math.min(mapW * TILE_SIZE - vw, camera.x));
  camera.y = Math.max(0, Math.min(mapH * TILE_SIZE - vh, camera.y));
}

function resetSpawnTutorial() {
  spawnTutorial = { step: 'pending', doorTried: false };
}

function startSpawnTutorial() {
  if (flags.spawnTutorialDone || spawnTutorial.step !== 'pending') return;
  spawnTutorial.step = 'welcome';
  showIntroMessage(SPAWN_TUTORIAL.welcome, () => {
    showIntroMessage(SPAWN_TUTORIAL.controls, () => { spawnTutorial.step = 'door'; });
  });
}

function getSpawnTutorialHint() {
  if (flags.spawnTutorialDone || spawnTutorial.step === 'done') return null;
  switch (spawnTutorial.step) {
    case 'welcome':
    case 'controls':
      return 'Read the inscription · Press E to continue';
    case 'door':
      return 'Sealed door to the south · walk close and press E';
    case 'mother':
      return 'Mother statue · press E to speak';
    case 'hall':
      if (!spawnFamily.brotherDone || !spawnFamily.sisterDone) {
        return 'Push statues along the floor grooves · press E';
      }
      if (!spawnFamily.fatherDone) return 'Father statue · press E to speak';
      return 'Paintings on the walls · press B for Etymology Book';
    case 'guru':
      return 'Find Guru Vidya at the village crossroads · press E to speak';
    default:
      return 'Tutorial Chamber';
  }
}

function dismissIntroMessage() {
  if (!introMsg) return;
  if (introMsg.charIndex < introMsg.visLen) {
    introMsg.charIndex = introMsg.visLen;
    return;
  }
  const fn = introMsg.onDismiss;
  introMsg = null;
  if (spawnCamera.mode === 'statue') {
    spawnCamera = { mode: 'player' };
    snapCameraToTarget();
  }
  if (fn) fn();
}

function updateIntroMessage(dt) {
  if (!introMsg || introMsg.charIndex >= introMsg.visLen) return;
  const stripped = introMsg.text;
  const ci = Math.max(0, Math.floor(introMsg.charIndex) - 1);
  const ch = stripped[ci] || '';
  let spd = 0.42;
  if ('.!?'.includes(ch)) spd = 0.21;
  else if (',;:—–…'.includes(ch)) spd = 0.294;
  else if (ch === '\n') spd = 0.252;
  else if (ch === ' ') spd = 0.504;
  introMsg.charIndex += spd;
}

function clampPlayerToSpawnRoom() {
  if (flags.spawnTutorialDone || introActive) return;
  const b = flags.spawnMotherDone ? spawnTutorialBounds() : spawnRoomInteriorBounds();
  player.x = Math.max(b.x + PLAYER_HW, Math.min(b.x + b.w - PLAYER_HW, player.x));
  player.y = Math.max(b.y + PLAYER_HH, Math.min(b.y + b.h - PLAYER_HH, player.y));
}

// ─── INIT ───
function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', e => {
    keys[e.code]=true;
    // Keep arrow keys / space from scrolling the page while playing.
    if (!e.metaKey && !e.ctrlKey && gameStarted) e.preventDefault();
  });
  window.addEventListener('keyup', e => { keys[e.code]=false; });
  setupTouchControls();
  const urlParams = new URLSearchParams(location.search);
  mainMap = generateMap();
  groundItemState = GROUND_ITEMS.map(()=>false);
  flags.introComplete = !shouldPlayIntro(urlParams);
  // Always play spawn tutorial on load unless ?skipSpawn
  flags.spawnMotherDone = false;
  flags.spawnTutorialDone = urlParams.has('skipSpawn');
  if (flags.spawnTutorialDone) flags.spawnMotherDone = true;
  if (flags.introComplete) beginMainWorld();
  else beginIntroMap();
  // Seed title particles
  for(let i=0;i<80;i++) particles.push(makeTitleParticle());
  if (urlParams.has('play')) {
    gameStarted = true;
    titleFade = 1;
    particles = [];
    snapCameraToTarget();
  }
  gameLoop(performance.now());
}

function setupTouchControls() {
  const toWorld = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const sx = (clientX - rect.left) * (canvas.width / rect.width);
    const sy = (clientY - rect.top) * (canvas.height / rect.height);
    return { x: sx + camera.x, y: sy + camera.y };
  };

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    touch.tapX = t.clientX;
    touch.tapY = t.clientY;
    touch.active = true;
    const w = toWorld(t.clientX, t.clientY);
    touch.worldX = w.x;
    touch.worldY = w.y;
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const w = toWorld(t.clientX, t.clientY);
    touch.worldX = w.x;
    touch.worldY = w.y;
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    const moved = Math.hypot(t.clientX - touch.tapX, t.clientY - touch.tapY);
    touch.active = false;
    if (moved < 18 && gameStarted && !dialogueState && !showInventory && !showLexicon && !showEtymologyBook && !quizState) {
      if (introMsg) dismissIntroMessage();
      else tryInteract();
    }
  }, { passive: false });
}

function applyTouchMovement() {
  touch.dx = 0;
  touch.dy = 0;
  if (!touch.active || !gameStarted || dialogueState || showInventory || showLexicon || showEtymologyBook || quizState || introMsg) return;
  const px = player.x * TILE_SIZE + TILE_SIZE / 2;
  const py = player.y * TILE_SIZE + TILE_SIZE / 2;
  const dx = touch.worldX - px;
  const dy = touch.worldY - py;
  const len = Math.hypot(dx, dy);
  if (len < 12) return;
  touch.dx = dx / len;
  touch.dy = dy / len;
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
      snapCameraToTarget();
    }
    if (justPressed('Escape') && introActive) skipIntroToWorld();
    return;
  }

  // Title fade + spawn tutorial kickoff
  if(titleFade < 1) titleFade = Math.min(1, titleFade + dt * 1.5);
  if (gameStarted && titleFade >= 1 && spawnTutorial.step === 'pending' && !introMsg && !quizState) {
    startSpawnTutorial();
  }

  // Screen flash decay
  if(screenFlash.alpha > 0) screenFlash.alpha = Math.max(0, screenFlash.alpha - dt * 2);

  // Camera shake decay
  if(cameraShake.intensity > 0) {
    cameraShake.intensity *= 0.9;
    cameraShake.x = (Math.random()-0.5) * cameraShake.intensity;
    cameraShake.y = (Math.random()-0.5) * cameraShake.intensity;
    if(cameraShake.intensity < 0.1) { cameraShake.intensity=0; cameraShake.x=0; cameraShake.y=0; }
  }

  // World glitch effect — more frequent as words are discovered + lore found
  const loreCount = ['seenWell','seenSlab','seenRuins','seenShore','seenWall'].filter(f=>flags[f]).length;
  if(gameStarted && !glitchState.active) {
    glitchState.timer -= dt;
    if(glitchState.timer <= 0) {
      glitchState.active = true;
      glitchState.duration = 0.05 + Math.random() * 0.15 + loreCount * 0.02;
      glitchState.timer = 6 + Math.random() * 12 - Math.min(discoveredWords.size * 0.4, 5) - loreCount * 0.8;
    }
  }
  if(glitchState.active) {
    glitchState.duration -= dt;
    if(glitchState.duration <= 0) glitchState.active = false;
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

  if (quizState || introMsg) {
    updateGameCamera(dt);
    if (!flags.spawnTutorialDone) updateSpawnFamilyStatues(dt);
    if (quizState) updateQuizKeys();
    if (introMsg) updateIntroMessage(dt);
    if (introMsg && (justPressed('KeyE') || justPressed('Enter') || justPressed('Space'))) dismissIntroMessage();
    updateParticles(dt);
    return;
  }

  if (introActive) {
    if (justPressed('Escape')) { skipIntroToWorld(); updateParticles(dt); return; }
    updateIntro(dt);
    updateParticles(dt);
    return;
  }

  // Panels
  if(justPressed('KeyI')||justPressed('Tab')) { showInventory=!showInventory; showLexicon=false; showEtymologyBook=false; }
  if(justPressed('KeyL')) { showLexicon=!showLexicon; showInventory=false; showEtymologyBook=false; }
  if(justPressed('KeyB')) { showEtymologyBook=!showEtymologyBook; showInventory=false; showLexicon=false; etymologyBookScroll=0; }
  if(showInventory||showLexicon||showEtymologyBook) {
    if(justPressed('Escape')) { showInventory=false; showLexicon=false; showEtymologyBook=false; }
    if(showEtymologyBook && discoveredEtymology.size > 0) {
      if(justPressed('ArrowUp')||justPressed('KeyW')) etymologyBookScroll=Math.max(0, etymologyBookScroll-1);
      if(justPressed('ArrowDown')||justPressed('KeyS')) etymologyBookScroll++;
    }
    updateParticles(dt);
    return;
  }

  // Movement
  applyTouchMovement();
  let dx=0,dy=0;
  if(touch.active && (touch.dx || touch.dy)) {
    dx = touch.dx;
    dy = touch.dy;
  } else {
    if(isDown('KeyW')||isDown('ArrowUp'))    dy=-1;
    if(isDown('KeyS')||isDown('ArrowDown'))  dy=1;
    if(isDown('KeyA')||isDown('ArrowLeft'))  dx=-1;
    if(isDown('KeyD')||isDown('ArrowRight')) dx=1;
  }
  if(dx!==0||dy!==0) {
    if (!isStatueSliding()) {
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
    }
  } else {
    player.moving=false;
    player.bobPhase+=dt*2;
  }

  if (!flags.spawnTutorialDone) {
    updateSpawnFamilyStatues(dt);
    clampPlayerToSpawnRoom();
  }

  // Interact
  if(justPressed('KeyE')) tryInteract();

  // Camera
  updateGameCamera(dt);

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
  const a = introActive ? 'Family Shrine' : getLocationName(player.x,player.y);
  if(a!==currentArea) currentArea=a;
  // Smooth tint lerp
  let tr=0,tg=0,tb=0,ta=0;
  if(currentArea.includes('Chamber'))        { tr=8;tg=6;tb=12;ta=0.14; }
  else if(currentArea.includes('Shrine'))         { tr=15;tg=10;tb=5;ta=0.1; }
  else if(currentArea.includes('Jaṅgala'))        { tr=0;tg=20;tb=0;ta=0.12; }
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
  return { x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-0.5)*20, vy:-Math.random()*15-5,
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
  if(tx<0||ty<0||tx>=mapW||ty>=mapH) return true;
  if (introActive && introStatueBlocks(tx, ty)) return true;
  if (isInSpawnTutorial() && spawnFamilyStatueBlocks(tx, ty)) return true;
  return SOLID.has(map[ty][tx]);
}
function canMoveTo(x,y) {
  const hw = PLAYER_HW, hh = PLAYER_HH;
  if (isInSpawnTutorial()) {
    const b = flags.spawnMotherDone ? spawnTutorialBounds() : spawnRoomInteriorBounds();
    if (x - hw < b.x || x + hw >= b.x + b.w || y - hh < b.y || y + hh >= b.y + b.h) return false;
  }
  return !isSolid(Math.floor(x-hw),Math.floor(y-hh))&&!isSolid(Math.floor(x+hw),Math.floor(y-hh))&&
         !isSolid(Math.floor(x-hw),Math.floor(y+hh))&&!isSolid(Math.floor(x+hw),Math.floor(y+hh));
}

// ─── INTERACTION ───
function tryInteract() {
  if (introActive) { tryIntroInteract(); return; }
  const nearby=getNearby();
  if(!nearby) return;
  if (nearby.type === 'mother') { trySpawnMotherInteract(); return; }
  if (nearby.type === 'spawnDoor') {
    if (flags.spawnMotherDone) return;
    if (!spawnTutorial.doorTried) {
      spawnTutorial.doorTried = true;
      spawnTutorial.step = 'mother';
      showIntroMessage(SPAWN_TUTORIAL.doorFail);
    } else {
      showIntroMessage('The stone door will not budge. The silent figure in the room may know why…');
    }
    return;
  }
  if (nearby.type === 'hallBrother') { trySpawnFamilyStatueInteract('brother'); return; }
  if (nearby.type === 'hallSister') { trySpawnFamilyStatueInteract('sister'); return; }
  if (nearby.type === 'father') { trySpawnFatherInteract(); return; }
  if (nearby.type === 'hallDoor') {
    if (!flags.spawnTutorialDone) {
      showIntroMessage('The outer seal holds fast. The Father statue may know the way out.');
    }
    return;
  }
  if (nearby.type === 'hallPainting') { tryHallPaintingInteract(nearby.target.id); return; }
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
  if (introActive) return getIntroNearby();
  const spawnNear = getSpawnNearby();
  if (spawnNear) return spawnNear;
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
  // Typing at brisk reading speed (~13.5 chars/sec) with minimal pauses
  if(ds.charIndex<ds.visLen) {
    const stripped=stripTags(ds.fullText);
    const ci=Math.max(0,Math.floor(ds.charIndex)-1);
    const ch=stripped[ci]||'';
    let spd=0.225; // ~13.5 chars/sec base (1.5x faster)
    if('.!?'.includes(ch)) spd=0.1125; // Brief pause after sentences
    else if(',;:—–…'.includes(ch)) spd=0.1575; // Very short pause after commas
    else if(ch==='\n') spd=0.135; // Brief pause at line breaks
    else if(ch===' ') spd=0.27; // Faster through spaces
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
  discoverEtymology(wordId);
  const popup={word:w,id:wordId,timer:5,slide:0};
  if(wordPopup) wordPopupQueue.push(popup);
  else wordPopup=popup;
  // Discovery feedback — flash and subtle shake
  screenFlash = { alpha: 0.25, color: '#ffd700' };
  cameraShake.intensity = Math.max(cameraShake.intensity, 3);
}

function discoverEtymology(loreId) {
  if (!loreId || !ETYMOLOGY_LORE[loreId] || discoveredEtymology.has(loreId)) return;
  discoveredEtymology.add(loreId);
}

// ─── MINIMAP ───
function buildMinimap() {
  const mc=document.createElement('canvas');
  mc.width=MAP_W; mc.height=MAP_H;
  const mx=mc.getContext('2d');
  const c={[T.GRASS]:'#4a8c3f',[T.GRASS2]:'#3f7a35',[T.PATH]:'#c4a76c',[T.WATER]:'#3a80c4',[T.TREE]:'#2a6a1a',
    [T.WALL]:'#7a7068',[T.FLOOR]:'#c8b896',[T.SAND]:'#e0d48c',[T.MOUNTAIN]:'#5a5a5a',[T.BRIDGE]:'#9a7b5b',
    [T.FLOWERS]:'#e88aac',[T.TALL_GRASS]:'#3a7a2f',[T.CROPS]:'#8B7355',[T.DOOR]:'#8a6a3a',[T.FENCE]:'#7a5a2a',[T.BUSH]:'#2a5a1a',
    [T.FLOOR_TRACK_H]:'#b8a880',[T.FLOOR_TRACK_V]:'#b8a880',[T.FLOOR_TRACK_X]:'#b8a880'};
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

  ctx.save();
  ctx.translate(-cameraShake.x, -cameraShake.y);
  if (isSpawnChamberZoom()) {
    renderSpawnChamberZoomed();
  } else {
    renderMap();
    if (introActive) {
      renderIntroScene();
    } else {
      renderGroundItems();
      renderInteractPoints();
      renderNPCs();
      renderMotherStatueEntity();
      renderSpawnFamilyScene();
      if (!flags.spawnTutorialDone) renderSpawnLockedDoorWorld();
    }
    renderPlayer();
  }
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
  renderIntroMessage();
  renderQuizOverlay();
  if(showInventory) renderInventoryPanel();
  if(showLexicon) renderLexiconPanel();
  if(showEtymologyBook) renderEtymologyBookPanel();
  renderScreenFlash();
  if (!introActive) renderGlitch();

  // Title fade
  if(titleFade<1) {
    ctx.fillStyle=`rgba(10,10,26,${1-titleFade})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}

// ─── TITLE SCREEN ───
function renderTitle() {
  // Animated background gradient
  const gcx=canvas.width/2, gcy=canvas.height/2;
  const grad = ctx.createRadialGradient(gcx,gcy,50,gcx,gcy,500);
  grad.addColorStop(0,'#1a1428');
  grad.addColorStop(0.5,'#0f0f1a');
  grad.addColorStop(1,'#050510');
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Particles
  renderParticles();

  // Decorative lines
  ctx.strokeStyle='rgba(255,215,0,0.08)';
  ctx.lineWidth=1;
  for(let i=0;i<5;i++) {
    const y=100+i*60;
    ctx.beginPath();ctx.moveTo(60,y);ctx.lineTo(canvas.width-60,y);ctx.stroke();
  }

  // Mandala-like circle
  ctx.strokeStyle='rgba(255,215,0,0.12)';
  ctx.lineWidth=1;
  const mcx=canvas.width/2, mcy=canvas.height*0.42;
  for(let i=0;i<3;i++) {
    ctx.beginPath();ctx.arc(mcx,mcy,80+i*30,0,Math.PI*2);ctx.stroke();
  }
  // Rotating dots on circles
  for(let i=0;i<12;i++) {
    const a = time*0.3+i*Math.PI/6;
    const r = 80+Math.sin(time+i)*10;
    ctx.fillStyle='rgba(255,215,0,0.3)';
    ctx.beginPath();ctx.arc(mcx+Math.cos(a)*r, mcy+Math.sin(a)*r, 2, 0, Math.PI*2);ctx.fill();
  }

  ctx.textAlign='center';
  const cx=canvas.width/2, cy=canvas.height/2;
  // Sanskrit
  ctx.fillStyle='#ffd700';
  ctx.font=`52px ${FONT_FALLBACK}`; // Use fallback for Sanskrit characters
  ctx.fillText('मन्त्र',cx,cy-166);
  // Glow on title
  ctx.shadowColor='#ffd700';ctx.shadowBlur=40;
  ctx.fillStyle='#e8e6e3';
  ctx.font=`${FONT_FANTASY_BOLD} 60px ${FONT_FANTASY}`;
  ctx.fillText('MANTRA',cx,cy-120);
  ctx.shadowBlur=0;
  ctx.font=`18px ${FONT_FANTASY}`;
  ctx.fillStyle='#9e9e9e';
  ctx.fillText('T H E   R E S O N A N T   W O R L D',cx,cy-90);
  // Tagline
  ctx.font=`${FONT_FANTASY_ITALIC} 15px ${FONT_FANTASY}`;
  ctx.fillStyle='#b8960f';
  ctx.fillText('"In 2025, a machine learned the oldest language. It learned too well."',cx,cy-48);
  // Controls
  ctx.font=`13px ${FONT_FANTASY}`;
  ctx.fillStyle='#555';
  ctx.fillText('WASD or touch to move  ·  E or tap to interact  ·  I inventory  ·  L lexicon  ·  B etymology book',cx,cy-12);
  ctx.fillText('?play skips title',cx,cy+4);
  // Pulsing prompt
  const a=0.5+0.5*Math.sin(time*3);
  ctx.globalAlpha=a;
  ctx.fillStyle='#ffd700';
  ctx.font=`${FONT_FANTASY_BOLD} 20px ${FONT_FANTASY}`;
  ctx.fillText('Press E or ENTER to begin',cx,cy+24);
  ctx.globalAlpha=1;
  ctx.font=`11px ${FONT_FANTASY}`;
  ctx.fillStyle='#444';
  ctx.fillText('Hong Kong, 2225 — A forgotten school. A 200-year-old program.',cx,cy+60);
  ctx.textAlign='left';
}

// ─── MAP ───
function getCameraViewSize() {
  const z = getWorldZoom();
  return { w: canvas.width / z, h: canvas.height / z };
}

function renderSpawnChamberZoomed() {
  const z = SPAWN_ZOOM;
  const vw = canvas.width / z, vh = canvas.height / z;
  const wx = camera.x + vw / 2;
  const wy = camera.y + vh / 2;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(z, z);
  ctx.translate(-wx, -wy);

  renderInWorldSpace = true;
  renderMapTilesWorld(wx, wy, z);
  renderMotherStatueEntity();
  renderSpawnFamilyScene();
  renderSpawnLockedDoorWorld();
  renderPlayer();
  renderInWorldSpace = false;
  ctx.restore();

  renderSpawnChamberVignette(z, wx, wy);
}

function renderMapTilesWorld(focusX, focusY, z) {
  const viewW = canvas.width / z;
  const viewH = canvas.height / z;
  const margin = 2;
  const sc = Math.floor((focusX - viewW / 2) / TILE_SIZE) - margin;
  const sr = Math.floor((focusY - viewH / 2) / TILE_SIZE) - margin;
  const ec = Math.ceil((focusX + viewW / 2) / TILE_SIZE) + margin;
  const er = Math.ceil((focusY + viewH / 2) / TILE_SIZE) + margin;
  for (let row = sr; row <= er; row++) {
    for (let col = sc; col <= ec; col++) {
      if (col < 0 || col >= mapW || row < 0 || row >= mapH) continue;
      const tile = map[row]?.[col];
      if (tile === undefined) continue;
      drawTile(tile, col * TILE_SIZE, row * TILE_SIZE, col, row);
    }
  }
}

function renderSpawnChamberVignette(z, focusX, focusY) {
  const pad = 12;
  const toScreen = (px, py) => ({
    x: (px - focusX) * z + canvas.width / 2,
    y: (py - focusY) * z + canvas.height / 2,
  });
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const addRoom = (R, owFn) => {
    const { w: ow, h: oh } = owFn();
    minX = Math.min(minX, R.x * TILE_SIZE - pad);
    minY = Math.min(minY, R.y * TILE_SIZE - pad);
    maxX = Math.max(maxX, (R.x + ow) * TILE_SIZE + pad);
    maxY = Math.max(maxY, (R.y + oh) * TILE_SIZE + pad);
  };
  addRoom(SPAWN_ROOM, spawnRoomOuterSize);
  if (flags.spawnMotherDone) addRoom(FAMILY_HALL, familyHallOuterSize);
  const tl = toScreen(minX, minY);
  const br = toScreen(maxX, maxY);
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, canvas.width, Math.max(0, tl.y));
  ctx.fillRect(0, br.y, canvas.width, Math.max(0, canvas.height - br.y));
  ctx.fillRect(0, tl.y, Math.max(0, tl.x), br.y - tl.y);
  ctx.fillRect(br.x, tl.y, Math.max(0, canvas.width - br.x), br.y - tl.y);
}

function renderMotherStatueEntity() {
  const m = SPAWN_ROOM.mother;
  drawShrineStatue('mother', m.x, m.y, flags.spawnMotherDone, m.name);
}

function drawShrineStatue(kind, tx, ty, lit, label) {
  const camX = renderInWorldSpace ? 0 : camera.x;
  const camY = renderInWorldSpace ? 0 : camera.y;
  const cx = tx * TILE_SIZE - camX;
  const cy = ty * TILE_SIZE - camY;
  const bob = Math.sin(time * 1.5 + tx * 0.7) * 0.4;
  const stone = lit ? '#8a8580' : '#6a6860';
  const headStone = lit ? '#a8a8a8' : '#8a8880';
  const gold = lit ? '#D4AF37' : '#6a5a30';

  if (!lit && kind === 'mother') {
    const pulse = 0.12 + 0.08 * Math.sin(time * 2);
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 28);
    grad.addColorStop(0, `rgba(255, 215, 0, ${pulse + 0.1})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - 28, cy - 28, 56, 56);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = stone;
  const bodyY = cy - 4 + bob;
  ctx.fillRect(cx - 8, bodyY, 16, 18);
  ctx.fillRect(cx - 10, bodyY + 14, 20, 6);

  ctx.fillStyle = headStone;
  ctx.beginPath();
  ctx.arc(cx, cy - 6 + bob, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = gold;
  if (kind === 'father') {
    ctx.fillRect(cx + 8, cy - 18 + bob, 3, 16);
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 20 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'brother') {
    ctx.fillRect(cx + 6, cy - 8 + bob, 8, 2);
  } else if (kind === 'sister') {
    ctx.fillRect(cx - 5, cy - 12 + bob, 10, 3);
  } else {
    ctx.fillRect(cx - 2, cy - 14 + bob, 4, 8);
  }

  ctx.fillStyle = '#333';
  const lookX = spawnCamera.mode === 'statue' && spawnCamera.x === tx ? player.x : player.x;
  const lookY = spawnCamera.mode === 'statue' && spawnCamera.y === ty ? player.y : player.y;
  const ea = Math.atan2(lookY - ty, lookX - tx);
  ctx.fillRect(cx - 3 + Math.cos(ea) * 1.5, cy - 7 + bob + Math.sin(ea), 2, 2);
  ctx.fillRect(cx + 1 + Math.cos(ea) * 1.5, cy - 7 + bob + Math.sin(ea), 2, 2);

  const devLabels = { mother: 'मातृ', father: 'पितृ', brother: 'भ्रातृ', sister: 'स्वसृ' };
  ctx.strokeStyle = gold;
  ctx.lineWidth = lit ? 2 : 1;
  ctx.strokeRect(cx - 12, cy - 16 + bob, 24, 34);

  if (label && dist(player.x, player.y, tx, ty) < 2.5) {
    ctx.font = `600 10px ${FONT_FALLBACK}`;
    const tw = ctx.measureText(label).width + 10;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(cx - tw / 2, cy - 28, tw, 14);
    ctx.fillStyle = lit ? '#ffd700' : '#ccc';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy - 18);
    ctx.textAlign = 'left';
  }

  ctx.fillStyle = lit ? '#ffd700' : '#888';
  ctx.font = `14px ${FONT_FALLBACK}`;
  ctx.textAlign = 'center';
  ctx.fillText(devLabels[kind] || '', cx, cy + 26 + bob);
  ctx.textAlign = 'left';
}

function renderSpawnLockedDoorWorld() {
  const camX = renderInWorldSpace ? 0 : camera.x;
  const camY = renderInWorldSpace ? 0 : camera.y;
  const pulse = 0.25 + 0.2 * Math.sin(time * 2.5);
  if (!flags.spawnMotherDone) {
    const d = SPAWN_ROOM.door;
    const sx = d.x * TILE_SIZE - camX;
    const sy = d.y * TILE_SIZE - camY;
    ctx.fillStyle = `rgba(120, 40, 40, ${pulse})`;
    ctx.fillRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    ctx.strokeStyle = '#884444';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 5, sy + 5, TILE_SIZE - 10, TILE_SIZE - 10);
  }
  if (flags.spawnMotherDone && !flags.spawnTutorialDone) {
    const d = FAMILY_HALL.southDoor;
    const sx = d.x * TILE_SIZE - camX;
    const sy = d.y * TILE_SIZE - camY;
    ctx.fillStyle = `rgba(80, 50, 120, ${pulse})`;
    ctx.fillRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    ctx.strokeStyle = '#664488';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 5, sy + 5, TILE_SIZE - 10, TILE_SIZE - 10);
  }
}

function renderMap() {
  const view = getCameraViewSize();
  const sc = Math.floor(camera.x / TILE_SIZE) - 1;
  const sr = Math.floor(camera.y / TILE_SIZE) - 1;
  const ec = Math.ceil((camera.x + view.w) / TILE_SIZE) + 1;
  const er = Math.ceil((camera.y + view.h) / TILE_SIZE) + 1;
  for (let row = sr; row <= er; row++) for (let col = sc; col <= ec; col++) {
    if(col<0||col>=mapW||row<0||row>=mapH) continue;
    const tile=map[row]?.[col];
    if(tile===undefined) continue;
    const sx=Math.floor(col*TILE_SIZE-camera.x), sy=Math.floor(row*TILE_SIZE-camera.y);
    drawTile(tile,sx,sy,col,row);
  }
}

function drawStoneFloor(x, y, s, col, row) {
  ctx.fillStyle='#c8b896';ctx.fillRect(x,y,s,s);
  ctx.strokeStyle='rgba(0,0,0,0.06)';ctx.lineWidth=1;
  ctx.strokeRect(x+1,y+1,s-2,s-2);
  ctx.fillStyle='rgba(160,130,80,0.15)';
  ctx.fillRect(x+4,y+8,s-8,1);
  ctx.fillRect(x+6,y+20,s-12,1);
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
      drawStoneFloor(x, y, s, col, row);
      break;
    case T.FLOOR_TRACK_H:
      drawStoneFloor(x, y, s, col, row);
      ctx.fillStyle='#2a2520';
      ctx.fillRect(x + s / 2 - 6, y + s / 2 - 1, 12, 2);
      ctx.fillStyle='rgba(0,0,0,0.12)';
      ctx.fillRect(x + s / 2 - 6, y + s / 2 + 1, 12, 1);
      break;
    case T.FLOOR_TRACK_V:
      drawStoneFloor(x, y, s, col, row);
      ctx.fillStyle='#2a2520';
      ctx.fillRect(x + s / 2 - 1, y + s / 2 - 6, 2, 12);
      ctx.fillStyle='rgba(0,0,0,0.12)';
      ctx.fillRect(x + s / 2 + 1, y + s / 2 - 6, 1, 12);
      break;
    case T.FLOOR_TRACK_X:
      drawStoneFloor(x, y, s, col, row);
      ctx.fillStyle='#2a2520';
      ctx.fillRect(x + s / 2 - 6, y + s / 2 - 1, 12, 2);
      ctx.fillRect(x + s / 2 - 1, y + s / 2 - 6, 2, 12);
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
  ctx.font=`18px ${FONT_FANTASY}`;
  ctx.textAlign='center';
  ctx.fillText(pt.icon,sx,sy+8);
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
      // Use fallback font if name contains Sanskrit characters
      if(hasSanskritChars(npc.name)) {
        ctx.font=`600 10px ${FONT_FALLBACK}`;
      } else {
        ctx.font=`${FONT_FANTASY_BOLD} 10px ${FONT_FANTASY}`;
      }
      const tw=ctx.measureText(npc.name).width+8;
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(sx+16-tw/2,sy-8,tw,14);
      ctx.fillStyle='#fff';
      if(hasSanskritChars(npc.name)) {
        ctx.font=`600 10px ${FONT_FALLBACK}`;
      } else {
        ctx.font=`${FONT_FANTASY_BOLD} 10px ${FONT_FANTASY}`;
      }
      ctx.textAlign='center';
      ctx.fillText(npc.name,sx+16,sy+3);
      ctx.textAlign='left';
    }
    // Quest exclamation mark for NPCs with quests
    if(hasQuestAvailable(npc.id)) {
      const qy=sy-12+Math.sin(time*4)*3;
      ctx.fillStyle='#ffd700';
      ctx.font=`${FONT_FANTASY_BOLD} 16px ${FONT_FANTASY}`;
      ctx.textAlign='center';
      ctx.fillText('?',sx+16,qy);
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
  const camX = renderInWorldSpace ? 0 : camera.x;
  const camY = renderInWorldSpace ? 0 : camera.y;
  const sx=Math.floor(player.x*TILE_SIZE-camX);
  const sy=Math.floor(player.y*TILE_SIZE-camY);
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
  const grad=ctx.createRadialGradient(canvas.width/2,canvas.height/2,120,canvas.width/2,canvas.height/2,420);
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

function renderGlitch() {
  if(!glitchState.active || !gameStarted) return;
  // Scanline displacement
  const numLines = 1 + Math.floor(Math.random() * 3);
  for(let i = 0; i < numLines; i++) {
    const y = Math.floor(Math.random() * canvas.height);
    const h = 1 + Math.floor(Math.random() * 4);
    const shift = Math.floor((Math.random() - 0.5) * 16);
    ctx.drawImage(canvas, 0, y, canvas.width, h, shift, y, canvas.width, h);
  }
  // Color aberration
  if(Math.random() < 0.4) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(3, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(-3, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  // Brief noise strip
  if(Math.random() < 0.25) {
    const ny = Math.floor(Math.random() * canvas.height);
    const nh = 2 + Math.floor(Math.random() * 6);
    ctx.fillStyle = `rgba(255,255,255,${(0.03 + Math.random() * 0.05).toFixed(3)})`;
    ctx.fillRect(0, ny, canvas.width, nh);
  }
}

// ─── INTERACT PROMPT ───
function renderInteractPrompt() {
  if(dialogueState||quizState||introMsg)return;
  const nearby=getNearby();
  if(!nearby)return;
  let tx,ty,label;
  if(nearby.type==='npc'){tx=nearby.target.x;ty=nearby.target.y;label=nearby.target.name;}
  else if(nearby.type==='item'){const it=ITEMS[nearby.target.itemId];tx=nearby.target.x;ty=nearby.target.y;label=it?it.name:'Item';}
  else if(nearby.type==='mother'){
    if (introActive) { tx=INTRO_LAYOUT.mother.x; ty=INTRO_LAYOUT.mother.y; label='Mother statue'; }
    else { tx=SPAWN_ROOM.mother.x; ty=SPAWN_ROOM.mother.y; label=SPAWN_ROOM.mother.name; }
  }
  else if(nearby.type==='spawnDoor'){tx=SPAWN_ROOM.door.x+0.5;ty=SPAWN_ROOM.door.y+0.5;label='Sealed door';}
  else if(nearby.type==='hallBrother'){tx=spawnFamily.brother.x;ty=spawnFamily.brother.y;label='Brother statue';}
  else if(nearby.type==='hallSister'){tx=spawnFamily.sister.x;ty=spawnFamily.sister.y;label='Sister statue';}
  else if(nearby.type==='father'){tx=FAMILY_HALL.father.x;ty=FAMILY_HALL.father.y;label=FAMILY_HALL.father.name;}
  else if(nearby.type==='hallDoor'){tx=FAMILY_HALL.southDoor.x+0.5;ty=FAMILY_HALL.southDoor.y+0.5;label='Sealed exit';}
  else if(nearby.type==='father'){tx=INTRO_LAYOUT.father.x;ty=INTRO_LAYOUT.father.y;label='Father statue';}
  else if(nearby.type==='brother'){tx=nearby.target.x;ty=nearby.target.y;label='Brother statue';}
  else if(nearby.type==='sister'){tx=nearby.target.x;ty=nearby.target.y;label='Sister statue';}
  else if(nearby.type==='hallPainting'){tx=nearby.target.ix;ty=nearby.target.iy;label=nearby.target.name;}
  else if(nearby.type==='bonus'){const ids={quilt:'Maternal quilt',matrix:'Matrix painting',mammal:'Cow painting'};tx=INTRO_LAYOUT[nearby.target].x;ty=INTRO_LAYOUT[nearby.target].y;label=ids[nearby.target]||'Painting';}
  else if(nearby.type==='exit'){tx=INTRO_LAYOUT.exit.x;ty=INTRO_LAYOUT.exit.y;label='Path outside';}
  else{tx=nearby.target.x;ty=nearby.target.y;label=nearby.target.name;}
  const centerCoord = (nearby.type === 'mother' && !introActive) || nearby.type === 'spawnDoor'
    || nearby.type === 'hallBrother' || nearby.type === 'hallSister' || nearby.type === 'father'
    || nearby.type === 'hallDoor' || nearby.type === 'hallPainting';
  const wx = centerCoord ? tx * TILE_SIZE : (tx + 0.5) * TILE_SIZE;
  const wy = centerCoord ? ty * TILE_SIZE : (ty + 0.5) * TILE_SIZE;
  let sx, sy;
  if (isSpawnChamberZoom()) {
    const z = SPAWN_ZOOM;
    const vw = canvas.width / z, vh = canvas.height / z;
    const fx = camera.x + vw / 2;
    const fy = camera.y + vh / 2;
    sx = (wx - fx) * z + canvas.width / 2 + cameraShake.x;
    sy = (wy - fy) * z + canvas.height / 2 - 14 + Math.sin(time * 3) * 2 + cameraShake.y;
  } else {
    sx = wx - camera.x + cameraShake.x;
    sy = wy - camera.y - 14 + Math.sin(time * 3) * 2 + cameraShake.y;
  }
  ctx.textAlign='center';
  // Use fallback font if label contains Sanskrit characters
  if(hasSanskritChars(label)) {
    ctx.font=`600 11px ${FONT_FALLBACK}`;
  } else {
    ctx.font=`${FONT_FANTASY_BOLD} 11px ${FONT_FANTASY}`;
  }
  const tw=ctx.measureText(`[E] ${label}`).width+12;
  // Rounded bg
  const bx=sx-tw/2, by=sy-10;
  ctx.fillStyle='rgba(0,0,0,0.75)';
  roundRect(ctx,bx,by,tw,18,5);ctx.fill();
  ctx.strokeStyle='#ffd700';ctx.lineWidth=1;
  roundRect(ctx,bx,by,tw,18,5);ctx.stroke();
  ctx.fillStyle='#ffd700';
  ctx.fillText(`[E] ${label}`,sx,sy+3);
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

  if (introActive) {
    ctx.fillStyle = '#ffd700';
    ctx.font = `600 12px ${FONT_FALLBACK}`;
    let hint = 'Approach the Mother statue · Press E';
    if (intro.motherDone && !intro.brotherDone) hint = 'Push Brother & Sister statues · Press E';
    else if (intro.brotherDone && intro.sisterDone && !intro.fatherDone) hint = 'Speak with the Father statue · Press E';
    else if (intro.exitOpen) hint = 'Walk north into the light';
    ctx.fillText(hint, 12, 19);
    ctx.fillStyle = '#888';
    ctx.font = `11px ${FONT_FANTASY}`;
    ctx.fillText('Examine quilts & paintings for bonus lore', 12, 34);
    return;
  }

  if (!flags.spawnTutorialDone && playerInSpawnTutorial()) {
    const hint = getSpawnTutorialHint();
    ctx.fillStyle = '#ffd700';
    ctx.font = `600 12px ${FONT_FALLBACK}`;
    ctx.fillText('Tutorial — Mother\'s Chamber', 12, 19);
    ctx.fillStyle = '#888';
    ctx.font = `11px ${FONT_FANTASY}`;
    ctx.fillText(hint || 'Explore the chamber', 12, 34);
    return;
  }

  const loc=getLocationName(player.x,player.y);
  ctx.fillStyle='#ffd700';
  // Use fallback font if location name contains Sanskrit characters
  if(hasSanskritChars(loc)) {
    ctx.font=`600 13px ${FONT_FALLBACK}`;
  } else {
    ctx.font=`${FONT_FANTASY_BOLD} 13px ${FONT_FANTASY}`;
  }
  ctx.fillText(`📍 ${loc}`,12,19);

  // Dye progress — nice circles
  const dx=canvas.width-210;
  ctx.fillStyle='#aaa';ctx.font=`11px ${FONT_FANTASY}`;
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
  ctx.fillStyle='#888';ctx.font=`11px ${FONT_FANTASY}`;
  ctx.fillText(`📖 ${discoveredWords.size}/${Object.keys(WORDS).length}`,dx+148,19);
  ctx.fillStyle='#888';ctx.font='11px sans-serif';
  ctx.fillText(`📜 ${discoveredEtymology.size}`,dx+228,19);

  // Bottom bar
  const bg=ctx.createLinearGradient(0,canvas.height-24,0,canvas.height);
  bg.addColorStop(0,'transparent');bg.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=bg;ctx.fillRect(0,canvas.height-24,canvas.width,24);
  ctx.fillStyle='#666';ctx.font=`11px ${FONT_FANTASY}`;
  ctx.fillText('WASD / touch: Move  ·  E / tap: Interact  ·  I: Inventory  ·  L: Lexicon  ·  B: Etymology Book',12,canvas.height-7);

  // Quest panel
  if(flags.metGuru&&!flags.gameComplete) {
    const qw=180,qh=68,qx=canvas.width-qw-6,qy=26;
    ctx.fillStyle='rgba(10,10,30,0.75)';
    roundRect(ctx,qx,qy,qw,qh,4);ctx.fill();
    ctx.strokeStyle='rgba(255,215,0,0.3)';ctx.lineWidth=1;
    roundRect(ctx,qx,qy,qw,qh,4);ctx.stroke();
    ctx.fillStyle='#ffd700';ctx.font=`${FONT_FANTASY_BOLD} 11px ${FONT_FANTASY}`;
    ctx.fillText('⚔ Active Quests',qx+8,qy+14);
    let qyy=qy+26;
    const quests=[
      {done:hasItem('krmija_dye'),name:'Kṛmija: Help Farmer Vrīhi',c:'#dc143c'},
      {done:hasItem('nila_dye'),name:'Nīla: Offering for Monk Bodhi',c:'#6a6aff'},
      {done:hasItem('naranga_dye'),name:'Nāraṅga: Explore the jungle',c:'#ff8c00'}
    ];
    for(const q of quests){
      ctx.fillStyle=q.done?'#6a6':'rgba(255,255,255,0.5)';
      const questText = q.done?`✓ ${q.name.split(':')[0]} dye obtained`:`○ ${q.name}`;
      // Use fallback font if quest text contains Sanskrit characters
      if(hasSanskritChars(questText)) {
        ctx.font=`10px ${FONT_FALLBACK}`;
      } else {
        ctx.font=`10px ${FONT_FANTASY}`;
      }
      ctx.fillText(questText,qx+10,qyy);
      if(!q.done){ctx.fillStyle=q.c+'60';ctx.fillRect(qx+4,qyy-8,3,10);}
      qyy+=16;
    }
  }
}

function getLocationName(px,py) {
  if (introActive) {
    if (!intro.doorNorthOpen) return 'Family Shrine — Mother\'s Chamber';
    if (!intro.exitOpen) return 'Family Shrine — Hall of Kin';
    return 'Family Shrine — Threshold';
  }
  if (!flags.spawnTutorialDone && playerInSpawnTutorial()) return "Tutorial — Family Shrine";
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
  if(!minimap||!gameStarted||introActive||isSpawnChamberZoom()) return;
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
  roundRect(ctx,bx,by,bw,bh,8);ctx.fill();
  // Border
  ctx.strokeStyle='#ffd700';ctx.lineWidth=2;
  roundRect(ctx,bx,by,bw,bh,8);ctx.stroke();
  // Inner line
  ctx.strokeStyle='rgba(255,215,0,0.1)';ctx.lineWidth=1;
  roundRect(ctx,bx+4,by+4,bw-8,bh-8,6);ctx.stroke();
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
    ctx.font=`${FONT_FANTASY_BOLD} 15px ${FONT_FANTASY}`;
    ctx.fillText(ds.speaker,bx+24,by+24);
    const nw=ctx.measureText(ds.speaker).width;
    ctx.fillStyle='rgba(255,215,0,0.15)';
    ctx.fillRect(bx+24,by+29,nw,1);
    textY=by+48;
  }

  // Rich text with typing
  const visText=richSubstr(ds.fullText,Math.floor(ds.charIndex));
  ctx.font=`18px ${FONT_FANTASY}`;
  drawRichText(ctx,visText,bx+24,textY,bw-48,26);

  // Page indicator
  ctx.fillStyle='#555';ctx.font=`10px ${FONT_FANTASY}`;ctx.textAlign='right';
  ctx.fillText(`${ds.index+1}/${ds.lines.length}`,bx+bw-16,by+bh-12);ctx.textAlign='left';
  // Continue prompt
  if(ds.charIndex>=ds.visLen){
    const a=0.5+0.5*Math.sin(time*4);
    ctx.fillStyle=`rgba(255,215,0,${a})`;ctx.font=`12px ${FONT_FANTASY}`;
    ctx.fillText('▼ E to continue',bx+24,by+bh-12);
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

// ─── FONT CONSTANTS ───
const FONT_FANTASY = '"Optimus Princeps", "MedievalSharp", "Uncial Antiqua", "Cinzel", serif';
const FONT_FANTASY_BOLD = '600'; // Semibold weight
const FONT_FANTASY_ITALIC = 'italic';
const FONT_FALLBACK = '"Noto Sans Devanagari", serif'; // Sanskrit & IAST diacritics

// ─── HELPER: Detect Sanskrit diacritics ───
function hasSanskritChars(text) {
  // Check for common Sanskrit diacritics: ā ī ū ṛ ṝ ḷ ḹ ē ō ṃ ḥ ś ṣ ṭ ḍ ṇ
  return /[āīūṛṝḷḹēōṃḥśṣṭḍṇṅ]/u.test(text);
}

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
  const baseFont = ctx.font; // Save current font
  for(const s of segs){
    if(s.t==='\n'){cx=x;cy+=lh;continue;}
    ctx.fillStyle=s.c;
    const parts=s.t.split(/( )/);
    for(const p of parts){
      if(!p)continue;
      // Use fallback font if text contains Sanskrit characters
      if(hasSanskritChars(p)) {
        const sizeMatch = baseFont.match(/(\d+)px/);
        const size = sizeMatch ? sizeMatch[1] : '18';
        const weightMatch = baseFont.match(/(\d+|bold|normal)/);
        const weight = weightMatch ? weightMatch[1] : 'normal';
        ctx.font = `${weight} ${size}px ${FONT_FALLBACK}`;
      } else {
        ctx.font = baseFont; // Restore original font
      }
      const w=ctx.measureText(p).width;
      if(cx+w>x+mw&&cx>x&&p.trim()){cx=x;cy+=lh;}
      ctx.fillText(p,cx,cy);
      cx+=w;
    }
  }
  ctx.font = baseFont; // Restore font at end
}

// ─── WORD POPUP ───
function renderWordPopup() {
  if(!wordPopup) return;
  const w=wordPopup.word;
  const slide=easeOutCubic(Math.min(1,wordPopup.slide));
  const fadeOut=Math.min(1,wordPopup.timer*2);
  const alpha=slide*fadeOut;

  const pw=440,ph=80;
  const px=canvas.width/2-pw/2;
  const py=32+10*(1-slide);

  ctx.globalAlpha=alpha;
  // Glow behind
  const grad=ctx.createLinearGradient(px,py,px+pw,py);
  grad.addColorStop(0,'transparent');grad.addColorStop(0.1,'rgba(255,215,0,0.1)');
  grad.addColorStop(0.9,'rgba(255,215,0,0.1)');grad.addColorStop(1,'transparent');
  ctx.fillStyle=grad;ctx.fillRect(px-10,py-2,pw+20,ph+4);
  // Box
  ctx.fillStyle='rgba(12,12,30,0.94)';
  roundRect(ctx,px,py,pw,ph,6);ctx.fill();
  ctx.strokeStyle='#ffd700';ctx.lineWidth=1;
  roundRect(ctx,px,py,pw,ph,6);ctx.stroke();
  // Content
  ctx.fillStyle='#ffd700';
  // Sanskrit word uses fallback font
  if(hasSanskritChars(w.s)) {
    ctx.font=`600 14px ${FONT_FALLBACK}`;
  } else {
    ctx.font=`${FONT_FANTASY_BOLD} 14px ${FONT_FANTASY}`;
  }
  ctx.fillText(`✦ Word Discovered: ${w.s}`,px+14,py+22);
  ctx.fillStyle='#4fc3f7';ctx.font=`12px ${FONT_FANTASY}`;
  ctx.fillText(`→ English: "${w.en}"${w.zh?'  ·  Chinese: '+w.zh:''}`,px+14,py+42);
  ctx.fillStyle='#aaa';ctx.font=`11px ${FONT_FANTASY}`;
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
  ctx.fillStyle='rgba(12,12,30,0.96)';roundRect(ctx,px,py,pw,ph,6);ctx.fill();
  ctx.strokeStyle='#ffd700';ctx.lineWidth=1;roundRect(ctx,px,py,pw,ph,6);ctx.stroke();
  // Header
  ctx.fillStyle='rgba(255,215,0,0.1)';ctx.fillRect(px+1,py+1,pw-2,36);
  ctx.fillStyle='#ffd700';ctx.font=`${FONT_FANTASY_BOLD} 16px ${FONT_FANTASY}`;
  ctx.fillText('🎒 Inventory',px+16,py+25);
  ctx.fillStyle='#666';ctx.font=`11px ${FONT_FANTASY}`;
  ctx.fillText('[I] close',px+pw-70,py+25);
  if(inventory.length===0){
    ctx.fillStyle='#555';ctx.font=`${FONT_FANTASY_ITALIC} 14px ${FONT_FANTASY}`;
    ctx.fillText('Your pack is empty. Explore and collect items.',px+20,py+80);
    return;
  }
  let iy=py+50;
  for(const itemId of inventory){
    const item=ITEMS[itemId];if(!item)continue;
    // Item row bg
    ctx.fillStyle='rgba(255,255,255,0.03)';
    roundRect(ctx,px+8,iy-4,pw-16,28,3);ctx.fill();
    // Color dot
    ctx.fillStyle=item.color;
    ctx.beginPath();ctx.arc(px+20,iy+8,4,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(px+20,iy+8,5,0,Math.PI*2);ctx.stroke();
    // Text
    ctx.fillStyle='#e8e6e3';
    // Use fallback font if item name contains Sanskrit characters
    if(hasSanskritChars(item.name)) {
      ctx.font=`600 13px ${FONT_FALLBACK}`;
    } else {
      ctx.font=`${FONT_FANTASY_BOLD} 13px ${FONT_FANTASY}`;
    }
    ctx.fillText(item.name,px+32,iy+6);
    ctx.fillStyle='#888';
    // Use fallback font if item description contains Sanskrit characters
    if(hasSanskritChars(item.desc)) {
      ctx.font=`11px ${FONT_FALLBACK}`;
    } else {
      ctx.font=`11px ${FONT_FANTASY}`;
    }
    ctx.fillText(item.desc,px+32,iy+20);
    iy+=36;
  }
}

// ─── LEXICON PANEL ───
function renderLexiconPanel() {
  const pw=620,ph=460,px=(canvas.width-pw)/2,py=(canvas.height-ph)/2;
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='rgba(12,12,30,0.96)';roundRect(ctx,px,py,pw,ph,6);ctx.fill();
  ctx.strokeStyle='#ffd700';ctx.lineWidth=1;roundRect(ctx,px,py,pw,ph,6);ctx.stroke();
  // Header
  ctx.fillStyle='rgba(255,215,0,0.1)';ctx.fillRect(px+1,py+1,pw-2,28);
  ctx.fillStyle='#ffd700';ctx.font=`${FONT_FANTASY_BOLD} 16px ${FONT_FANTASY}`;
  ctx.fillText(`📖 Lexicon (${discoveredWords.size}/${Object.keys(WORDS).length})`,px+16,py+25);
  ctx.fillStyle='#666';ctx.font=`11px ${FONT_FANTASY}`;
  ctx.fillText('[L] close',px+pw-70,py+25);
  if(discoveredWords.size===0){
    ctx.fillStyle='#555';ctx.font=`${FONT_FANTASY_ITALIC} 14px ${FONT_FANTASY}`;
    ctx.fillText('No words discovered yet. Talk to people and explore.',px+20,py+80);
    return;
  }
  let iy=py+40;const cols=2,colW=(pw-24)/cols;let col=0;
  for(const wId of discoveredWords){
    const w=WORDS[wId];if(!w)continue;
    const cx=px+12+col*colW;
    // Row bg
    ctx.fillStyle='rgba(255,255,255,0.02)';
    ctx.fillRect(cx-3,iy-10,colW-6,24);
    ctx.fillStyle='#ffd700';
    // Sanskrit word uses fallback font
    if(hasSanskritChars(w.s)) {
      ctx.font=`600 12px ${FONT_FALLBACK}`;
    } else {
      ctx.font=`${FONT_FANTASY_BOLD} 12px ${FONT_FANTASY}`;
    }
    ctx.fillText(w.s,cx,iy);
    ctx.fillStyle='#4fc3f7';ctx.font=`11px ${FONT_FANTASY}`;
    ctx.fillText(`→ ${w.en}${w.zh?' · '+w.zh:''}`,cx,iy+14);
    col++;if(col>=cols){col=0;iy+=34;}
  }
}

// ─── ETYMOLOGY BOOK PANEL ───
function renderEtymologyBookPanel() {
  const pw = 640, ph = 480, px = (canvas.width - pw) / 2, py = (canvas.height - ph) / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(12,12,30,0.96)'; roundRect(ctx, px, py, pw, ph, 6); ctx.fill();
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; roundRect(ctx, px, py, pw, ph, 6); ctx.stroke();
  ctx.fillStyle = 'rgba(255,215,0,0.1)'; ctx.fillRect(px + 1, py + 1, pw - 2, 28);
  ctx.fillStyle = '#ffd700'; ctx.font = `${FONT_FANTASY_BOLD} 16px ${FONT_FANTASY}`;
  ctx.fillText(`📜 Etymology Book (${discoveredEtymology.size}/${Object.keys(ETYMOLOGY_LORE).length})`, px + 16, py + 25);
  ctx.fillStyle = '#666'; ctx.font = `11px ${FONT_FANTASY}`;
  ctx.fillText('[B] close · ↑↓ scroll', px + pw - 130, py + 25);

  if (discoveredEtymology.size === 0) {
    ctx.fillStyle = '#555'; ctx.font = `${FONT_FANTASY_ITALIC} 14px ${FONT_FANTASY}`;
    ctx.fillText('No stories yet. Press E on paintings and statues in the family hall.', px + 20, py + 80);
    return;
  }

  const entries = [...discoveredEtymology].map(id => ETYMOLOGY_LORE[id]).filter(Boolean);
  const rowH = 88;
  const viewTop = py + 40;
  const viewH = ph - 52;
  const maxScroll = Math.max(0, entries.length * rowH - viewH);
  etymologyBookScroll = Math.max(0, Math.min(etymologyBookScroll, Math.ceil(maxScroll / rowH)));

  ctx.save();
  ctx.beginPath(); ctx.rect(px + 8, viewTop, pw - 16, viewH); ctx.clip();
  let iy = viewTop - etymologyBookScroll * rowH;
  for (const lore of entries) {
    if (iy + rowH >= viewTop && iy <= viewTop + viewH) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(px + 12, iy, pw - 24, rowH - 8);
      ctx.fillStyle = '#ffd700'; ctx.font = `${FONT_FANTASY_BOLD} 14px ${FONT_FANTASY}`;
      ctx.fillText(lore.title, px + 20, iy + 18);
      ctx.fillStyle = '#c9a227'; ctx.font = `600 11px ${FONT_FALLBACK}`;
      ctx.fillText(`root: ${lore.root}`, px + 20, iy + 34);
      ctx.fillStyle = '#bbb'; ctx.font = `12px ${FONT_FANTASY}`;
      wrapText(lore.text, px + 20, iy + 50, pw - 48, 14, 3);
    }
    iy += rowH;
  }
  ctx.restore();
}

function wrapText(text, x, y, maxW, lineH, maxLines) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lineH;
      lines++;
      line = word;
      if (lines >= maxLines - 1) {
        ctx.fillText(line.length > 42 ? line.slice(0, 39) + '…' : line, x, y);
        return;
      }
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}

function tryHallPaintingInteract(id) {
  if (quizState || introMsg || isStatueSliding()) return;
  const lore = ETYMOLOGY_LORE[id];
  if (!lore) return;
  const firstTime = !discoveredEtymology.has(id);
  discoverEtymology(id);
  showIntroMessage(
    lore.text,
    firstTime ? () => showIntroMessage('Saved to your Etymology Book. Press B to read it anytime.') : null,
  );
  if (firstTime) screenFlash = { alpha: 0.18, color: '#ffd700' };
}

function drawHallPainting(id, wall, wx, wy) {
  const camX = renderInWorldSpace ? 0 : camera.x;
  const camY = renderInWorldSpace ? 0 : camera.y;
  const s = TILE_SIZE;
  const tileX = wx * s - camX;
  const tileY = wy * s - camY;
  const lit = discoveredEtymology.has(id);
  let cx, cy;
  if (wall === 'east') {
    cx = tileX + 6;
    cy = tileY + s / 2;
  } else if (wall === 'west') {
    cx = tileX + s - 6;
    cy = tileY + s / 2;
  } else if (wall === 'south') {
    cx = tileX + s / 2;
    cy = tileY + 6;
  } else {
    cx = tileX + s / 2;
    cy = tileY + s - 6;
  }
  const fw = 24, fh = 30;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(cx - fw / 2 + 2, cy - fh / 2 + 2, fw, fh);
  ctx.fillStyle = lit ? '#5a5048' : '#4a4540';
  ctx.fillRect(cx - fw / 2, cy - fh / 2, fw, fh);
  ctx.strokeStyle = lit ? '#ffd700' : '#8a7a58';
  ctx.lineWidth = lit ? 2 : 1;
  ctx.strokeRect(cx - fw / 2, cy - fh / 2, fw, fh);
  ctx.fillStyle = '#3a3530';
  ctx.fillRect(cx - fw / 2 + 3, cy - fh / 2 + 3, fw - 6, fh - 6);
  if (id === 'matrix') {
    ctx.fillStyle = lit ? '#1a2840' : '#152030';
    ctx.fillRect(cx - 8, cy - 10, 16, 20);
    ctx.fillStyle = lit ? '#00ffaa' : '#3a8a70';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MAT', cx, cy - 1);
    ctx.fillText('RIX', cx, cy + 6);
    ctx.textAlign = 'left';
  } else if (id === 'maternity') {
    ctx.fillStyle = lit ? '#6a3040' : '#4a2830';
    ctx.fillRect(cx - 8, cy - 10, 16, 20);
    ctx.fillStyle = lit ? '#ffd7e8' : '#c8a0a8';
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 3, cy, 6, 8);
    ctx.fillStyle = lit ? '#ffd700' : '#886644';
    ctx.font = `8px ${FONT_FALLBACK}`;
    ctx.textAlign = 'center';
    ctx.fillText('मातृ', cx, cy + 8);
    ctx.textAlign = 'left';
  } else if (id === 'mammal') {
    ctx.fillStyle = lit ? '#5a4028' : '#403020';
    ctx.fillRect(cx - 8, cy - 10, 16, 20);
    ctx.fillStyle = lit ? '#deb887' : '#a08060';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx + 3, cy - 4, 2, 4);
  }
}

function renderHallPaintings() {
  if (!flags.spawnMotherDone) return;
  for (const p of FAMILY_HALL.paintings) {
    drawHallPainting(p.id, p.wall, p.wx, p.wy);
  }
}

// ═══════════════════════════════════════
//         VILLAGE SPAWN CHAMBER
// ═══════════════════════════════════════
function spawnFamilyStatueBlocks(tx, ty) {
  if (!flags.spawnMotherDone) return false;
  const onTile = (sx, sy) => Math.floor(sx + 0.5) === tx && Math.floor(sy + 0.5) === ty;
  const b = spawnFamily.brother;
  if (!spawnFamily.brotherDone && onTile(b.x, b.y)) return true;
  const s = spawnFamily.sister;
  if (!spawnFamily.sisterDone && onTile(s.x, s.y)) return true;
  if (spawnFamily.fatherVisible && !spawnFamily.fatherDone) {
    const f = FAMILY_HALL.father;
    if (onTile(f.x, f.y)) return true;
  }
  return false;
}

function getHallPaintingNearby(maxDist) {
  if (!flags.spawnMotherDone || !playerInFamilyHall()) return null;
  let best = null;
  let bestDist = maxDist;
  for (const p of FAMILY_HALL.paintings) {
    const d = dist(player.x, player.y, p.ix, p.iy);
    if (d < bestDist) {
      bestDist = d;
      best = { type: 'hallPainting', target: p };
    }
  }
  return best;
}

function getSpawnNearby() {
  if (flags.spawnTutorialDone) {
    const m = SPAWN_ROOM.mother;
    if (dist(player.x, player.y, m.x, m.y) < 1.9) {
      return { type: 'mother', target: m };
    }
    if (spawnFamily.fatherVisible) {
      const f = FAMILY_HALL.father;
      if (dist(player.x, player.y, f.x, f.y) < 1.9) return { type: 'father', target: f };
    }
    const b = spawnFamily.brother;
    if (dist(player.x, player.y, b.x, b.y) < 1.9) return { type: 'hallBrother', target: b };
    const s = spawnFamily.sister;
    if (dist(player.x, player.y, s.x, s.y) < 1.9) return { type: 'hallSister', target: s };
    const painting = getHallPaintingNearby(1.9);
    if (painting) return painting;
    return null;
  }

  if (flags.spawnMotherDone) {
    let best = null;
    let bestDist = 1.9;
    const tryPick = (type, x, y, target) => {
      const d = dist(player.x, player.y, x, y);
      if (d < bestDist) {
        bestDist = d;
        best = { type, target };
      }
    };
    const tryStatue = (type, sx, sy, sliding, done) => {
      if (sliding || done) return;
      tryPick(type, sx, sy, spawnFamily[type === 'hallBrother' ? 'brother' : 'sister']);
    };
    tryStatue('hallBrother', spawnFamily.brother.x, spawnFamily.brother.y, spawnFamily.brother.sliding, spawnFamily.brotherDone);
    tryStatue('hallSister', spawnFamily.sister.x, spawnFamily.sister.y, spawnFamily.sister.sliding, spawnFamily.sisterDone);
    if (spawnFamily.fatherVisible) {
      const f = FAMILY_HALL.father;
      tryPick('father', f.x, f.y, f);
    }
    for (const p of FAMILY_HALL.paintings) {
      tryPick('hallPainting', p.ix, p.iy, p);
    }
    if (best) return best;
    if (playerInFamilyHall()) {
      const hd = FAMILY_HALL.southDoor;
      if (!flags.spawnTutorialDone && dist(player.x, player.y, hd.x + 0.5, hd.y + 0.5) < 1.6) {
        return { type: 'hallDoor', target: null };
      }
    }
  }

  const m = SPAWN_ROOM.mother;
  if (dist(player.x, player.y, m.x, m.y) < 1.9) {
    return { type: 'mother', target: m };
  }
  if (!flags.spawnMotherDone) {
    const d = SPAWN_ROOM.door;
    if (dist(player.x, player.y, d.x + 0.5, d.y + 0.5) < 1.6) {
      return { type: 'spawnDoor', target: null };
    }
  }
  return null;
}

function trySpawnFamilyStatueInteract(which) {
  if (quizState || introMsg || isStatueSliding()) return;
  const doneKey = which + 'Done';
  if (spawnFamily[doneKey]) {
    showIntroMessage(which === 'brother' ? INTRO_ETYM.brother : INTRO_ETYM.sister);
    return;
  }
  slideSpawnFamilyStatue(which);
}

function slideSpawnFamilyStatue(which) {
  if (!flags.spawnMotherDone) return;
  const s = spawnFamily[which];
  const cfg = FAMILY_HALL[which];
  if (s.sliding || spawnFamily[which + 'Done']) return;
  s.sliding = true;
  s.path = cfg.path.map(p => ({ x: p.x, y: p.y }));
  s.pathIdx = 1;
  s.segT = 0;
  spawnCamera = { mode: 'statue', x: s.x, y: s.y };
}

function onSpawnStatueArrived(which) {
  const s = spawnFamily[which];
  s.sliding = false;
  s.path = null;
  spawnFamily[which + 'Done'] = true;
  if (which === 'brother') discoverWord('bhrata');
  else discoverWord('svasar');
  spawnCamera = { mode: 'statue', x: s.x, y: s.y };
  screenFlash = { alpha: 0.25, color: '#ffd700' };
  repaintFamilyHallTracks(map, !spawnFamily.brotherDone, !spawnFamily.sisterDone);
  showIntroMessage(
    which === 'brother' ? INTRO_ETYM.brother : INTRO_ETYM.sister,
    tryRevealSpawnFather,
  );
}

function tryRevealSpawnFather() {
  if (spawnFamily.brotherDone && spawnFamily.sisterDone && !spawnFamily.fatherVisible) {
    spawnFamily.fatherVisible = true;
    showIntroChain([
      'Brother and Sister glow gold in their niches.',
      'The family whole again. The Father stirs from the stone beside the sealed exit…',
    ]);
    screenFlash = { alpha: 0.25, color: '#ffd700' };
  }
}

function updateSpawnFamilyStatues(dt) {
  if (!flags.spawnMotherDone || flags.spawnTutorialDone) return;
  for (const which of ['brother', 'sister']) {
    const s = spawnFamily[which];
    if (!s.sliding || !s.path || s.pathIdx >= s.path.length) continue;
    const from = s.path[s.pathIdx - 1];
    const to = s.path[s.pathIdx];
    const segLen = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
    if (segLen < 0.01) {
      s.pathIdx++;
      s.segT = 0;
      continue;
    }
    s.segT += STATUE_TRACK_SPEED * dt / segLen;
    const t = Math.min(1, s.segT);
    s.x = from.x + (to.x - from.x) * t;
    s.y = from.y + (to.y - from.y) * t;
    spawnCamera.x = s.x;
    spawnCamera.y = s.y;
    if (t >= 1) {
      s.x = to.x;
      s.y = to.y;
      s.pathIdx++;
      s.segT = 0;
      if (s.pathIdx >= s.path.length) {
        onSpawnStatueArrived(which);
      }
    }
  }
}

function renderSpawnFamilyScene() {
  if (!flags.spawnMotherDone && !flags.spawnTutorialDone) return;
  renderHallDestinationMarks();
  renderHallPaintings();
  if (flags.spawnMotherDone) {
    drawShrineStatue('brother', spawnFamily.brother.x, spawnFamily.brother.y, spawnFamily.brotherDone, 'Brother statue');
    drawShrineStatue('sister', spawnFamily.sister.x, spawnFamily.sister.y, spawnFamily.sisterDone, 'Sister statue');
    if (spawnFamily.fatherVisible) {
      const f = FAMILY_HALL.father;
      drawShrineStatue('father', f.x, f.y, spawnFamily.fatherDone, f.name);
    }
  }
}

function renderHallDestinationMarks() {
  if (!flags.spawnMotherDone || flags.spawnTutorialDone) return;
  if (spawnFamily.brotherDone && spawnFamily.sisterDone) return;
  const camX = renderInWorldSpace ? 0 : camera.x;
  const camY = renderInWorldSpace ? 0 : camera.y;
  const drawMark = (tx, ty, done) => {
    const sx = tx * TILE_SIZE + TILE_SIZE / 2 - camX;
    const sy = ty * TILE_SIZE + TILE_SIZE / 2 - camY;
    const pulse = 0.25 + 0.2 * Math.sin(time * 3 + tx);
    ctx.fillStyle = done ? 'rgba(255,215,0,0.12)' : `rgba(255,215,0,${pulse * 0.35})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = done ? '#886622' : '#ffd700';
    ctx.lineWidth = done ? 1 : 2;
    ctx.stroke();
    if (!done) {
      ctx.fillStyle = `rgba(255,215,0,${0.5 + pulse * 0.3})`;
      ctx.font = `11px ${FONT_FANTASY}`;
      ctx.textAlign = 'center';
      ctx.fillText('◎', sx, sy + 4);
      ctx.textAlign = 'left';
    }
  };
  if (!spawnFamily.brotherDone) {
    drawMark(FAMILY_HALL.brotherMark.x, FAMILY_HALL.brotherMark.y, false);
  }
  if (!spawnFamily.sisterDone) {
    drawMark(FAMILY_HALL.sisterMark.x, FAMILY_HALL.sisterMark.y, false);
  }
}

function trySpawnMotherInteract() {
  if (quizState) return;
  if (flags.spawnMotherDone) {
    showIntroMessage(MOTHER_QUIZ.etym);
    return;
  }
  if (spawnTutorial.step === 'door' || !spawnTutorial.doorTried) {
    showIntroMessage(SPAWN_TUTORIAL.motherEarly);
    return;
  }
  openQuiz({
    q: MOTHER_QUIZ.q,
    opts: MOTHER_QUIZ.opts,
    ok: MOTHER_QUIZ.ok,
    wrongHint: MOTHER_QUIZ.wrongHint,
    onCorrect: unlockMotherChamber,
  });
}

function trySpawnFatherInteract() {
  if (quizState || introMsg || isStatueSliding()) return;
  if (spawnFamily.fatherDone) {
    showIntroMessage(FATHER_QUIZ.etym);
    return;
  }
  if (!spawnFamily.fatherVisible) return;
  if (!spawnFamily.brotherDone || !spawnFamily.sisterDone) {
    showIntroMessage('The Brother and Sister must stand in their places before the Father will speak.');
    return;
  }
  openQuiz({
    q: FATHER_QUIZ.q,
    opts: FATHER_QUIZ.opts,
    ok: FATHER_QUIZ.ok,
    wrongHint: 'Try again…',
    onCorrect: unlockFamilyHall,
  });
}

function unlockMotherChamber() {
  flags.spawnMotherDone = true;
  applySpawnChambers(map, { motherDoorOpen: true, hallDoorOpen: false });
  discoverWord('matri');
  spawnTutorial.step = 'hall';
  showIntroChain([
    MOTHER_QUIZ.etym,
    'The inner seal breaks. Walk south into the hall of kin.',
    SPAWN_TUTORIAL.hallGuide1,
    SPAWN_TUTORIAL.hallGuide2,
    SPAWN_TUTORIAL.hallGuide3,
    SPAWN_TUTORIAL.hallGuide4,
  ]);
  screenFlash = { alpha: 0.35, color: '#ffd700' };
  const s = SPAWN_ROOM.mother;
  for (let i = 0; i < 12; i++) {
    spawnParticle(s.x * TILE_SIZE, s.y * TILE_SIZE, 'sparkle');
  }
}

function unlockFamilyHall() {
  spawnFamily.fatherDone = true;
  applySpawnChambers(map, { motherDoorOpen: true, hallDoorOpen: true });
  discoverWord('pitri');
  spawnTutorial.step = 'guru';
  showIntroChain([
    FATHER_QUIZ.etym,
    'The outer seal shatters.',
    'Walk south into Siṃhapura — find Guru Vidya at the village crossroads.',
  ], () => {
    flags.spawnTutorialDone = true;
    spawnTutorial.step = 'done';
    snapCameraToTarget();
    startDialogue({
      lines: [
        'You step into the open air. The village crossroads lie ahead.\n{d}Find {g}Guru Vidya{/} at the center of Siṃhapura — the one called the "heavy one," heavy with knowing.{/}',
      ],
      speaker: 'The Resonant World',
      speakerColor: '#ffd700',
      words: [],
      give: [],
      take: [],
      setFlags: [],
    });
  });
  screenFlash = { alpha: 0.4, color: '#ffd700' };
  cameraShake.intensity = 6;
}

function unlockSpawnRoom() { unlockMotherChamber(); }

function openQuiz(cfg) {
  quizState = {
    q: cfg.q,
    opts: [...cfg.opts],
    ok: cfg.ok,
    wrongHint: cfg.wrongHint || 'Try again…',
    wrong: false,
    wrongIdx: -1,
    hovered: -1,
    onCorrect: cfg.onCorrect,
    _bounds: [],
  };
}

// ═══════════════════════════════════════
//           FAMILY SHRINE INTRO
// ═══════════════════════════════════════
function showIntroMessage(text, onDismiss) {
  introMsg = { text, charIndex: 0, visLen: text.length, onDismiss: onDismiss || null };
}

function showIntroChain(messages, onDone) {
  let i = 0;
  const next = () => {
    if (i >= messages.length) {
      if (onDone) onDone();
      return;
    }
    showIntroMessage(messages[i++], next);
  };
  next();
}

function openIntroQuiz(key, onCorrect) {
  const q = INTRO_QUIZ[key];
  openQuiz({
    q: q.q,
    opts: q.opts,
    ok: q.ok,
    wrongHint: 'Try again…',
    onCorrect,
  });
}

function introDist(tx, ty, w, h) {
  const cx = player.x + 0.5;
  const cy = player.y + 0.5;
  const ox = tx + (w || 1) / 2;
  const oy = ty + (h || 1) / 2;
  return Math.hypot(cx - ox, cy - oy);
}

function introStatueBlocks(tx, ty) {
  const m = INTRO_LAYOUT.mother;
  if (!intro.motherDone && tx === m.x && ty === m.y) return true;
  if (!intro.doorNorthOpen) return false;
  for (const which of ['brother', 'sister']) {
    const s = intro[which];
    const ix = Math.floor(s.x);
    const iy = Math.floor(s.y);
    if (tx === ix && ty === iy) return true;
  }
  if (intro.fatherVisible) {
    const f = INTRO_LAYOUT.father;
    if (tx === f.x && ty === f.y) return true;
  }
  return false;
}

function getIntroNearby() {
  let best = null;
  let bestD = 2.2;
  const tryPick = (type, target, tx, ty, dist) => {
    const d = introDist(tx, ty, 1, 1);
    if (d < dist && d < bestD) { bestD = d; best = { type, target }; }
  };

  if (!intro.motherDone) {
    tryPick('mother', null, INTRO_LAYOUT.mother.x, INTRO_LAYOUT.mother.y, 2);
  }
  if (intro.doorNorthOpen) {
    if (!intro.brotherDone && !intro.brother.sliding) {
      tryPick('brother', intro.brother, intro.brother.x, intro.brother.y, 1.8);
    }
    if (!intro.sisterDone && !intro.sister.sliding) {
      tryPick('sister', intro.sister, intro.sister.x, intro.sister.y, 1.8);
    }
    if (intro.fatherVisible && !intro.fatherDone) {
      tryPick('father', null, INTRO_LAYOUT.father.x, INTRO_LAYOUT.father.y, 2);
    }
  }
  if (!intro.bonuses.quilt) tryPick('bonus', 'quilt', INTRO_LAYOUT.quilt.x, INTRO_LAYOUT.quilt.y, 1.6);
  if (!intro.bonuses.matrix) tryPick('bonus', 'matrix', INTRO_LAYOUT.matrix.x, INTRO_LAYOUT.matrix.y, 1.6);
  if (!intro.bonuses.mammal) tryPick('bonus', 'mammal', INTRO_LAYOUT.mammal.x, INTRO_LAYOUT.mammal.y, 1.6);
  if (intro.exitOpen) tryPick('exit', null, INTRO_LAYOUT.exit.x, INTRO_LAYOUT.exit.y, 1.8);

  return best;
}

function tryIntroInteract() {
  const near = getIntroNearby();
  if (!near) return;

  if (near.type === 'mother') {
    openIntroQuiz('mother', () => {
      intro.motherDone = true;
      discoverWord('matri');
      showIntroMessage(INTRO_QUIZ.mother.etym);
      applyIntroDoorNorth(map, true);
      intro.doorNorthOpen = true;
      screenFlash = { alpha: 0.35, color: '#ffd700' };
      for (let i = 0; i < 12; i++) {
        spawnParticle(INTRO_LAYOUT.mother.x * TILE_SIZE + 16, INTRO_LAYOUT.mother.y * TILE_SIZE + 16, 'sparkle');
      }
    });
    return;
  }

  if (near.type === 'bonus') {
    const id = near.target;
    if (!intro.bonuses[id]) {
      intro.bonuses[id] = true;
      showIntroMessage(INTRO_BONUS_TEXT[id]);
      screenFlash = { alpha: 0.2, color: '#ffd700' };
    }
    return;
  }

  if (near.type === 'brother' && !intro.brotherDone) {
    slideIntroStatue('brother');
    return;
  }
  if (near.type === 'sister' && !intro.sisterDone) {
    slideIntroStatue('sister');
    return;
  }

  if (near.type === 'father' && intro.fatherVisible && !intro.fatherDone) {
    openIntroQuiz('father', () => {
      intro.fatherDone = true;
      discoverWord('pitri');
      showIntroMessage(INTRO_QUIZ.father.etym);
      applyIntroExit(map, true);
      intro.exitOpen = true;
      screenFlash = { alpha: 0.4, color: '#ffd700' };
      cameraShake.intensity = 6;
    });
    return;
  }

  if (near.type === 'exit' && intro.exitOpen) {
    completeIntro();
  }
}

function slideIntroStatue(which) {
  const s = intro[which];
  const L = INTRO_LAYOUT[which];
  if (s.sliding) return;
  if (which === 'brother' && intro.brotherDone) return;
  if (which === 'sister' && intro.sisterDone) return;
  s.sliding = true;
  s.t = 0;
  s.fromX = s.x;
  s.fromY = s.y;
  s.toX = L.targetX;
  s.toY = L.targetY;
}

function updateIntroStatues(dt) {
  ['brother', 'sister'].forEach(which => {
    const s = intro[which];
    if (!s.sliding) return;
    s.t += dt * 1.4;
    const t = Math.min(1, s.t);
    const ease = 1 - Math.pow(1 - t, 3);
    s.x = s.fromX + (s.toX - s.fromX) * ease;
    s.y = s.fromY + (s.toY - s.fromY) * ease;
    if (t >= 1) {
      s.sliding = false;
      s.x = s.toX;
      s.y = s.toY;
      if (which === 'brother' && !intro.brotherDone) {
        intro.brotherDone = true;
        discoverWord('bhrata');
        showIntroMessage(INTRO_ETYM.brother);
      }
      if (which === 'sister' && !intro.sisterDone) {
        intro.sisterDone = true;
        discoverWord('svasar');
        showIntroMessage(INTRO_ETYM.sister);
      }
      if (intro.brotherDone && intro.sisterDone && !intro.fatherVisible) {
        intro.fatherVisible = true;
        showIntroMessage('A third figure emerges from the stone…');
        screenFlash = { alpha: 0.25, color: '#ffd700' };
      }
    }
  });
}

function updateIntro(dt) {
  updateIntroStatues(dt);

  applyTouchMovement();
  let dx = 0, dy = 0;
  if (touch.active && (touch.dx || touch.dy)) {
    dx = touch.dx;
    dy = touch.dy;
  } else {
    if (isDown('KeyW') || isDown('ArrowUp')) dy = -1;
    if (isDown('KeyS') || isDown('ArrowDown')) dy = 1;
    if (isDown('KeyA') || isDown('ArrowLeft')) dx = -1;
    if (isDown('KeyD') || isDown('ArrowRight')) dx = 1;
  }
  if (dx !== 0 || dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= len;
    dy /= len;
    const spd = player.speed * dt;
    const nx = player.x + dx * spd;
    const ny = player.y + dy * spd;
    if (canMoveTo(nx, player.y)) player.x = nx;
    if (canMoveTo(player.x, ny)) player.y = ny;
    player.dir = Math.atan2(dy, dx);
    player.moving = true;
    player.bobPhase += dt * 10;
  } else {
    player.moving = false;
    player.bobPhase += dt * 2;
  }

  if (justPressed('KeyE')) tryIntroInteract();

  if (intro.exitOpen && player.y < 2.2 && Math.abs(player.x - INTRO_LAYOUT.exit.x) < 1.2) {
    completeIntro();
  }

  const tx = player.x * TILE_SIZE - canvas.width / 2;
  const ty = player.y * TILE_SIZE - canvas.height / 2;
  camera.x += (tx - camera.x) * 0.12;
  camera.y += (ty - camera.y) * 0.12;
  camera.x = Math.max(0, Math.min(mapW * TILE_SIZE - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(mapH * TILE_SIZE - canvas.height, camera.y));
}

function skipIntroToWorld() {
  if (!introActive) return;
  introActive = false;
  introMsg = null;
  quizState = null;
  flags.introComplete = true;
  saveIntroComplete();
  flags.spawnMotherDone = false;
  flags.spawnTutorialDone = false;
  beginMainWorld();
}

function completeIntro() {
  if (!introActive) return;
  skipIntroToWorld();
  startDialogue({
    lines: [
      'The stone door grinds open. {w}Sunlight{/} — real sunlight — spills across the threshold.',
      'You step into {g}Siṃhapura{/}. The village hums with voices, spice, and memory.',
      '{d}The words of kin still echo in the chamber behind you.\nNow the wider world awaits.{/}',
      'Find {g}Guru Vidya{/} in the village square. The journey to restore the {w}Tri-Ratna{/} begins here.',
    ],
    words: [],
    give: [],
    take: [],
    setFlags: ['metIntro'],
  });
}

function renderIntroScene() {
  renderIntroProps();
  renderIntroStatues();
}

function renderIntroProps() {
  const drawProp = (tx, ty, drawFn) => {
    const sx = tx * TILE_SIZE - camera.x;
    const sy = ty * TILE_SIZE - camera.y;
    if (sx < -64 || sx > canvas.width + 64 || sy < -64 || sy > canvas.height + 64) return;
    drawFn(sx, sy);
  };

  if (!intro.bonuses.quilt) {
    drawProp(INTRO_LAYOUT.quilt.x, INTRO_LAYOUT.quilt.y, (x, y) => {
      ctx.fillStyle = '#8b4040';
      ctx.fillRect(x + 4, y + 12, 24, 14);
      ctx.fillStyle = '#a05050';
      ctx.fillRect(x + 6, y + 8, 20, 8);
      ctx.strokeStyle = '#ffd966';
      ctx.strokeRect(x + 4, y + 8, 24, 18);
    });
  }
  if (!intro.bonuses.matrix) {
    drawProp(INTRO_LAYOUT.matrix.x, INTRO_LAYOUT.matrix.y, (x, y) => {
      ctx.fillStyle = '#4a3828';
      ctx.fillRect(x + 2, y + 4, 28, 22);
      ctx.fillStyle = '#1a2840';
      ctx.fillRect(x + 6, y + 8, 20, 14);
      ctx.fillStyle = '#00ffaa';
      ctx.font = '10px monospace';
      ctx.fillText('MATRIX', x + 8, y + 18);
    });
  }
  if (!intro.bonuses.mammal) {
    drawProp(INTRO_LAYOUT.mammal.x, INTRO_LAYOUT.mammal.y, (x, y) => {
      ctx.fillStyle = '#5a4028';
      ctx.fillRect(x + 2, y + 6, 26, 20);
      ctx.fillStyle = '#deb887';
      ctx.beginPath();
      ctx.ellipse(x + 16, y + 18, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 20, y + 10, 4, 6);
    });
  }
}

function drawFamilyStatue(kind, tx, ty, lit) {
  const x = tx * TILE_SIZE - camera.x;
  const y = ty * TILE_SIZE - camera.y;
  const stone = lit ? '#b0b0b0' : '#6a6a6a';
  const gold = lit ? '#D4AF37' : '#6a5a30';
  const alpha = lit ? 1 : 0.65;

  ctx.globalAlpha = alpha;
  ctx.fillStyle = stone;

  if (kind === 'mother') {
    ctx.fillRect(x + 4, y + 28, 40, 12);
    ctx.fillStyle = lit ? '#c8c8c8' : '#7a7a7a';
    ctx.beginPath();
    ctx.arc(x + 24, y + 14, 12, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = stone;
    ctx.beginPath();
    ctx.arc(x + 24, y + 20, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 14, y + 26, 20, 12);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (kind === 'father') {
    ctx.fillRect(x + 4, y + 32, 40, 8);
    ctx.beginPath();
    ctx.arc(x + 24, y + 14, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 16, y + 22, 16, 14);
    ctx.strokeStyle = gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 34, y + 26);
    ctx.lineTo(x + 34, y + 4);
    ctx.stroke();
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(x + 34, y + 4, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'brother') {
    ctx.fillRect(x + 4, y + 32, 40, 8);
    ctx.fillRect(x + 10, y + 14, 28, 22);
    ctx.beginPath();
    ctx.arc(x + 24, y + 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(x + 36, y + 18);
    ctx.lineTo(x + 46, y + 6);
    ctx.lineTo(x + 38, y + 14);
    ctx.fill();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (kind === 'sister') {
    ctx.fillRect(x + 8, y + 30, 32, 8);
    ctx.beginPath();
    ctx.arc(x + 24, y + 14, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 14, y + 22, 20, 12);
    if (lit) {
      ctx.fillStyle = gold;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = lit ? 10 : 0;
      ctx.beginPath();
      ctx.arc(x + 24, y + 28, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.fillStyle = lit ? '#fff' : '#aaa';
  ctx.font = `20px ${FONT_FALLBACK}`;
  ctx.textAlign = 'center';
  const labels = { mother: 'मातृ', father: 'पितृ', brother: 'भ्रातृ', sister: 'स्वसृ' };
  ctx.fillText(labels[kind], x + 24, y + 46);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function renderIntroStatues() {
  drawFamilyStatue('mother', INTRO_LAYOUT.mother.x, INTRO_LAYOUT.mother.y, intro.motherDone);
  if (intro.doorNorthOpen) {
    drawFamilyStatue('brother', intro.brother.x, intro.brother.y, intro.brotherDone);
    drawFamilyStatue('sister', intro.sister.x, intro.sister.y, intro.sisterDone);
    if (intro.fatherVisible) {
      drawFamilyStatue('father', INTRO_LAYOUT.father.x, INTRO_LAYOUT.father.y, intro.fatherDone);
    }
  }
  if (intro.exitOpen) {
    const ex = INTRO_LAYOUT.exit.x * TILE_SIZE - camera.x;
    const ey = INTRO_LAYOUT.exit.y * TILE_SIZE - camera.y;
    const pulse = 0.35 + 0.2 * Math.sin(time * 3);
    ctx.fillStyle = `rgba(100, 220, 120, ${pulse})`;
    ctx.fillRect(ex - 4, ey - 8, TILE_SIZE + 8, TILE_SIZE + 16);
    ctx.fillStyle = '#ffd700';
    ctx.font = `12px ${FONT_FANTASY}`;
    ctx.textAlign = 'center';
    ctx.fillText('To Siṃhapura', ex + TILE_SIZE / 2, ey - 12);
    ctx.textAlign = 'left';
  }
}

function measureIntroMessageHeight(text, maxW, lh) {
  ctx.font = `15px ${FONT_FALLBACK}`;
  let lines = 0;
  for (const para of text.split('\n')) {
    if (!para) { lines++; continue; }
    let line = '';
    for (const w of para.split(' ')) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > maxW && line) { lines++; line = w + ' '; }
      else line = test;
    }
    if (line.trim()) lines++;
  }
  return Math.max(118, lines * lh + 54);
}

function renderIntroMessage() {
  if (!introMsg) return;
  const pw = 520;
  const lh = 22;
  const ph = measureIntroMessageHeight(introMsg.text, pw - 36, lh);
  const px = (canvas.width - pw) / 2;
  const py = canvas.height * 0.22;
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  roundRect(ctx, px, py, pw, ph, 8);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  roundRect(ctx, px, py, pw, ph, 8);
  ctx.stroke();
  ctx.fillStyle = '#f5e6c8';
  ctx.font = `15px ${FONT_FALLBACK}`;
  const visible = introMsg.text.substring(0, Math.floor(introMsg.charIndex));
  wrapTextCanvas(visible, px + 18, py + 28, pw - 36, lh);
  ctx.fillStyle = '#888';
  ctx.font = `12px ${FONT_FANTASY}`;
  ctx.textAlign = 'center';
  const done = introMsg.charIndex >= introMsg.visLen;
  const pulse = done ? 0.55 + 0.45 * Math.sin(time * 3) : 0.35;
  ctx.globalAlpha = pulse;
  ctx.fillText(done ? 'Press E to continue' : '…', px + pw / 2, py + ph - 16);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

function wrapTextCanvas(text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '', ly = y;
  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, ly);
      line = w + ' ';
      ly += lh;
    } else line = test;
  }
  ctx.fillText(line.trim(), x, ly);
}

function renderQuizOverlay() {
  if (!quizState) return;
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pw = 460, ph = 40 + quizState.opts.length * 44;
  const px = (canvas.width - pw) / 2;
  const py = (canvas.height - ph) / 2;

  ctx.fillStyle = 'rgba(18,14,32,0.97)';
  roundRect(ctx, px, py, pw, ph, 8);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  roundRect(ctx, px, py, pw, ph, 8);
  ctx.stroke();

  ctx.fillStyle = '#ffd700';
  ctx.font = `600 14px ${FONT_FALLBACK}`;
  wrapTextCanvas(quizState.q, px + 16, py + 26, pw - 32, 20);

  let oy = py + 52;
  quizState.opts.forEach((opt, i) => {
    const hover = quizState.hovered === i;
    const wrong = quizState.wrongIdx === i;
    ctx.fillStyle = wrong ? 'rgba(160,48,48,0.5)' : hover ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)';
    roundRect(ctx, px + 14, oy, pw - 28, 36, 5);
    ctx.fill();
    ctx.strokeStyle = wrong ? '#c04040' : '#8b7355';
    ctx.lineWidth = 1;
    roundRect(ctx, px + 14, oy, pw - 28, 36, 5);
    ctx.stroke();
    ctx.fillStyle = '#f5e6c8';
    ctx.font = `15px ${FONT_FALLBACK}`;
    ctx.fillText(opt, px + 26, oy + 24);
    quizState._bounds = quizState._bounds || [];
    quizState._bounds[i] = { x: px + 14, y: oy, w: pw - 28, h: 36 };
    oy += 44;
  });

  if (quizState.wrong) {
    ctx.fillStyle = '#e08080';
    ctx.font = `12px ${FONT_FALLBACK}`;
    wrapTextCanvas(quizState.wrongHint || 'Try again…', px + 16, oy + 8, pw - 32, 16);
  }
}

function setupQuizInput() {
  canvas.addEventListener('click', e => {
    if (!quizState) return;
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const cb = quizState.onCorrect;
    quizState._bounds?.forEach((b, i) => {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        const opt = quizState.opts[i];
        if (quizState.ok.includes(opt)) {
          quizState = null;
          cb();
        } else {
          quizState.wrong = true;
          quizState.wrongIdx = i;
          setTimeout(() => {
            if (quizState) { quizState.wrong = false; quizState.wrongIdx = -1; }
          }, 700);
        }
      }
    });
  });
  canvas.addEventListener('mousemove', e => {
    if (!quizState) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    quizState.hovered = -1;
    quizState._bounds?.forEach((b, i) => {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) quizState.hovered = i;
    });
  });
}

// Keyboard quiz: 1/2/3 keys when quiz open
function updateQuizKeys() {
  if (!quizState) return;
  const keysNum = ['Digit1', 'Digit2', 'Digit3'];
  keysNum.forEach((code, i) => {
    if (justPressed(code) && quizState.opts[i]) {
      const opt = quizState.opts[i];
      const cb = quizState.onCorrect;
      if (quizState.ok.includes(opt)) {
        quizState = null;
        cb();
      } else {
        quizState.wrong = true;
        quizState.wrongIdx = i;
        setTimeout(() => {
          if (quizState) { quizState.wrong = false; quizState.wrongIdx = -1; }
        }, 700);
      }
    }
  });
}

// ─── START ───
window.addEventListener('load', () => {
  init();
  setupQuizInput();
});
