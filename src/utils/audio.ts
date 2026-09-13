// Web Audio synthesizer and recording utility for authentic voice memo playback

class AudioEngine {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private playStartTime: number = 0;
  private pauseOffset: number = 0;
  private intervalId: any = null;
  private onTimeUpdate?: (currentSeconds: number) => void;
  private onEnded?: () => void;
  private durationSeconds: number = 102; // 1:42

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  play(
    playbackRate: number = 1.0,
    onTimeUpdate?: (current: number) => void,
    onEnded?: () => void
  ) {
    this.onTimeUpdate = onTimeUpdate;
    this.onEnded = onEnded;

    if (this.isPlaying) return;
    const ctx = this.getContext();

    // Create a gentle, warm vocal formant-like ambient sound representing seminar audio
    this.oscillator = ctx.createOscillator();
    this.gainNode = ctx.createGain();

    // Warm chord with filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(280, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    this.oscillator.type = 'triangle';
    this.oscillator.frequency.setValueAtTime(140 * playbackRate, ctx.currentTime);

    // Subtle human voice modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(4.5, ctx.currentTime);
    lfoGain.gain.setValueAtTime(6, ctx.currentTime);
    lfo.connect(this.oscillator.frequency);
    lfo.start();

    // Soft master gain
    this.gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1);

    this.oscillator.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    this.oscillator.start();
    this.isPlaying = true;
    this.playStartTime = Date.now() - (this.pauseOffset * 1000) / playbackRate;

    // Timer loop for waveform sync
    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      const elapsed = ((Date.now() - this.playStartTime) / 1000) * playbackRate;
      if (elapsed >= this.durationSeconds) {
        this.stop();
        if (this.onEnded) this.onEnded();
      } else {
        if (this.onTimeUpdate) this.onTimeUpdate(elapsed);
      }
    }, 100);
  }

  pause() {
    if (!this.isPlaying) return;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    }
    setTimeout(() => {
      try {
        this.oscillator?.stop();
        this.oscillator?.disconnect();
      } catch (e) {}
    }, 60);

    clearInterval(this.intervalId);
    this.pauseOffset = (Date.now() - this.playStartTime) / 1000;
    this.isPlaying = false;
  }

  stop() {
    this.pause();
    this.pauseOffset = 0;
    if (this.onTimeUpdate) this.onTimeUpdate(0);
  }

  seek(seconds: number) {
    this.pauseOffset = seconds;
    if (this.onTimeUpdate) this.onTimeUpdate(seconds);
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
