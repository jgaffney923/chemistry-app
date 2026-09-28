// Progress saved on this device only. Every access is wrapped so a blocked or
// full localStorage (private mode, storage cleared) never breaks the game.

const KEY = 'chemistry-save-v1';

const DEFAULTS = {
  sound: true,
  stars: { sorter: 0 },
  sorterIntroSeen: false,
  labIntroSeen: false,
  stickers: [],
};

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...DEFAULTS, ...saved, stars: { ...DEFAULTS.stars, ...saved.stars } };
    }
  } catch {
    // fall through to defaults
  }
  return structuredClone(DEFAULTS);
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // progress lasts for this session only
  }
}

export function getStars(game) {
  return data.stars[game] || 0;
}

export function addStars(game, count) {
  data.stars[game] = getStars(game) + count;
  persist();
}

export function isSorterIntroSeen() {
  return data.sorterIntroSeen;
}

export function markSorterIntroSeen() {
  data.sorterIntroSeen = true;
  persist();
}

export function isLabIntroSeen() {
  return data.labIntroSeen;
}

export function markLabIntroSeen() {
  data.labIntroSeen = true;
  persist();
}

export function hasSticker(id) {
  return data.stickers.includes(id);
}

export function stickerCount() {
  return data.stickers.length;
}

// Returns true if this is a new sticker.
export function addSticker(id) {
  if (hasSticker(id)) return false;
  data.stickers = [...data.stickers, id];
  persist();
  return true;
}

export function isSoundOn() {
  return data.sound;
}

export function setSoundOn(on) {
  data.sound = on;
  persist();
}

export function resetProgress() {
  data = { ...structuredClone(DEFAULTS), sound: data.sound };
  persist();
}
