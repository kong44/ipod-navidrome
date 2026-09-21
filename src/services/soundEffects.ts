// Synthesizes authentic iPod piezo click sound using Web Audio API

class SoundEffectsManager {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Play iPod scroll click (short sharp mechanical transient)
   */
  public playClick() {
    if (!this.isEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Create a burst of white noise bandpassed to 2.5kHz + high-pitched impulse
      const bufferSize = ctx.sampleRate * 0.005; // 5ms burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // Sharp decaying impulse
        const decay = Math.exp(-i / (bufferSize * 0.2));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter for characteristic plastic casing resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.Q.setValueAtTime(4.0, now);

      // Low oscillator "thud" component
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.004);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.18, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.004);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.22, now);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.005);

      noiseSource.connect(filter);
      filter.connect(mainGain);
      osc.connect(oscGain);
      oscGain.connect(mainGain);

      mainGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.005);
      osc.start(now);
      osc.stop(now + 0.005);
    } catch {
      // AudioContext might be blocked before first interaction
    }
  }

  /**
   * Play button press click (slightly deeper click)
   */
  public playButtonPress() {
    if (!this.isEnabled) return;
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.008);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.008);
    } catch {
      // Ignore
    }
  }
}

export const soundEffects = new SoundEffectsManager();
