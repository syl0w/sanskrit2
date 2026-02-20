// ============================================================
// MANTRA: THE RESONANT WORLD — Game Data
// All word lists, scene content, and puzzle configurations
// ============================================================

const WORDS = {
  // === PHONETIC TRANSLITERATIONS (Sanskrit → Chinese by sound) ===
  phonetic: [
    {
      id: "kshana",
      sanskrit: "Kṣaṇa",
      chinese: "刹那",
      pinyin: "chànà",
      english: "Instant / Moment",
      meaning: "A brief, fleeting moment in time — the smallest unit of existence in Buddhist philosophy.",
      lore: "The Steam-Knights of Albion measure time in seconds. The Ghost-Warriors of Jade measure it in 刹那. Both forgot they learned it from the same source.",
      category: "phonetic"
    },
    {
      id: "nirvana",
      sanskrit: "Nirvāṇa",
      chinese: "涅槃",
      pinyin: "nièpán",
      english: "Nirvana",
      meaning: "Liberation from the cycle of suffering and rebirth — the ultimate spiritual goal.",
      lore: "In the West, they say 'Nirvana' and think of peace. In the East, they write 涅槃 and mean the same. The Silencer made them forget this.",
      category: "phonetic"
    },
    {
      id: "bodhisattva",
      sanskrit: "Bodhisattva",
      chinese: "菩萨",
      pinyin: "púsà",
      english: "Bodhisattva",
      meaning: "An enlightened being who delays their own nirvana to help others achieve liberation.",
      lore: "The greatest warriors are not those who conquer, but those who awaken. The 菩萨 knew this before the war began.",
      category: "phonetic"
    },
    {
      id: "stupa",
      sanskrit: "Stūpa",
      chinese: "塔",
      pinyin: "tǎ",
      english: "Stupa / Pagoda",
      meaning: "A sacred mound-shaped structure containing relics, used as a place of meditation.",
      lore: "The great towers of the Jade Dynasty are called 塔. The ancient builders called them Stūpa. The architecture remembers what the people forgot.",
      category: "phonetic"
    },
    {
      id: "dhyana",
      sanskrit: "Dhyāna",
      chinese: "禅",
      pinyin: "chán",
      english: "Zen / Meditation",
      meaning: "Deep meditation — the practice of stilling the mind to perceive truth.",
      lore: "Dhyāna became 禅 (Chán) as it traveled the Silk Road to China, then crossed the sea to Japan as Zen. One word, three civilizations, one truth.",
      category: "phonetic"
    },
    {
      id: "arhat",
      sanskrit: "Arhat",
      chinese: "罗汉",
      pinyin: "luóhàn",
      english: "Arhat",
      meaning: "One who has attained nirvana — a perfected person who has overcome the defilements.",
      lore: "The 罗汉 statues in the monastery garden each hold a secret. They were warriors once, before they found the Source Tongue.",
      category: "phonetic"
    },
    {
      id: "sangharama",
      sanskrit: "Saṅghārāma",
      chinese: "伽蓝",
      pinyin: "qiélán",
      english: "Monastery",
      meaning: "A community garden or monastery — a place where seekers gather.",
      lore: "Every 伽蓝 was built on the same blueprint: a place where words could be studied in peace. Lord Bheda burned most of them.",
      category: "phonetic"
    },
    {
      id: "sangha",
      sanskrit: "Saṅgha",
      chinese: "僧",
      pinyin: "sēng",
      english: "Monk / Sangha",
      meaning: "A community of monks or spiritual practitioners.",
      lore: "The 僧 of the East and the monks of the West share the same root — a community bound by seeking truth.",
      category: "phonetic"
    },
    {
      id: "namas",
      sanskrit: "Namas",
      chinese: "南无",
      pinyin: "nāmó",
      english: "Homage / Devotion",
      meaning: "An expression of respect and devotion — 'I bow to you.'",
      lore: "南无 — the first word a child learns in the monasteries. It means to bow, to honor, to remember what came before.",
      category: "phonetic"
    },
    {
      id: "yama",
      sanskrit: "Yama-rāja",
      chinese: "阎王",
      pinyin: "yánwáng",
      english: "Yama (King of Death)",
      meaning: "The ruler of the underworld who judges the dead.",
      lore: "阎王 guards the gate between life and death. In every culture, his name echoes the same ancient sound.",
      category: "phonetic"
    }
  ],

  // === SEMANTIC BORROWINGS (Sanskrit meaning → Chinese meaning-translation) ===
  semantic: [
    {
      id: "lokadhatu",
      sanskrit: "Loka-dhātu",
      chinese: "世界",
      pinyin: "shìjiè",
      english: "World",
      meaning: "The realm of existence — everything that is perceivable.",
      lore: "世界 literally means 'generation-boundary.' The Sanskrit Loka-dhātu means 'realm of existence.' Different words, same understanding of our place in the cosmos.",
      category: "semantic"
    },
    {
      id: "sattva",
      sanskrit: "Sattva",
      chinese: "众生",
      pinyin: "zhòngshēng",
      english: "Sentient Beings",
      meaning: "All living, feeling creatures capable of suffering and joy.",
      lore: "众生 — 'the many lives.' Every creature in this war-torn world is a sattva, deserving of compassion.",
      category: "semantic"
    },
    {
      id: "samsara",
      sanskrit: "Saṃsāra",
      chinese: "轮回",
      pinyin: "lúnhuí",
      english: "Reincarnation / Cycle",
      meaning: "The endless cycle of birth, death, and rebirth.",
      lore: "轮回 — 'the wheel returns.' This war is itself a Saṃsāra, repeating endlessly until someone breaks the cycle.",
      category: "semantic"
    },
    {
      id: "hetuphala",
      sanskrit: "Hetu-phala",
      chinese: "因果",
      pinyin: "yīnguǒ",
      english: "Cause and Effect",
      meaning: "The universal law that every action has a consequence.",
      lore: "因果 — 'cause-fruit.' What Lord Bheda sows in war, he shall reap in ruin. This is the law.",
      category: "semantic"
    },
    {
      id: "moksha",
      sanskrit: "Mokṣa",
      chinese: "解脱",
      pinyin: "jiětuō",
      english: "Liberation",
      meaning: "Freedom from the cycle of rebirth — ultimate spiritual release.",
      lore: "解脱 means 'to untie and escape.' Mokṣa is the loosening of all bonds. Arya seeks this — not for herself, but for her brother.",
      category: "semantic"
    },
    {
      id: "kalpa",
      sanskrit: "Kalpa",
      chinese: "劫",
      pinyin: "jié",
      english: "Eon / Kalpa",
      meaning: "An immeasurably long period of time in cosmic cycles.",
      lore: "劫 — a single character for an eternity. How long has this war lasted? It feels like a Kalpa.",
      category: "semantic"
    },
    {
      id: "mara",
      sanskrit: "Māra",
      chinese: "魔",
      pinyin: "mó",
      english: "Demon",
      meaning: "The tempter, the lord of illusion who distracts from truth.",
      lore: "魔 — the demon. Lord Bheda is the Māra of this age, spreading illusion and division.",
      category: "semantic"
    },
    {
      id: "manovijnana",
      sanskrit: "Mano-vijñāna",
      chinese: "意识",
      pinyin: "yìshí",
      english: "Consciousness",
      meaning: "The mind's awareness — the sixth sense in Buddhist philosophy.",
      lore: "意识 — 'mind-knowledge.' The Resonator Gauntlet works by amplifying Arya's consciousness, her Mano-vijñāna.",
      category: "semantic"
    }
  ],

  // === DIRECT ENGLISH LOANWORDS (Sanskrit → English) ===
  direct: [
    {
      id: "avatar",
      sanskrit: "Avatāra (अवतार)",
      chinese: "—",
      pinyin: "",
      english: "Avatar",
      meaning: "A deity's descent to earth. Now also means a digital representation of a person.",
      lore: "In the old tongue, an Avatāra was a god walking among mortals. Now it's your profile picture. Words evolve, but roots remain.",
      category: "direct"
    },
    {
      id: "chakra",
      sanskrit: "Cakra (चक्र)",
      chinese: "—",
      pinyin: "",
      english: "Chakra",
      meaning: "Wheel or circle — the spinning energy centers within the body.",
      lore: "The Resonator Gauntlet channels energy through the seven Cakras. Each one unlocks a new tier of power.",
      category: "direct"
    },
    {
      id: "dharma",
      sanskrit: "Dharma (धर्म)",
      chinese: "—",
      pinyin: "",
      english: "Dharma",
      meaning: "Divine law, duty, and righteous conduct — the moral order of the universe.",
      lore: "Every warrior swears an oath. In the Source Tongue, that oath is Dharma — the law that holds the world together.",
      category: "direct"
    },
    {
      id: "guru",
      sanskrit: "Guru (गुरु)",
      chinese: "—",
      pinyin: "",
      english: "Guru",
      meaning: "A teacher, guide, or expert — one who dispels darkness with knowledge.",
      lore: "Gu means darkness. Ru means light. A Guru is one who leads you from ignorance to understanding.",
      category: "direct"
    },
    {
      id: "karma",
      sanskrit: "Karman (कर्मन्)",
      chinese: "—",
      pinyin: "",
      english: "Karma",
      meaning: "Action and its consequences — the universal law of moral causation.",
      lore: "Every spell you cast, every word you speak — all is Karman. The universe keeps a perfect ledger.",
      category: "direct"
    },
    {
      id: "mantra",
      sanskrit: "Mantra (मन्त्र)",
      chinese: "—",
      pinyin: "",
      english: "Mantra",
      meaning: "A sacred utterance — a word or sound repeated to aid concentration and channel power.",
      lore: "The name of this world's magic. A Mantra is not just a word — it is a key that unlocks reality itself.",
      category: "direct"
    },
    {
      id: "yoga",
      sanskrit: "Yoga (योग)",
      chinese: "—",
      pinyin: "",
      english: "Yoga",
      meaning: "Union — the practice of uniting mind, body, and spirit.",
      lore: "The warriors of old didn't just fight. They practiced Yoga — the union of breath and blade, mind and movement.",
      category: "direct"
    },
    {
      id: "pundit",
      sanskrit: "Paṇḍita (पण्डित)",
      chinese: "—",
      pinyin: "",
      english: "Pundit",
      meaning: "A learned scholar — one who has mastered the texts.",
      lore: "The Paṇḍitas were the keepers of the Source Tongue. Lord Bheda silenced them first.",
      category: "direct"
    }
  ],

  // === EVERYDAY ENGLISH WORDS (indirect borrowings from Sanskrit) ===
  everyday: [
    {
      id: "sugar",
      sanskrit: "Śarkarā (शर्करा)",
      chinese: "—",
      pinyin: "",
      english: "Sugar",
      meaning: "Crystallized sweetness — from the Sanskrit word for 'gravel' or 'grit.'",
      lore: "The merchants of the Silk Road carried Śarkarā westward. The word passed through Persian, Arabic, and French before becoming 'sugar.'",
      category: "everyday"
    },
    {
      id: "orange",
      sanskrit: "Nāraṅga (नारङ्ग)",
      chinese: "—",
      pinyin: "",
      english: "Orange",
      meaning: "The citrus fruit — its name traveled from Sanskrit through Persian and Arabic to Europe.",
      lore: "Nāraṅga → nāranj (Persian) → naranja (Spanish) → orange. A fruit that carried its Sanskrit name across continents.",
      category: "everyday"
    },
    {
      id: "candy",
      sanskrit: "Khaṇḍa (खण्ड)",
      chinese: "—",
      pinyin: "",
      english: "Candy",
      meaning: "A piece of crystallized sugar — from the Sanskrit word for 'piece' or 'fragment.'",
      lore: "Khaṇḍa-śarkarā — 'sugar in pieces.' The children of Albion don't know their sweets have Sanskrit names.",
      category: "everyday"
    },
    {
      id: "jungle",
      sanskrit: "Jaṅgala (जङ्गल)",
      chinese: "—",
      pinyin: "",
      english: "Jungle",
      meaning: "Dense, wild forest — from the Sanskrit for 'uncultivated wasteland.'",
      lore: "The borderlands between Albion and Jade are called 'The Jungle.' The word itself is ancient.",
      category: "everyday"
    },
    {
      id: "loot",
      sanskrit: "Luṇṭ (लुण्ट्)",
      chinese: "—",
      pinyin: "",
      english: "Loot",
      meaning: "Plundered goods — from the Sanskrit root meaning 'to rob.'",
      lore: "Lord Bheda's soldiers call their spoils 'loot.' They don't know the word itself was looted from the Source Tongue.",
      category: "everyday"
    },
    {
      id: "shampoo",
      sanskrit: "Campayati (चम्पयति)",
      chinese: "—",
      pinyin: "",
      english: "Shampoo",
      meaning: "To knead or massage — originally referred to a head massage technique.",
      lore: "The royal baths of the old empire used Campayati — the art of pressing and kneading. The British took the technique and the word.",
      category: "everyday"
    },
    {
      id: "thug",
      sanskrit: "Sthaga (स्थग)",
      chinese: "—",
      pinyin: "",
      english: "Thug",
      meaning: "A violent criminal — from the Sanskrit for 'swindler' or 'deceiver.'",
      lore: "Lord Bheda's enforcers are Sthagas in the truest sense — deceivers who hide truth for profit.",
      category: "everyday"
    },
    {
      id: "juggernaut",
      sanskrit: "Jagannātha (जगन्नाथ)",
      chinese: "—",
      pinyin: "",
      english: "Juggernaut",
      meaning: "An unstoppable, crushing force — from 'Lord of the World.'",
      lore: "The Albion Empire's war machines are called Juggernauts. The irony: the word means 'Lord of the World' — a title of compassion, not destruction.",
      category: "everyday"
    },
    {
      id: "ginger",
      sanskrit: "Śṛṅgavera (शृङ्गवेर)",
      chinese: "—",
      pinyin: "",
      english: "Ginger",
      meaning: "A pungent root spice — from the Sanskrit for 'horn-shaped root.'",
      lore: "Śṛṅga means 'horn,' vera means 'body.' A root shaped like an antler, carrying its Sanskrit description through millennia.",
      category: "everyday"
    },
    {
      id: "punch",
      sanskrit: "Pañca (पञ्च)",
      chinese: "—",
      pinyin: "",
      english: "Punch (the drink)",
      meaning: "A mixed drink — named for its five (pañca) original ingredients.",
      lore: "Five ingredients: spirit, sugar, lemon, water, spice. The number five — Pañca — became the name of the drink itself.",
      category: "everyday"
    }
  ]
};

// ============================================================
// SPELL CRAFTING DATA
// ============================================================
const SPELL_ROOTS = [
  { id: "agni", name: "Agni", meaning: "Fire", type: "element", icon: "🔥", color: "#ff6b35" },
  { id: "jala", name: "Jala", meaning: "Water", type: "element", icon: "💧", color: "#4fc3f7" },
  { id: "vayu", name: "Vāyu", meaning: "Wind", type: "element", icon: "🌬️", color: "#b0bec5" },
  { id: "prthivi", name: "Pṛthivī", meaning: "Earth", type: "element", icon: "🪨", color: "#8d6e63" },
  { id: "vidyut", name: "Vidyut", meaning: "Lightning", type: "element", icon: "⚡", color: "#ffeb3b" },
  { id: "maha", name: "Mahā", meaning: "Great", type: "modifier", icon: "✦", color: "#ffd700" },
  { id: "laghu", name: "Laghu", meaning: "Swift/Light", type: "modifier", icon: "💨", color: "#80deea" },
  { id: "bahu", name: "Bahu", meaning: "Many/Multiple", type: "modifier", icon: "✧", color: "#ce93d8" },
  { id: "divya", name: "Divya", meaning: "Divine", type: "modifier", icon: "✴", color: "#fff59d" },
  { id: "astra", name: "Astra", meaning: "Weapon/Missile", type: "suffix", icon: "🏹", color: "#ef5350" },
  { id: "kavaca", name: "Kavaca", meaning: "Shield/Armor", type: "suffix", icon: "🛡️", color: "#66bb6a" },
  { id: "cikitsa", name: "Cikitsā", meaning: "Healing", type: "suffix", icon: "💚", color: "#69f0ae" },
  { id: "drishti", name: "Dṛṣṭi", meaning: "Sight/Vision", type: "suffix", icon: "👁️", color: "#7c4dff" },
];

const SPELL_RECIPES = {
  "agni": { name: "Agni", desc: "A small flame appears from the gauntlet.", power: 1, effect: "fire-small" },
  "agni+astra": { name: "Agni-Astra", desc: "A fiery arrow streaks across the battlefield.", power: 3, effect: "fire-arrow" },
  "maha+agni": { name: "Mahā-Agni", desc: "A great conflagration erupts, filling the area with sacred fire.", power: 4, effect: "fire-large" },
  "maha+agni+astra": { name: "Mahā-Agni-Astra", desc: "A massive homing fireball that clears the battlefield — the legendary fire weapon.", power: 8, effect: "fire-ultimate" },
  "jala": { name: "Jala", desc: "A stream of purifying water flows forth.", power: 1, effect: "water-small" },
  "jala+kavaca": { name: "Jala-Kavaca", desc: "A shimmering water shield surrounds you.", power: 3, effect: "water-shield" },
  "maha+jala": { name: "Mahā-Jala", desc: "A tidal wave crashes through the area.", power: 4, effect: "water-large" },
  "divya+jala+cikitsa": { name: "Divya-Jala-Cikitsā", desc: "Divine healing waters restore all vitality — the sacred spring.", power: 7, effect: "water-heal" },
  "vayu": { name: "Vāyu", desc: "A gust of wind pushes enemies back.", power: 1, effect: "wind-small" },
  "laghu+vayu": { name: "Laghu-Vāyu", desc: "Swift winds carry you across the battlefield at incredible speed.", power: 3, effect: "wind-speed" },
  "bahu+vayu+astra": { name: "Bahu-Vāyu-Astra", desc: "A storm of wind blades strikes all enemies multiple times.", power: 6, effect: "wind-storm" },
  "vidyut+astra": { name: "Vidyut-Astra", desc: "A bolt of lightning strikes with precision.", power: 4, effect: "lightning-bolt" },
  "maha+vidyut+astra": { name: "Mahā-Vidyut-Astra", desc: "The sky splits open with divine thunder — the weapon of Indra himself.", power: 9, effect: "lightning-ultimate" },
  "prthivi+kavaca": { name: "Pṛthivī-Kavaca", desc: "Stone armor encases your body, granting immense defense.", power: 3, effect: "earth-shield" },
  "divya+agni+drishti": { name: "Divya-Agni-Dṛṣṭi", desc: "Divine fire vision reveals all hidden secrets in the area.", power: 5, effect: "fire-vision" },
  "laghu+vidyut": { name: "Laghu-Vidyut", desc: "Quick sparks of lightning dance between your fingers.", power: 2, effect: "lightning-small" },
  "bahu+agni": { name: "Bahu-Agni", desc: "Multiple fireballs orbit around you.", power: 3, effect: "fire-multi" },
  "divya+cikitsa": { name: "Divya-Cikitsā", desc: "Divine light heals all wounds and purifies corruption.", power: 5, effect: "divine-heal" },
};

// ============================================================
// SCENE / NARRATIVE DATA
// ============================================================
const STORY = {
  intro: [
    {
      title: "The Divided World",
      text: "For centuries, two great empires have waged an endless war. The <span class='text-blue'>Albion Empire</span> of the West wields iron and industry. The <span class='text-jade'>Jade Dynasty</span> of the East commands spirit and tradition.",
      bgClass: "bg-war"
    },
    {
      title: "The Forgotten Truth",
      text: "They have forgotten that their languages, their cultures, their very <em>words</em> share a common root — an ancient tongue called the <span class='text-gold'>Source Language</span>. A tongue so powerful it could reshape reality itself.",
      bgClass: "bg-scrolls"
    },
    {
      title: "The Silence",
      text: "Arya's brother, Veda, discovered fragments of this truth. He spoke a word of the Source Tongue aloud — and was consumed by <span class='text-purple'>the Silence</span>, a void between dimensions. He vanished, leaving only his journal behind.",
      bgClass: "bg-silence"
    },
    {
      title: "The Resonator Gauntlet",
      text: "In Veda's journal, Arya finds the location of an ancient artifact: the <span class='text-gold'>Resonator Gauntlet</span>. It translates the Source Tongue into power. With it, she will speak the words that reunite the world — and find her brother.",
      bgClass: "bg-gauntlet"
    },
    {
      title: "Your Mission",
      text: "Discover the hidden connections between <span class='text-gold'>Sanskrit</span>, <span class='text-blue'>English</span>, and <span class='text-jade'>Chinese</span>. Every word you translate weakens Lord Bheda's grip on the warring empires. Every connection you forge brings you closer to Veda.",
      bgClass: "bg-mission"
    }
  ],

  scenes: {
    temple: {
      id: "temple",
      name: "Meditation Temple",
      subtitle: "The Silk Road Connection",
      description: "A ruined temple on the border of the Jade Empire. Ghost monks haunt its halls, chanting in an unknown tongue...",
      unlocked: true,
      completed: false,
      icon: "🏯",
      words: ["dhyana", "nirvana", "bodhisattva", "sangha"],
      bgClass: "bg-temple"
    },
    gate: {
      id: "gate",
      name: "The Guardian Gate",
      subtitle: "The Historical Import",
      description: "Two massive statues block the path to the inner sanctum. One bears Western heraldry, the other Eastern guardianship...",
      unlocked: true,
      completed: false,
      icon: "🦁",
      words: ["lokadhatu", "sattva", "hetuphala"],
      bgClass: "bg-gate"
    },
    market: {
      id: "market",
      name: "The Silk Road Market",
      subtitle: "Words Without Borders",
      description: "A bustling market where East meets West. The traders don't realize how many of their everyday words share ancient roots...",
      unlocked: false,
      completed: false,
      icon: "🏪",
      words: ["sugar", "orange", "candy", "jungle", "loot", "ginger"],
      bgClass: "bg-market"
    },
    monastery: {
      id: "monastery",
      name: "The Ancient Monastery",
      subtitle: "Sacred Translations",
      description: "Deep in the mountains, an ancient monastery holds scrolls that reveal how Sanskrit shaped Buddhist vocabulary across Asia...",
      unlocked: false,
      completed: false,
      icon: "📜",
      words: ["kshana", "samsara", "moksha", "kalpa", "mara", "manovijnana"],
      bgClass: "bg-monastery"
    },
    forge: {
      id: "forge",
      name: "The Spell Forge",
      subtitle: "The Source Code of Magic",
      description: "The ancient workshop where Sanskrit roots become power. Combine elements, modifiers, and forms to craft your own spells...",
      unlocked: false,
      completed: false,
      icon: "⚒️",
      words: [],
      bgClass: "bg-forge"
    }
  }
};

// ============================================================
// PUZZLE CONFIGURATIONS
// ============================================================
const PUZZLES = {
  temple: {
    type: "trinity_chain",
    title: "The Ghost Monks' Chant",
    intro: "The temple is filled with a haunting chant. The Ghost Monks repeat a word: <span class='text-jade'>\"Chán... Chán...\"</span> The walls shimmer, showing a Western reflection: <span class='text-blue'>\"Meditation\"</span>. Your gauntlet resonates — there is a Sanskrit root that connects them both.",
    phases: [
      {
        prompt: "The monks chant 禅 (Chán). The walls show \"Meditation.\" What is the Source Word?",
        sanskrit_answer: "dhyana",
        options: ["Dhyāna", "Karma", "Yoga", "Nirvāṇa"],
        correct: 0,
        chain: ["Dhyāna (Sanskrit)", "禅 Chán (Chinese)", "Zen (Japanese)", "Meditation (English)"],
        revelation: "The word traveled the Silk Road: <span class='text-gold'>Dhyāna</span> → <span class='text-jade'>禅 Chán</span> → Zen → <span class='text-blue'>Meditation</span>. One practice, many names, one root.",
        wordUnlock: "dhyana"
      },
      {
        prompt: "The fog clears to reveal an inscription. On one side: <span class='text-blue'>\"Liberation from suffering\"</span>. On the other: <span class='text-jade'>涅槃 (nièpán)</span>. What root connects them?",
        sanskrit_answer: "nirvana",
        options: ["Saṃsāra", "Mokṣa", "Nirvāṇa", "Dharma"],
        correct: 2,
        chain: ["Nirvāṇa (Sanskrit)", "涅槃 nièpán (Chinese)", "Nirvana (English)"],
        revelation: "Both civilizations borrowed the same word: <span class='text-gold'>Nirvāṇa</span>. The West took it directly. The East wrote it as <span class='text-jade'>涅槃</span> — a phonetic mirror of the original sound.",
        wordUnlock: "nirvana"
      },
      {
        prompt: "A statue emerges from the mist. The Western plaque reads <span class='text-blue'>\"Enlightened One\"</span>. The Eastern inscription says <span class='text-jade'>菩萨 (púsà)</span>. What is the Source Word?",
        sanskrit_answer: "bodhisattva",
        options: ["Bodhisattva", "Arhat", "Guru", "Buddha"],
        correct: 0,
        chain: ["Bodhisattva (Sanskrit)", "菩萨 púsà (Chinese)", "Bodhisattva (English)"],
        revelation: "<span class='text-gold'>Bodhisattva</span> — one who delays their own liberation to save others. The Chinese <span class='text-jade'>菩萨</span> is a phonetic echo of this Sanskrit compassion.",
        wordUnlock: "bodhisattva"
      }
    ]
  },

  gate: {
    type: "trinity_match",
    title: "The Guardian Statues",
    intro: "Two massive statues block the path. The Western statue bears a <span class='text-blue'>heraldic Lion</span>. The Eastern statue is labeled <span class='text-jade'>狮 (Shī)</span>. Your journal reveals: lions were not native to ancient China. The symbol traveled the Silk Road. You must find the connections to open the gate.",
    pairs: [
      {
        sanskrit: "Loka-dhātu",
        english: "World",
        chinese: "世界 (shìjiè)",
        hint: "The realm of all existence",
        wordUnlock: "lokadhatu"
      },
      {
        sanskrit: "Sattva",
        english: "Sentient Beings",
        chinese: "众生 (zhòngshēng)",
        hint: "All living, feeling creatures",
        wordUnlock: "sattva"
      },
      {
        sanskrit: "Hetu-phala",
        english: "Cause and Effect",
        chinese: "因果 (yīnguǒ)",
        hint: "The universal law of consequence",
        wordUnlock: "hetuphala"
      }
    ]
  },

  market: {
    type: "speed_match",
    title: "Silk Road Speed Trading",
    intro: "The market is alive with commerce! Words flow between cultures like goods along the Silk Road. Match each English word to its Sanskrit ancestor before time runs out!",
    pairs: [
      { english: "Sugar", sanskrit: "Śarkarā", hint: "Gravel → crystallized sweetness", wordUnlock: "sugar" },
      { english: "Orange", sanskrit: "Nāraṅga", hint: "A fruit that carried its name across continents", wordUnlock: "orange" },
      { english: "Candy", sanskrit: "Khaṇḍa", hint: "A 'piece' of sugar", wordUnlock: "candy" },
      { english: "Jungle", sanskrit: "Jaṅgala", hint: "Uncultivated wasteland", wordUnlock: "jungle" },
      { english: "Loot", sanskrit: "Luṇṭ", hint: "To rob or plunder", wordUnlock: "loot" },
      { english: "Ginger", sanskrit: "Śṛṅgavera", hint: "Horn-shaped root", wordUnlock: "ginger" },
    ]
  },

  monastery: {
    type: "scroll_translate",
    title: "The Sacred Scrolls",
    intro: "Ancient scrolls line the walls of the monastery. Each contains a concept that Chinese translators carefully rendered from Sanskrit — not by sound, but by <em>meaning</em>. Read each scroll and match the Sanskrit concept to its Chinese semantic translation.",
    scrolls: [
      {
        sanskrit: "Kṣaṇa",
        meaning: "The briefest moment — a flash of existence",
        chinese: "刹那 (chànà)",
        english: "Instant",
        type: "Phonetic — the Chinese sounds echo the Sanskrit",
        wordUnlock: "kshana"
      },
      {
        sanskrit: "Saṃsāra",
        meaning: "The wheel of rebirth that turns endlessly",
        chinese: "轮回 (lúnhuí)",
        english: "Reincarnation",
        type: "Semantic — 轮 (wheel) + 回 (return) captures the meaning",
        wordUnlock: "samsara"
      },
      {
        sanskrit: "Mokṣa",
        meaning: "To be released from all bonds and cycles",
        chinese: "解脱 (jiětuō)",
        english: "Liberation",
        type: "Semantic — 解 (untie) + 脱 (escape) mirrors the concept",
        wordUnlock: "moksha"
      },
      {
        sanskrit: "Kalpa",
        meaning: "A cosmic age — time beyond human comprehension",
        chinese: "劫 (jié)",
        english: "Eon",
        type: "Phonetic — a single character for an eternity",
        wordUnlock: "kalpa"
      },
      {
        sanskrit: "Māra",
        meaning: "The tempter, the lord of illusion and desire",
        chinese: "魔 (mó)",
        english: "Demon",
        type: "Phonetic — the sound of darkness crossing languages",
        wordUnlock: "mara"
      },
      {
        sanskrit: "Mano-vijñāna",
        meaning: "The mind's awareness, the sixth sense",
        chinese: "意识 (yìshí)",
        english: "Consciousness",
        type: "Semantic — 意 (mind/intent) + 识 (knowledge) = awareness",
        wordUnlock: "manovijnana"
      }
    ]
  }
};

// ============================================================
// HELPER: Get all words as flat array
// ============================================================
function getAllWords() {
  return [
    ...WORDS.phonetic,
    ...WORDS.semantic,
    ...WORDS.direct,
    ...WORDS.everyday
  ];
}

function getWordById(id) {
  return getAllWords().find(w => w.id === id);
}
