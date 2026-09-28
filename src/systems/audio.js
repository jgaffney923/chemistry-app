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

export function setMuted(value) {
  muted = value;
  if (muted) stopNarration();
}

// Must be called inside a tap handler the first time (iOS audio rule).
export function unlockAudio(scene) {
  const ctx = scene.sound.context;
  if (ctx && ctx.state !== 'running') ctx.resume();
}

let current = null;

export function say(scene, id) {
  if (muted) return;
  stopNarration();
  const key = narrationKey(id);
  if (scene.cache.audio.exists(key)) {
    const sound = scene.sound.add(key);
    sound.once('complete', () => {
      sound.destroy();
      if (current === sound) current = null;
    });
    current = sound;
    sound.play();
  } else if (lines[id] && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(lines[id].text);
    u.rate = 0.9;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
  }
}

export function stopNarration() {
  if (current) {
    current.stop();
    current.destroy();
    current = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
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
