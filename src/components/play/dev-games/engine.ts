/**
 * Dev Games engine: five athletics-style events drawn on a 2D canvas.
 *
 * Running: alternate Left/Right as fast as you can. Repeating the same side
 * does nothing, so it's rhythm as much as speed. Field events: run up, press
 * the action button to plant before the line, hold to raise the angle and let
 * go to jump or throw. Archery: aim, allow for the wind, and loose six arrows.
 */
import { playSound, type SoundName } from "@/lib/sfx";
import type { EventId } from "@/lib/records";

export type GameEventId = Exclude<EventId, "allround">;

export const W = 800;
export const H = 450;
const GROUND = 360;
const PPM = 22; // pixels per metre
const ATHLETE_X = 220;

const IMPULSE = 0.95;
const DRAG = 1.15;
const VMAX = 12;
const G = 9.81;

const C = {
  bg: "#050816",
  sky2: "#0b1430",
  track: "#3b1f2b",
  trackLine: "rgba(255,255,255,0.25)",
  grass: "#0c2a24",
  sand: "#c9a66b",
  primary: "#00e5ff",
  accent: "#00ffb3",
  gold: "#facc15",
  red: "#f87171",
  text: "#e2e8f0",
  muted: "#94a3b8",
};

export interface Ghost {
  label: string;
  /** Finish time in seconds. */
  time: number;
  color: string;
}

export interface Flag {
  label: string;
  /** Distance in metres. */
  dist: number;
  color: string;
}

export interface EventStatus {
  title: string;
  message: string;
  sub?: string;
  /** Hint for the action button label. */
  action: string;
  done: boolean;
  /** Final mark in the stored integer units, or null for no mark. */
  mark: number | null;
  attempts?: (number | null)[];
}

export interface EventRun {
  id: GameEventId;
  update(dt: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  tap(side: 0 | 1): void;
  actionDown(): void;
  actionUp(): void;
  /** Archery only. */
  aimTo?(x: number, y: number): void;
  aimBy?(dx: number, dy: number): void;
  setAimKeys?(keys: { x: number; y: number }): void;
  status(): EventStatus;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const sfx = (n: SoundName) => playSound(n);

/* ── Drawing helpers ────────────────────────────────────────────────────── */

function crowdColor(i: number) {
  const h = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  const v = Math.abs(h);
  return v < 0.25 ? "#334155" : v < 0.5 ? "#1e293b" : v < 0.7 ? "#475569" : v < 0.85 ? "#0e7490" : "#7c3aed";
}

function drawStadium(ctx: CanvasRenderingContext2D, camX: number, t: number, opts: { trackTo?: number; pit?: [number, number]; field?: number } = {}) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, C.bg);
  sky.addColorStop(1, C.sky2);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Floodlights
  for (let i = 0; i < 3; i++) {
    const lx = ((i * 380 - camX * PPM * 0.15) % 1140 + 1140) % 1140 - 170;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(lx, 30, 46, 10);
    const glow = ctx.createRadialGradient(lx + 23, 36, 2, lx + 23, 36, 90);
    glow.addColorStop(0, "rgba(255,255,255,0.25)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(lx - 70, 0, 186, 130);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(lx + 20, 40, 6, 120);
  }

  // Crowd (parallax)
  const crowdTop = 170;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, crowdTop, W, GROUND - 40 - crowdTop);
  const off = camX * PPM * 0.5;
  const start = Math.floor(off / 12);
  for (let row = 0; row < 7; row++) {
    for (let k = start; k < start + 70; k++) {
      const x = k * 12 - off + (row % 2) * 6;
      const bob = Math.sin(t * 6 + k * 1.3 + row) > 0.92 ? -3 : 0;
      ctx.fillStyle = crowdColor(k * 7 + row * 131);
      ctx.beginPath();
      ctx.arc(x, crowdTop + 12 + row * 17 + bob, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Advertising boards
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, GROUND - 40, W, 22);
  ctx.font = "bold 12px ui-monospace, monospace";
  ctx.fillStyle = "rgba(0,229,255,0.7)";
  const boardOff = (camX * PPM) % 260;
  for (let x = -boardOff; x < W; x += 260) ctx.fillText("DCW DIGITAL · DEV GAMES", x + 20, GROUND - 25);

  // Grass + track
  ctx.fillStyle = C.grass;
  ctx.fillRect(0, GROUND - 18, W, H - GROUND + 18);
  const trackEnd = opts.trackTo !== undefined ? (opts.trackTo - camX) * PPM + ATHLETE_X : W;
  ctx.fillStyle = C.track;
  ctx.fillRect(0, GROUND - 18, Math.max(0, Math.min(W, trackEnd)), 44);
  ctx.strokeStyle = C.trackLine;
  ctx.lineWidth = 1;
  for (const y of [GROUND - 18, GROUND + 4, GROUND + 26]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(Math.max(0, Math.min(W, trackEnd)), y);
    ctx.stroke();
  }
  if (opts.pit) {
    const [a, b] = opts.pit;
    const x1 = (a - camX) * PPM + ATHLETE_X;
    const x2 = (b - camX) * PPM + ATHLETE_X;
    ctx.fillStyle = C.sand;
    ctx.fillRect(x1, GROUND - 14, x2 - x1, 36);
  }
}

function worldX(x: number, camX: number) {
  return (x - camX) * PPM + ATHLETE_X;
}

function drawMarkers(ctx: CanvasRenderingContext2D, camX: number, from: number, to: number, every: number, offset = 0) {
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillStyle = C.muted;
  ctx.textAlign = "center";
  for (let m = from; m <= to; m += every) {
    const x = worldX(m, camX);
    if (x < -20 || x > W + 20) continue;
    ctx.fillRect(x - 0.5, GROUND + 26, 1, 8);
    ctx.fillText(`${m - offset}m`, x, GROUND + 48);
  }
  ctx.textAlign = "left";
}

function drawLine(ctx: CanvasRenderingContext2D, camX: number, at: number, color: string, label?: string, chequer = false) {
  const x = worldX(at, camX);
  if (x < -40 || x > W + 40) return;
  if (chequer) {
    for (let i = 0; i < 11; i++) {
      ctx.fillStyle = i % 2 ? "#fff" : "#111";
      ctx.fillRect(x - 3, GROUND - 18 + i * 4, 3, 4);
      ctx.fillStyle = i % 2 ? "#111" : "#fff";
      ctx.fillRect(x, GROUND - 18 + i * 4, 3, 4);
    }
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x - 2, GROUND - 18, 4, 44);
  }
  if (label) {
    ctx.font = "bold 11px ui-monospace, monospace";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(label, x, GROUND - 52);
    ctx.textAlign = "left";
  }
}

type Pose = "run" | "crouch" | "air" | "throw" | "stand" | "fall";

function drawAthlete(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number, pose: Pose, color = C.primary, alpha = 1, scale = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  let hipY = -30;
  let lean = 0.15;
  let legA = s * 0.9;
  let legB = -s * 0.9;
  let armA = -s * 1.0;
  let armB = s * 1.0;
  if (pose === "stand") {
    legA = 0.12; legB = -0.12; armA = 0.2; armB = -0.2; lean = 0;
  } else if (pose === "crouch") {
    hipY = -22; lean = 0.55; legA = 0.9; legB = -0.5; armA = -1.2; armB = 1.0;
  } else if (pose === "air") {
    legA = 1.1; legB = 0.7; armA = -2.3; armB = -1.9; lean = 0.25;
  } else if (pose === "throw") {
    legA = 0.6; legB = -0.6; armA = -2.6; armB = 0.8; lean = -0.2;
  } else if (pose === "fall") {
    hipY = -12; lean = 1.25; legA = -0.4; legB = 0.4; armA = 1.5; armB = 1.8;
  }
  const kneeBend = pose === "run" ? Math.max(0, c) * 1.1 : 0.4;
  const leg = (a: number, bend: number) => {
    const kx = Math.sin(a) * 15;
    const ky = hipY + Math.cos(a) * 15;
    const fx = kx + Math.sin(a - bend) * 15;
    const fy = ky + Math.cos(a - bend) * 15;
    ctx.beginPath();
    ctx.moveTo(0, hipY);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, Math.min(0, fy));
    ctx.stroke();
  };
  leg(legA, kneeBend);
  leg(legB, pose === "run" ? Math.max(0, -c) * 1.1 : 0.4);
  // Torso
  const sx = Math.sin(lean) * 24;
  const sy = hipY - Math.cos(lean) * 24;
  ctx.beginPath();
  ctx.moveTo(0, hipY);
  ctx.lineTo(sx, sy);
  ctx.stroke();
  // Arms
  for (const a of [armA, armB]) {
    ctx.beginPath();
    ctx.moveTo(sx, sy + 3);
    const ex = sx + Math.sin(a) * 12;
    const ey = sy + 3 + Math.cos(a) * 12;
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex + Math.sin(a + 0.8) * 11, ey + Math.cos(a + 0.8) * 11);
    ctx.stroke();
  }
  // Head
  ctx.beginPath();
  ctx.arc(sx + Math.sin(lean) * 9, sy - 9, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function banner(ctx: CanvasRenderingContext2D, text: string, color = C.text, size = 34, y = 120) {
  ctx.save();
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(5,8,22,0.85)";
  ctx.strokeText(text, W / 2, y);
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, y);
  ctx.restore();
}

function hudText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = C.text, align: CanvasTextAlign = "left", size = 18) {
  ctx.save();
  ctx.font = `700 ${size}px ui-monospace, monospace`;
  ctx.textAlign = align;
  ctx.fillStyle = "rgba(5,8,22,0.6)";
  const w = ctx.measureText(text).width;
  const bx = align === "right" ? x - w - 8 : align === "center" ? x - w / 2 - 8 : x - 8;
  ctx.fillRect(bx, y - size, w + 16, size + 10);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function speedBar(ctx: CanvasRenderingContext2D, v: number) {
  const x = 20;
  const y = H - 24;
  ctx.fillStyle = "rgba(5,8,22,0.7)";
  ctx.fillRect(x - 4, y - 14, 208, 22);
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x, y - 10, 200, 14);
  const p = Math.min(1, v / VMAX);
  const grad = ctx.createLinearGradient(x, 0, x + 200, 0);
  grad.addColorStop(0, C.accent);
  grad.addColorStop(0.7, C.primary);
  grad.addColorStop(1, C.gold);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y - 10, 200 * p, 14);
  ctx.font = "10px ui-monospace, monospace";
  ctx.fillStyle = C.text;
  ctx.fillText(`${v.toFixed(1)} m/s`, x + 6, y + 1);
}

/* ── Running mechanics shared by every event ────────────────────────────── */

class Runner {
  x = 0;
  v = 0;
  last: 0 | 1 | -1 = -1;
  phase = 0;
  tap(side: 0 | 1) {
    if (side !== this.last) {
      this.v = Math.min(VMAX, this.v + IMPULSE);
      this.last = side;
    } else {
      this.v *= 0.96;
    }
  }
  step(dt: number, drag = DRAG) {
    this.v = Math.max(0, this.v - this.v * drag * dt);
    this.x += this.v * dt;
    this.phase += this.v * dt * 1.55;
  }
}

/* ── Track events: 100m and 110m hurdles ───────────────────────────────── */

const HURDLES = Array.from({ length: 10 }, (_, i) => 13.72 + i * 9.14);

function trackEvent(id: "sprint" | "hurdles", ghosts: Ghost[]): EventRun {
  const dist = id === "sprint" ? 100 : 110;
  const r = new Runner();
  let state: "marks" | "set" | "go" | "finished" | "dq" = "marks";
  let stateT = 0;
  let setFor = rand(0.9, 2.1);
  let falseStarts = 0;
  let t = 0; // race clock
  let clock = 0; // wall clock for animation
  let msg = "On your marks";
  let finishTime: number | null = null;
  let jumpT = -1;
  const JUMP = 0.55;
  const knocked = new Set<number>();
  let stumble = 0;

  const falseStart = () => {
    falseStarts++;
    sfx("wrong");
    if (falseStarts >= 2) {
      state = "dq";
      msg = "Disqualified: two false starts";
      return;
    }
    msg = "False start! One more and you're out";
    state = "marks";
    stateT = -1.2;
    setFor = rand(0.9, 2.1);
    r.v = 0;
    r.x = 0;
    r.last = -1;
  };

  const airborne = () => jumpT >= 0 && jumpT < JUMP;
  const heightM = () => (airborne() ? 1.25 * 4 * (jumpT / JUMP) * (1 - jumpT / JUMP) : 0);

  return {
    id,
    tap(side) {
      if (state === "marks" || state === "set") return falseStart();
      if (state !== "go" || airborne()) return;
      r.tap(side);
    },
    actionDown() {
      if (id !== "hurdles") return;
      if (state === "marks" || state === "set") return falseStart();
      if (state === "go" && !airborne() && r.v > 0.5) {
        jumpT = 0;
        sfx("jump");
      }
    },
    actionUp() {},
    update(dt) {
      clock += dt;
      stateT += dt;
      if (state === "marks" && stateT > 1) {
        state = "set";
        stateT = 0;
        msg = "Set...";
        sfx("tick");
      } else if (state === "set" && stateT > setFor) {
        state = "go";
        stateT = 0;
        msg = "GO!";
        sfx("start");
      } else if (state === "go") {
        t += dt;
        if (stateT > 0.8 && msg === "GO!") msg = "";
        const before = r.x;
        if (airborne()) {
          jumpT += dt;
          r.step(dt, DRAG * 0.4);
        } else {
          if (jumpT >= JUMP) jumpT = -1;
          r.step(dt, stumble > 0 ? DRAG * 2.2 : DRAG);
        }
        stumble = Math.max(0, stumble - dt);
        if (id === "hurdles") {
          HURDLES.forEach((hx, i) => {
            if (!knocked.has(i) && before < hx && r.x >= hx && heightM() < 0.6) {
              knocked.add(i);
              r.v *= 0.45;
              stumble = 0.5;
              sfx("crash");
            }
          });
        }
        if (r.x >= dist) {
          // Interpolate the exact crossing moment.
          const over = (r.x - dist) / Math.max(0.01, r.v);
          finishTime = Math.max(0.01, t - over);
          state = "finished";
          msg = "";
          sfx("finish");
        }
      } else if (state === "finished") {
        r.step(dt, DRAG * 1.6);
      }
    },
    draw(ctx) {
      const camX = Math.max(0, r.x);
      drawStadium(ctx, camX, clock);
      drawMarkers(ctx, camX, 0, dist, 10);
      drawLine(ctx, camX, 0, "#fff", "START");
      drawLine(ctx, camX, dist, "#fff", "FINISH", true);
      // Ghosts in the lane above
      const raceT = state === "go" ? t : state === "finished" ? finishTime ?? t : 0;
      ghosts.forEach((g, i) => {
        const gx = Math.min(dist, (dist * raceT) / g.time);
        const sx = worldX(gx, camX);
        if (sx > -30 && sx < W + 30) {
          drawAthlete(ctx, sx, GROUND - 14 - i * 8, gx * 1.55, raceT > 0 && gx < dist ? "run" : "stand", g.color, 0.35, 0.85);
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillStyle = g.color;
          ctx.textAlign = "center";
          ctx.fillText(g.label, sx, GROUND - 82 - i * 12);
          ctx.textAlign = "left";
        }
      });
      if (id === "hurdles") {
        HURDLES.forEach((hx, i) => {
          const x = worldX(hx, camX);
          if (x < -30 || x > W + 30) return;
          ctx.strokeStyle = knocked.has(i) ? C.red : "#f8fafc";
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (knocked.has(i)) {
            ctx.moveTo(x - 4, GROUND + 6);
            ctx.lineTo(x + 18, GROUND + 2);
          } else {
            ctx.moveTo(x - 6, GROUND + 6);
            ctx.lineTo(x - 6, GROUND - 16);
            ctx.lineTo(x + 6, GROUND - 16);
            ctx.lineTo(x + 6, GROUND + 6);
          }
          ctx.stroke();
          if (!knocked.has(i)) {
            ctx.fillStyle = C.gold;
            ctx.fillRect(x - 7, GROUND - 20, 14, 5);
          }
        });
      }
      const pose: Pose = state === "marks" || state === "set" ? "crouch" : airborne() ? "air" : stumble > 0 ? "fall" : r.v < 0.3 ? "stand" : "run";
      drawAthlete(ctx, ATHLETE_X, GROUND + 4 - heightM() * PPM, r.phase, pose);

      hudText(ctx, (state === "finished" ? finishTime ?? t : t).toFixed(2) + "s", W - 20, 34, C.text, "right", 22);
      speedBar(ctx, r.v);
      if (state === "dq") banner(ctx, "DISQUALIFIED", C.red);
      else if (state === "finished" && finishTime) banner(ctx, `${finishTime.toFixed(2)}s`, C.gold, 46);
      else if (msg) banner(ctx, msg, msg === "GO!" ? C.accent : C.text);
    },
    status() {
      return {
        title: id === "sprint" ? "100m Sprint" : "110m Hurdles",
        message: state === "dq" ? "Disqualified" : state === "finished" ? `Finished in ${finishTime?.toFixed(2)}s` : msg || "Go go go!",
        action: id === "hurdles" ? "Jump" : "—",
        done: (state === "finished" && stateT > 0 && r.v < 2) || state === "dq",
        mark: state === "finished" && finishTime ? Math.round(finishTime * 100) : null,
      };
    },
  };
}

/* ── Field events: long jump and javelin ───────────────────────────────── */

function fieldEvent(id: "longjump" | "javelin", flags: Flag[]): EventRun {
  const LINE = id === "longjump" ? 40 : 30;
  const K = id === "longjump" ? 0.85 : 9;
  const r = new Runner();
  const attempts: (number | null)[] = [];
  let state: "ready" | "run" | "plant" | "flight" | "result" | "done" = "ready";
  let stateT = 0;
  let clock = 0;
  let angle = 0;
  let plantX = 0;
  let vPlant = 0;
  let range = 0;
  let flightT = 0;
  let flightDur = 1;
  let result: number | null = null;
  let msg = "Attempt 1 of 3";
  let foul = false;

  const reset = () => {
    r.x = 0;
    r.v = 0;
    r.last = -1;
    angle = 0;
    state = "ready";
    stateT = 0;
    foul = false;
    msg = `Attempt ${attempts.length + 1} of 3`;
  };

  const finishAttempt = (mark: number | null, text: string) => {
    attempts.push(mark);
    result = mark;
    msg = text;
    state = "result";
    stateT = 0;
  };

  const launch = () => {
    if (state !== "plant") return;
    const th = (Math.max(1, angle) * Math.PI) / 180;
    range = ((vPlant * vPlant * Math.sin(2 * th)) / G) * K;
    flightDur = id === "longjump" ? 0.6 + range / 12 : 1.1 + range / 70;
    flightT = 0;
    state = "flight";
    sfx(id === "longjump" ? "jump" : "release");
  };

  const best = () => attempts.reduce<number | null>((b, a) => (a !== null && (b === null || a > b) ? a : b), null);

  return {
    id,
    tap(side) {
      if (state === "ready") {
        state = "run";
        msg = "";
      }
      if (state === "run") r.tap(side);
    },
    actionDown() {
      if (state === "run" && r.v > 1) {
        state = "plant";
        plantX = r.x;
        vPlant = r.v;
        angle = 0;
        stateT = 0;
      }
    },
    actionUp() {
      launch();
    },
    update(dt) {
      clock += dt;
      stateT += dt;
      if (state === "run") {
        r.step(dt);
        if (r.x > LINE) {
          foul = true;
          sfx("wrong");
          finishAttempt(null, "Foul! Over the line");
        }
      } else if (state === "plant") {
        angle = Math.min(80, stateT * 72);
        vPlant *= 1 - 0.1 * dt;
        r.v = Math.max(0, r.v - r.v * 6 * dt);
        if (angle >= 80) launch();
      } else if (state === "flight") {
        flightT += dt;
        if (flightT >= flightDur) {
          const measured = range - (LINE - plantX);
          if (measured < 0.5) {
            sfx("wrong");
            finishAttempt(null, "No mark");
          } else {
            const cm = Math.round(measured * 100);
            const isBest = best() === null || cm > (best() ?? 0);
            sfx(isBest ? "correct" : "coin");
            finishAttempt(cm, `${measured.toFixed(2)}m${isBest && attempts.length ? "  ·  best so far" : ""}`);
          }
        }
      } else if (state === "result" && stateT > 1.9) {
        if (attempts.length >= 3) {
          state = "done";
          msg = best() !== null ? `Best: ${((best() ?? 0) / 100).toFixed(2)}m` : "No valid attempts";
          sfx("finish");
        } else reset();
      } else if (state === "ready") {
        r.phase += dt * 0.6;
      }
    },
    draw(ctx) {
      const flying = state === "flight" || (state === "result" && !foul && result !== null);
      const p = state === "flight" ? Math.min(1, flightT / flightDur) : flying ? 1 : 0;
      const th = (Math.max(1, angle) * Math.PI) / 180;
      const objX = plantX + range * p;
      const vScale = id === "longjump" ? 1.6 : 0.32;
      const apex = (range * Math.tan(th)) / 4;
      const objH = 4 * apex * p * (1 - p) * vScale;
      const camX = flying ? (id === "javelin" ? objX : Math.max(0, objX)) : Math.max(0, r.x);
      const pit: [number, number] | undefined = id === "longjump" ? [LINE + 1, LINE + 11] : undefined;
      drawStadium(ctx, camX, clock, { trackTo: LINE, pit });
      if (id === "javelin") drawMarkers(ctx, camX, LINE + 10, LINE + 130, 10, LINE);
      else drawMarkers(ctx, camX, LINE + 2, LINE + 10, 1, LINE);
      drawLine(ctx, camX, LINE, id === "longjump" ? "#f8fafc" : C.red, id === "longjump" ? "BOARD" : "FOUL LINE");
      flags.forEach((f, i) => {
        const x = worldX(LINE + f.dist, camX);
        if (x < -20 || x > W + 20) return;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, GROUND + 8);
        ctx.lineTo(x, GROUND - 46 - i * 14);
        ctx.stroke();
        ctx.fillStyle = f.color;
        ctx.fillRect(x, GROUND - 46 - i * 14, 10, 7);
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(f.label, x + 13, GROUND - 39 - i * 14);
      });

      if (id === "longjump") {
        const ax = flying ? worldX(objX, camX) : ATHLETE_X;
        const ay = GROUND + 4 - (flying ? objH * PPM : 0);
        const pose: Pose = state === "plant" ? "crouch" : state === "flight" ? "air" : state === "result" ? (foul ? "stand" : "fall") : r.v < 0.3 ? "stand" : "run";
        drawAthlete(ctx, flying ? ax : worldX(state === "plant" ? plantX : r.x, camX), ay, r.phase, pose);
        if (state === "result" && !foul && result !== null) {
          const x = worldX(LINE + result / 100, camX);
          ctx.fillStyle = C.gold;
          ctx.fillRect(x - 1, GROUND - 14, 2, 36);
        }
      } else {
        const ax = worldX(state === "plant" || flying ? plantX : r.x, camX);
        drawAthlete(ctx, ax, GROUND + 4, r.phase, state === "plant" ? "throw" : state === "ready" ? "stand" : flying ? "stand" : "run");
        // Javelin
        const jx = flying ? worldX(objX, camX) : ax + 6;
        const jy = flying ? GROUND - 30 - objH * PPM : GROUND - 56;
        let ang = state === "plant" ? -th : -0.25;
        if (flying) {
          const slope = (4 * apex * (1 - 2 * p) * vScale * PPM) / (range * PPM || 1);
          ang = state === "flight" ? -Math.atan(slope) : 0.5;
        }
        ctx.save();
        ctx.translate(jx, flying && state === "result" ? GROUND - 6 : jy);
        ctx.rotate(ang);
        ctx.strokeStyle = "#f1f5f9";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-26, 0);
        ctx.lineTo(26, 0);
        ctx.stroke();
        ctx.fillStyle = C.gold;
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      }

      // Angle meter
      if (state === "plant" || state === "flight") {
        const cx = W - 90;
        const cy = 150;
        ctx.fillStyle = "rgba(5,8,22,0.7)";
        ctx.fillRect(cx - 20, cy - 80, 100, 100);
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 60, -Math.PI / 2, 0);
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,255,179,0.5)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, 60, -(50 * Math.PI) / 180, -(40 * Math.PI) / 180);
        ctx.stroke();
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(th) * 60, cy - Math.sin(th) * 60);
        ctx.stroke();
        ctx.font = "bold 13px ui-monospace, monospace";
        ctx.fillStyle = C.text;
        ctx.fillText(`${Math.round(angle)}°`, cx + 8, cy + 14);
      }

      speedBar(ctx, state === "plant" ? vPlant : r.v);
      if (state === "run" || state === "ready") {
        const left = LINE - r.x;
        hudText(ctx, `${id === "longjump" ? "Board" : "Line"} in ${left.toFixed(1)}m`, 24, 34, left < 6 ? C.gold : C.text, "left", 16);
      }
      hudText(ctx, `Attempt ${Math.min(3, attempts.length + (state === "result" || state === "done" ? 0 : 1))}/3`, W - 20, 34, C.text, "right", 16);
      const b = best();
      if (b !== null) hudText(ctx, `Best ${(b / 100).toFixed(2)}m`, W - 20, 64, C.gold, "right", 14);
      if (state === "ready") banner(ctx, msg, C.text, 30);
      if (state === "result") banner(ctx, msg, foul || result === null ? C.red : C.gold, 40);
      if (state === "done") banner(ctx, msg, C.gold, 40);
    },
    status() {
      return {
        title: id === "longjump" ? "Long Jump" : "Javelin",
        message: msg,
        action: state === "plant" ? "Let go!" : id === "longjump" ? "Jump" : "Throw",
        done: state === "done" && stateT > 0.6,
        mark: best(),
        attempts,
      };
    },
  };
}

/* ── Archery ───────────────────────────────────────────────────────────── */

const TX = W / 2;
const TY = 215;
const TR = 150;
const ARROWS = 6;
const SHOT_TIME = 12;

function archeryEvent(): EventRun {
  let aimX = TX;
  let aimY = TY;
  let keys = { x: 0, y: 0 };
  let t = 0; // time on this arrow
  let clock = 0;
  const shots: { x: number; y: number; score: number }[] = [];
  let wind = { x: rand(-1, 1), y: rand(-0.3, 0.3) };
  let state: "aim" | "flying" | "hit" | "done" = "aim";
  let stateT = 0;
  let msg = "Aim for the gold. Mind the wind.";
  let doneT = 0;

  const sway = () => {
    const a = 7 + Math.max(0, t - 3) * 5;
    return {
      x: a * Math.sin(t * 1.7) + a * 0.5 * Math.sin(t * 4.3 + 1),
      y: a * 0.8 * Math.cos(t * 1.3) + a * 0.4 * Math.sin(t * 3.7),
    };
  };

  const shoot = () => {
    if (state !== "aim") return;
    const s = sway();
    const x = aimX + s.x + wind.x * 48;
    const y = aimY + s.y + wind.y * 30;
    const d = Math.hypot(x - TX, y - TY);
    const score = Math.max(0, 10 - Math.floor(d / (TR / 10)));
    shots.push({ x, y, score });
    state = "flying";
    stateT = 0;
    sfx("release");
  };

  const total = () => shots.reduce((s, a) => s + a.score, 0);
  const windText = () => {
    const mps = Math.abs(wind.x) * 6;
    return `${wind.x < 0 ? "←" : "→"} ${mps.toFixed(1)} m/s`;
  };

  return {
    id: "archery",
    tap() {},
    actionDown() {
      shoot();
    },
    actionUp() {},
    aimTo(x, y) {
      aimX = Math.max(TX - TR * 1.6, Math.min(TX + TR * 1.6, x));
      aimY = Math.max(40, Math.min(H - 30, y));
    },
    aimBy(dx, dy) {
      this.aimTo!(aimX + dx, aimY + dy);
    },
    setAimKeys(k) {
      keys = k;
    },
    update(dt) {
      clock += dt;
      stateT += dt;
      if (state === "aim") {
        t += dt;
        if (keys.x || keys.y) this.aimBy!(keys.x * 200 * dt, keys.y * 200 * dt);
        if (t > SHOT_TIME) {
          shots.push({ x: -100, y: -100, score: 0 });
          msg = "Too slow! That's a miss";
          sfx("wrong");
          state = "hit";
          stateT = 0;
        }
      } else if (state === "flying" && stateT > 0.25) {
        const last = shots[shots.length - 1]!;
        state = "hit";
        stateT = 0;
        msg = last.score === 10 ? "Bullseye! 10" : last.score === 0 ? "Missed the target" : `${last.score}`;
        sfx(last.score >= 9 ? "correct" : last.score === 0 ? "miss" : "coin");
      } else if (state === "hit" && stateT > 1.3) {
        if (shots.length >= ARROWS) {
          state = "done";
          doneT = 0;
          msg = `${total()} points`;
          sfx("finish");
        } else {
          state = "aim";
          t = 0;
          wind = { x: rand(-1, 1), y: rand(-0.3, 0.3) };
          msg = "";
        }
      } else if (state === "done") doneT += dt;
    },
    draw(ctx) {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, C.bg);
      sky.addColorStop(1, "#0c2a24");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      // Grass and stand
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 40, W, 70);
      for (let k = 0; k < 68; k++)
        for (let row = 0; row < 4; row++) {
          ctx.fillStyle = crowdColor(k * 3 + row * 17);
          ctx.beginPath();
          ctx.arc(k * 12 + (row % 2) * 6, 52 + row * 16 + (Math.sin(clock * 5 + k) > 0.95 ? -2 : 0), 4, 0, Math.PI * 2);
          ctx.fill();
        }
      ctx.fillStyle = C.grass;
      ctx.fillRect(0, TY + TR - 10, W, H);
      // Target stand
      ctx.fillStyle = "#3f2d1d";
      ctx.fillRect(TX - 70, TY + 60, 10, TR + 20);
      ctx.fillRect(TX + 60, TY + 60, 10, TR + 20);
      const rings = ["#f8fafc", "#f8fafc", "#111827", "#111827", "#2563eb", "#2563eb", "#dc2626", "#dc2626", "#facc15", "#facc15"];
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(TX, TY, TR - i * (TR / 10), 0, Math.PI * 2);
        ctx.fillStyle = rings[i]!;
        ctx.fill();
        ctx.strokeStyle = i === 2 || i === 3 ? "#475569" : "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = "#111";
      ctx.fillRect(TX - 1, TY - 1, 2, 2);
      // Arrows
      shots.forEach((s, i) => {
        if (s.x < 0) return;
        const fresh = i === shots.length - 1 && state === "flying";
        if (fresh) return;
        ctx.fillStyle = "#0b1220";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + 9, s.y + 9);
        ctx.stroke();
      });
      // Crosshair
      if (state === "aim") {
        const s = sway();
        const cx = aimX + s.x;
        const cy = aimY + s.y;
        ctx.strokeStyle = t > SHOT_TIME - 3 ? C.red : C.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.moveTo(cx - 22, cy);
        ctx.lineTo(cx - 6, cy);
        ctx.moveTo(cx + 6, cy);
        ctx.lineTo(cx + 22, cy);
        ctx.moveTo(cx, cy - 22);
        ctx.lineTo(cx, cy - 6);
        ctx.moveTo(cx, cy + 6);
        ctx.lineTo(cx, cy + 22);
        ctx.stroke();
      }
      // Wind flag
      ctx.fillStyle = "rgba(5,8,22,0.7)";
      ctx.fillRect(16, 128, 150, 54);
      ctx.font = "11px ui-monospace, monospace";
      ctx.fillStyle = C.muted;
      ctx.fillText("WIND", 26, 146);
      ctx.font = "bold 16px ui-monospace, monospace";
      ctx.fillStyle = Math.abs(wind.x) > 0.6 ? C.gold : C.text;
      ctx.fillText(windText(), 26, 170);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(140, 136, 3, 40);
      ctx.save();
      ctx.translate(142, 140);
      ctx.scale(wind.x < 0 ? -1 : 1, 1);
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8 + Math.abs(wind.x) * 16, 4 + Math.sin(clock * 9) * 1.5);
      ctx.lineTo(0, 10);
      ctx.fill();
      ctx.restore();

      hudText(ctx, `${total()} pts`, W - 20, 34, C.gold, "right", 20);
      hudText(ctx, `Arrow ${Math.min(ARROWS, shots.length + (state === "aim" ? 1 : 0))}/${ARROWS}`, W - 20, 64, C.text, "right", 14);
      if (state === "aim") hudText(ctx, `${Math.max(0, SHOT_TIME - t).toFixed(0)}s`, 24, 34, t > SHOT_TIME - 3 ? C.red : C.text, "left", 16);
      if (state === "hit" || state === "done") banner(ctx, msg, state === "done" ? C.gold : C.text, 36, 40 + 24);
      else if (msg && t < 2.5) banner(ctx, msg, C.text, 20, 30);
    },
    status() {
      return {
        title: "Archery",
        message: msg,
        action: "Shoot",
        done: state === "done" && doneT > 0.8,
        mark: state === "done" ? total() : null,
      };
    },
  };
}

export function createEvent(id: GameEventId, opts: { ghosts?: Ghost[]; flags?: Flag[] } = {}): EventRun {
  switch (id) {
    case "sprint":
    case "hurdles":
      return trackEvent(id, opts.ghosts ?? []);
    case "longjump":
    case "javelin":
      return fieldEvent(id, opts.flags ?? []);
    case "archery":
      return archeryEvent();
  }
}
