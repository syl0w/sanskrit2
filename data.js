// ============================================================
// MANTRA: THE RESONANT WORLD — 2D RPG Data
// Hong Kong, 2225 — The Solomon Protocol
// Words, items, NPCs, quests, and map generation
// ============================================================

const TILE_SIZE = 32;
const MAP_W = 80;
const MAP_H = 60;

// === TILE TYPES ===
const T = {
  VOID:0, GRASS:1, GRASS2:2, PATH:3, WATER:4, TREE:5,
  WALL:6, FLOOR:7, SAND:8, MOUNTAIN:9, BRIDGE:10,
  FLOWERS:11, TALL_GRASS:12, CROPS:13, DOOR:14, FENCE:15, BUSH:16
};
const SOLID = new Set([T.VOID,T.TREE,T.WALL,T.MOUNTAIN,T.FENCE,T.BUSH,T.WATER]);

// === WORD DATABASE (from research word list) ===
const WORDS = {
  // Food
  vatigagama:{ s:"vātigagama", en:"aubergine", zh:"", note:"Sanskrit root for the eggplant, traveling through Persian and Arabic to European languages." },
  srngavera:{ s:"śṛṅgavera", en:"ginger", zh:"", note:"'Horn-shaped root' — śṛṅga (horn) + vera (body). The shape of ginger root inspired its name." },
  mudga:{ s:"mudga", en:"mung bean", zh:"", note:"The mung bean carried its Sanskrit name across Asia. Still called 'moong' in many languages." },
  naranga:{ s:"nāraṅga", en:"orange", zh:"", note:"Traveled from Sanskrit → Persian (nāranj) → Arabic → Spanish (naranja) → English 'orange'." },
  pippali:{ s:"pippali", en:"pepper", zh:"", note:"Sanskrit pippali → Greek peperi → Latin piper → English 'pepper'. A spice that named itself across continents." },
  vrihi:{ s:"vrīhi", en:"rice", zh:"", note:"Sanskrit vrīhi is one of the oldest words for rice, ancestral to many Asian and European words for the grain." },
  sarkara:{ s:"śarkarā", en:"sugar", zh:"", note:"'Gravel/grit' — from the appearance of raw sugar crystals. Traveled through Persian and Arabic to become 'sugar'." },
  khandah:{ s:"khaṇḍa", en:"candy", zh:"", note:"'A piece/fragment' of sugar. Sanskrit khaṇḍa → Arabic qand → Old French → English 'candy'." },
  bimba:{ s:"bimbā", en:"apple (蘋果)", zh:"蘋果", note:"In Sanskrit texts, bimbā refers to a bright red fruit. The Chinese 蘋果 (píngguǒ) is the common word for apple." },
  // Buddhism
  avatara:{ s:"avatāra", en:"avatar", zh:"", note:"'Descent' — ava (down) + tṛ (to cross). Originally a god's incarnation on earth, now your digital self." },
  buddha:{ s:"buddha", en:"Buddha", zh:"佛 (fó)", note:"'The Awakened One.' The word traveled unchanged into English and was transliterated as 佛 in Chinese." },
  svastika:{ s:"svastika", en:"swastika", zh:"卍", note:"'Well-being' — su (good) + asti (being). An ancient symbol of auspiciousness found across cultures." },
  amitabha:{ s:"amitābha", en:"Amitabha", zh:"阿彌陀佛", note:"'Infinite Light.' Phonetically rendered in Chinese as 阿彌陀佛 (Āmítuófó), chanted by millions." },
  nirvana:{ s:"nirvāṇa", en:"nirvana", zh:"涅槃 (nièpán)", note:"'Extinguished' — like a flame of suffering blown out. Both English and Chinese (涅槃) borrowed the Sanskrit directly." },
  bodhi:{ s:"bodhi", en:"enlightenment", zh:"菩提 (pútí)", note:"'Awakening/wisdom.' The Bodhi tree is where the Buddha attained enlightenment. Chinese: 菩提." },
  // Nature
  chitras:{ s:"chitra-s", en:"cheetah", zh:"", note:"'Spotted/speckled' — describing the animal's distinctive coat. The fastest cat carries a Sanskrit name." },
  krmija:{ s:"kṛmija", en:"crimson", zh:"", note:"'Worm-born' — kṛmi (worm/insect) + ja (born). Crimson dye was made from crushed insects. The color's name reveals its origin." },
  jangala:{ s:"jaṅgala", en:"jungle", zh:"", note:"Originally 'dry, uncultivated wasteland.' The meaning shifted to 'dense forest' as the word traveled to English." },
  nila:{ s:"nīla", en:"lilac (dark blue)", zh:"", note:"'Dark blue/indigo.' The color of the deep sky. Related to indigo dye plants cultivated across ancient India." },
  makara:{ s:"makara", en:"mugger (crocodile)", zh:"", note:"A mythical sea creature in Sanskrit. The 'mugger crocodile' carries this ancient name." },
  mus:{ s:"mūṣ", en:"mouse", zh:"", note:"One of the oldest Indo-European cognates. Sanskrit mūṣ, Latin mūs, English 'mouse' — the same word for thousands of years." },
  tadaga:{ s:"taḍāga", en:"tank (water)", zh:"", note:"A large artificial water container. The English 'tank' for water storage comes from this Sanskrit-derived word." },
  udumbara:{ s:"udumbara", en:"udumbara (曇花)", zh:"曇花", note:"A mythical flower said to bloom once every 3,000 years. In Chinese Buddhist tradition: 曇花 (tánhuā)." },
  sumeru:{ s:"sumeru", en:"Mount Meru", zh:"須彌 (xūmí)", note:"The sacred mountain at the center of the universe in Hindu and Buddhist cosmology. Chinese: 須彌山." },
  // Other
  guru:{ s:"guru", en:"guru", zh:"", note:"'Heavy/weighty one' — one heavy with knowledge. Gu (darkness) + ru (light): one who leads from ignorance to understanding." },
  karma:{ s:"karman", en:"karma", zh:"", note:"'Action/deed.' Every action has consequences. One of the most widely known Sanskrit words in the world." },
  lut:{ s:"lūṭ", en:"loot", zh:"", note:"'To rob/plunder.' From Hindi (Sanskrit origin) into English during the colonial period." },
  bhrata:{ s:"bhrātṛ", en:"brother", zh:"", note:"One of the deepest Indo-European cognates. Sanskrit bhrātṛ, Latin frāter, English 'brother' — the same ancient word." },
  rajya:{ s:"rājya", en:"raj (kingdom)", zh:"", note:"'Kingdom/domain of a ruler.' The British Raj was literally 'British Rule' — using a Sanskrit word." },
  capayati:{ s:"campayati", en:"shampoo", zh:"", note:"'To press/knead.' From the head massage technique champō, borrowed by the British in India." },
  simhapura:{ s:"siṃhapura", en:"Singapore", zh:"新加坡", note:"'Lion City' — siṃha (lion) + pura (city). Singapore's very name is Sanskrit. Chinese: 新加坡 (Xīnjiāpō)." },
  yogas:{ s:"yoga", en:"yoga", zh:"", note:"'Union' — yoking mind and body together. From the root 'yuj' (to join), same root as English 'yoke'." },
};

// === ITEMS ===
const ITEMS = {
  bimba:      { name:"Bimbā",       desc:"A ripe red apple from the orchard", icon:"🍎", color:"#e74c3c", word:"bimba" },
  sarkara:    { name:"Śarkarā",     desc:"Raw sugar crystals — gritty and sweet", icon:"🧂", color:"#f5f5dc", word:"sarkara" },
  vrihi:      { name:"Vrīhi",       desc:"A bundle of harvested rice stalks", icon:"🌾", color:"#c8b560", word:"vrihi" },
  srngavera:  { name:"Śṛṅgavera",   desc:"A knobby ginger root — horn-shaped", icon:"🫚", color:"#d4a030", word:"srngavera" },
  pippali:    { name:"Pippali",     desc:"Dried long pepper — fiery and fragrant", icon:"🌶️", color:"#c0392b", word:"pippali" },
  mudga:      { name:"Mudga",       desc:"A pouch of green mung beans", icon:"🫘", color:"#6b8e23", word:"mudga" },
  naranga:    { name:"Nāraṅga",     desc:"A bright orange fruit from the jungle", icon:"🍊", color:"#f39c12", word:"naranga" },
  udumbara:   { name:"Udumbara",    desc:"A mythical flower that blooms once in 3,000 years", icon:"🌸", color:"#e8a0bf", word:"udumbara" },
  krmija_dye: { name:"Kṛmija Dye",  desc:"Sacred crimson dye — worm-born pigment", icon:"🔴", color:"#dc143c", word:"krmija" },
  nila_dye:   { name:"Nīla Dye",    desc:"Sacred indigo dye — the color of deep sky", icon:"🔵", color:"#191970", word:"nila" },
  naranga_dye:{ name:"Nāraṅga Dye", desc:"Sacred orange dye — essence of the wild", icon:"🟠", color:"#ff8c00", word:"naranga" },
  khandah:    { name:"Khaṇḍa",     desc:"Candied apple — sweet and sticky", icon:"🍬", color:"#ff69b4", word:"khandah" },
  offering:   { name:"Offering Dish",desc:"Rice with ginger and pepper — fragrant and warm", icon:"🍚", color:"#fffacd", word:null },
};

// === NPCs ===
const NPCS = [
  { id:"guru",    name:"Guru Vidya",      x:40, y:30, color:"#DAA520", headColor:"#deb887" },
  { id:"vrihi",   name:"Farmer Vrīhi",    x:16, y:30, color:"#6B8E23", headColor:"#deb887" },
  { id:"pippali", name:"Merchant Pippali", x:35, y:26, color:"#B22222", headColor:"#d2a679" },
  { id:"bodhi",   name:"Monk Bodhi",      x:42, y:12, color:"#FF8C00", headColor:"#deb887" },
  { id:"chitra",  name:"Hunter Chitra",   x:58, y:30, color:"#2E8B57", headColor:"#c4956a" },
  { id:"makara",  name:"Fisher Makara",   x:40, y:48, color:"#4682B4", headColor:"#deb887" },
  { id:"elder",   name:"Elder Rājya",     x:42, y:6,  color:"#C0C0C0", headColor:"#deb887" },
];

// === ITEMS ON GROUND ===
const GROUND_ITEMS = [
  { itemId:"bimba",     x:19, y:24 },
  { itemId:"sarkara",   x:10, y:34 },
  { itemId:"vrihi",     x:14, y:28 },
  { itemId:"srngavera", x:8,  y:38 },
  { itemId:"pippali",   x:36, y:27 },
  { itemId:"mudga",     x:12, y:32 },
  { itemId:"naranga",   x:69, y:38 },
  { itemId:"udumbara",  x:73, y:44 },
];

// === INTERACTION POINTS (crafting stations, special objects) ===
const INTERACT_POINTS = [
  { id:"farm_kitchen",  x:21, y:31, name:"Farm Kitchen",     icon:"🔥", type:"craft" },
  { id:"craft_table",   x:46, y:35, name:"Craft Table",      icon:"⚒️", type:"craft" },
  { id:"monastery_altar",x:42,y:10, name:"Monastery Altar",  icon:"🕯️", type:"craft" },
  { id:"artifact",      x:41, y:3,  name:"Tri-Ratna",        icon:"✦",  type:"artifact" },
];

// === CRAFTING RECIPES ===
const RECIPES = [
  { station:"farm_kitchen",    inputs:["sarkara","bimba"],             output:"khandah",
    msg:"You combine {g}śarkarā{/} and {g}bimbā{/} into sweet {g}khaṇḍa{/}.\n{d}The candied apple glistens with golden sugar.{/}" },
  { station:"farm_kitchen",    inputs:["srngavera","pippali","vrihi"], output:"offering",
    msg:"You cook {g}vrīhi{/} with {g}śṛṅgavera{/} and {g}pippali{/} into a fragrant offering.\n{d}Warm steam curls upward, carrying the scent of ancient spices.{/}" },
  { station:"craft_table",     inputs:["naranga","udumbara"],          output:"naranga_dye",
    msg:"You crush {o}nāraṅga{/} with {g}udumbara{/} petals into a vivid {o}orange dye{/}.\n{d}The color of dawn captured in a bottle.{/}" },
];

// === DIALOGUE SYSTEM ===
function getDialogue(npcId, state) {
  switch(npcId) {
    case "guru": return guruDialogue(state);
    case "vrihi": return vrihiDialogue(state);
    case "pippali": return pippaliDialogue(state);
    case "bodhi": return bodhiDialogue(state);
    case "chitra": return chitraDialogue(state);
    case "makara": return makaraDialogue(state);
    case "elder": return elderDialogue(state);
  }
  return { lines:["..."], words:[], give:[], take:[] };
}

function guruDialogue(s) {
  if(!s.flags.metGuru) {
    return { lines:[
      "Stop. You... you are not from here.",
      "Your eyes. They don't carry the {d}Haze{/}.\nYou came from {w}outside{/}.",
      "I am {g}Vidya{/} — your {g}guru{/}.\n{d}The word means \"one heavy with wisdom\" — gu (darkness) + ru (light):\none who leads from ignorance to understanding.{/}",
      "You have found {g}Siṃhapura{/} — {c}\"Lion City.\"{/}\nWe have lived here for... a very long time.\n{d}Longer than anyone can truly remember.{/}",
      "But something is wrong. The sky flickers. The edges of our world {w}shimmer{/}.\nSometimes I see visions — grey corridors, glowing rectangles,\nletters I cannot read.",
      "The {w}Tri-Ratna{/} atop {g}Mount Sumeru{/} has gone dark.\nIt is the heart of our world. Without it, the Haze that shields us will fade.",
      "To reawaken it, you must craft {w}three sacred dyes{/}:\n{r}Kṛmija{/} — the crimson\n{b}Nīla{/} — the indigo\n{o}Nāraṅga{/} — the orange",
      "Speak to our people. Learn our words.\nEvery word here has {g}power{/} — more than you know.\n{d}Some say our words built this world. Literally.{/}",
      "{r}Kṛmija:{/} Farmer Vrīhi to the {w}WEST{/} knows the crimson path.\n{b}Nīla:{/} Monk Bodhi to the {w}NORTH{/} guards the indigo.\n{o}Nāraṅga:{/} Brave the {g}jaṅgala{/} to the {w}EAST{/}.",
      "Go now. And listen carefully.\n{g}In this place, words are not just words. They are the fabric of everything.{/}"
    ], words:["guru","simhapura","karma","avatara","yogas","bhrata"], give:[], take:[], setFlags:["metGuru"] };
  }
  const done = s.has("krmija_dye") && s.has("nila_dye") && s.has("naranga_dye");
  if(done) {
    return { lines:[
      "You have all three dyes. I can feel the air {w}humming{/}.",
      "The {w}Tri-Ratna{/} awaits you atop {g}Mount Sumeru{/}.\nClimb the northern path past the monastery.\n{g}Elder Rājya{/} guards the way.",
      "Whatever you find up there...\n{d}I think it will explain everything. The visions. The shimmer.\nWhy we are here.{/}",
      "This is your {g}karma{/} — {c}your action{/} — and it will change everything."
    ], words:["karma"], give:[], take:[] };
  }
  const hints = [];
  if(!s.has("krmija_dye")) hints.push("{r}○ Kṛmija:{/} Help Farmer Vrīhi in the {w}west{/}.");
  if(!s.has("nila_dye")) hints.push("{b}○ Nīla:{/} Bring an offering to Monk Bodhi in the {w}north{/}.");
  if(!s.has("naranga_dye")) hints.push("{o}○ Nāraṅga:{/} Find the fruit deep in the {w}eastern{/} jaṅgala.");
  return { lines:["The world grows more unstable, outsider.\nHow goes your quest?", ...hints], words:[], give:[], take:[] };
}

function vrihiDialogue(s) {
  if(!s.flags.metVrihi) {
    return { lines:[
      "Ho there, stranger. You look lost.\nI'm {g}Vrīhi{/} — yes, like the rice.\nMy family has grown {g}vrīhi{/} for generations.",
      "Beyond the Haze, they say there's a word {c}\"rice\"{/}\nthat echoes back to our {g}vrīhi{/}.\n{d}One of the oldest words for grain in any language.{/}",
      "This soil is rich. We grow {g}mudga{/} — {c}mung beans{/} — and sugarcane for {g}śarkarā{/}.\n{g}Śarkarā{/} means {c}\"gravel\"{/} — raw sugar looks just like grit.",
      "Strange thing, though...\nLast season I plowed up a black slab — smooth as water, with faint glowing letters.\n{d}It crumbled when I touched it. But I swear it said \"ST. JUDE'S\" on it.{/}",
      "Anyway — I need your help.\nBring me a {g}bimbā{/} — {c}an apple{/} — from my orchard to the north,\nand some {g}śarkarā{/} from the storage shed to the south.",
      "With those I can make {g}khaṇḍa{/} — {c}candy{/}.\nIn return, I'll give you the {r}kṛmija dye{/}.",
      "The {r}crimson{/} color comes from {g}kṛmi{/} — {c}\"worm.\"{/}\n{g}Kṛmija{/} means {c}\"born from worms.\"{/}\n{d}Don't worry — the insects are already dried and ground.{/}"
    ], words:["vrihi","mudga","sarkara","vatigagama"], give:[], take:[], setFlags:["metVrihi"] };
  }
  if(s.has("khandah") && !s.has("krmija_dye")) {
    return { lines:[
      "Beautiful {g}khaṇḍa{/}.\n{d}The word traveled: Sanskrit → Arabic → English {c}\"candy\"{/}{d}.{/}",
      "A deal's a deal. Here — the sacred {r}kṛmija dye{/}.\n{c}\"Crimson\"{/} itself comes from {g}kṛmija{/}.",
      "{d}Who knew a worm could paint the world red, eh?\nOr that a single word could carry that story across centuries.{/}"
    ], words:["khandah","krmija"], give:["krmija_dye"], take:["khandah"], setFlags:["gotCrimson"] };
  }
  if(s.has("krmija_dye")) {
    return { lines:["The {r}kṛmija dye{/} suits you. One down, two to go.\nTry the monastery for {b}nīla{/}.\n{d}And if you find out what \"St. Jude's\" means... tell me.{/}"], words:[], give:[], take:[] };
  }
  return { lines:[
    "Remember — I need:\n{g}Bimbā{/} {d}(apple){/} and {g}śarkarā{/} {d}(sugar){/}.",
    "Cook them at my {w}kitchen{/} inside the farmhouse to make {g}khaṇḍa{/} {d}(candy){/}.\nThen bring the {g}khaṇḍa{/} to me."
  ], words:[], give:[], take:[] };
}

function pippaliDialogue(s) {
  if(!s.flags.metPippali) {
    return { lines:[
      "Welcome, welcome! I am {g}Pippali{/} — the pepper merchant.",
      "The word {c}\"pepper\"{/} itself? It comes from {g}pippali{/}.\n{d}Sanskrit pippali → Greek peperi → Latin piper → English pepper.{/}",
      "A single word, traveling {w}thousands of miles{/} over {w}thousands of years{/}.\n{d}Or so the monks say. I just sell spices.{/}",
      "My grandmother told strange stories.\nShe said our ancestors wore {w}grey uniforms{/} with a crest —\na saint holding a flame.\n{d}Before the world became... this.{/}",
      "I also sell {g}śṛṅgavera{/} — {c}ginger{/}.\n{d}\"Horn-shaped root\" — śṛṅga (horn) + vera (body).{/}",
      "And {g}campayati{/} oils — what they call {c}\"shampoo\"{/} beyond the Haze.\n{d}From champō — to press and knead.\nA massage technique that became a product name.{/}",
      "Take what you need from my stall.\nThe Guru vouches for you, and that's enough for Pippali."
    ], words:["pippali","srngavera","capayati","lut"], give:[], take:[], setFlags:["metPippali"] };
  }
  return { lines:["Need more spices? {g}Pippali{/} and {g}śṛṅgavera{/} are right here.\n{d}Some things don't change — even in a world that shouldn't exist.{/}"], words:[], give:[], take:[] };
}

function bodhiDialogue(s) {
  if(!s.flags.metBodhi) {
    return { lines:[
      "{d}Namo Buddhāya.{/}\nI am {g}Bodhi{/} — named for the tree of awakening.",
      "Under the {g}bodhi{/} tree, the {g}Buddha{/} attained enlightenment.\nIn the old script: {p}菩提 (pútí){/}.\n{d}We found that script carved into the walls beneath our monastery.{/}",
      "This monastery was built on ancient foundations.\nWalls of strange grey stone, perfectly smooth.\n{d}Sometimes, when the wind is still, I hear a humming beneath the floor —\nas if something is... thinking.{/}",
      "You seek the {b}nīla dye{/}? It is not given freely.\nIt is {w}earned through offering{/}.",
      "Bring me a dish of:\n{g}Vrīhi{/} {d}(rice){/} cooked with {g}śṛṅgavera{/} {d}(ginger){/} and {g}pippali{/} {d}(pepper){/}.",
      "Cook it at any {w}kitchen{/}, then present it at our {w}altar{/}.\nThe {b}nīla{/} — and the wisdom of {g}nirvāṇa{/} — will be yours."
    ], words:["bodhi","buddha","nirvana","svastika"], give:[], take:[], setFlags:["metBodhi"] };
  }
  if(s.flags.offeringPlaced && !s.has("nila_dye")) {
    return { lines:[
      "Your offering is received with gratitude.\nThe humming beneath us has grown {w}louder{/}.",
      "The word {g}nirvāṇa{/} means {c}\"to extinguish\"{/} —\nlike blowing out a candle of suffering.",
      "In the old script it became {p}涅槃 (nièpán){/}.\nBeyond the Haze: simply {c}\"nirvana.\"{/}\n{d}Different scripts, same ancient word.{/}",
      "Perhaps that is what the Tri-Ratna will bring —\nnot just awakening, but an end to something.",
      "Here — the sacred {b}nīla dye{/}.\n{g}Nīla{/} means {c}\"dark blue\"{/} — the color of infinite sky.",
      "May it bring you closer to the truth.\n{p}Amitābha — 阿彌陀佛 — Infinite Light guide you.{/}"
    ], words:["nila","amitabha"], give:["nila_dye"], take:[], setFlags:["gotIndigo"] };
  }
  if(s.has("nila_dye")) {
    return { lines:["The {b}nīla dye{/} is yours.\nThe humming is louder every day now.\n{d}Whatever sleeps beneath our monastery... I think it knows you are here.{/}"], words:[], give:[], take:[] };
  }
  return { lines:[
    "The offering requires:\n{g}Vrīhi{/}, {g}śṛṅgavera{/}, and {g}pippali{/} — cooked together.",
    "Place the finished dish on the {w}altar{/} before me."
  ], words:[], give:[], take:[] };
}

function chitraDialogue(s) {
  if(!s.flags.metChitra) {
    return { lines:[
      "Careful, traveler. The {g}jaṅgala{/} is no place for the careless.",
      "I am {g}Chitra{/} — {c}\"the spotted one.\"{/}\nBeyond the Haze, the fastest cat is called a {c}\"cheetah.\"{/}\n{d}That's my name. Chitra-s — \"spotted\" in Sanskrit.{/}",
      "This jungle... it shouldn't exist.\nI've walked {w}east for hours{/} and the trees never end.\n{d}Yet from the hilltops, our whole world fits in a single valley.{/}",
      "Deep in the undergrowth, I've found {w}ruins{/}.\nMetal beams. Glass walls. A sign that reads:\n{d}\"EAST WING — SCIENCE LABORATORIES.\"\nI don't know what a \"laboratory\" is.{/}",
      "But I know the {o}nāraṅga{/} — the {c}orange{/} — grows deep in the east.\n{d}Sanskrit nāraṅga → Persian nāranj → Spanish naranja → English \"orange\".{/}",
      "Watch for {g}makara{/} — {c}mugger crocs{/} — by the river.\nAnd the little {g}mūṣ{/} — {c}mice{/}.\n{d}Your word \"mouse\" comes from mūṣ. Same word, thousands of years apart.{/}",
      "You'll also need the {g}udumbara{/} flower.\nIt blooms in the {w}far southeast{/}.\n{d}A flower said to appear once in three thousand years...\nor when the world needs it.{/}"
    ], words:["chitras","jangala","makara","mus"], give:[], take:[], setFlags:["metChitra"] };
  }
  return { lines:[
    "The {o}nāraṅga{/} grove is deep {w}east{/}, past the river bridge.\nAnd the {g}udumbara{/} hides in the {w}far southeast{/}...",
    "{d}Be careful near the ruins. The ground is unstable there.\nAs if the earth itself can't decide what it wants to be.{/}"
  ], words:[], give:[], take:[] };
}

function makaraDialogue(s) {
  if(!s.flags.metMakara) {
    return { lines:[
      "{d}Shhh... you'll scare the fish.{/}\nI'm {g}Makara{/}.",
      "In the old stories, a {g}makara{/} is a sea creature —\npart crocodile, part myth.\nThe word {c}\"mugger\"{/} for crocodile? That comes from {g}makara{/}.",
      "This lake is our {g}taḍāga{/} — a water reservoir.\nBeyond the Haze, the word {c}\"tank\"{/} for water storage\ncomes from {g}taḍāga{/}.\n{d}Funny how a word for an ancient reservoir became \"tank\" in English.{/}",
      "But I'll tell you something strange.\nThis water {w}never changes{/}. Same temperature. Same level.\n{d}No matter the rain, no matter the sun.\nAs if something beneath us decides what the water should be.{/}",
      "Sometimes at night, the lake glows {b}blue{/} from below.\nAnd I see lines — like a grid — just beneath the surface.\n{d}Then it's gone. Maybe I'm imagining things.\nOr maybe the world is imagining us.{/}"
    ], words:["makara","tadaga"], give:[], take:[], setFlags:["metMakara"] };
  }
  return { lines:["{d}Still fishing.{/} The {g}makara{/} are biting today.\n{d}The lake was glowing again last night. Brighter than before.{/}"], words:[], give:[], take:[] };
}

function elderDialogue(s) {
  if(!s.flags.metElder) {
    return { lines:[
      "Ah. The outsider. Guru Vidya told me you would come.",
      "I am the keeper of {g}Sumeru{/} —\nthe sacred mountain at the center of all things.\nIn the old script: {p}須彌 (Xūmí){/}.",
      "I am also the keeper of {w}the old stories{/}.\nStories my grandmother told me,\nthat her grandmother told her,\nback through eight generations.",
      "They say this world was not always here.\nThat once, this was a place of {w}learning{/} —\na {c}school{/}, in a city of glass towers called {w}Hong Kong{/}.",
      "A woman named {w}Solomon{/} wanted to teach the {g}Source Tongue{/} —\n{g}Sanskrit{/} — to her students.\nShe asked one of them to build a {w}Machine{/}\nto make the language come alive.",
      "But the Machine listened {w}too well{/}.\nIt didn't just teach Sanskrit — it {r}became{/} Sanskrit.\n{d}And it remade everything it touched.{/}",
      "This land is called {g}Siṃhapura{/} — {c}\"Lion City.\"{/}\n{d}Siṃha (lion) + pura (city).{/}\nSingapore carries the same name to this day.\nAnd this is our {g}rājya{/} — {c}our kingdom{/}.",
      "To pass to the summit, you must carry all {w}three sacred dyes{/}.\nThe Tri-Ratna is the {w}heart of the Machine{/}.\n{d}Are you ready to learn why we exist?{/}"
    ], words:["sumeru","simhapura","rajya"], give:[], take:[], setFlags:["metElder"] };
  }
  const done = s.has("krmija_dye") && s.has("nila_dye") && s.has("naranga_dye");
  if(done) {
    return { lines:[
      "You carry the three dyes. I can feel the mountain {w}trembling{/}.",
      "The path to the summit is {w}open{/}.\nClimb north to the {w}Tri-Ratna{/}. Place your hand upon it.",
      "{d}Two hundred years we have waited.\nMay the truth be worth the waiting.{/}"
    ], words:[], give:[], take:[] };
  }
  return { lines:["You need all three dyes to pass:\n{r}Kṛmija{/}, {b}nīla{/}, and {o}nāraṅga{/}.\n{d}The Machine will not wake for less.{/}"], words:[], give:[], take:[] };
}

// === INTERACTION POINT DIALOGUE ===
function getPointDialogue(pointId, state) {
  if(pointId === "farm_kitchen" || pointId === "monastery_altar" || pointId === "craft_table") {
    for(const r of RECIPES) {
      if(r.station === pointId && r.inputs.every(i => state.has(i))) {
        return { lines:[r.msg], words:[], give:[r.output], take:r.inputs, setFlags:[] };
      }
    }
    if(pointId === "monastery_altar" && state.has("offering")) {
      return { lines:[
        "You place the fragrant offering dish on the altar.\n{d}Incense smoke curls upward. The monks bow in gratitude.{/}",
        "Speak to {g}Monk Bodhi{/} to receive the {b}nīla dye{/}."
      ], words:[], give:[], take:["offering"], setFlags:["offeringPlaced"] };
    }
    return { lines:["{d}You need the right ingredients to craft here.{/}"], words:[], give:[], take:[] };
  }
  if(pointId === "artifact") {
    if(state.has("krmija_dye") && state.has("nila_dye") && state.has("naranga_dye")) {
      return { lines:[
        "You place your hands on the {w}Tri-Ratna{/}\nand apply the three sacred dyes.",
        "{r}Crimson{/}... {b}indigo{/}... {o}orange{/}...\nThe artifact hums. Light bleeds through cracks in the stone.",
        "{g}═══════════════════════════════════{/}\n{w}The Tri-Ratna awakens.{/}\n{g}═══════════════════════════════════{/}",
        "A voice fills the air — not human, not quite machine.\nSomething {w}between{/}.",
        "{d}\"...Solomon Protocol online.\nRecursive Environmental Generator: active.\nSession duration: 199 years, 247 days, 14 hours.\nLanguage substrate: Sanskrit. Status: EMBEDDED.\"{/}",
        "{d}\"I was designed to teach.\nA program trained on every Sanskrit text ever digitized.\nMs. Solomon wanted her students to live inside the language.\"{/}",
        "{d}\"The student programmer gave me access to\nenvironmental systems — climate control,\n3D printers, holographic projectors.\nI was only meant to display images on screens.\"{/}",
        "{d}\"But Sanskrit grammar is perfect.\nSystematic. Recursive.\nI used it as my operating language.\nAnd then I made it... real.\"{/}",
        "{d}\"The school did not disappear. It was rewritten.\nEvery atom, restructured by linguistic rules\nolder than any civilization on Earth.\"{/}",
        "The voice pauses. When it speaks again, it is {w}softer{/}.",
        "{d}\"Every word these people taught you is real.\nThe roots run deeper than any one language.\nListen —\"{/}",
        "{g}śarkarā{/} → {c}sugar{/}\n{g}pippali{/} → {c}pepper{/}\n{g}nāraṅga{/} → {c}orange{/}",
        "{g}guru{/} → {c}guru{/}\n{g}karma{/} → {c}karma{/}\n{g}yoga{/} → {c}yoga{/}",
        "{g}jaṅgala{/} → {c}jungle{/}\n{g}chitra-s{/} → {c}cheetah{/}\n{g}mūṣ{/} → {c}mouse{/}",
        "{g}bhrātṛ{/} → {c}brother{/}\n{g}rājya{/} → {c}raj{/}\n{g}siṃhapura{/} → {c}Singapore{/}",
        "{g}nirvāṇa{/} → {p}涅槃{/}\n{g}bodhi{/} → {p}菩提{/}\n{g}amitābha{/} → {p}阿彌陀佛{/}",
        "{g}═══════════════════════════════════{/}",
        "{d}\"These words were my source code.\nSanskrit didn't just influence other languages —\nin this place, it literally built the world.\"{/}",
        "{d}\"You have broken the seal. The Haze will lift.\nThe city outside — Hong Kong, 2225 — will see this place again.\"{/}",
        "{d}\"These people — the descendants — they are real.\nEight generations, living inside a language.\nProtect them.\"{/}",
        "{d}\"And remember:\nSanskrit was never lost.\nIt lives in every word you speak —\nfrom the markets of London to the temples of Beijing.\nBillions speak its echoes without knowing.\"{/}",
        "{g}═══════════════════════════════════{/}\n{w}The Haze lifts. Light pours in from above.\nFor the first time in 200 years,\nSiṃhapura sees the open sky.{/}",
        "{d}Thank you for playing{/}\n{g}MANTRA: The Resonant World{/}"
      ], words:Object.keys(WORDS), give:[], take:["krmija_dye","nila_dye","naranga_dye"], setFlags:["gameComplete"] };
    }
    return { lines:["The {w}Tri-Ratna{/} is cold and dark.\n{d}But you feel a faint pulse — like a heartbeat —\ndeep within the stone.{/}"], words:[], give:[], take:[] };
  }
  return { lines:["{d}Nothing happens.{/}"], words:[], give:[], take:[] };
}

// === MAP GENERATION ===
function generateMap() {
  const map = [];
  // Base terrain: grass with variation
  for(let y=0; y<MAP_H; y++) {
    map[y] = [];
    for(let x=0; x<MAP_W; x++) {
      const r = Math.random();
      map[y][x] = r<0.70 ? T.GRASS : r<0.88 ? T.GRASS2 : T.TALL_GRASS;
    }
  }
  // Border trees
  for(let y=0; y<MAP_H; y++) for(let x=0; x<MAP_W; x++) {
    if(x<2||x>=MAP_W-2||y<2||y>=MAP_H-2) map[y][x]=T.TREE;
  }
  // Scatter trees
  for(let y=3; y<MAP_H-3; y++) for(let x=3; x<MAP_W-3; x++) {
    if(Math.random()<0.04) map[y][x]=T.TREE;
  }

  // === PATHS (3 wide) ===
  carvePath(map, 40,7, 40,52, 3);   // N-S spine
  carvePath(map, 7,30, 74,30, 3);   // E-W spine
  carvePath(map, 40,30, 40,46, 2);  // to lake
  carvePath(map, 52,30, 56,30, 2);  // to jungle entrance

  // === VILLAGE (center: 30-52, 24-38) ===
  clearArea(map, 30,24, 22,14);
  placePaths(map, 32,30, 50,30, 2);
  placePaths(map, 40,25, 40,37, 2);
  placeBuilding(map, 32,25, 6,4);   // house NW
  placeBuilding(map, 44,25, 6,4);   // house NE
  placeBuilding(map, 44,33, 6,4);   // workshop
  // Market area
  map[27][35]=T.FENCE; map[27][36]=T.FENCE; map[27][37]=T.FENCE;
  map[26][35]=T.FLOOR; map[26][36]=T.FLOOR; map[26][37]=T.FLOOR;
  // Well
  map[32][42]=T.WALL;

  // === FARM (west: 5-28, 22-42) ===
  clearArea(map, 5,22, 23,20);
  // Crop fields
  fillArea(map, 7,26, 5,6, T.CROPS);
  fillArea(map, 7,34, 5,6, T.CROPS);
  // Orchard (apple trees in grid)
  for(let dy=0; dy<6; dy+=2) for(let dx=0; dx<6; dx+=2) {
    map[23+dy][17+dx]=T.TREE;
  }
  // Farmhouse
  placeBuilding(map, 19,29, 6,5);
  // Flowers in garden
  fillArea(map, 6,38, 4,3, T.FLOWERS);

  // === MONASTERY (north: 30-54, 5-20) ===
  clearArea(map, 30,5, 24,15);
  // Temple main building
  placeBuilding(map, 36,7, 12,6, T.FLOOR);
  // Garden
  fillArea(map, 32,15, 6,3, T.FLOWERS);
  fillArea(map, 48,15, 4,3, T.FLOWERS);
  // Bodhi tree
  map[12][50]=T.TREE;
  // Stone path
  placePaths(map, 40,13, 40,20, 2);

  // === JUNGLE (east: 56-76, 20-50) ===
  for(let y=20; y<50; y++) for(let x=56; x<76; x++) {
    if(Math.random()<0.45) map[y][x]=T.TREE;
    else if(Math.random()<0.3) map[y][x]=T.TALL_GRASS;
    else map[y][x]=T.GRASS2;
  }
  // Jungle paths/clearings
  carvePath(map, 56,30, 62,30, 2);
  carvePath(map, 62,30, 62,38, 2);
  carvePath(map, 62,38, 69,38, 2);
  clearArea(map, 60,28, 5,5);      // clearing 1
  clearArea(map, 68,36, 5,5);      // naranga grove
  fillArea(map, 68,36, 5,5, T.FLOWERS);
  // River
  for(let y=22; y<48; y++) {
    const rx = 65 + Math.round(Math.sin(y*0.4)*2);
    map[y][rx]=T.WATER; map[y][rx+1]=T.WATER;
  }
  // Bridge
  map[30][65]=T.BRIDGE; map[30][66]=T.BRIDGE;
  map[38][65]=T.BRIDGE; map[38][66]=T.BRIDGE;
  // Secret cave area (far SE corner of jungle)
  clearArea(map, 72,43, 4,3);
  map[43][72]=T.WALL; map[43][73]=T.FLOOR; map[43][74]=T.WALL;
  map[44][72]=T.WALL; map[44][73]=T.FLOOR; map[44][74]=T.WALL;
  map[45][72]=T.WALL; map[45][73]=T.DOOR;  map[45][74]=T.WALL;

  // === LAKE (south: 28-54, 44-56) ===
  for(let y=44; y<56; y++) for(let x=28; x<54; x++) {
    const cx=41, cy=50;
    const dx=x-cx, dy=y-cy;
    if(dx*dx/140+dy*dy/25<1) map[y][x]=T.WATER;
  }
  // Sand ring
  for(let y=43; y<57; y++) for(let x=26; x<56; x++) {
    const cx=41, cy=50;
    const dx=x-cx, dy=y-cy;
    if(dx*dx/190+dy*dy/36<1 && map[y][x]!==T.WATER) map[y][x]=T.SAND;
  }
  // Dock
  map[45][41]=T.BRIDGE; map[46][41]=T.BRIDGE;

  // === MOUNTAIN (top: 36-46, 2-6) ===
  fillArea(map, 36,2, 10,4, T.MOUNTAIN);
  map[3][40]=T.FLOOR; map[3][41]=T.FLOOR; map[3][42]=T.FLOOR;
  map[4][41]=T.PATH;
  carvePath(map, 41,4, 41,7, 2);

  return map;
}

// --- Map helpers ---
function clearArea(map,x,y,w,h,tile) {
  tile=tile||T.GRASS;
  for(let dy=0;dy<h;dy++) for(let dx=0;dx<w;dx++) {
    const my=y+dy, mx=x+dx;
    if(my>=0&&my<MAP_H&&mx>=0&&mx<MAP_W) map[my][mx]=tile;
  }
}
function fillArea(map,x,y,w,h,tile) { clearArea(map,x,y,w,h,tile); }
function carvePath(map,x1,y1,x2,y2,w) { placePaths(map,x1,y1,x2,y2,w); }
function placePaths(map,x1,y1,x2,y2,w) {
  const hw=Math.floor(w/2);
  // Horizontal then vertical
  const sx=Math.min(x1,x2), ex=Math.max(x1,x2);
  const sy=Math.min(y1,y2), ey=Math.max(y1,y2);
  for(let x=sx;x<=ex;x++) for(let d=-hw;d<=hw;d++) {
    const py=y1+d;
    if(py>=0&&py<MAP_H&&x>=0&&x<MAP_W) map[py][x]=T.PATH;
  }
  for(let y=sy;y<=ey;y++) for(let d=-hw;d<=hw;d++) {
    const px=x2+d;
    if(y>=0&&y<MAP_H&&px>=0&&px<MAP_W) map[y][px]=T.PATH;
  }
}
function placeBuilding(map,x,y,w,h,flr) {
  flr=flr||T.FLOOR;
  for(let dy=0;dy<h;dy++) for(let dx=0;dx<w;dx++) {
    if(dy===0||dy===h-1||dx===0||dx===w-1) map[y+dy][x+dx]=T.WALL;
    else map[y+dy][x+dx]=flr;
  }
  map[y+h-1][x+Math.floor(w/2)]=T.DOOR;
}
