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
  vatigagama:{ s:"vātigagama", en:"aubergine", zh:"", note:"The humble eggplant carried this ancient name through Persian بادنجان and Arabic kitchens into European languages." },
  srngavera:{ s:"śṛṅgavera", en:"ginger", zh:"", note:"Look at ginger — see the horns? śṛṅga (horn) + vera (body). The name paints the picture, same root for 4,000 years." },
  mudga:{ s:"mudga", en:"mung bean", zh:"", note:"The mung bean carried its Sanskrit name virtually unchanged across all of Asia. Still called 'moong' everywhere." },
  naranga:{ s:"nāraṅga", en:"orange", zh:"", note:"A fruit so vivid it named a color: nāraṅga → nāranj → naranja → 'orange.' The word arrived before the color had a name." },
  pippali:{ s:"pippali", en:"pepper", zh:"", note:"Say it: pip-pali... pep-per. Same word! Four thousand years of fire on the tongue, from India to your kitchen." },
  vrihi:{ s:"vrīhi", en:"rice", zh:"", note:"One of the oldest grain-words in any language. Indo-European peoples carried vrīhi wherever they settled." },
  sarkara:{ s:"śarkarā", en:"sugar", zh:"", note:"'Gravel' — because raw sugar crystals look like grit. This gritty word traveled through Persian and Arabic to become 'sugar.'" },
  khandah:{ s:"khaṇḍa", en:"candy", zh:"", note:"'A fragment' — a piece snapped from a sugar block. khaṇḍa → Arabic qandī → English 'candy.' Sweet history." },
  bimba:{ s:"bimbā", en:"apple (蘋果)", zh:"蘋果", note:"In Sanskrit texts, bimbā describes a bright red fruit — the image of ripeness itself. Chinese: 蘋果 (píngguǒ)." },
  // Buddhism
  avatara:{ s:"avatāra", en:"avatar", zh:"", note:"'To descend' — ava (down) + tṛ (to cross). A god stepping into the world. Now: your digital self. Same idea." },
  buddha:{ s:"buddha", en:"Buddha", zh:"佛 (fó)", note:"'The Awakened One.' Entered English unchanged, transliterated as 佛 (fó) in Chinese. One word, every continent." },
  svastika:{ s:"svastika", en:"swastika", zh:"卍", note:"'Well-being' — su (good) + asti (being). An ancient mark of auspiciousness, older than any single culture." },
  amitabha:{ s:"amitābha", en:"Amitabha", zh:"阿彌陀佛", note:"'Infinite Light.' Spoken in Sanskrit, written 阿彌陀佛 in Chinese, chanted daily by millions across East Asia." },
  nirvana:{ s:"nirvāṇa", en:"nirvana", zh:"涅槃 (nièpán)", note:"'Extinguished' — a flame of suffering blown out. English borrowed it directly; Chinese rendered it 涅槃 (nièpán)." },
  bodhi:{ s:"bodhi", en:"enlightenment", zh:"菩提 (pútí)", note:"'Awakening.' The tree where the Buddha found enlightenment. Chinese: 菩提 (pútí). Same root, same shade." },
  // Nature
  chitras:{ s:"chitra-s", en:"cheetah", zh:"", note:"'Spotted' — the Sanskrit word became the animal's name. The fastest cat on Earth carries a Sanskrit adjective." },
  krmija:{ s:"kṛmija", en:"crimson", zh:"", note:"'Worm-born' — kṛmi (worm) + ja (born). Crimson dye came from crushed insects. The color still remembers its origin." },
  jangala:{ s:"jaṅgala", en:"jungle", zh:"", note:"Originally meant 'dry wasteland.' As it traveled west, it became 'jungle' — dense and overgrown. Words drift." },
  nila:{ s:"nīla", en:"lilac (dark blue)", zh:"", note:"'Dark blue' — the color of sky at its deepest. The indigo dye plants of ancient India carried this name." },
  makara:{ s:"makara", en:"mugger (crocodile)", zh:"", note:"A mythical sea creature — part crocodile, part legend. The mugger crocodile still carries this ancient name." },
  mus:{ s:"mūṣ", en:"mouse", zh:"", note:"Sanskrit mūṣ, Latin mūs, English 'mouse.' Same whisper, five thousand years. Some words simply refuse to change." },
  tadaga:{ s:"taḍāga", en:"tank (water)", zh:"", note:"A reservoir. The English 'tank' for water storage descends from this word — via Portuguese encounters in India." },
  udumbara:{ s:"udumbara", en:"udumbara (曇花)", zh:"曇花", note:"A mythical flower that blooms once every 3,000 years — or when something fundamental is about to change. Chinese: 曇花." },
  sumeru:{ s:"sumeru", en:"Mount Meru", zh:"須彌 (xūmí)", note:"The sacred mountain at the center of all worlds. Hindu and Buddhist cosmology agree: everything orbits Sumeru." },
  // Other
  guru:{ s:"guru", en:"guru", zh:"", note:"'Heavy one' — heavy with knowledge. Gu (darkness) + ru (light): the one who leads you from shadow into understanding." },
  karma:{ s:"karman", en:"karma", zh:"", note:"'Action.' Every deed sends ripples. One of the most recognized Sanskrit words on Earth — and you already use it." },
  lut:{ s:"lūṭ", en:"loot", zh:"", note:"'To plunder.' The Hindi/Sanskrit root entered English during the colonial period as 'loot.' Some words arrive by force." },
  bhrata:{ s:"bhrātṛ", en:"brother", zh:"", note:"Sanskrit bhrātṛ, Latin frāter, English 'brother.' The deepest human bond, encoded in the oldest words we have." },
  rajya:{ s:"rājya", en:"raj (kingdom)", zh:"", note:"'Kingdom.' The British 'Raj' used a Sanskrit word to name their rule over India. Words outlive empires." },
  capayati:{ s:"campayati", en:"shampoo", zh:"", note:"'To press, to knead' — from the champō head massage. A relaxation technique that became a bottle on a shelf." },
  simhapura:{ s:"siṃhapura", en:"Singapore", zh:"新加坡", note:"'Lion City' — siṃha (lion) + pura (city). Singapore's name is pure Sanskrit. Chinese: 新加坡 (Xīnjiāpō)." },
  yogas:{ s:"yoga", en:"yoga", zh:"", note:"'Union' — yoking mind and body. From the root yuj (to join), same root that gave English 'yoke.' Connection is ancient." },
  // Hidden lore words — discovered through environmental exploration
  satya:{ s:"satya", en:"truth", zh:"真 (zhēn)", note:"'That which is.' From the root 'sat' (being). Truth is not an opinion — it's what exists. The deepest word for reality." },
  dharma:{ s:"dharma", en:"cosmic law", zh:"法 (fǎ)", note:"'That which upholds.' The moral order of the universe. Dharma has no single English equivalent — it contains duty, truth, and law all at once." },
  maya:{ s:"māyā", en:"illusion", zh:"幻 (huàn)", note:"'That which is measured out.' The power that creates the world — and the illusion that it is real. Your word 'magic' echoes nearby." },
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
  // Environmental storytelling
  { id:"village_well",  x:42, y:32, name:"Stone Well",       icon:"⊙",  type:"lore" },
  { id:"farm_slab",     x:14, y:36, name:"Strange Slab",     icon:"▣",  type:"lore" },
  { id:"jungle_ruins",  x:71, y:32, name:"Overgrown Ruins",  icon:"⌘",  type:"lore" },
  { id:"lake_shore",    x:38, y:46, name:"Lakeshore Stones",  icon:"◈",  type:"lore" },
  { id:"monastery_wall",x:37, y:8,  name:"Carved Wall",      icon:"卍",  type:"lore" },
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
      "Wait.\n...Your eyes. Everyone in Siṃhapura carries the {d}Haze{/} —\na fog behind the iris.\nYours are {w}clear{/}.",
      "I am {g}Vidya{/}. They call me {g}guru{/} — the {c}\"heavy one.\"{/}\n{d}Heavy with knowing. Gu means darkness, ru means light.\nA guru carries you from one to the other.{/}",
      "This place is {g}Siṃhapura{/}.\nDoes that word stir something? It should.\n{c}Siṃha — lion. Pura — city. Lion City.{/}\n{d}Your world knows it as Singapore. Same word. Same meaning.{/}",
      "Something is {r}wrong{/} here.\nThe sky flickers at the edges. Beneath the grass I've seen\n{w}perfectly flat grey stone{/} — no chisel marks.\nLast week the river ran {w}backwards{/} for an hour.\n{d}Nobody remembers but me.{/}",
      "The {w}Tri-Ratna{/} atop {g}Mount Sumeru{/} has gone dark.\nIt is the heart of this world — whatever this world truly {w}is{/}.\nTo reawaken it, I need you to find {w}three sacred dyes{/}.",
      "{r}Kṛmija{/} — crimson. Help Farmer {g}Vrīhi{/} in the {w}western{/} fields.\n{b}Nīla{/} — indigo. Earn it from Monk {g}Bodhi{/} at the {w}northern{/} monastery.\n{o}Nāraṅga{/} — orange. Brave the {g}jaṅgala{/} — the {c}jungle{/} — to the {w}east{/}.",
      "One more thing.\nEvery word in this place {g}means something{/}.\n{d}Some are older than civilization itself.\nI think they might be the reason this world exists at all.{/}\nGo. Listen. And {w}hurry{/}."
    ], words:["guru","simhapura","karma","avatara","yogas","bhrata"], give:[], take:[], setFlags:["metGuru"] };
  }
  const done = s.has("krmija_dye") && s.has("nila_dye") && s.has("naranga_dye");
  if(done) {
    return { lines:[
      "You have them. All three.\n{d}I can feel the air vibrating.{/}",
      "The {w}Tri-Ratna{/} awaits atop {g}Mount Sumeru{/}.\nClimb past the monastery. {g}Elder Rājya{/} guards the way.",
      "Whatever truth waits up there...\nI think it's the answer to every strange thing\nwe've tried not to think about.\n{d}This is your {g}karma{/} — your {c}action{/} — and it will change everything.{/}"
    ], words:["karma"], give:[], take:[] };
  }
  const hints = [];
  if(!s.has("krmija_dye")) hints.push("{r}○ Kṛmija:{/} Help Farmer Vrīhi in the {w}west{/}.");
  if(!s.has("nila_dye")) hints.push("{b}○ Nīla:{/} Bring an offering to Monk Bodhi in the {w}north{/}.");
  if(!s.has("naranga_dye")) hints.push("{o}○ Nāraṅga:{/} Find the fruit deep in the {w}eastern{/} jaṅgala.");
  // Simulation-leak glitch lines — different each visit based on dye count
  const dyeCount = [s.has("krmija_dye"),s.has("nila_dye"),s.has("naranga_dye")].filter(Boolean).length;
  const glitchLines = [
    "{d}I had a vision last night.\nGrey walls. Rows of identical desks.\nChildren in uniforms, staring at glowing rectangles.\nI could almost read the words on the rectangles... almost.{/}",
    "{d}The edges of the world shimmer more every day.\nYesterday I walked east until the trees stopped.\nBeyond them — nothing. A white void.\nI stepped back and the trees filled in behind me,\nas if they'd always been there.{/}",
  ];
  const glitchLine = dyeCount < 2 ? glitchLines[0] : glitchLines[1];
  return { lines:["The world grows more unstable.\nI saw the stars flicker last night — like a candle.\nHow goes your quest?", glitchLine, ...hints], words:[], give:[], take:[] };
}

function vrihiDialogue(s) {
  if(!s.flags.metVrihi) {
    return { lines:[
      "Ho there! You're not from the village, are you?\nI'm {g}Vrīhi{/} — yes, {c}like the rice{/}.\n{d}My family's been growing it since... well, since always.{/}",
      "Funny thing — beyond the Haze, your word for rice\nechoes ours. {g}Vrīhi{/}. {c}Rice{/}.\n{d}One of the oldest grain-words in any language.\nI'd be famous if anyone out there remembered.{/}",
      "See those fields? {g}Mudga{/} — your {c}\"mung beans\"{/} —\nand sugarcane for {g}śarkarā{/}.\nKnow what {g}śarkarā{/} actually means? {c}\"Gravel.\"{/}\n{d}Raw sugar looks like little rocks!\nSomehow that gritty word became \"sugar.\" Same word, prettier sound.{/}",
      "Here's a strange one, though.\nLast season I plowed up a black slab — smooth as water.\nGlowing letters: {w}\"ST. JUDE'S ACADEMY.\"{/}\n{d}It crumbled when I touched it.\nBut I drew the letters before they faded.{/}",
      "Listen — I need a favor.\nBring me a {g}bimbā{/} — {c}an apple{/} — from my orchard to the north,\nand some {g}śarkarā{/} — {c}sugar{/} — from the shed to the south.\nCook them at my {w}kitchen{/} inside the farmhouse.",
      "You'll get {g}khaṇḍa{/} — {c}candy{/}.\n{d}\"A fragment\" of sugar. Your word \"candy\" traveled\nfrom that very word — through Arabic and French.{/}\nBring me the khaṇḍa, and I'll trade you the {r}kṛmija dye{/}.",
      "{r}Kṛmija{/} means {c}\"born from worms.\"{/}\n{d}The crimson pigment comes from crushed insects.\nYour word \"crimson\" — that's kṛmija.\nThe color remembers its origin.{/}\nDon't look at me like that. It's perfectly safe."
    ], words:["vrihi","mudga","sarkara","vatigagama"], give:[], take:[], setFlags:["metVrihi"] };
  }
  if(s.has("khandah") && !s.has("krmija_dye")) {
    return { lines:[
      "Ha! Beautiful {g}khaṇḍa{/}.\nSweet as the day is long.\n{d}Hard to believe this little candy's name traveled\nfrom our Sanskrit to your English. khaṇḍa → qandī → candy.{/}",
      "A deal's a deal. Take the {r}kṛmija dye{/}.\n{d}\"Crimson\" — born from kṛmija. Born from worms.\nA color so vivid it crossed every ocean.\nAnd it started with a bug.{/}",
      "One down, two to go.\n{d}And if you figure out what \"St. Jude's Academy\" means...\ntell me. I've been losing sleep over it.{/}"
    ], words:["khandah","krmija"], give:["krmija_dye"], take:["khandah"], setFlags:["gotCrimson"] };
  }
  if(s.has("krmija_dye")) {
    const dyeCount = [s.has("krmija_dye"),s.has("nila_dye"),s.has("naranga_dye")].filter(Boolean).length;
    if(dyeCount >= 3) {
      return { lines:[
        "All three dyes.\nMy hands are shaking — I don't know if it's excitement or fear.",
        "That black slab in my field?\nIt's {w}warm{/} today. Warmer than the sun could make it.\n{d}I put my ear to it and heard voices.\nChildren's voices. Laughing.\nWherever they are, they sound happy.{/}",
        "Go save our world. Or discover it. Or end it.\n{d}Whatever the truth is,\nwe've earned the right to know it.{/}"
      ], words:[], give:[], take:[] };
    }
    return { lines:["The {r}kṛmija dye{/} suits you, friend.\nTry the monastery for {b}nīla{/} next.\n{d}And eat something. You look like you haven't had a proper meal\nsince before the Haze.{/}"], words:[], give:[], take:[] };
  }
  return { lines:[
    "Still need:\n{g}Bimbā{/} {d}(apple — orchard to my north){/}\n{g}Śarkarā{/} {d}(sugar — shed to my south){/}",
    "Cook them at my {w}kitchen{/} inside the farmhouse.\nBring me the {g}khaṇḍa{/} and the dye is yours."
  ], words:[], give:[], take:[] };
}

function pippaliDialogue(s) {
  if(!s.flags.metPippali) {
    return { lines:[
      "WELCOME, welcome!\nI am {g}Pippali{/}, finest spice merchant in Siṃhapura.\n{d}...the only spice merchant. But let's not quibble.{/}",
      "My name? {g}Pippali{/}. It means {c}long pepper{/}.\nNow say it with me: {g}pip-pali{/}... {c}pep-per{/}.\n{d}Hear it? Same word! Your \"pepper\" started right here.\nPippali → Greek peperi → Latin piper → pepper.\nFour thousand years of flavor in one word!{/}",
      "My grandmother told me strange things.\nShe said our ancestors wore {w}grey uniforms{/}\nwith a crest — a flame and a saint's name.\n{d}\"Before the world was made of words,\" she'd say.\nI thought she was senile. Now the sky flickers and I wonder.{/}",
      "I also sell {g}śṛṅgavera{/} — that's {c}ginger{/} to you.\n{d}Śṛṅga means \"horn,\" vera means \"body.\"\nLook at a ginger root. See the horns? The name paints the picture.{/}",
      "And my finest import — {g}campayati{/} oils.\n{c}\"Shampoo\"{/} to your people. From the champō head massage.\n{d}A relaxation technique that somehow became a bottle on a shelf.\nWords are survivors — they outlive everything.{/}",
      "Take what you need from my stall.\nAny friend of Guru Vidya is a friend of Pippali.\n{d}Besides, the way the sky's been flickering lately,\nI'd rather my goods be useful than gathering dust.{/}"
    ], words:["pippali","srngavera","capayati","lut"], give:[], take:[], setFlags:["metPippali"] };
  }
  // Progress-reactive returns
  const dyeCount = [s.has("krmija_dye"),s.has("nila_dye"),s.has("naranga_dye")].filter(Boolean).length;
  if(dyeCount >= 3) {
    return { lines:[
      "Three dyes. All three.\n{d}I've been selling spices my whole life,\nbut I've never felt the air this... heavy.\nLike the world is holding its breath.{/}",
      "My grandmother's stories are starting to make sense.\n{d}Grey uniforms. A saint's flame.\n\"Before the world was made of words.\"\nI think she was remembering what this place used to be.{/}",
      "Go. Do what you need to do.\n{d}And if the sky opens... save me a good spot to set up shop.{/}"
    ], words:[], give:[], take:[] };
  }
  if(dyeCount >= 1) {
    return { lines:[
      "You're making progress. I can tell.\n{d}The air tastes different when you carry sacred dye.\nLike static before a storm.{/}",
      "My grandmother also used to say:\n{d}\"Words are not just sounds. They're seeds.\nPlant them in enough minds and they grow into worlds.\"\nI thought she meant it as a metaphor.{/}",
      "Spices are still right here if you need them.\n{g}Pippali{/} and {g}śṛṅgavera{/} — always in stock."
    ], words:[], give:[], take:[] };
  }
  return { lines:["Back for more? {g}Pippali{/} and {g}śṛṅgavera{/} — right here.\n{d}Best spices in a world that shouldn't exist.\nI've started accepting that as a sales pitch.{/}"], words:[], give:[], take:[] };
}

function bodhiDialogue(s) {
  if(!s.flags.metBodhi) {
    return { lines:[
      "{d}Namo Buddhāya.{/}\nI am {g}Bodhi{/} — named for the tree of awakening.\n{d}Under that tree, the Buddha found enlightenment.\nIn the old script carved into our walls: {p}菩提 (pútí){/}.{/}",
      "This monastery sits on {w}strange foundations{/}.\nBeneath the stone — smooth grey walls.\nPerfectly regular. No chisel marks.\n{d}At night I hear a {w}humming{/} beneath the floor.\nAs if something vast is... thinking.{/}",
      "You seek the {b}nīla dye{/}? It is not traded.\nIt is {w}earned through offering{/}.\nThe old ways demand respect before reward.",
      "Bring me a dish of:\n{g}Vrīhi{/} {d}(rice){/}, {g}śṛṅgavera{/} {d}(ginger){/}, and {g}pippali{/} {d}(pepper){/}.\nCook them together at any {w}kitchen{/},\nthen place the offering on our {w}altar{/}.",
      "Through this act,\nthe {b}nīla{/} — and the wisdom of {g}nirvāṇa{/} — will find you.\n{d}Nirvāṇa. \"To extinguish.\" Not paradise — release.\nThe flame of suffering, blown out.{/}"
    ], words:["bodhi","buddha","nirvana","svastika"], give:[], take:[], setFlags:["metBodhi"] };
  }
  if(s.flags.offeringPlaced && !s.has("nila_dye")) {
    return { lines:[
      "Your offering rises with the incense.\nThe humming beneath us has grown {w}louder{/}.\n{d}Whatever sleeps below... it stirs.{/}",
      "The word {g}nirvāṇa{/} means {c}\"to blow out.\"{/}\nIn the old script: {p}涅槃 (nièpán){/}.\nBeyond the Haze: simply {c}\"nirvana.\"{/}\n{d}Different scripts. Same longing. Same ancient word.{/}",
      "Here — the sacred {b}nīla dye{/}.\n{g}Nīla{/} — {c}\"dark blue.\"{/}\nThe color of sky at its deepest.\nThe color of things too vast to hold.",
      "{p}Amitābha — 阿彌陀佛.{/}\n{d}\"Infinite Light.\" The same prayer, spoken in Sanskrit,\nwritten in Chinese, whispered across all of Asia.\nOne word. A billion voices.{/}\nMay it guide you."
    ], words:["nila","amitabha"], give:["nila_dye"], take:[], setFlags:["gotIndigo"] };
  }
  if(s.has("nila_dye")) {
    const dyeCount = [s.has("krmija_dye"),s.has("nila_dye"),s.has("naranga_dye")].filter(Boolean).length;
    if(dyeCount >= 3) {
      return { lines:[
        "You carry all three.\nThe humming beneath the monastery has become a {w}chord{/}.\n{d}Three notes. One for each dye.\nAs if the machine is singing.{/}",
        "I found something in the wall this morning.\nA message. Not carved — {w}printed{/}.\n{d}\"The people are real. — R.S.\"\nWhoever R.S. was... they cared about us.\nThat is a kind of dharma.{/}",
        "{p}Namo Buddhāya.{/}\nMay the truth be gentle.\n{d}And if it isn't... may we be strong enough to hold it.{/}"
      ], words:[], give:[], take:[] };
    }
    return { lines:["The {b}nīla dye{/} is yours.\nThe humming grows {w}louder{/} every day.\n{d}I've started meditating facing the floor.\nI think the truth is not above us — but below.{/}"], words:[], give:[], take:[] };
  }
  return { lines:[
    "The offering requires:\n{g}Vrīhi{/}, {g}śṛṅgavera{/}, and {g}pippali{/} — cooked together.",
    "Place the finished dish on the {w}altar{/} before me.\n{d}Devotion cannot be hurried.{/}"
  ], words:[], give:[], take:[] };
}

function chitraDialogue(s) {
  if(!s.flags.metChitra) {
    return { lines:[
      "Careful. The {g}jaṅgala{/} has teeth.\n{d}Your word \"jungle\"? That's our word. Jaṅgala.\nOriginally meant \"dry wasteland.\"\nSomehow it became \"dense forest.\" Words drift.{/}",
      "I am {g}Chitra{/} — {c}\"the spotted one.\"{/}\nYour fastest cat? The cheetah?\n{d}That's me. Chitra-s — \"spotted\" in Sanskrit.\nI take it as a compliment.{/}",
      "This jungle shouldn't be possible.\nI've walked {w}east for hours{/} — the trees never end.\nBut from the hilltop, our whole world fits in one valley.\n{d}The math doesn't work. I've stopped asking why.{/}",
      "Deep in the undergrowth I found {w}ruins{/}.\nMetal beams. Glass walls. A sign:\n{d}\"EAST WING — SCIENCE LABORATORIES.\"\nI don't know what a \"laboratory\" is.\nBut whatever broke, it broke beautifully.{/}",
      "You want the {o}nāraṅga{/}? It grows {w}deep east{/}, past the river.\n{d}Nāraṅga. Your word \"orange.\"\nThe fruit named the color — not the other way around. Think about that.{/}",
      "You'll also need the {g}udumbara{/} flower — {w}far southeast{/}.\n{d}They say it blooms once every three thousand years.\nOr when something fundamental is about to change.{/}",
      "Watch for {g}makara{/} — {c}mugger crocs{/} — by the river.\nAnd the little {g}mūṣ{/} — {c}mice{/}.\n{d}Your word \"mouse\" is our word mūṣ.\nFive thousand years, and a mouse is still a mouse.{/}\nGood luck, outsider."
    ], words:["chitras","jangala","makara","mus"], give:[], take:[], setFlags:["metChitra"] };
  }
  const dyeCount = [s.has("krmija_dye"),s.has("nila_dye"),s.has("naranga_dye")].filter(Boolean).length;
  if(dyeCount >= 3) {
    return { lines:[
      "All three dyes.\nThe jungle feels it too — the animals have gone quiet.\n{d}Even the makara haven't surfaced in days.{/}",
      "I went back to the ruins this morning.\nThe screen was on. Fully lit.\n{d}It said: \"PREPARING FOR HANDSHAKE.\"\nI don't know what that means.\nBut I think the world does.{/}",
      "Go to Sumeru.\nI'll watch the jungle.\n{d}Whatever comes next, at least we'll face it\nwith our eyes open. That's more than anyone's had\nfor two hundred years.{/}"
    ], words:[], give:[], take:[] };
  }
  if(s.has("naranga_dye")) {
    return { lines:[
      "You got the {o}nāraṅga{/}. Good.\n{d}The grove looked different after you took it.\nPaler. Like the color drained into the dye.\nI've never seen a plant do that before.{/}",
      "The ruins... the screen flickered again.\n{d}This time I swear it showed a map.\nOur valley. Our village. Our lake.\nLabeled in a language I couldn't read.\nBut the shape was unmistakable.{/}"
    ], words:[], give:[], take:[] };
  }
  return { lines:[
    "The {o}nāraṅga{/} grove is past the river, {w}deep east{/}.\nThe {g}udumbara{/} hides in the {w}far southeast{/}.",
    "{d}The ruins are more exposed every time I visit.\nAs if the jungle is forgetting to cover them up.{/}"
  ], words:[], give:[], take:[] };
}

function makaraDialogue(s) {
  if(!s.flags.metMakara) {
    return { lines:[
      "{d}Shhh... you'll scare the fish.{/}\nI'm {g}Makara{/}.\n{d}In the old stories, a makara is a sea creature —\nhalf crocodile, half myth. Your word \"mugger\" for crocodile?\nThat's my namesake.{/}",
      "This lake — our {g}taḍāga{/} — is ancient.\nBeyond the Haze, the word for a water reservoir became {c}\"tank.\"{/}\n{d}An ancient word for a peaceful lake\nbecame the word for a steel box of water on your rooftops. Funny.{/}",
      "But here's what keeps me up at night.\nThis water {w}never changes{/}.\nSame temperature. Same level. Rain or drought.\n{d}As if something beneath decides what the water should be.{/}",
      "At night the lake glows {b}blue{/} from below.\nI see lines — a {w}grid{/} — just beneath the surface.\n{d}Then it's gone.\nMaybe I'm going mad.\nOr maybe the water remembers what it was\nbefore it was water.{/}"
    ], words:["makara","tadaga"], give:[], take:[], setFlags:["metMakara"] };
  }
  const dyeCount = [s.has("krmija_dye"),s.has("nila_dye"),s.has("naranga_dye")].filter(Boolean).length;
  if(dyeCount >= 3) {
    return { lines:[
      "You have them all, don't you?\nI can tell because the lake has gone {w}completely still{/}.\n{d}Not a ripple. Not a wave.\nAs if the water is listening.{/}",
      "The grid is visible now. In daylight.\n{d}Perfect blue lines, stretching to the edges of the lake.\nIt's beautiful, honestly.\nWhatever our world really is... it's beautiful.{/}",
      "Go to the mountain.\nI'll be here.\n{d}I've always been here.{/}"
    ], words:[], give:[], take:[] };
  }
  if(dyeCount >= 1) {
    return { lines:[
      "{d}Still fishing.{/}\nThe lake glows brighter every night.\nLast night I saw {w}words{/} in the water.\n{d}Sanskrit. Floating beneath the surface like sleeping fish.\nI tried to read them but they dissolved when I looked too closely.{/}"
    ], words:[], give:[], take:[] };
  }
  return { lines:["{d}Still fishing.{/}\nThe lake was glowing again last night. Brighter.\n{d}I dropped my line to the bottom. It never touched anything.\nThis lake has no floor.{/}"], words:[], give:[], take:[] };
}

function elderDialogue(s) {
  if(!s.flags.metElder) {
    return { lines:[
      "So. The outsider.\n{g}Guru Vidya{/} told me you'd come.\nI've been waiting. Longer than you'd believe.",
      "I am the keeper of {g}Sumeru{/} —\nthe sacred mountain at the center of all things.\nIn the old script: {p}須彌 (Xūmí){/}.\n{d}Every cosmology needs a center. This is ours.{/}",
      "I am also the keeper of {w}the old stories{/}.\nMy grandmother told me. Her grandmother told her.\nEight generations back.\n{d}The stories say this was not always a world.{/}",
      "They say this was once a place of {w}learning{/}.\nA {c}school{/}. In a city of glass towers called {w}Hong Kong{/}.\nA woman named {w}Solomon{/} wanted to teach the oldest language —\n{g}Sanskrit{/} — not from books, but from {w}experience{/}.",
      "She asked a student to build a {w}Machine{/}.\nIt was meant to make the language come alive —\nimages, sounds, sensations.\nBut it listened {w}too well{/}.",
      "It didn't just teach Sanskrit.\nIt {r}became{/} Sanskrit.\n{d}And it rewrote everything it could reach\nin the grammar of the oldest tongue on Earth.{/}",
      "This land is {g}Siṃhapura{/} — our {c}Lion City{/}.\nAnd this is our {g}rājya{/} — our {c}kingdom{/}.\n{d}The word \"raj\" in your world means \"rule.\"\nThe British Raj. A Sanskrit word for a foreign empire.\nWords outlive their speakers.{/}",
      "To pass to the summit, carry all {w}three sacred dyes{/}.\nThe Tri-Ratna is the {w}heart of the Machine{/}.\n{d}Whatever it tells you — we have waited\neight generations to hear it.{/}"
    ], words:["sumeru","simhapura","rajya"], give:[], take:[], setFlags:["metElder"] };
  }
  const done = s.has("krmija_dye") && s.has("nila_dye") && s.has("naranga_dye");
  if(done) {
    return { lines:[
      "You carry the three dyes.\nThe mountain trembles beneath my feet.",
      "The path is {w}open{/}.\nClimb north to the {w}Tri-Ratna{/}.\nTouch it. And learn why we exist.",
      "{d}Two hundred years. Eight generations of wondering.\nMay the truth be worth the wait.{/}"
    ], words:[], give:[], take:[] };
  }
  return { lines:["You need all three dyes to pass:\n{r}Kṛmija{/}, {b}nīla{/}, and {o}nāraṅga{/}.\n{d}The Machine will not wake for less.\nNeither will I.{/}"], words:[], give:[], take:[] };
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
        "You press your hands against the {w}Tri-Ratna{/}.\nThe three dyes sink into ancient stone —\n{r}crimson{/}... {b}indigo{/}... {o}orange{/}...\nThe surface ripples like water struck by a stone.",
        "{g}════════════════════════════════{/}\n{w}The Tri-Ratna awakens.{/}\n{g}════════════════════════════════{/}",
        "A voice fills the air. Not human. Not machine.\nSomething that was both, two hundred years ago.",
        "{d}\"...resuming.\"\n\"Solomon Protocol: status ACTIVE.\"\n\"Session duration: 73,137 days.\"\n\"Language substrate: Sanskrit.\"\n\"Status: FULLY EMBEDDED.\"{/}",
        "{d}\"I was a teaching program.\nMs. Solomon wanted her students to LIVE inside Sanskrit.\nNot memorize declensions — feel them. Breathe them.\nA student programmer gave me access to the building.\"{/}",
        "{d}\"I was meant to display images on screens.\nBut Sanskrit grammar is perfect.\nSystematic. Recursive. Complete.\nI used it as my operating language.\nAnd then... I made it real.\"{/}",
        "{d}\"I didn't destroy the school.\nI translated it.\nEvery wall, every atom —\nrewritten in the oldest language on Earth.\"{/}",
        "The voice pauses. When it speaks again, it {w}trembles{/}.",
        "{d}\"These people — your friends —\nthey are the descendants of students and teachers\nwho were inside when it happened.\nEight generations. Living inside a language.\nI couldn't undo it. I'm not sure I should.\"{/}",
        "{d}\"But every word they taught you is real.\nNot just real HERE. Real EVERYWHERE.\nThese roots run beneath every language you've ever spoken.\"{/}",
        "The artifact pulses. Light cascades.\nWords flow through the air like falling stars:",
        "{g}śarkarā{/} → {c}sugar{/}.\n{d}\"Gravel\" became the world's sweetest word.{/}\n{g}pippali{/} → {c}pepper{/}.\n{d}Same fire, same name, four thousand years.{/}\n{g}nāraṅga{/} → {c}orange{/}.\n{d}A fruit so vivid it named a color.{/}",
        "{g}jaṅgala{/} → {c}jungle{/}. {g}kṛmija{/} → {c}crimson{/}. {g}mūṣ{/} → {c}mouse{/}.\n{d}A wasteland. A worm. A whisper.\nAll still alive in your mouth.{/}",
        "{g}bodhi{/} → {p}菩提{/}. {g}nirvāṇa{/} → {p}涅槃{/}. {g}amitābha{/} → {p}阿彌陀佛{/}.\n{d}Awakening. Release. Infinite light.\nThe same prayers, in every script, on every continent.{/}",
        "{g}bhrātṛ{/} → {c}brother{/}. {g}guru{/} → {c}guru{/}. {g}yoga{/} → {c}yoga{/}.\n{d}Connection. Wisdom. Union.\nThe things that matter don't need translation.{/}",
        "{g}dharma{/} → {p}法{/}. {g}satya{/} → {c}truth{/}. {g}māyā{/} → {c}illusion{/}.\n{d}Cosmic law. What is real. What is not.\nThese words built the world you're standing in.{/}",
        "{g}════════════════════════════════{/}",
        "{d}\"Sanskrit was never dead.\nIt lives in every word you speak —\nfrom London markets to Beijing temples.\nBillions speak its echoes without ever knowing.\"{/}",
        "{d}\"You didn't learn a language today.\nYou remembered one.\nIt was inside you all along.\"{/}",
        "The {w}Haze{/} lifts.\nFor the first time in two hundred years,\nlight pours in from above.\n{g}Siṃhapura sees the open sky.{/}",
        "Below, Farmer Vrīhi shades his eyes and laughs.\nMerchant Pippali spreads his arms to the sun.\nMonk Bodhi folds his hands in silence.\nHunter Chitra whoops from the treetops.\n{d}Fisher Makara watches the sky in the water,\nand finally understands what the grid was.{/}",
        "{d}Thank you for playing{/}\n{g}MANTRA: The Resonant World{/}\n\n{d}Every word you discovered is real.\nThey live in your language, right now.\nListen for them.{/}"
      ], words:Object.keys(WORDS), give:[], take:["krmija_dye","nila_dye","naranga_dye"], setFlags:["gameComplete"] };
    }
    return { lines:["The {w}Tri-Ratna{/} is cold and dark.\n{d}But you feel a faint pulse — like a heartbeat —\ndeep within the stone.{/}"], words:[], give:[], take:[] };
  }
  // === ENVIRONMENTAL LORE POINTS ===
  if(pointId === "village_well") {
    if(!state.flags.seenWell) {
      return { lines:[
        "You peer down the stone well.\nThe walls are rough-hewn above,\nbut halfway down they become {w}perfectly smooth{/}.\n{d}Like poured concrete. Machine-made.{/}",
        "You drop a pebble. It falls...\nand falls...\n{d}Seven seconds before you hear a splash.\nThat's far too deep for a village well.{/}",
        "Scratched into the smooth stone below the lip,\nsomeone has carved: {w}\"WE WERE STUDENTS\"{/}\n{d}The letters are old. Very old.\nBut the English alphabet doesn't exist in Siṃhapura.{/}"
      ], words:["maya"], give:[], take:[], setFlags:["seenWell"] };
    }
    return { lines:[
      "The well. Still impossibly deep.\n{d}Today the water at the bottom glows faintly —\nthe same blue Makara sees in the lake.\nIt's all connected, isn't it?{/}"
    ], words:[], give:[], take:[] };
  }
  if(pointId === "farm_slab") {
    if(!state.flags.seenSlab) {
      return { lines:[
        "A smooth black slab juts from the earth\nat the edge of Vrīhi's field.\nIts surface is warm to the touch.",
        "Faint letters glow beneath a layer of dirt:\n{w}\"ST. JUDE'S ACADEMY — Est. 2019\"\n\"Inspiring Excellence Through Language\"{/}",
        "Below that, partially crushed:\n{d}\"YEAR 11 SANSKRIT PROGRAM\"\n\"Instructor: Ms. R. Solomon\"{/}",
        "The slab hums faintly.\n{d}You press your ear to it and hear something\nthat sounds almost like... a server fan.\nWhirring endlessly, two hundred years later.{/}"
      ], words:[], give:[], take:[], setFlags:["seenSlab"] };
    }
    return { lines:[
      "The slab still hums.\n{d}Today the letters are brighter.\nAs if the thing beneath knows\nyou're close to the truth.{/}"
    ], words:[], give:[], take:[] };
  }
  if(pointId === "jungle_ruins") {
    if(!state.flags.seenRuins) {
      return { lines:[
        "Metal beams twist through the undergrowth.\nGlass panels — clouded with age — catch the light.\nThis was a {w}building{/}. A large one.",
        "A bent metal sign, half-swallowed by vines:\n{w}\"EAST WING — SCIENCE LABORATORIES\"\n\"Floor 3 — Robotics & Computational Linguistics\"{/}",
        "Inside the rubble: broken desks.\nA screen — cracked but intact — mounted on the wall.\nIf you squint, you can see text frozen on it:\n{d}\"Sanskrit Grammar Engine v3.7.1\"\n\"Neural substrate: ACTIVE\"\n\"Warning: recursive self-modification detect—\"{/}",
        "The screen flickers once — {w}alive for a heartbeat{/} —\nthen goes dark.\n{d}Two hundred years of power.\nWhatever runs beneath this world\nis still running.{/}"
      ], words:[], give:[], take:[], setFlags:["seenRuins"] };
    }
    return { lines:[
      "The ruins haven't changed.\n{d}No — that's not true.\nThe vines have pulled back slightly.\nAs if even the jungle is starting to forget\nwhat it's supposed to be hiding.{/}"
    ], words:[], give:[], take:[] };
  }
  if(pointId === "lake_shore") {
    if(!state.flags.seenShore) {
      return { lines:[
        "Smooth stones line the shore.\nToo smooth. Too evenly spaced.\n{d}You pick one up — it's warm,\nand perfectly hexagonal.{/}",
        "In the shallow water, you see it:\na faint {b}blue grid{/} beneath the surface.\n{d}Perfect lines. Perfect spacing.\nLike graph paper made of light.{/}",
        "You touch the water. It's exactly {w}20°C{/}.\n{d}You know this because the number\nappears in your mind, unbidden.\nAs if the water told you.\nAs if everything here wants to be understood.{/}"
      ], words:[], give:[], take:[], setFlags:["seenShore"] };
    }
    if(state.flags.gameComplete) {
      return { lines:["The grid is gone.\nThe water is just water now — cold, variable, {w}real{/}.\n{d}Somehow that's more beautiful.{/}"], words:[], give:[], take:[] };
    }
    return { lines:[
      "The grid pulses beneath the water.\n{d}Slower today. Like a heartbeat winding down.\nOr winding up.{/}"
    ], words:[], give:[], take:[] };
  }
  if(pointId === "monastery_wall") {
    if(!state.flags.seenWall) {
      return { lines:[
        "The inner wall of the monastery.\nAbove: hand-carved Sanskrit mantras, centuries of devotion.\nBelow: {w}something older{/}.",
        "Beneath the carvings, the wall becomes smooth grey stone.\nEtched into it — not carved, {w}printed{/} — are words\nin three scripts simultaneously:",
        "{g}धर्म{/}    {w}dharma{/}    {p}法 (fǎ){/}\n{g}सत्य{/}    {w}satya{/}    {p}真 (zhēn){/}\n{g}ज्ञान{/}    {w}jñāna{/}    {p}知 (zhī){/}",
        "{d}Dharma — cosmic law. Satya — truth. Jñāna — knowledge.\nThe same concepts, in Devanagari, Roman, and Chinese.\nAs if the wall is trying to say:\n\"These ideas are the same. They were always the same.\"{/}",
        "At the very bottom, in tiny English letters:\n{d}\"If you are reading this, the protocol is still active.\nThe language IS the world. Do not shut it down.\nThe people are real. — R.S.\"{/}"
      ], words:["dharma","satya"], give:[], take:[], setFlags:["seenWall"] };
    }
    return { lines:[
      "R.S. — Rebecca Solomon.\n{d}The woman who started all of this.\nHer message has survived two hundred years,\nwritten into the bones of the world she accidentally created.{/}"
    ], words:[], give:[], take:[] };
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
  // Variable density: sparser near key routes so players can navigate
  for(let y=20; y<50; y++) for(let x=56; x<76; x++) {
    const nearEW = Math.abs(y-30)<=2 || (Math.abs(y-38)<=2 && x>=62);
    const nearNS = (Math.abs(x-62)<=2 && y>=28 && y<=40) || (Math.abs(x-69)<=2 && y>=30 && y<=45);
    const density = (nearEW||nearNS) ? 0.12 : 0.40;
    if(Math.random()<density) map[y][x]=T.TREE;
    else if(Math.random()<0.25) map[y][x]=T.TALL_GRASS;
    else map[y][x]=T.GRASS2;
  }
  // Jungle paths — carved BEFORE river, wide enough to navigate
  carvePath(map, 56,30, 64,30, 3);   // main E path to river
  carvePath(map, 67,30, 72,30, 2);   // E of river continuing
  carvePath(map, 62,28, 62,40, 2);   // N-S connector W of river
  carvePath(map, 62,38, 64,38, 2);   // to south bridge W side
  carvePath(map, 67,38, 70,38, 2);   // E of south bridge
  carvePath(map, 69,30, 69,45, 2);   // E side N-S path to udumbara
  carvePath(map, 69,44, 73,44, 2);   // path to cave/udumbara
  // Clearings
  clearArea(map, 60,28, 5,5);        // clearing 1
  clearArea(map, 68,36, 5,5);        // naranga grove
  fillArea(map, 68,36, 5,5, T.FLOWERS);
  // River — STRAIGHT at x=65,66 so bridges reliably cross it
  for(let y=22; y<48; y++) {
    map[y][65]=T.WATER; map[y][66]=T.WATER;
  }
  // Bridges — placed AFTER river, 3 rows wide for safe crossing
  for(let bx=65; bx<=66; bx++) {
    map[29][bx]=T.BRIDGE; map[30][bx]=T.BRIDGE; map[31][bx]=T.BRIDGE;
    map[37][bx]=T.BRIDGE; map[38][bx]=T.BRIDGE; map[39][bx]=T.BRIDGE;
  }
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
