// Narration and sound. Recorded lines live at assets/audio/narration/<id>.m4a.
// Until a line is recorded (narration.json "recorded": true), the device voice reads it.

let lines = {};
let muted = false;

export function narrationKey(id) {
  return `narr:${id}`;
}

// Call from a scene's preload() once narration.json is in the cache.
export function preloadNarration(scene) {
  lines = scene.cache.json.get('narration') || {};
  for (const [id, line] of Object.entries(lines)) {
    if (line.recorded) {
      scene.load.audio(narrationKey(id), `assets/audio/narration/${id}.m4a`);
    }
  }
}

export function setMuted(game, value) {
  muted = value;
  game.sound.mute = value;
  if (muted) stopNarration();
}

// Must be called inside a tap handler the first time (iOS audio rule).
export function unlockAudio(scene) {
  const ctx = scene.sound.context;
  if (ctx && ctx.state !== 'running') ctx.resume();
  // iOS also keeps the device voice silent until it has spoken once during a tap.
  // A silent line wakes it up, so unrecorded lines can use it later.
  if ('speechSynthesis' in window) {
    const wake = new SpeechSynthesisUtterance(' ');
    wake.volume = 0;
    speechSynthesis.speak(wake);
  }
}

let current = null;
let finishCurrent = null;
let usedSpeech = false;

// Speaks a line. The promise resolves when it ends or is interrupted,
// so callers can wait before moving on.
export function say(scene, id) {
  stopNarration();
  if (muted || !lines[id]) return Promise.resolve();

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(safety);
      if (finishCurrent === finish) finishCurrent = null;
      resolve();
    };
    finishCurrent = finish;
    // Speech "end" events are unreliable on iOS, so never wait forever.
    const safety = setTimeout(finish, 1500 + lines[id].text.length * 90);

    const key = narrationKey(id);
    if (scene.cache.audio.exists(key)) {
      const sound = scene.sound.add(key);
      sound.once('complete', () => {
        sound.destroy();
        if (current === sound) current = null;
        finish();
      });
      current = sound;
      sound.play();
    } else if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(lines[id].text);
      u.rate = 0.9;
      u.pitch = 1.1;
      u.onend = finish;
      u.onerror = finish;
      usedSpeech = true;
      speechSynthesis.speak(u);
    } else {
      finish();
    }
  });
}

export function stopNarration() {
  if (current) {
    current.stop();
    current.destroy();
    current = null;
  }
  // Only cancel speech we started, so the silent wake-up line in unlockAudio survives.
  if (usedSpeech) {
    speechSynthesis.cancel();
    usedSpeech = false;
  }
  if (finishCurrent) finishCurrent();
}

// Placeholder sound effects made from simple tones, until real SFX files exist.
const SFX = {
  good: [[523, 0, 0.12], [784, 0.1, 0.22]],
  boing: [[330, 0, 0.25, 180]],
  pop: [[660, 0, 0.08]],
  star: [[784, 0, 0.1], [988, 0.08, 0.1], [1319, 0.16, 0.3]],
};

export function sfx(scene, name) {
  const ctx = scene.sound.context;
  if (muted || !ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  for (const [freq, start, length, slideTo] of SFX[name]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + start + length);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.25, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + length + 0.05);
  }
}

// iOS suspends audio when the app is backgrounded and only lets it resume on a tap.
// Phaser already pauses the game loop and sounds while hidden.
export function installAudioGuards(game) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopNarration();
  });
  window.addEventListener('pointerdown', () => {
    const ctx = game.sound.context;
    if (ctx && ctx.state !== 'running') ctx.resume();
  });
}
