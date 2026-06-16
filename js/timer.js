/**
 * Timer — reusable countdown engine with SVG ring sync.
 */

export class Timer {
  /**
   * @param {Object} opts
   * @param {number} opts.duration  — total seconds
   * @param {Function} opts.onTick  — called every second with { remaining, elapsed, fraction }
   * @param {Function} opts.onComplete — called when timer reaches 0
   * @param {Function} [opts.onWarning] — called when remaining <= warningAt
   * @param {number} [opts.warningAt=10] — seconds threshold for warning
   */
  constructor({ duration, onTick, onComplete, onWarning, warningAt = 10 }) {
    this.totalDuration = duration;
    this.remaining = duration;
    this.elapsed = 0;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.onWarning = onWarning;
    this.warningAt = warningAt;

    this._intervalId = null;
    this._startTime = null;
    this._pausedAt = null;
    this._pauseOffset = 0;
    this._running = false;
    this._paused = false;
    this._completed = false;
  }

  get isRunning() { return this._running && !this._paused; }
  get isPaused()  { return this._paused; }
  get isComplete(){ return this._completed; }

  start() {
    if (this._running) return;
    this._running = true;
    this._completed = false;
    this._startTime = performance.now();
    this._pauseOffset = 0;
    this._tick();
    this._intervalId = setInterval(() => this._tick(), 250); // 4× per second for smooth ring
  }

  pause() {
    if (!this._running || this._paused) return;
    this._paused = true;
    this._pausedAt = performance.now();
    clearInterval(this._intervalId);
    this._intervalId = null;
  }

  resume() {
    if (!this._paused) return;
    this._paused = false;
    this._pauseOffset += performance.now() - this._pausedAt;
    this._pausedAt = null;
    this._intervalId = setInterval(() => this._tick(), 250);
  }

  stop() {
    this._running = false;
    this._paused = false;
    clearInterval(this._intervalId);
    this._intervalId = null;
  }

  reset() {
    this.stop();
    this.remaining = this.totalDuration;
    this.elapsed = 0;
    this._completed = false;
  }

  /** Update the total duration (e.g., for Telescoping round changes) */
  setDuration(newDuration) {
    this.totalDuration = newDuration;
    this.remaining = newDuration;
    this.elapsed = 0;
    this._startTime = performance.now();
    this._pauseOffset = 0;
  }

  _tick() {
    const now = performance.now();
    const realElapsed = (now - this._startTime - this._pauseOffset) / 1000;

    this.elapsed = Math.min(realElapsed, this.totalDuration);
    this.remaining = Math.max(this.totalDuration - this.elapsed, 0);

    const fraction = this.elapsed / this.totalDuration; // 0 → 1

    this.onTick?.({
      remaining: this.remaining,
      elapsed: this.elapsed,
      fraction: Math.min(fraction, 1),
      totalDuration: this.totalDuration,
    });

    // Warning callback
    if (this.remaining <= this.warningAt && this.remaining > 0) {
      this.onWarning?.({ remaining: this.remaining });
    }

    // Completion
    if (this.remaining <= 0 && !this._completed) {
      this._completed = true;
      this.stop();
      this.onComplete?.();
    }
  }
}

/* ─── Timer Ring Helper ──────────────────────────────────────────────────── */

const CIRCUMFERENCE = 2 * Math.PI * 90; // radius = 90 in our SVG

/**
 * Update the SVG ring progress.
 * @param {SVGCircleElement} ringEl
 * @param {number} fraction — 0 (full) → 1 (empty)
 */
export function updateRing(ringEl, fraction) {
  if (!ringEl) return;
  const offset = CIRCUMFERENCE * fraction;
  ringEl.style.strokeDashoffset = offset;
}

/**
 * Format seconds into M:SS or H:MM:SS
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
