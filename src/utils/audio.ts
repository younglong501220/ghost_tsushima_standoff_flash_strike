/**
 * Web Audio API Procedural Sound Engine for Ghost of Tsushima Web Game
 * 100% synthesized - zero external audio asset dependencies.
 */

class TsushimaSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.85;

  public init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Deep Japanese Taiko Drum strike
   */
  public playTaiko(intensity: 'light' | 'normal' | 'heavy' | 'lethal' = 'normal'): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const gainFactor = this.volume * (intensity === 'lethal' ? 1.0 : intensity === 'heavy' ? 0.8 : intensity === 'light' ? 0.4 : 0.6);

    // 1. Fundamental sub-bass drum body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const startFreq = intensity === 'lethal' ? 180 : intensity === 'heavy' ? 150 : 130;
    const endFreq = intensity === 'lethal' ? 30 : 38;
    const duration = intensity === 'lethal' ? 0.8 : intensity === 'heavy' ? 0.6 : 0.4;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    oscGain.gain.setValueAtTime(gainFactor, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    // 2. Leather skin attack crack (Filtered noise)
    const skinBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
    const skinData = skinBuffer.getChannelData(0);
    for (let i = 0; i < skinData.length; i++) {
      skinData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }

    const skinSource = this.ctx.createBufferSource();
    skinSource.buffer = skinBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    filter.Q.setValueAtTime(2, now);

    const skinGain = this.ctx.createGain();
    skinGain.gain.setValueAtTime(gainFactor * 0.8, now);
    skinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    skinSource.connect(filter);
    filter.connect(skinGain);
    skinGain.connect(this.ctx.destination);
    skinSource.start(now);
  }

  /**
   * Metallic Katana Clash / Parry Clang
   */
  public playClang(isPerfect: boolean = false): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const gainFactor = this.volume * (isPerfect ? 0.65 : 0.45);
    const frequencies = isPerfect
      ? [1250, 1820, 2450, 3350, 4800, 6200]
      : [1100, 1650, 2300, 3100];
    const duration = isPerfect ? 0.65 : 0.35;

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 20, now);

      gain.gain.setValueAtTime(gainFactor / frequencies.length, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    });

    // High metal friction burst
    const noiseLen = Math.floor(this.ctx.sampleRate * (isPerfect ? 0.08 : 0.04));
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) data[i] = Math.random() * 2 - 1;

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const bFilter = this.ctx.createBiquadFilter();
    bFilter.type = 'highpass';
    bFilter.frequency.setValueAtTime(3500, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(gainFactor * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isPerfect ? 0.08 : 0.04));

    noiseSrc.connect(bFilter);
    bFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noiseSrc.start(now);
  }

  /**
   * Sword Slash Swoosh
   */
  public playSlash(type: 'light' | 'heavy' | 'iai' = 'light'): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const gainFactor = this.volume * (type === 'iai' ? 0.7 : type === 'heavy' ? 0.5 : 0.35);
    const duration = type === 'iai' ? 0.25 : type === 'heavy' ? 0.2 : 0.12;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    const startF = type === 'iai' ? 1200 : type === 'heavy' ? 950 : 750;
    const endF = type === 'iai' ? 60 : type === 'heavy' ? 80 : 120;

    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + duration);

    gain.gain.setValueAtTime(gainFactor, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Visceral blood slicing spray
   */
  public playBlood(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.22;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.55, now);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  /**
   * Sheathing / Drawing Katana Blade click
   */
  public playSwordDraw(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Friction whistle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // Click lock
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(1400, now + 0.08);
    clickGain.gain.setValueAtTime(this.volume * 0.35, now + 0.08);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now + 0.08);
    clickOsc.stop(now + 0.14);
  }

  /**
   * Tense Heartbeat for Standoff
   */
  public playHeartbeat(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const playBeat = (time: number, freq: number, gainVal: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

      gain.gain.setValueAtTime(this.volume * gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.14);
    };

    playBeat(now, 75, 0.4);
    playBeat(now + 0.14, 60, 0.28);
  }

  /**
   * Resolve Healing Meditation (Hirajoshi Pentatonic chime)
   */
  public playHeal(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Japanese in-sen / Hirajoshi scale notes: D4, Eb4, G4, A4, D5
    const notes = [293.66, 311.13, 392.00, 440.00, 587.33];

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(this.volume * 0.22, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.6);
    });
  }

  /**
   * Dodge swoosh
   */
  public playDodge(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);

    gain.gain.setValueAtTime(this.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Ghost Stance Trigger Roar
   */
  public playGhostStanceTrigger(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTaiko('lethal');

    // Low brass war horn drone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(82, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(850, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(180, now + 1.2);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  /**
   * Battle Victory Chords
   */
  public playVictory(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.playTaiko('heavy');
    const now = this.ctx.currentTime + 0.1;
    const chords = [220, 293.66, 329.63, 440, 587.33];

    chords.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.9);
    });
  }

  /**
   * Defeat Gong
   */
  public playDefeat(): void {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 1.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);

    gain.gain.setValueAtTime(this.volume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.6);
  }
}

export const audio = new TsushimaSoundEngine();
