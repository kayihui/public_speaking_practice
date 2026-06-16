/**
 * App — Router, navigation, state management, and exercise orchestration.
 */

import { EXERCISES, DIFFICULTY } from './data.js';
import { Timer, updateRing, formatTime } from './timer.js';
import { AudioManager, RecordingManager } from './audio.js';

// Dynamic imports for exercise modules
const exerciseModules = {
  'word-riff':      () => import('./exercises/word-riff.js'),
  'conductor':      () => import('./exercises/conductor.js'),
  'headline-drill': () => import('./exercises/headline-drill.js'),
  'telescoping':    () => import('./exercises/telescoping.js'),
};

/* ═══════════════════════════════════════════════════════════════════════════
   Global State
   ═══════════════════════════════════════════════════════════════════════════ */

const state = {
  currentView: 'home',
  currentExercise: null,  // exercise id string
  difficulty: 'easy',
  duration: 3,            // minutes
  recordingEnabled: false,
  muted: false,
};

const audio = new AudioManager();
const recorder = new RecordingManager();

let activeTimer = null;
let activeExercise = null; // the exercise module instance

/* ═══════════════════════════════════════════════════════════════════════════
   DOM References
   ═══════════════════════════════════════════════════════════════════════════ */

const views = {
  home:     document.getElementById('view-home'),
  config:   document.getElementById('view-config'),
  session:  document.getElementById('view-session'),
  complete: document.getElementById('view-complete'),
};

const els = {
  // Home
  exerciseGrid: document.getElementById('exercise-grid'),

  // Config
  configIcon:        document.getElementById('config-icon'),
  configTitle:       document.getElementById('config-title'),
  configDescription: document.getElementById('config-description'),
  configDuration:    document.getElementById('config-duration'),
  configDurationDisplay: document.getElementById('config-duration-display'),
  configDifficulty:  document.getElementById('config-difficulty'),
  configDifficultyDesc: document.getElementById('config-difficulty-desc'),
  configRecording:   document.getElementById('config-recording'),
  configStartBtn:    document.getElementById('config-start-btn'),
  configBackBtn:     document.getElementById('config-back-btn'),

  // Session
  sessionExerciseName: document.getElementById('session-exercise-name'),
  sessionMuteBtn:      document.getElementById('session-mute-btn'),
  sessionRecIndicator: document.getElementById('session-recording-indicator'),
  timerContainer:      document.getElementById('timer-container'),
  timerRingProgress:   document.getElementById('timer-ring-progress'),
  timerTime:           document.getElementById('timer-time'),
  timerLabel:          document.getElementById('timer-label'),
  exerciseContent:     document.getElementById('exercise-content'),
  sessionPauseBtn:     document.getElementById('session-pause-btn'),
  sessionStopBtn:      document.getElementById('session-stop-btn'),

  // Complete
  completeSubtitle:  document.getElementById('complete-subtitle'),
  completeStats:     document.getElementById('complete-stats'),
  completeRecording: document.getElementById('complete-recording'),
  completeAudio:       document.getElementById('complete-audio'),
  completeDownloadBtn: document.getElementById('complete-download-btn'),
  completeRetryBtn:    document.getElementById('complete-retry-btn'),
  completeHomeBtn:     document.getElementById('complete-home-btn'),
};


/* ═══════════════════════════════════════════════════════════════════════════
   View Management
   ═══════════════════════════════════════════════════════════════════════════ */

function showView(viewName) {
  // Remove active from all
  Object.values(views).forEach(v => v.classList.remove('active'));

  // Activate target
  const target = views[viewName];
  if (target) {
    target.classList.add('active');
    state.currentView = viewName;
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   Home View — Build Exercise Cards
   ═══════════════════════════════════════════════════════════════════════════ */

function buildExerciseCards() {
  els.exerciseGrid.innerHTML = '';

  Object.values(EXERCISES).forEach(exercise => {
    const card = document.createElement('div');
    card.className = 'glass-card exercise-card';
    card.dataset.exercise = exercise.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Start ${exercise.name}`);

    card.innerHTML = `
      <span class="exercise-card__icon">${exercise.icon}</span>
      <h3 class="exercise-card__name">${exercise.name}</h3>
      <p class="exercise-card__desc">${exercise.shortDesc}</p>
    `;

    card.addEventListener('click', () => openConfig(exercise.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openConfig(exercise.id);
      }
    });

    els.exerciseGrid.appendChild(card);
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   Config View
   ═══════════════════════════════════════════════════════════════════════════ */

function openConfig(exerciseId) {
  const exercise = EXERCISES[exerciseId];
  if (!exercise) return;

  state.currentExercise = exerciseId;
  state.duration = exercise.defaultDuration;
  state.difficulty = 'easy';

  // Populate config UI
  els.configIcon.textContent = exercise.icon;
  els.configTitle.textContent = exercise.name;
  els.configDescription.textContent = exercise.description;

  // Duration slider
  els.configDuration.value = exercise.defaultDuration;
  els.configDurationDisplay.textContent = `${exercise.defaultDuration} min`;

  // Reset difficulty to easy
  els.configDifficulty.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.difficulty === 'easy');
    btn.setAttribute('aria-checked', btn.dataset.difficulty === 'easy');
  });
  updateDifficultyDesc();

  // Reset recording toggle
  els.configRecording.checked = false;
  state.recordingEnabled = false;

  showView('config');
}

function updateDifficultyDesc() {
  const config = DIFFICULTY[state.currentExercise];
  if (config && config[state.difficulty]) {
    els.configDifficultyDesc.textContent = config[state.difficulty].label;
  } else {
    els.configDifficultyDesc.textContent = '';
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   Session — Start, Pause, Stop
   ═══════════════════════════════════════════════════════════════════════════ */

async function startSession() {
  const exercise = EXERCISES[state.currentExercise];
  if (!exercise) return;

  // Handle recording
  if (state.recordingEnabled) {
    const granted = await recorder.requestPermission();
    if (!granted) {
      state.recordingEnabled = false;
      els.configRecording.checked = false;
      // Continue without recording
    }
  }

  // Set session UI
  els.sessionExerciseName.textContent = exercise.name;
  els.sessionPauseBtn.textContent = '⏸ Pause';
  els.sessionPauseBtn.disabled = false;
  els.sessionStopBtn.disabled = false;

  // Mute state
  els.sessionMuteBtn.textContent = audio.muted ? '🔇' : '🔊';

  // Recording indicator
  if (state.recordingEnabled) {
    els.sessionRecIndicator.classList.remove('hidden');
  } else {
    els.sessionRecIndicator.classList.add('hidden');
  }

  // Reset timer ring
  updateRing(els.timerRingProgress, 0);
  els.timerContainer.classList.remove('warning', 'danger');

  // Load exercise module
  const mod = await exerciseModules[state.currentExercise]();
  activeExercise = mod;

  const durationSecs = state.duration * 60;
  const difficultyConfig = DIFFICULTY[state.currentExercise]?.[state.difficulty] || {};

  showView('session');

  // Small delay for view transition, then start
  await sleep(100);

  // Initialize the exercise
  activeExercise.init({
    container: els.exerciseContent,
    duration: durationSecs,
    difficulty: state.difficulty,
    difficultyConfig,
    audio,
    onTimerUpdate: (remaining, label) => {
      // Allow exercise to override timer display (e.g., Telescoping shows round time)
      els.timerTime.textContent = formatTime(remaining);
      if (label) els.timerLabel.textContent = label;
    },
    onTimerRingUpdate: (fraction) => {
      updateRing(els.timerRingProgress, fraction);
    },
    onTimerWarning: (remaining) => {
      els.timerContainer.classList.toggle('danger', remaining <= 3);
      els.timerContainer.classList.toggle('warning', remaining > 3 && remaining <= 10);
    },
    onComplete: () => {
      finishSession();
    },
  });

  // Start recording
  if (state.recordingEnabled) {
    recorder.start();
  }

  // Play start sound
  audio.playStart();

  // Start exercise
  activeExercise.start();
}

function togglePause() {
  if (!activeExercise) return;

  if (activeExercise.isPaused?.()) {
    activeExercise.resume();
    els.sessionPauseBtn.textContent = '⏸ Pause';
    if (state.recordingEnabled) {
      recorder.resume();
      els.sessionRecIndicator.classList.remove('hidden');
    }
  } else {
    activeExercise.pause();
    els.sessionPauseBtn.textContent = '▶ Resume';
    if (state.recordingEnabled) {
      recorder.pause();
    }
  }
}

async function stopSession() {
  if (activeExercise) {
    activeExercise.stop();
  }
  await finishSession();
}

async function finishSession() {
  const exercise = EXERCISES[state.currentExercise];

  // Stop recording
  let audioUrl = null;
  if (state.recordingEnabled && recorder.isRecording) {
    audioUrl = await recorder.stop();
  }

  // Get results from exercise module
  const results = activeExercise?.getResults?.() || {};

  // Play completion chime
  audio.playChime();

  // Build complete view
  els.completeSubtitle.textContent = `${exercise.name} — ${state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1)}`;

  // Build stats
  els.completeStats.innerHTML = '';
  const statsData = [
    { value: formatTime(state.duration * 60), label: 'Duration' },
    ...(results.stats || []),
  ];

  statsData.forEach(stat => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <div class="stat-card__value">${stat.value}</div>
      <div class="stat-card__label">${stat.label}</div>
    `;
    els.completeStats.appendChild(card);
  });

  // Recording playback + download
  if (audioUrl) {
    els.completeRecording.style.display = 'block';
    els.completeAudio.src = audioUrl;
    // Store URL for download button
    els.completeDownloadBtn._audioUrl = audioUrl;
    els.completeDownloadBtn._exerciseName = exercise.id;
  } else {
    els.completeRecording.style.display = 'none';
    els.completeAudio.src = '';
  }

  // Clean up
  els.timerContainer.classList.remove('warning', 'danger');

  showView('complete');
}


/* ═══════════════════════════════════════════════════════════════════════════
   Event Listeners
   ═══════════════════════════════════════════════════════════════════════════ */

function bindEvents() {
  // Config — Duration slider
  els.configDuration.addEventListener('input', () => {
    state.duration = parseInt(els.configDuration.value, 10);
    els.configDurationDisplay.textContent = `${state.duration} min`;
  });

  // Config — Difficulty buttons
  els.configDifficulty.addEventListener('click', (e) => {
    const btn = e.target.closest('.difficulty-btn');
    if (!btn) return;
    state.difficulty = btn.dataset.difficulty;
    els.configDifficulty.querySelectorAll('.difficulty-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-checked', b === btn);
    });
    updateDifficultyDesc();
  });

  // Config — Recording toggle
  els.configRecording.addEventListener('change', () => {
    state.recordingEnabled = els.configRecording.checked;
  });

  // Config — Start
  els.configStartBtn.addEventListener('click', startSession);

  // Config — Back
  els.configBackBtn.addEventListener('click', () => {
    showView('home');
  });

  // Session — Pause
  els.sessionPauseBtn.addEventListener('click', togglePause);

  // Session — Stop
  els.sessionStopBtn.addEventListener('click', stopSession);

  // Session — Mute
  els.sessionMuteBtn.addEventListener('click', () => {
    const muted = audio.toggleMute();
    els.sessionMuteBtn.textContent = muted ? '🔇' : '🔊';
  });

  // Complete — Download Recording
  els.completeDownloadBtn.addEventListener('click', () => {
    const url = els.completeDownloadBtn._audioUrl;
    if (!url) return;
    const name = els.completeDownloadBtn._exerciseName || 'session';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultra-speaking-${name}-${timestamp}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // Complete — Retry
  els.completeRetryBtn.addEventListener('click', () => {
    recorder.release();
    openConfig(state.currentExercise);
  });

  // Complete — Home
  els.completeHomeBtn.addEventListener('click', () => {
    recorder.release();
    showView('home');
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   Utilities
   ═══════════════════════════════════════════════════════════════════════════ */

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}


/* ═══════════════════════════════════════════════════════════════════════════
   Init
   ═══════════════════════════════════════════════════════════════════════════ */

function init() {
  buildExerciseCards();
  bindEvents();
  showView('home');
}

// Boot
init();
