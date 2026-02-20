// ============================================================
// MANTRA: THE RESONANT WORLD — Game Engine
// Scene management, puzzle mechanics, and UI logic
// ============================================================

class MantraGame {
  constructor() {
    // Game state
    this.currentScene = 'title';
    this.introSlide = 0;
    this.discoveredWords = new Set();
    this.discoveredSpells = new Map();
    this.completedScenes = new Set();
    this.forgeSlots = [null, null, null];
    this.lexiconFilter = 'all';

    // Puzzle state
    this.currentPuzzle = null;
    this.puzzlePhase = 0;
    this.matchState = null;
    this.speedState = null;

    // Init
    this.initParticles();
    this.render();
  }

  // ============================================================
  // SCENE MANAGEMENT
  // ============================================================
  switchScene(sceneName) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const scene = document.getElementById(`scene-${sceneName}`);
    if (scene) {
      scene.classList.add('active');
      this.currentScene = sceneName;
    }
  }

  // ============================================================
  // TITLE SCREEN
  // ============================================================
  startIntro() {
    this.introSlide = 0;
    this.switchScene('intro');
    this.renderIntroSlide();
  }

  // ============================================================
  // STORY INTRO
  // ============================================================
  renderIntroSlide() {
    const slides = STORY.intro;
    const slide = slides[this.introSlide];
    const progress = ((this.introSlide + 1) / slides.length) * 100;

    document.getElementById('intro-progress-bar').style.width = `${progress}%`;
    
    const titleEl = document.getElementById('intro-title');
    const textEl = document.getElementById('intro-text');
    const slideContainer = document.getElementById('intro-slide');

    // Animate slide change
    slideContainer.style.animation = 'none';
    slideContainer.offsetHeight; // trigger reflow
    slideContainer.style.animation = 'fadeIn 0.5s ease';

    titleEl.textContent = slide.title;
    textEl.innerHTML = slide.text;

    // Update button text
    const nextBtn = document.getElementById('btn-intro-next');
    if (this.introSlide >= slides.length - 1) {
      nextBtn.innerHTML = 'Enter the World <span class="btn-arrow">→</span>';
    } else {
      nextBtn.innerHTML = 'Continue <span class="btn-arrow">→</span>';
    }
  }

  nextIntroSlide() {
    const slides = STORY.intro;
    if (this.introSlide < slides.length - 1) {
      this.introSlide++;
      this.renderIntroSlide();
    } else {
      this.showMap();
    }
  }

  skipIntro() {
    this.showMap();
  }

  // ============================================================
  // WORLD MAP
  // ============================================================
  showMap() {
    // Clean up any active timers
    if (this.speedState && this.speedState.timer) {
      clearInterval(this.speedState.timer);
      this.speedState.timer = null;
    }
    this.switchScene('map');
    this.renderMap();
  }

  renderMap() {
    const grid = document.getElementById('map-grid');
    grid.innerHTML = '';

    const scenes = STORY.scenes;
    for (const key of Object.keys(scenes)) {
      const scene = scenes[key];
      const isUnlocked = scene.unlocked || this.isSceneUnlocked(key);
      const isCompleted = this.completedScenes.has(key);

      const card = document.createElement('div');
      card.className = `map-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;
      
      card.innerHTML = `
        <div class="map-card-icon">${scene.icon}</div>
        <div class="map-card-name">${scene.name}</div>
        <div class="map-card-subtitle">${scene.subtitle}</div>
        <div class="map-card-desc">${scene.description}</div>
        ${!isUnlocked ? '<div class="map-card-locked-label">🔒 Complete previous areas to unlock</div>' : ''}
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => this.enterLocation(key));
      }

      grid.appendChild(card);
    }

    // Update stats
    document.getElementById('stat-words').textContent = this.discoveredWords.size;
    document.getElementById('stat-spells').textContent = this.discoveredSpells.size;
    document.getElementById('stat-scenes').textContent = this.completedScenes.size;
  }

  isSceneUnlocked(sceneId) {
    const order = ['temple', 'gate', 'market', 'monastery', 'forge'];
    const idx = order.indexOf(sceneId);
    if (idx <= 0) return true;
    // Unlock if previous scene is completed
    return this.completedScenes.has(order[idx - 1]);
  }

  // ============================================================
  // LOCATION ENTRY
  // ============================================================
  enterLocation(locationId) {
    if (locationId === 'forge') {
      this.showForge();
      return;
    }

    // Clean up any active timers
    if (this.speedState && this.speedState.timer) {
      clearInterval(this.speedState.timer);
      this.speedState.timer = null;
    }

    this.switchScene('location');
    const scene = STORY.scenes[locationId];
    const puzzle = PUZZLES[locationId];
    const container = document.getElementById('location-container');

    container.innerHTML = `
      <div class="location-header">
        <div class="location-back">
          <button class="btn btn-ghost btn-back" onclick="game.showMap()">← Back to Map</button>
        </div>
        <div class="map-card-icon" style="font-size:3em;">${scene.icon}</div>
        <h2 class="location-name">${scene.name}</h2>
        <div class="location-subtitle">${scene.subtitle}</div>
      </div>
      <div class="location-intro">
        <div class="scene-title">${puzzle.title}</div>
        <p>${puzzle.intro}</p>
      </div>
      <div id="puzzle-area"></div>
    `;

    // Start the appropriate puzzle
    switch (puzzle.type) {
      case 'trinity_chain':
        this.startTrinityChain(locationId);
        break;
      case 'trinity_match':
        this.startTrinityMatch(locationId);
        break;
      case 'speed_match':
        this.startSpeedMatch(locationId);
        break;
      case 'scroll_translate':
        this.startScrollTranslate(locationId);
        break;
    }
  }

  // ============================================================
  // PUZZLE: TRINITY CHAIN (Temple)
  // ============================================================
  startTrinityChain(locationId) {
    this.currentPuzzle = locationId;
    this.puzzlePhase = 0;
    this.renderTrinityChainPhase();
  }

  renderTrinityChainPhase() {
    const puzzle = PUZZLES[this.currentPuzzle];
    const phase = puzzle.phases[this.puzzlePhase];
    const area = document.getElementById('puzzle-area');

    area.innerHTML = `
      <div class="puzzle-phase" id="current-phase">
        <div class="puzzle-prompt">${phase.prompt}</div>
        <div class="puzzle-options" id="puzzle-options">
          ${phase.options.map((opt, i) => `
            <button class="puzzle-option" data-index="${i}" onclick="game.selectTrinityOption(${i})">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="phase-feedback"></div>
      </div>
      <div style="text-align:center; margin-top:1em; font-family:var(--font-ui); font-size:0.85rem; color:var(--text-dim);">
        Phase ${this.puzzlePhase + 1} of ${puzzle.phases.length}
      </div>
    `;
  }

  selectTrinityOption(index) {
    const puzzle = PUZZLES[this.currentPuzzle];
    const phase = puzzle.phases[this.puzzlePhase];
    const options = document.querySelectorAll('.puzzle-option');

    if (index === phase.correct) {
      // Correct!
      options[index].classList.add('correct');
      options.forEach(o => o.classList.add('disabled'));

      // Unlock word
      this.discoverWord(phase.wordUnlock);

      // Show chain and revelation
      const feedback = document.getElementById('phase-feedback');
      const chainHTML = phase.chain.map(word => {
        let cls = 'english';
        if (word.includes('Sanskrit')) cls = 'sanskrit';
        else if (word.includes('Chinese') || word.includes('chán') || word.includes('Chán') || /[\u4e00-\u9fff]/.test(word)) cls = 'chinese';
        else if (word.includes('Japanese')) cls = 'japanese';
        return `<span class="chain-word ${cls}">${word}</span>`;
      }).join('<span class="chain-arrow">→</span>');

      feedback.innerHTML = `
        <div class="word-chain">${chainHTML}</div>
        <div class="puzzle-revelation">${phase.revelation}</div>
        <div style="text-align:center; margin-top:1.5em;">
          <button class="btn btn-gold" onclick="game.nextTrinityPhase()">
            ${this.puzzlePhase < puzzle.phases.length - 1 ? 'Next Puzzle →' : 'Complete Scene ✓'}
          </button>
        </div>
      `;
    } else {
      // Wrong
      options[index].classList.add('wrong');
      setTimeout(() => options[index].classList.remove('wrong'), 500);
    }
  }

  nextTrinityPhase() {
    const puzzle = PUZZLES[this.currentPuzzle];
    if (this.puzzlePhase < puzzle.phases.length - 1) {
      this.puzzlePhase++;
      this.renderTrinityChainPhase();
    } else {
      this.completeScene(this.currentPuzzle);
    }
  }

  // ============================================================
  // PUZZLE: TRINITY MATCH (Gate)
  // ============================================================
  startTrinityMatch(locationId) {
    this.currentPuzzle = locationId;
    const puzzle = PUZZLES[locationId];
    
    // Pre-shuffle once so order stays consistent during the puzzle
    const pairs = puzzle.pairs.map((p, i) => ({ ...p, index: i, matched: false }));
    this.matchState = {
      pairs: pairs,
      shuffledSanskrit: this.shuffleArray(pairs.map(p => p.sanskrit)),
      shuffledEnglish: this.shuffleArray(pairs.map(p => p.english)),
      shuffledChinese: this.shuffleArray(pairs.map(p => p.chinese)),
      selected: null,
      selectedColumn: null,
      matchedCount: 0,
      currentPairIndex: 0
    };

    this.renderTrinityMatch();
  }

  renderTrinityMatch() {
    const puzzle = PUZZLES[this.currentPuzzle];
    const state = this.matchState;
    const area = document.getElementById('puzzle-area');

    // Check if all matched
    if (state.matchedCount >= state.pairs.length) {
      this.completeScene(this.currentPuzzle);
      return;
    }

    // Use the pre-shuffled order for consistent display
    const allSanskrit = state.shuffledSanskrit;
    const allEnglish = state.shuffledEnglish;
    const allChinese = state.shuffledChinese;

    // Show hint for the next unmatched pair
    const nextUnmatched = state.pairs.find(p => !p.matched);
    const hintText = nextUnmatched ? nextUnmatched.hint : '';

    area.innerHTML = `
      <div class="puzzle-phase">
        <div class="puzzle-prompt">
          <strong>Hint:</strong> <em>${hintText}</em>
        </div>
        <div class="match-grid">
          <div>
            <div class="match-column-header sanskrit-col">Sanskrit (Source)</div>
            ${allSanskrit.map(s => `
              <div class="match-item sanskrit-item ${state.selected === s ? 'selected' : ''} ${this.isMatchedSanskrit(s) ? 'matched' : ''}" 
                   onclick="game.selectMatchItem('sanskrit', '${this.escapeAttr(s)}')">
                ${s}
              </div>
            `).join('')}
          </div>
          <div>
            <div class="match-column-header english-col">English (West)</div>
            ${allEnglish.map(e => `
              <div class="match-item english-item ${state.selected === e ? 'selected' : ''} ${this.isMatchedEnglish(e) ? 'matched' : ''}"
                   onclick="game.selectMatchItem('english', '${this.escapeAttr(e)}')">
                ${e}
              </div>
            `).join('')}
          </div>
          <div>
            <div class="match-column-header chinese-col">Chinese (East)</div>
            ${allChinese.map(c => `
              <div class="match-item chinese-item ${state.selected === c ? 'selected' : ''} ${this.isMatchedChinese(c) ? 'matched' : ''}"
                   onclick="game.selectMatchItem('chinese', '${this.escapeAttr(c)}')">
                ${c}
              </div>
            `).join('')}
          </div>
        </div>
        <div class="match-hint" id="match-hint">Select a Sanskrit word, then its English or Chinese counterpart</div>
        <div style="text-align:center; margin-top:1em; font-family:var(--font-ui); font-size:0.85rem; color:var(--text-dim);">
          Matched: ${state.matchedCount} / ${state.pairs.length}
        </div>
      </div>
    `;
  }

  isMatchedSanskrit(s) {
    return this.matchState.pairs.some(p => p.matched && p.sanskrit === s);
  }
  isMatchedEnglish(e) {
    return this.matchState.pairs.some(p => p.matched && p.english === e);
  }
  isMatchedChinese(c) {
    return this.matchState.pairs.some(p => p.matched && p.chinese === c);
  }

  selectMatchItem(column, value) {
    const state = this.matchState;
    
    // If nothing selected yet, select this
    if (!state.selectedColumn) {
      state.selected = value;
      state.selectedColumn = column;
      state.selectedValue = value;
      this.renderTrinityMatch();
      return;
    }

    // If same column, switch selection
    if (state.selectedColumn === column) {
      state.selected = value;
      state.selectedValue = value;
      this.renderTrinityMatch();
      return;
    }

    // Different columns - check for a match
    // We need to collect all three to match. Let's use a simpler approach:
    // Select Sanskrit first, then either English or Chinese
    if (state.selectedColumn !== 'sanskrit' && column !== 'sanskrit') {
      // Need Sanskrit first
      state.selected = value;
      state.selectedColumn = column;
      state.selectedValue = value;
      const hint = document.getElementById('match-hint');
      if (hint) hint.textContent = 'Start by selecting a Sanskrit word first!';
      this.renderTrinityMatch();
      return;
    }

    // One is Sanskrit, one is English or Chinese
    const sanskritVal = state.selectedColumn === 'sanskrit' ? state.selectedValue : value;
    const otherVal = state.selectedColumn === 'sanskrit' ? value : state.selectedValue;
    const otherCol = state.selectedColumn === 'sanskrit' ? column : state.selectedColumn;

    // Find matching pair
    const matchPair = state.pairs.find(p => 
      !p.matched && p.sanskrit === sanskritVal && 
      (otherCol === 'english' ? p.english === otherVal : p.chinese === otherVal)
    );

    if (matchPair) {
      matchPair.matched = true;
      state.matchedCount++;
      this.discoverWord(matchPair.wordUnlock);
      this.showToast('✨', `Connection found: ${matchPair.sanskrit}`);
      
      // Check if need more matches for this pair's other column
      // Actually let's check if all pairs matched
      if (state.matchedCount >= state.pairs.length) {
        setTimeout(() => this.completeScene(this.currentPuzzle), 800);
      }
    } else {
      this.showToast('❌', 'That connection doesn\'t resonate...');
    }

    state.selected = null;
    state.selectedColumn = null;
    state.selectedValue = null;
    this.renderTrinityMatch();
  }

  // ============================================================
  // PUZZLE: SPEED MATCH (Market)
  // ============================================================
  startSpeedMatch(locationId) {
    this.currentPuzzle = locationId;
    const puzzle = PUZZLES[locationId];

    this.speedState = {
      pairs: this.shuffleArray([...puzzle.pairs]),
      currentIndex: 0,
      score: 0,
      timeLeft: 60,
      timer: null,
      active: true
    };

    this.renderSpeedMatch();
    this.startSpeedTimer();
  }

  startSpeedTimer() {
    this.speedState.timer = setInterval(() => {
      this.speedState.timeLeft--;
      this.updateSpeedTimer();
      if (this.speedState.timeLeft <= 0) {
        this.endSpeedMatch();
      }
    }, 1000);
  }

  updateSpeedTimer() {
    const fill = document.querySelector('.speed-timer-fill');
    const text = document.querySelector('.speed-timer-text');
    if (fill) fill.style.width = `${(this.speedState.timeLeft / 60) * 100}%`;
    if (text) text.textContent = `${this.speedState.timeLeft}s remaining`;
  }

  renderSpeedMatch() {
    const state = this.speedState;
    const area = document.getElementById('puzzle-area');

    if (state.currentIndex >= state.pairs.length) {
      this.endSpeedMatch();
      return;
    }

    const pair = state.pairs[state.currentIndex];
    
    // Create wrong options
    const allSanskrit = PUZZLES[this.currentPuzzle].pairs.map(p => p.sanskrit);
    const wrongOptions = allSanskrit.filter(s => s !== pair.sanskrit);
    const options = this.shuffleArray([pair.sanskrit, ...this.shuffleArray(wrongOptions).slice(0, 3)]);

    area.innerHTML = `
      <div class="puzzle-phase">
        <div class="speed-timer">
          <div class="speed-timer-bar">
            <div class="speed-timer-fill" style="width:${(state.timeLeft / 60) * 100}%"></div>
          </div>
          <div class="speed-timer-text">${state.timeLeft}s remaining</div>
        </div>
        <div class="speed-pair">
          <div class="speed-english">${pair.english}</div>
          <div class="speed-hint">${pair.hint}</div>
        </div>
        <div class="speed-options">
          ${options.map(opt => `
            <button class="puzzle-option" onclick="game.selectSpeedOption('${this.escapeAttr(opt)}', '${this.escapeAttr(pair.sanskrit)}', '${pair.wordUnlock}')">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div class="speed-score">
          <span class="speed-score-value">Score: ${state.score} / ${state.pairs.length}</span>
        </div>
      </div>
    `;
  }

  selectSpeedOption(selected, correct, wordUnlock) {
    if (!this.speedState.active) return;

    const options = document.querySelectorAll('.puzzle-option');
    
    if (selected === correct) {
      this.speedState.score++;
      this.discoverWord(wordUnlock);
      
      // Highlight correct
      options.forEach(o => {
        if (o.textContent.trim() === selected) o.classList.add('correct');
        o.classList.add('disabled');
      });

      this.showToast('✨', `Correct! ${selected} → ${this.speedState.pairs[this.speedState.currentIndex].english}`);
    } else {
      // Highlight wrong and correct
      options.forEach(o => {
        const text = o.textContent.trim();
        if (text === selected) o.classList.add('wrong');
        if (text === correct) o.classList.add('correct');
        o.classList.add('disabled');
      });
    }

    // Next pair after brief delay
    setTimeout(() => {
      this.speedState.currentIndex++;
      if (this.speedState.currentIndex >= this.speedState.pairs.length) {
        this.endSpeedMatch();
      } else {
        this.renderSpeedMatch();
      }
    }, 800);
  }

  endSpeedMatch() {
    if (this.speedState.timer) {
      clearInterval(this.speedState.timer);
      this.speedState.timer = null;
    }
    this.speedState.active = false;
    this.completeScene(this.currentPuzzle);
  }

  // ============================================================
  // PUZZLE: SCROLL TRANSLATE (Monastery)
  // ============================================================
  startScrollTranslate(locationId) {
    this.currentPuzzle = locationId;
    const puzzle = PUZZLES[locationId];
    this.scrollRevealed = new Set();
    this.renderScrollTranslate();
  }

  renderScrollTranslate() {
    const puzzle = PUZZLES[this.currentPuzzle];
    const area = document.getElementById('puzzle-area');

    area.innerHTML = `
      <div id="scrolls-container">
        ${puzzle.scrolls.map((scroll, i) => `
          <div class="scroll-card ${this.scrollRevealed.has(i) ? 'revealed' : ''}" id="scroll-${i}">
            <div class="scroll-sanskrit">${scroll.sanskrit}</div>
            <div class="scroll-meaning">"${scroll.meaning}"</div>
            <div class="scroll-translations">
              <div class="scroll-translation chinese">
                <small>Chinese</small><br>${scroll.chinese}
              </div>
              <div class="scroll-translation english">
                <small>English</small><br>${scroll.english}
              </div>
            </div>
            <div class="scroll-type">${scroll.type}</div>
            ${!this.scrollRevealed.has(i) ? `
              <button class="btn btn-gold btn-small scroll-reveal-btn" onclick="game.revealScroll(${i})">
                ◈ Reveal Connection
              </button>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ${this.scrollRevealed.size >= puzzle.scrolls.length ? `
        <div style="text-align:center; margin-top:2em;">
          <button class="btn btn-gold btn-large" onclick="game.completeScene('${this.currentPuzzle}')">
            Complete Scene ✓
          </button>
        </div>
      ` : `
        <div style="text-align:center; margin-top:1em; font-family:var(--font-ui); font-size:0.85rem; color:var(--text-dim);">
          Scrolls revealed: ${this.scrollRevealed.size} / ${puzzle.scrolls.length}
        </div>
      `}
    `;
  }

  revealScroll(index) {
    const puzzle = PUZZLES[this.currentPuzzle];
    const scroll = puzzle.scrolls[index];
    
    this.scrollRevealed.add(index);
    this.discoverWord(scroll.wordUnlock);
    this.showToast('📜', `Scroll revealed: ${scroll.sanskrit}`);
    this.renderScrollTranslate();
  }

  // ============================================================
  // SCENE COMPLETION
  // ============================================================
  completeScene(sceneId) {
    this.completedScenes.add(sceneId);
    const scene = STORY.scenes[sceneId];
    
    // Discover any remaining words for this scene
    scene.words.forEach(w => this.discoverWord(w));

    // Unlock next scene
    const order = ['temple', 'gate', 'market', 'monastery', 'forge'];
    const idx = order.indexOf(sceneId);
    if (idx >= 0 && idx < order.length - 1) {
      STORY.scenes[order[idx + 1]].unlocked = true;
    }

    const area = document.getElementById('puzzle-area') || document.getElementById('location-container');
    
    const discoveredInScene = scene.words.map(wId => {
      const w = getWordById(wId);
      return w ? w.sanskrit : wId;
    }).filter(Boolean);

    area.innerHTML = `
      <div class="scene-complete">
        <div class="scene-complete-icon">✦</div>
        <h2 class="scene-complete-title">${scene.name} Complete!</h2>
        <p style="color:var(--text-secondary); margin-bottom:1em;">
          You've uncovered the connections hidden in this place.
        </p>
        <div class="scene-complete-words">
          ${discoveredInScene.map(w => `<span class="scene-complete-word">${w}</span>`).join('')}
        </div>
        <p style="color:var(--text-dim); font-family:var(--font-ui); font-size:0.85rem; margin:1em 0;">
          ${discoveredInScene.length} words added to your Lexicon
        </p>
        <div style="display:flex; gap:1em; justify-content:center; margin-top:1.5em; flex-wrap:wrap;">
          <button class="btn btn-gold" onclick="game.showMap()">
            ← Return to Map
          </button>
          <button class="btn btn-blue" onclick="game.showLexicon()">
            📖 View Lexicon
          </button>
        </div>
      </div>
    `;
  }

  // ============================================================
  // WORD DISCOVERY
  // ============================================================
  discoverWord(wordId) {
    if (this.discoveredWords.has(wordId)) return;
    this.discoveredWords.add(wordId);
    const word = getWordById(wordId);
    if (word) {
      this.showToast('📖', `New word: ${word.sanskrit}`);
    }
  }

  // ============================================================
  // LEXICON
  // ============================================================
  showLexicon() {
    this.switchScene('lexicon');
    this.renderLexicon();
  }

  filterLexicon(filter) {
    this.lexiconFilter = filter;
    document.querySelectorAll('.lexicon-tabs .tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === filter);
    });
    this.renderLexicon();
  }

  renderLexicon() {
    const grid = document.getElementById('lexicon-grid');
    const emptyEl = document.getElementById('lexicon-empty');
    
    const allWords = getAllWords().filter(w => this.discoveredWords.has(w.id));
    const filtered = this.lexiconFilter === 'all' 
      ? allWords 
      : allWords.filter(w => w.category === this.lexiconFilter);

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyEl.style.display = 'block';
      emptyEl.querySelector('p').textContent = allWords.length === 0 
        ? 'No words discovered yet. Explore the world to find them!'
        : 'No words in this category yet.';
      return;
    }

    emptyEl.style.display = 'none';
    grid.innerHTML = filtered.map(word => `
      <div class="lexicon-card" onclick="game.showWordDetail('${word.id}')">
        <div class="lexicon-card-sanskrit">${word.sanskrit}</div>
        <div class="lexicon-card-meaning">${word.meaning.substring(0, 80)}${word.meaning.length > 80 ? '...' : ''}</div>
        <div class="lexicon-card-connections">
          <span class="lexicon-tag english">${word.english}</span>
          ${word.chinese !== '—' ? `<span class="lexicon-tag chinese">${word.chinese} ${word.pinyin}</span>` : ''}
          <span class="lexicon-tag category">${word.category}</span>
        </div>
      </div>
    `).join('');
  }

  // ============================================================
  // WORD DETAIL MODAL
  // ============================================================
  showWordDetail(wordId) {
    const word = getWordById(wordId);
    if (!word) return;

    const modal = document.getElementById('modal-word');
    const content = document.getElementById('word-detail-content');

    content.innerHTML = `
      <div class="word-detail-sanskrit">${word.sanskrit}</div>
      <div class="word-detail-meaning">${word.meaning}</div>
      
      <div class="trinity">
        <div class="trinity-center">
          <div class="trinity-center-label">Sanskrit — The Source</div>
          <div class="trinity-center-word">${word.sanskrit}</div>
        </div>
        <div class="trinity-branches">
          <div class="trinity-branch english">
            <div class="trinity-branch-label">English — The Material</div>
            <div class="trinity-branch-word">${word.english}</div>
          </div>
          <div class="trinity-branch chinese">
            <div class="trinity-branch-label">Chinese — The Spiritual</div>
            <div class="trinity-branch-word">${word.chinese !== '—' ? `${word.chinese} (${word.pinyin})` : 'No direct equivalent'}</div>
          </div>
        </div>
      </div>

      <div class="word-detail-lore">${word.lore}</div>
      <div class="word-detail-category">Category: ${this.getCategoryLabel(word.category)}</div>
    `;

    modal.style.display = 'flex';
  }

  getCategoryLabel(cat) {
    const labels = {
      phonetic: 'Phonetic Transliteration (Sound-based borrowing into Chinese)',
      semantic: 'Semantic Borrowing (Meaning-based translation into Chinese)',
      direct: 'Direct English Loanword',
      everyday: 'Everyday English Word (Indirect borrowing)'
    };
    return labels[cat] || cat;
  }

  closeModal() {
    document.getElementById('modal-word').style.display = 'none';
  }

  // ============================================================
  // SPELL FORGE
  // ============================================================
  showForge() {
    this.switchScene('forge');
    this.forgeSlots = [null, null, null];
    this.renderForge();
  }

  renderForge() {
    const rootsContainer = document.getElementById('forge-roots');
    const slotsContainer = document.getElementById('forge-slots');
    const resultEl = document.getElementById('forge-result');

    // Render root buttons grouped by type
    const grouped = {
      modifier: SPELL_ROOTS.filter(r => r.type === 'modifier'),
      element: SPELL_ROOTS.filter(r => r.type === 'element'),
      suffix: SPELL_ROOTS.filter(r => r.type === 'suffix')
    };

    rootsContainer.innerHTML = `
      <div style="font-family:var(--font-ui); font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.3em;">Modifiers</div>
      ${grouped.modifier.map(r => this.renderRootButton(r)).join('')}
      <div style="font-family:var(--font-ui); font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em; margin:0.5em 0 0.3em;">Elements</div>
      ${grouped.element.map(r => this.renderRootButton(r)).join('')}
      <div style="font-family:var(--font-ui); font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em; margin:0.5em 0 0.3em;">Forms</div>
      ${grouped.suffix.map(r => this.renderRootButton(r)).join('')}
    `;

    // Render slots
    const slotLabels = ['Modifier', 'Element', 'Form'];
    slotsContainer.innerHTML = this.forgeSlots.map((slot, i) => `
      <div class="forge-slot ${slot ? 'filled' : 'empty'}" data-slot="${i}" onclick="game.clearSlot(${i})">
        ${slot ? `
          <div class="slot-content">
            <div class="slot-icon">${slot.icon}</div>
            <div class="slot-name">${slot.name}</div>
          </div>
        ` : `
          <span class="slot-label">${slotLabels[i]}</span>
        `}
      </div>
      ${i < 2 ? '<div class="forge-plus">+</div>' : ''}
    `).join('');

    resultEl.style.display = 'none';

    // Render spellbook
    this.renderSpellbook();
  }

  renderRootButton(root) {
    const isSelected = this.forgeSlots.some(s => s && s.id === root.id);
    return `
      <button class="forge-root-btn ${isSelected ? 'selected' : ''}" onclick="game.addRootToForge('${root.id}')">
        <span class="forge-root-icon">${root.icon}</span>
        <div>
          <div class="forge-root-name">${root.name}</div>
          <div class="forge-root-meaning">${root.meaning}</div>
        </div>
        <span class="forge-root-type ${root.type}">${root.type}</span>
      </button>
    `;
  }

  addRootToForge(rootId) {
    const root = SPELL_ROOTS.find(r => r.id === rootId);
    if (!root) return;

    // Find appropriate slot based on type
    let slotIndex;
    if (root.type === 'modifier') slotIndex = 0;
    else if (root.type === 'element') slotIndex = 1;
    else if (root.type === 'suffix') slotIndex = 2;

    // If that slot is taken, try to find another empty slot
    if (this.forgeSlots[slotIndex]) {
      // Replace the existing one
      this.forgeSlots[slotIndex] = root;
    } else {
      this.forgeSlots[slotIndex] = root;
    }

    this.renderForge();
  }

  clearSlot(index) {
    this.forgeSlots[index] = null;
    this.renderForge();
  }

  clearForge() {
    this.forgeSlots = [null, null, null];
    this.renderForge();
  }

  castSpell() {
    const filledSlots = this.forgeSlots.filter(Boolean);
    if (filledSlots.length === 0) {
      this.showToast('⚠️', 'Add at least one root to cast a spell!');
      return;
    }

    // Build recipe key (sorted by: modifiers, elements, suffixes)
    const key = filledSlots
      .sort((a, b) => {
        const order = { modifier: 0, element: 1, suffix: 2 };
        return order[a.type] - order[b.type];
      })
      .map(r => r.id)
      .join('+');

    const recipe = SPELL_RECIPES[key];
    const resultEl = document.getElementById('forge-result');

    if (recipe) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="forge-result-name">${recipe.name}</div>
        <div class="forge-result-desc">${recipe.desc}</div>
        <div class="forge-result-power">Power Level: ${recipe.power}/10</div>
        <div class="power-bar">
          ${Array.from({ length: 10 }, (_, i) => `
            <div class="power-pip ${i < recipe.power ? 'filled' : ''}"></div>
          `).join('')}
        </div>
      `;

      // Track discovery
      if (!this.discoveredSpells.has(key)) {
        this.discoveredSpells.set(key, recipe);
        this.showToast('⚡', `New spell crafted: ${recipe.name}!`);
        this.renderSpellbook();
      }

      // Visual spell effect
      this.showSpellEffect(recipe.effect);

      // Re-render after animation
      resultEl.style.animation = 'none';
      resultEl.offsetHeight;
      resultEl.style.animation = 'fadeInUp 0.5s ease';
    } else {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="forge-result-name" style="color:var(--text-dim);">No Resonance</div>
        <div class="forge-result-desc" style="color:var(--text-dim);">
          These roots don't combine into a known spell. Try a different combination!
          <br><small>Hint: Start with an Element, then add a Modifier or Form.</small>
        </div>
      `;
      resultEl.style.animation = 'none';
      resultEl.offsetHeight;
      resultEl.style.animation = 'fadeInUp 0.5s ease';
    }
  }

  showSpellEffect(effectType) {
    const overlay = document.createElement('div');
    overlay.className = 'spell-effect';
    
    if (effectType.includes('fire')) overlay.classList.add('fire');
    else if (effectType.includes('water') || effectType.includes('heal')) overlay.classList.add('water');
    else if (effectType.includes('wind') || effectType.includes('storm')) overlay.classList.add('wind');
    else if (effectType.includes('lightning')) overlay.classList.add('lightning');
    else if (effectType.includes('earth')) overlay.classList.add('earth');
    else if (effectType.includes('divine')) overlay.classList.add('divine');

    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1000);
  }

  renderSpellbook() {
    const list = document.getElementById('spellbook-list');
    if (this.discoveredSpells.size === 0) {
      list.innerHTML = '<p class="empty-text">Cast spells to fill your spellbook!</p>';
      return;
    }

    list.innerHTML = Array.from(this.discoveredSpells.values())
      .sort((a, b) => b.power - a.power)
      .map(spell => `
        <div class="spellbook-entry">
          <div class="spellbook-entry-name">${spell.name}</div>
          <div class="spellbook-entry-power">${'◆'.repeat(spell.power)}${'◇'.repeat(10 - spell.power)}</div>
        </div>
      `).join('');
  }

  // ============================================================
  // TOAST NOTIFICATIONS
  // ============================================================
  showToast(icon, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ============================================================
  // PARTICLE BACKGROUND
  // ============================================================
  initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.7 ? 45 : 220 // gold or blue
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  // ============================================================
  // UTILITIES
  // ============================================================
  shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  escapeAttr(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  render() {
    // Initial render - title screen is default active
  }
}

// ============================================================
// INITIALIZE GAME
// ============================================================
const game = new MantraGame();
