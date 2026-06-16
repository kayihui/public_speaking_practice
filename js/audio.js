/**
 * Audio — Web Audio API sound cues + MediaRecorder for session recording.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   AudioManager — procedurally generated sound cues
   ═══════════════════════════════════════════════════════════════════════════ */

export class AudioManager {
  constructor() {
    this._ctx = null;
    this._muted = false;
  }

  get muted() { return this._muted; }

  toggleMute() {
    this._muted = !this._muted;
    return this._muted;
  }

  setMuted(val) {
    this._muted = !!val;
  }

  _ensureContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  }

  /** Play a tone with envelope */
  _playTone(freq, duration = 0.15, type = 'sine', volume = 0.15) {
    if (this._muted) return;
    try {
      const ctx = this._ensureContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.05);
    } catch (e) {
      // Silently fail — audio is not critical
    }
  }

  /** Countdown tick (5, 4, 3, 2, 1) */
  playTick() {
    this._playTone(880, 0.08, 'sine', 0.1);
  }

  /** Final countdown tick (1 second left) */
  playFinalTick() {
    this._playTone(1100, 0.1, 'sine', 0.15);
  }

  /** Session / round complete chime */
  playChime() {
    if (this._muted) return;
    try {
      const ctx = this._ensureContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.6);
      });
    } catch (e) {}
  }

  /** New word / new prompt sound */
  playNewWord() {
    this._playTone(660, 0.12, 'triangle', 0.12);
  }

  /** Conductor command appear sound */
  playCommand() {
    if (this._muted) return;
    try {
      const ctx = this._ensureContext();
      const now = ctx.currentTime;
      // Two-tone alert
      [440, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch (e) {}
  }

  /** Phase transition (Headline Drill) */
  playPhaseChange() {
    if (this._muted) return;
    try {
      const ctx = this._ensureContext();
      const now = ctx.currentTime;
      [392, 523.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.5);
      });
    } catch (e) {}
  }

  /** Start session beep */
  playStart() {
    this._playTone(523.25, 0.2, 'sine', 0.15);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   RecordingManager — optional microphone recording via MediaRecorder
   ═══════════════════════════════════════════════════════════════════════════ */

export class RecordingManager {
  constructor() {
    this._stream = null;
    this._recorder = null;
    this._chunks = [];
    this._blob = null;
    this._url = null;
    this._recording = false;
  }

  get isRecording() { return this._recording; }
  get hasRecording() { return !!this._blob; }
  get audioUrl() { return this._url; }

  /** Request microphone permission. Returns true if granted. */
  async requestPermission() {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (e) {
      console.warn('Microphone access denied:', e);
      return false;
    }
  }

  /** Start recording. Must call requestPermission() first. */
  start() {
    if (!this._stream || this._recording) return false;
    this._chunks = [];
    this._blob = null;
    if (this._url) {
      URL.revokeObjectURL(this._url);
      this._url = null;
    }

    try {
      this._recorder = new MediaRecorder(this._stream, {
        mimeType: this._getSupportedMimeType(),
      });
    } catch (e) {
      // Fallback: let browser pick
      this._recorder = new MediaRecorder(this._stream);
    }

    this._recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this._chunks.push(e.data);
    };

    this._recorder.onstop = () => {
      this._blob = new Blob(this._chunks, { type: this._recorder.mimeType || 'audio/webm' });
      this._url = URL.createObjectURL(this._blob);
      this._recording = false;
    };

    this._recorder.start(1000); // collect data every second
    this._recording = true;
    return true;
  }

  /** Pause recording */
  pause() {
    if (this._recorder && this._recorder.state === 'recording') {
      this._recorder.pause();
    }
  }

  /** Resume recording */
  resume() {
    if (this._recorder && this._recorder.state === 'paused') {
      this._recorder.resume();
    }
  }

  /** Stop recording and finalize */
  stop() {
    return new Promise((resolve) => {
      if (!this._recorder || this._recorder.state === 'inactive') {
        resolve(this._url);
        return;
      }
      this._recorder.onstop = () => {
        this._blob = new Blob(this._chunks, { type: this._recorder.mimeType || 'audio/webm' });
        this._url = URL.createObjectURL(this._blob);
        this._recording = false;
        resolve(this._url);
      };
      this._recorder.stop();
    });
  }

  /** Release microphone stream */
  release() {
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
    if (this._url) {
      URL.revokeObjectURL(this._url);
      this._url = null;
    }
    this._recorder = null;
    this._chunks = [];
    this._blob = null;
    this._recording = false;
  }

  _getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  }
}
