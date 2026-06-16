/**
 * The Headline Drill — Exercise Module
 *
 * A topic appears. User has a short "headline phase" to craft one punchy sentence,
 * then an "expand phase" to elaborate. Two-phase structure trains leading with the conclusion.
 */

import { TOPICS, pickRandom } from '../data.js';
import { Timer } from '../timer.js';

let timer = null;
let container = null;
let config = {};
let callbacks = {};
let currentTopic = '';
let currentPhase = 'headline'; // 'headline' | 'expand'
let headlinePhaseDuration = 10;
let paused = false;
let phaseTransitioned = false;
let lastTickSecond = -1;

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
  currentPhase = 'headline';
  phaseTransitioned = false;
  lastTickSecond = -1;

  // Pick topic
  const difficulty = opts.difficulty || 'easy';
  currentTopic = pickRandom(TOPICS[difficulty]);

  // Headline phase duration from difficulty config
  headlinePhaseDuration = opts.difficultyConfig?.headlinePhase || 10;

  // Render UI
  container.innerHTML = `
    <div class="headline__topic">Your topic: <em>${currentTopic}</em></div>
    <div class="headline__phase-indicator" id="hl-phases">
      <div class="headline__phase-step active" id="hl-phase-headline">
        📰 Headline
      </div>
      <div class="headline__phase-divider"></div>
      <div class="headline__phase-step" id="hl-phase-expand">
        📖 Expand
      </div>
    </div>
    <div class="headline__prompt headline__prompt--headline" id="hl-prompt">
      Craft your headline!
    </div>
  `;

  // Create timer for total session
  timer = new Timer({
    duration: opts.duration,
    onTick: ({ remaining, elapsed, fraction }) => {
      // Determine current phase
      if (elapsed >= headlinePhaseDuration && currentPhase === 'headline') {
        transitionToExpand();
      }

      // Show different info based on phase
      if (currentPhase === 'headline') {
        const headlineRemaining = Math.max(headlinePhaseDuration - elapsed, 0);
        callbacks.onTimerUpdate?.(headlineRemaining, 'headline phase');
        callbacks.onTimerRingUpdate?.(elapsed / headlinePhaseDuration);
        // Warning for headline phase
        callbacks.onTimerWarning?.(headlineRemaining);
      } else {
        callbacks.onTimerUpdate?.(remaining, 'expand phase');
        const expandElapsed = elapsed - headlinePhaseDuration;
        const expandTotal = opts.duration - headlinePhaseDuration;
        callbacks.onTimerRingUpdate?.(expandElapsed / expandTotal);
        callbacks.onTimerWarning?.(remaining);
      }

      // Countdown sounds — use tracked second to fire once per integer second
      const relevantRemaining = currentPhase === 'headline'
        ? Math.max(headlinePhaseDuration - elapsed, 0)
        : remaining;
      const currentSec = Math.ceil(relevantRemaining);
      if (currentSec <= 5 && currentSec > 0 && currentSec !== lastTickSecond) {
        lastTickSecond = currentSec;
        if (currentSec <= 1) opts.audio?.playFinalTick();
        else opts.audio?.playTick();
      }
      if (currentSec > 5) lastTickSecond = -1; // reset for next phase
    },
    onWarning: () => {
      // Handled inline above
    },
    onComplete: () => {
      callbacks.onComplete?.();
    },
    warningAt: 10,
  });
}

export function start() {
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
}

export function getResults() {
  return {
    stats: [
      { value: `${headlinePhaseDuration}s`, label: 'Headline Time' },
      { value: currentPhase === 'expand' ? '✅' : '—', label: 'Expanded' },
    ],
    topic: currentTopic,
  };
}

/* ─── Internal ───────────────────────────────────────────────────────────── */

function transitionToExpand() {
  if (phaseTransitioned) return;
  phaseTransitioned = true;
  currentPhase = 'expand';

  // Play phase transition sound
  config.audio?.playPhaseChange();

  // Update phase indicators
  const headlineStep = document.getElementById('hl-phase-headline');
  const expandStep = document.getElementById('hl-phase-expand');
  const prompt = document.getElementById('hl-prompt');

  if (headlineStep) {
    headlineStep.classList.remove('active');
    headlineStep.classList.add('complete');
    headlineStep.innerHTML = '✅ Headline';
  }

  if (expandStep) {
    expandStep.classList.add('active');
  }

  if (prompt) {
    prompt.className = 'headline__prompt headline__prompt--expand';
    prompt.textContent = 'Now expand on your headline!';
    // Re-trigger animation
    prompt.style.animation = 'none';
    prompt.offsetHeight;
    prompt.style.animation = '';
  }

  // Reset timer ring warning classes
  const timerContainer = document.getElementById('timer-container');
  if (timerContainer) {
    timerContainer.classList.remove('warning', 'danger');
  }
}
