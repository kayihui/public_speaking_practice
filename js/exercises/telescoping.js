/**
 * Telescoping — Exercise Module
 *
 * Same topic, 3 rounds of increasing length.
 * Round ratios scale with difficulty. Brief preparation pause between rounds.
 */

import { TOPICS, pickRandom } from '../data.js';
import { Timer, formatTime } from '../timer.js';

let timer = null;
let prepTimer = null;
let container = null;
let config = {};
let callbacks = {};
let currentTopic = '';
let currentRound = 0; // 0, 1, 2
let roundDurations = []; // in seconds
let paused = false;
let prepPhase = false;

const PREP_DURATION = 5; // 5 seconds between rounds

export function init(opts) {
  container = opts.container;
  config = opts;
  callbacks = {
    onTimerUpdate: opts.onTimerUpdate,
    onTimerRingUpdate: opts.onTimerRingUpdate,
    onTimerWarning: opts.onTimerWarning,
    onComplete: opts.onComplete,
  };
  paused = false;
  currentRound = 0;
  prepPhase = false;

  // Pick topic
  const difficulty = opts.difficulty || 'easy';
  currentTopic = pickRandom(TOPICS[difficulty]);

  // Calculate round durations based on ratios
  const ratios = opts.difficultyConfig?.roundRatios || [1, 2, 3];
  const totalRatio = ratios.reduce((a, b) => a + b, 0);
  // Total speaking time = session duration minus prep pauses (2 × 5s)
  const totalSpeakingTime = opts.duration - (PREP_DURATION * 2);
  roundDurations = ratios.map(r => Math.max(Math.round((r / totalRatio) * totalSpeakingTime), 10));

  // Render UI
  renderUI();

  // Create timer for first round
  createRoundTimer(0);
}

export function start() {
  timer.start();
  config.audio?.playNewWord();
}

export function pause() {
  paused = true;
  timer?.pause();
  prepTimer?.pause();
}

export function resume() {
  paused = false;
  if (prepPhase) {
    prepTimer?.resume();
  } else {
    timer?.resume();
  }
}

export function isPaused() {
  return paused;
}

export function stop() {
  paused = false;
  timer?.stop();
  prepTimer?.stop();
}

export function getResults() {
  return {
    stats: [
      { value: '3', label: 'Rounds' },
      { value: roundDurations.map(d => formatTime(d)).join(' → '), label: 'Round Lengths' },
    ],
    topic: currentTopic,
  };
}

/* ─── Internal ───────────────────────────────────────────────────────────── */

function renderUI() {
  container.innerHTML = `
    <div class="telescoping__topic">Your topic: <em>${currentTopic}</em></div>
    <div class="telescoping__rounds" id="ts-rounds">
      ${roundDurations.map((dur, i) => `
        <div class="telescoping__round ${i === 0 ? 'active' : ''}" id="ts-round-${i}">
          <span class="telescoping__round-number">Round ${i + 1}</span>
          <span class="telescoping__round-duration">${formatTime(dur)}</span>
        </div>
        ${i < 2 ? '<div class="telescoping__round-divider"></div>' : ''}
      `).join('')}
    </div>
    <div class="telescoping__instruction" id="ts-instruction">
      Deliver your idea in ${formatTime(roundDurations[0])}
    </div>
    <div class="telescoping__scale" id="ts-scale">
      ${roundDurations.map((dur, i) => {
        const maxDur = Math.max(...roundDurations);
        const heightPercent = (dur / maxDur) * 100;
        return `<div class="telescoping__scale-bar ${i === 0 ? 'active' : ''}" id="ts-bar-${i}" style="height: ${heightPercent}%"></div>`;
      }).join('')}
    </div>
  `;
}

function createRoundTimer(roundIndex) {
  const duration = roundDurations[roundIndex];

  timer = new Timer({
    duration,
    onTick: ({ remaining, fraction }) => {
      callbacks.onTimerUpdate?.(remaining, `round ${roundIndex + 1} of 3`);
      callbacks.onTimerRingUpdate?.(fraction);

      if (remaining <= 5 && remaining > 0 && Math.ceil(remaining) === remaining) {
        if (remaining <= 1) config.audio?.playFinalTick();
        else config.audio?.playTick();
      }
    },
    onWarning: ({ remaining }) => {
      callbacks.onTimerWarning?.(remaining);
    },
    onComplete: () => {
      onRoundComplete(roundIndex);
    },
    warningAt: Math.min(10, duration / 2),
  });
}

function onRoundComplete(roundIndex) {
  // Mark round as complete
  const roundEl = document.getElementById(`ts-round-${roundIndex}`);
  const barEl = document.getElementById(`ts-bar-${roundIndex}`);
  if (roundEl) {
    roundEl.classList.remove('active');
    roundEl.classList.add('complete');
  }
  if (barEl) {
    barEl.classList.remove('active');
    barEl.classList.add('complete');
  }

  // Reset timer ring warning
  const timerContainer = document.getElementById('timer-container');
  if (timerContainer) {
    timerContainer.classList.remove('warning', 'danger');
  }

  if (roundIndex >= 2) {
    // All rounds complete
    callbacks.onComplete?.();
    return;
  }

  // Play transition sound
  config.audio?.playPhaseChange();

  // Start preparation phase
  prepPhase = true;
  const instruction = document.getElementById('ts-instruction');
  const nextRound = roundIndex + 1;

  showPrepCountdown(nextRound, () => {
    prepPhase = false;
    startNextRound(nextRound);
  });
}

function showPrepCountdown(nextRound, onDone) {
  const instruction = document.getElementById('ts-instruction');
  if (!instruction) { onDone(); return; }

  instruction.className = 'telescoping__instruction telescoping__instruction--prepare';
  instruction.textContent = `Get ready for Round ${nextRound + 1}...`;

  let count = PREP_DURATION;

  callbacks.onTimerUpdate?.(count, 'get ready');
  callbacks.onTimerRingUpdate?.(0);

  prepTimer = new Timer({
    duration: PREP_DURATION,
    onTick: ({ remaining, fraction }) => {
      callbacks.onTimerUpdate?.(remaining, 'get ready');
      callbacks.onTimerRingUpdate?.(fraction);

      const currentCount = Math.ceil(remaining);
      if (currentCount !== count && currentCount > 0) {
        count = currentCount;
        instruction.textContent = `Round ${nextRound + 1} in ${count}...`;
      }
    },
    onComplete: () => {
      onDone();
    },
    warningAt: 0,
  });

  prepTimer.start();
}

function startNextRound(roundIndex) {
  currentRound = roundIndex;

  // Update UI
  const roundEl = document.getElementById(`ts-round-${roundIndex}`);
  const barEl = document.getElementById(`ts-bar-${roundIndex}`);
  const instruction = document.getElementById('ts-instruction');

  if (roundEl) roundEl.classList.add('active');
  if (barEl) barEl.classList.add('active');
  if (instruction) {
    instruction.className = 'telescoping__instruction';
    instruction.textContent = `Deliver your idea in ${formatTime(roundDurations[roundIndex])}`;
    // Re-trigger animation
    instruction.style.animation = 'none';
    instruction.offsetHeight;
    instruction.style.animation = '';
  }

  // Play start sound
  config.audio?.playNewWord();

  // Create and start new round timer
  createRoundTimer(roundIndex);
  timer.start();
}
