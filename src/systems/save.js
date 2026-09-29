// Progress saved on this device only. Every access is wrapped so a blocked or
// full localStorage (private mode, storage cleared) never breaks the game.

const KEY = 'chemistry-save-v1';

const DEFAULTS = {
  sound: true,
  stars: { sorter: 0 },
  sorterIntroSeen: false,
  labIntroSeen: false,
  stickers: [],
  builderIntroSeen: false,
  molecules: [],
  tips: [], // one-time explanations already given, by name
  heatFound: [], // Heat Slider changes seen, e.g. "water.melt"
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

export function isBuilderIntroSeen() {
  return data.builderIntroSeen;
}

export function markBuilderIntroSeen() {
  data.builderIntroSeen = true;
  persist();
}

export function hasMolecule(id) {
  return data.molecules.includes(id);
}

export function moleculeCount() {
  return data.molecules.length;
}

export function addMolecule(id) {
  if (hasMolecule(id)) return;
  data.molecules = [...data.molecules, id];
  persist();
}

export function tipShown(name) {
  return data.tips.includes(name);
}

export function markTipShown(name) {
  if (tipShown(name)) return;
  data.tips = [...data.tips, name];
  persist();
}

export function heatFound(id) {
  return data.heatFound.includes(id);
}

export function heatFoundCount() {
  return data.heatFound.length;
}

// Returns true if this change is new.
export function addHeatFound(id) {
  if (heatFound(id)) return false;
  data.heatFound = [...data.heatFound, id];
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
