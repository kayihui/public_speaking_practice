/**
 * The Conductor — Exercise Module
 *
 * User speaks on a topic while style/energy commands appear at random intervals.
 * User must adapt their delivery in real-time.
 */

import { CONDUCTOR_COMMANDS, CONDUCTOR_TOPICS, pickRandom } from '../data.js';
import { Timer } from '../timer.js';

let timer = null;
let commandTimeout = null;
let fadeTimeout = null;
let container = null;
let config = {};
let callbacks = {};
let commandsShown = [];
let currentTopic = '';
let paused = false;
let commandPool = [];

export function init(opts) {
  container = opts.container;
  config = opts;
  callbacks = {
    onTimerUpdate: opts.onTimerUpdate,
    onTimerRingUpdate: opts.onTimerRingUpdate,
    onTimerWarning: opts.onTimerWarning,
    onComplete: opts.onComplete,
  };
  commandsShown = [];
  paused = false;

  // Pick a random topic
  currentTopic = pickRandom(CONDUCTOR_TOPICS);

  // Build command pool
  const difficulty = opts.difficulty || 'easy';
  commandPool = [...CONDUCTOR_COMMANDS[difficulty]];

  // Render UI
  container.innerHTML = `
    <div class="conductor__topic">Speaking about: <em>${currentTopic}</em></div>
    <div class="conductor__command-area" id="cd-command-area">
      <div class="conductor__waiting" id="cd-waiting">Start speaking...</div>
    </div>
  `;

  // Create timer
  timer = new Timer({
    duration: opts.duration,
    onTick: ({ remaining, fraction }) => {
      callbacks.onTimerUpdate?.(remaining, 'remaining');
      callbacks.onTimerRingUpdate?.(fraction);
      if (remaining <= 5 && remaining > 0 && Math.ceil(remaining) === remaining) {
        if (remaining <= 1) opts.audio?.playFinalTick();
        else opts.audio?.playTick();
      }
    },
    onWarning: ({ remaining }) => {
      callbacks.onTimerWarning?.(remaining);
    },
    onComplete: () => {
      clearTimeout(commandTimeout);
      clearTimeout(fadeTimeout);
      callbacks.onComplete?.();
    },
    warningAt: 10,
  });
}

export function start() {
  timer.start();
  // Schedule first command after a brief intro period
  scheduleNextCommand(3);
}

export function pause() {
  paused = true;
  timer.pause();
  clearTimeout(commandTimeout);
  clearTimeout(fadeTimeout);
}

export function resume() {
  paused = false;
  timer.resume();
  // Resume command scheduling
  scheduleNextCommand(2);
}

export function isPaused() {
  return paused;
}

export function stop() {
  paused = false;
  timer?.stop();
  clearTimeout(commandTimeout);
  clearTimeout(fadeTimeout);
}

export function getResults() {
  return {
    stats: [
      { value: String(commandsShown.length), label: 'Commands' },
      { value: currentTopic.slice(0, 20) + '…', label: 'Topic' },
    ],
    commands: [...commandsShown],
    topic: currentTopic,
  };
}

/* ─── Internal ───────────────────────────────────────────────────────────── */

function scheduleNextCommand(delaySecs) {
  if (paused || timer?.isComplete) return;

  const { commandMinInterval = 10, commandMaxInterval = 15 } = config.difficultyConfig || {};
  const delay = delaySecs !== undefined
    ? delaySecs
    : commandMinInterval + Math.random() * (commandMaxInterval - commandMinInterval);

  commandTimeout = setTimeout(() => {
    if (paused || timer?.isComplete) return;
    showCommand();
  }, delay * 1000);
}

function showCommand() {
  // Pick a command (avoid immediate repeat)
  if (commandPool.length === 0) {
    const difficulty = config.difficulty || 'easy';
    commandPool = [...CONDUCTOR_COMMANDS[difficulty]];
  }

  const idx = Math.floor(Math.random() * commandPool.length);
  const command = commandPool.splice(idx, 1)[0];
  commandsShown.push(command);

  const area = document.getElementById('cd-command-area');
  if (!area) return;

  // Remove waiting text
  const waiting = document.getElementById('cd-waiting');
  if (waiting) waiting.remove();

  // Remove existing command
  const existing = area.querySelector('.conductor__command');
  if (existing) {
    existing.classList.add('exiting');
    setTimeout(() => existing.remove(), 300);
  }

  // Play command sound
  config.audio?.playCommand();

  // Create command element
  const cmdEl = document.createElement('div');
  cmdEl.className = 'conductor__command';
  cmdEl.innerHTML = `
    <span class="conductor__command-icon">${command.icon}</span>
    <span class="conductor__command-text">${command.text}</span>
    <span class="conductor__command-category">${command.category}</span>
  `;

  // Slight delay if replacing
  setTimeout(() => {
    area.appendChild(cmdEl);

    // Fade out after hold period
    fadeTimeout = setTimeout(() => {
      cmdEl.classList.add('exiting');
      setTimeout(() => {
        cmdEl.remove();
        // Show waiting state briefly
        if (!timer?.isComplete) {
          const w = document.createElement('div');
          w.className = 'conductor__waiting';
          w.id = 'cd-waiting';
          w.textContent = 'Keep speaking...';
          area.appendChild(w);
        }
      }, 300);
    }, 3500); // hold command visible for 3.5s
  }, existing ? 350 : 0);

  // Schedule next command
  scheduleNextCommand();
}
