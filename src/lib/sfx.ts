/**
 * Tiny sound-effects engine for the games. Every sound is synthesised with
 * the Web Audio API, so there are no audio files to download. Sounds only
 * start after a user gesture (pressing Start), and a single mute setting is
 * shared by all the games and remembered between visits.
 */

export type SoundName =
  | "start"
  | "click"
  | "select"
  | "correct"
  | "wrong"
  | "badge"
  | "finish"
  | "shoot"
  | "miss"
  | "explode"
  | "bigExplode"
  | "hurt"
  | "wave"
  | "jump"
  | "coin"
  | "crash"
  | "release"
  | "splat"
  | "tick"
  | "gameOver";

const MUTE_KEY = "dcw-sound-muted";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let muted: boolean | null = null;
const lastPlayed = new Map<SoundName, number>();
const listeners = new Set<() => void>();

function readMuted(): boolean {
  if (muted !== null) return muted;
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    muted = false;
  }
  return muted;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return readMuted();
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    window.localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (!value) unlockAudio();
  listeners.forEach((l) => l());
}

export function subscribeMuted(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  return ctx;
}

/** Call from a click/tap handler so browsers allow audio to start. */
export function unlockAudio() {
  const ac = audio();
  if (ac && ac.state === "suspended") void ac.resume();
}

interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  to?: number;
  dur: number;
  vol?: number;
  delay?: number;
  attack?: number;
}

function tone({ type = "square", freq, to, dur, vol = 0.08, delay = 0, attack = 0.005 }: ToneOpts) {
  const ac = ctx;
  if (!ac || !master) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

interface NoiseOpts {
  dur: number;
  vol?: number;
  from?: number;
  to?: number;
  filter?: BiquadFilterType;
  delay?: number;
}

function noise({ dur, vol = 0.15, from = 2000, to = 200, filter = "lowpass", delay = 0 }: NoiseOpts) {
  const ac = ctx;
  if (!ac || !master) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = noiseBuf;
  const f = ac.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const arp = (notes: number[], step: number, type: OscillatorType = "triangle", vol = 0.09) =>
  notes.forEach((freq, i) => tone({ type, freq, dur: step * 1.6, vol, delay: i * step }));

const SOUNDS: Record<SoundName, () => void> = {
  start: () => arp([523, 784], 0.07, "square", 0.05),
  click: () => tone({ freq: 880, dur: 0.03, vol: 0.04 }),
  select: () => tone({ type: "triangle", freq: 660, dur: 0.05, vol: 0.07 }),
  correct: () => arp([523, 659, 784, 1047], 0.07),
  wrong: () => {
    tone({ type: "sawtooth", freq: 220, to: 110, dur: 0.28, vol: 0.06 });
    tone({ type: "square", freq: 233, to: 116, dur: 0.28, vol: 0.03 });
  },
  badge: () => {
    arp([784, 988, 1175, 1568], 0.06, "triangle", 0.08);
    tone({ type: "sine", freq: 2093, dur: 0.4, vol: 0.04, delay: 0.24 });
  },
  finish: () => arp([392, 523, 659, 784, 1047], 0.09),
  shoot: () => tone({ freq: 1400, to: 500, dur: 0.05, vol: 0.025 }),
  miss: () => tone({ type: "sine", freq: 140, to: 90, dur: 0.07, vol: 0.06 }),
  explode: () => {
    noise({ dur: 0.28, vol: 0.18, from: 1800, to: 150 });
    tone({ type: "sine", freq: 160, to: 50, dur: 0.2, vol: 0.08 });
  },
  bigExplode: () => {
    noise({ dur: 0.8, vol: 0.25, from: 2400, to: 60 });
    tone({ type: "sine", freq: 110, to: 30, dur: 0.6, vol: 0.12 });
    arp([523, 659, 784, 1047], 0.08, "triangle", 0.06);
  },
  hurt: () => {
    tone({ type: "sawtooth", freq: 320, to: 70, dur: 0.35, vol: 0.08 });
    noise({ dur: 0.2, vol: 0.12, from: 900, to: 100 });
  },
  wave: () => arp([392, 523, 659], 0.08, "square", 0.04),
  jump: () => tone({ freq: 330, to: 720, dur: 0.12, vol: 0.045 }),
  coin: () => {
    tone({ freq: 988, dur: 0.06, vol: 0.05 });
    tone({ freq: 1319, dur: 0.18, vol: 0.05, delay: 0.06 });
  },
  crash: () => {
    noise({ dur: 0.45, vol: 0.2, from: 1500, to: 80 });
    tone({ type: "square", freq: 180, to: 50, dur: 0.4, vol: 0.06 });
  },
  release: () => arp([659, 784, 1047, 1319], 0.07, "square", 0.04),
  splat: () => {
    noise({ dur: 0.14, vol: 0.18, from: 1200, to: 300, filter: "bandpass" });
    tone({ type: "sine", freq: 240, to: 90, dur: 0.12, vol: 0.08 });
  },
  tick: () => tone({ type: "sine", freq: 1000, dur: 0.05, vol: 0.05 }),
  gameOver: () => arp([523, 440, 349, 262], 0.14, "triangle", 0.08),
};

/** Minimum gap between repeats of a sound, to stop rapid sounds stacking up. */
const MIN_GAP: Partial<Record<SoundName, number>> = { shoot: 25, miss: 60, select: 40, click: 30 };

export function playSound(name: SoundName) {
  if (typeof window === "undefined" || readMuted()) return;
  const ac = audio();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const now = performance.now();
  const gap = MIN_GAP[name];
  if (gap && now - (lastPlayed.get(name) ?? 0) < gap) return;
  lastPlayed.set(name, now);
  try {
    SOUNDS[name]();
  } catch {
    /* audio is a nice-to-have; never let it break a game */
  }
}
