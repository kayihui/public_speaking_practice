/**
 * Word Association Riff — Exercise Module
 *
 * A random word appears. User speaks freely, associating ideas.
 * New words appear at intervals based on difficulty.
 */

import { WORDS, pickRandom, shuffle } from '../data.js';
import { Timer, updateRing, formatTime } from '../timer.js';

let timer = null;
let wordTimer = null;
let container = null;
let config = {};
let callbacks = {};
let wordsShown = [];
let currentWordEl = null;
let wordPool = [];
let paused = false;

export function init(opts) {
  container = opts.container;
  config = opts;
  callbacks = {
    onTimerUpdate: opts.onTimerUpdate,
    onTimerRingUpdate: opts.onTimerRingUpdate,
    onTimerWarning: opts.onTimerWarning,
    onComplete: opts.onComplete,
  };
  wordsShown = [];
  paused = false;

  // Build word pool from difficulty
  const difficulty = opts.difficulty || 'easy';
  wordPool = shuffle([...WORDS[difficulty]]);

  // Render initial UI
  container.innerHTML = `
    <div class="word-riff__word" id="wr-word"></div>
    <div class="word-riff__counter" id="wr-counter"></div>
    <div class="word-riff__history" id="wr-history"></div>
  `;

  // Create main timer
  timer = new Timer({
    duration: opts.duration,
    onTick: ({ remaining, fraction }) => {
      callbacks.onTimerUpdate?.(remaining, 'remaining');
      callbacks.onTimerRingUpdate?.(fraction);
      // Countdown sounds
      if (remaining <= 5 && remaining > 0 && Math.ceil(remaining) === remaining) {
        if (remaining <= 1) opts.audio?.playFinalTick();
        else opts.audio?.playTick();
      }
    },
    onWarning: ({ remaining }) => {
      callbacks.onTimerWarning?.(remaining);
    },
    onComplete: () => {
      clearInterval(wordTimer);
      callbacks.onComplete?.();
    },
    warningAt: 10,
  });
}

export function start() {
  // Show first word
  showNextWord();

  // Start word rotation timer
  const intervalSecs = config.difficultyConfig?.wordInterval || 15;
  wordTimer = setInterval(() => {
    if (!paused) showNextWord();
  }, intervalSecs * 1000);

  // Start countdown
  timer.start();
}

export function pause() {
  paused = true;
  timer.pause();
}

export function resume() {
  paused = false;
  timer.resume();
}

export function isPaused() {
  return paused;
}

export function stop() {
  paused = false;
  timer?.stop();
  clearInterval(wordTimer);
  wordTimer = null;
}

export function getResults() {
  return {
    stats: [
      { value: String(wordsShown.length), label: 'Words Shown' },
      { value: `${config.difficultyConfig?.wordInterval || 15}s`, label: 'Word Interval' },
    ],
    words: [...wordsShown],
  };
}

/* ─── Internal ───────────────────────────────────────────────────────────── */

function showNextWord() {
  // Recycle pool if exhausted
  if (wordPool.length === 0) {
    wordPool = shuffle([...WORDS[config.difficulty || 'easy']]);
  }

  const word = wordPool.pop();
  wordsShown.push(word);

  const wordEl = document.getElementById('wr-word');
  const counterEl = document.getElementById('wr-counter');
  const historyEl = document.getElementById('wr-history');

  if (!wordEl) return;

  // Animate out old word, then in new word
  if (wordsShown.length > 1) {
    wordEl.classList.add('exiting');
    config.audio?.playNewWord();

    setTimeout(() => {
      wordEl.textContent = word;
      wordEl.classList.remove('exiting');
      // Re-trigger enter animation
      wordEl.style.animation = 'none';
      wordEl.offsetHeight; // force reflow
      wordEl.style.animation = '';
    }, 300);
  } else {
    wordEl.textContent = word;
  }

  // Update counter
  if (counterEl) {
    counterEl.textContent = `Word ${wordsShown.length}`;
  }

  // Update history (show past words as pills)
  if (historyEl && wordsShown.length > 1) {
    const pill = document.createElement('span');
    pill.className = 'word-riff__history-item';
    pill.textContent = wordsShown[wordsShown.length - 2]; // previous word
    historyEl.appendChild(pill);
  }
}
