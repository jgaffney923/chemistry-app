// Offline cache for the whole game.
// Run `node tools/update-sw.mjs` before each deploy: it rewrites the file list
// below and bumps CACHE_VERSION so iPads pick up the new files.

const CACHE_VERSION = 24;
const CACHE_NAME = `chemistry-v${CACHE_VERSION}`;

// PRECACHE-START
const PRECACHE = [
  './',
  'assets/audio/narration/atom.C.m4a',
  'assets/audio/narration/atom.H.m4a',
  'assets/audio/narration/atom.O.m4a',
  'assets/audio/narration/boot.welcome.m4a',
  'assets/audio/narration/builder.addH.m4a',
  'assets/audio/narration/builder.addH2.m4a',
  'assets/audio/narration/builder.allMade.m4a',
  'assets/audio/narration/builder.broken.m4a',
  'assets/audio/narration/builder.cleared.m4a',
  'assets/audio/narration/builder.complete.m4a',
  'assets/audio/narration/builder.double.m4a',
  'assets/audio/narration/builder.free.m4a',
  'assets/audio/narration/builder.full.m4a',
  'assets/audio/narration/builder.intro.m4a',
  'assets/audio/narration/builder.plusTip.m4a',
  'assets/audio/narration/builder.triple.m4a',
  'assets/audio/narration/change.butter.meltedButter.m4a',
  'assets/audio/narration/change.chocolate.meltedChocolate.m4a',
  'assets/audio/narration/change.ice.water.m4a',
  'assets/audio/narration/change.meltedChocolate.chocolate.m4a',
  'assets/audio/narration/change.steam.water.m4a',
  'assets/audio/narration/change.water.ice.m4a',
  'assets/audio/narration/change.water.steam.m4a',
  'assets/audio/narration/chg.bakeCake.do.m4a',
  'assets/audio/narration/chg.bakeCake.result.m4a',
  'assets/audio/narration/chg.brownApple.do.m4a',
  'assets/audio/narration/chg.brownApple.result.m4a',
  'assets/audio/narration/chg.cookEgg.do.m4a',
  'assets/audio/narration/chg.cookEgg.result.m4a',
  'assets/audio/narration/chg.dissolveSugar.do.m4a',
  'assets/audio/narration/chg.dissolveSugar.result.m4a',
  'assets/audio/narration/chg.freezeWater.do.m4a',
  'assets/audio/narration/chg.freezeWater.result.m4a',
  'assets/audio/narration/chg.meltButter.do.m4a',
  'assets/audio/narration/chg.meltButter.result.m4a',
  'assets/audio/narration/chg.meltChocolate.do.m4a',
  'assets/audio/narration/chg.meltChocolate.result.m4a',
  'assets/audio/narration/chg.meltIce.do.m4a',
  'assets/audio/narration/chg.meltIce.result.m4a',
  'assets/audio/narration/chg.rustNail.do.m4a',
  'assets/audio/narration/chg.rustNail.result.m4a',
  'assets/audio/narration/chg.toast.do.m4a',
  'assets/audio/narration/chg.toast.result.m4a',
  'assets/audio/narration/disc.boilWater.m4a',
  'assets/audio/narration/disc.fizz.m4a',
  'assets/audio/narration/disc.freezeWater.m4a',
  'assets/audio/narration/disc.hardenButter.m4a',
  'assets/audio/narration/disc.hardenChocolate.m4a',
  'assets/audio/narration/disc.iceFloats.m4a',
  'assets/audio/narration/disc.meltButter.m4a',
  'assets/audio/narration/disc.meltChocolate.m4a',
  'assets/audio/narration/disc.meltIce.m4a',
  'assets/audio/narration/disc.oilFloats.m4a',
  'assets/audio/narration/disc.saltDissolves.m4a',
  'assets/audio/narration/disc.sandSinks.m4a',
  'assets/audio/narration/disc.sugarDissolves.m4a',
  'assets/audio/narration/disc.toast.m4a',
  'assets/audio/narration/disc.toastStays.m4a',
  'assets/audio/narration/heat.allFound.m4a',
  'assets/audio/narration/heat.butter.freeze.m4a',
  'assets/audio/narration/heat.butter.melt.m4a',
  'assets/audio/narration/heat.chocolate.freeze.m4a',
  'assets/audio/narration/heat.chocolate.melt.m4a',
  'assets/audio/narration/heat.compare.butter.m4a',
  'assets/audio/narration/heat.compare.chocolate.m4a',
  'assets/audio/narration/heat.hint.butter.freeze.m4a',
  'assets/audio/narration/heat.hint.butter.melt.m4a',
  'assets/audio/narration/heat.hint.chocolate.freeze.m4a',
  'assets/audio/narration/heat.hint.chocolate.melt.m4a',
  'assets/audio/narration/heat.hint.water.boil.m4a',
  'assets/audio/narration/heat.hint.water.condense.m4a',
  'assets/audio/narration/heat.hint.water.freeze.m4a',
  'assets/audio/narration/heat.hint.water.melt.m4a',
  'assets/audio/narration/heat.intro.m4a',
  'assets/audio/narration/heat.pick.butter.m4a',
  'assets/audio/narration/heat.pick.chocolate.m4a',
  'assets/audio/narration/heat.pick.water.m4a',
  'assets/audio/narration/heat.water.boil.m4a',
  'assets/audio/narration/heat.water.condense.m4a',
  'assets/audio/narration/heat.water.freeze.m4a',
  'assets/audio/narration/heat.water.melt.m4a',
  'assets/audio/narration/hint.boilWater.m4a',
  'assets/audio/narration/hint.fizz.m4a',
  'assets/audio/narration/hint.freezeWater.m4a',
  'assets/audio/narration/hint.hardenButter.m4a',
  'assets/audio/narration/hint.hardenChocolate.m4a',
  'assets/audio/narration/hint.iceFloats.m4a',
  'assets/audio/narration/hint.meltButter.m4a',
  'assets/audio/narration/hint.meltChocolate.m4a',
  'assets/audio/narration/hint.meltIce.m4a',
  'assets/audio/narration/hint.oilFloats.m4a',
  'assets/audio/narration/hint.saltDissolves.m4a',
  'assets/audio/narration/hint.sandSinks.m4a',
  'assets/audio/narration/hint.sugarDissolves.m4a',
  'assets/audio/narration/hint.toast.m4a',
  'assets/audio/narration/hint.toastStays.m4a',
  'assets/audio/narration/house.intro.m4a',
  'assets/audio/narration/intro.done.m4a',
  'assets/audio/narration/intro.gas.m4a',
  'assets/audio/narration/intro.gas.try.m4a',
  'assets/audio/narration/intro.liquid.m4a',
  'assets/audio/narration/intro.liquid.try.m4a',
  'assets/audio/narration/intro.solid.m4a',
  'assets/audio/narration/intro.solid.try.m4a',
  'assets/audio/narration/item.bakingSoda.name.m4a',
  'assets/audio/narration/item.balloon.fact.m4a',
  'assets/audio/narration/item.balloon.name.m4a',
  'assets/audio/narration/item.bread.name.m4a',
  'assets/audio/narration/item.brick.fact.m4a',
  'assets/audio/narration/item.brick.name.m4a',
  'assets/audio/narration/item.butter.fact.m4a',
  'assets/audio/narration/item.butter.name.m4a',
  'assets/audio/narration/item.chocolate.fact.m4a',
  'assets/audio/narration/item.chocolate.name.m4a',
  'assets/audio/narration/item.crayon.fact.m4a',
  'assets/audio/narration/item.crayon.name.m4a',
  'assets/audio/narration/item.honey.fact.m4a',
  'assets/audio/narration/item.honey.name.m4a',
  'assets/audio/narration/item.ice.fact.m4a',
  'assets/audio/narration/item.ice.name.m4a',
  'assets/audio/narration/item.juice.fact.m4a',
  'assets/audio/narration/item.juice.name.m4a',
  'assets/audio/narration/item.meltedButter.fact.m4a',
  'assets/audio/narration/item.meltedButter.name.m4a',
  'assets/audio/narration/item.meltedChocolate.fact.m4a',
  'assets/audio/narration/item.meltedChocolate.name.m4a',
  'assets/audio/narration/item.milk.fact.m4a',
  'assets/audio/narration/item.milk.name.m4a',
  'assets/audio/narration/item.oil.name.m4a',
  'assets/audio/narration/item.puff.fact.m4a',
  'assets/audio/narration/item.puff.name.m4a',
  'assets/audio/narration/item.rock.fact.m4a',
  'assets/audio/narration/item.rock.name.m4a',
  'assets/audio/narration/item.salt.name.m4a',
  'assets/audio/narration/item.sand.name.m4a',
  'assets/audio/narration/item.spoon.fact.m4a',
  'assets/audio/narration/item.spoon.name.m4a',
  'assets/audio/narration/item.steam.fact.m4a',
  'assets/audio/narration/item.steam.name.m4a',
  'assets/audio/narration/item.sugar.name.m4a',
  'assets/audio/narration/item.teddy.fact.m4a',
  'assets/audio/narration/item.teddy.name.m4a',
  'assets/audio/narration/item.toast.name.m4a',
  'assets/audio/narration/item.vinegar.name.m4a',
  'assets/audio/narration/item.water.fact.m4a',
  'assets/audio/narration/item.water.name.m4a',
  'assets/audio/narration/lab.allFound.m4a',
  'assets/audio/narration/lab.bakingSodaAlone.m4a',
  'assets/audio/narration/lab.beaker.m4a',
  'assets/audio/narration/lab.free.m4a',
  'assets/audio/narration/lab.freezer.m4a',
  'assets/audio/narration/lab.freshWater.m4a',
  'assets/audio/narration/lab.hotPlate.m4a',
  'assets/audio/narration/lab.intro.m4a',
  'assets/audio/narration/lab.magnifier.m4a',
  'assets/audio/narration/lab.magnify.dissolved.m4a',
  'assets/audio/narration/lab.magnify.grains.m4a',
  'assets/audio/narration/lab.magnify.oil.m4a',
  'assets/audio/narration/lab.magnify.sand.m4a',
  'assets/audio/narration/lab.magnify.water.m4a',
  'assets/audio/narration/lab.notInBeaker.m4a',
  'assets/audio/narration/lab.nothing.m4a',
  'assets/audio/narration/lab.spoon.m4a',
  'assets/audio/narration/lab.stickers.m4a',
  'assets/audio/narration/lab.stir.m4a',
  'assets/audio/narration/lab.stirred.m4a',
  'assets/audio/narration/lab.vinegarAlone.m4a',
  'assets/audio/narration/level2.cool.m4a',
  'assets/audio/narration/level2.heat.m4a',
  'assets/audio/narration/level2.intro.m4a',
  'assets/audio/narration/level2.unlocked.m4a',
  'assets/audio/narration/menu.soon.m4a',
  'assets/audio/narration/mol.carbonDioxide.m4a',
  'assets/audio/narration/mol.hydrogen.m4a',
  'assets/audio/narration/mol.methane.m4a',
  'assets/audio/narration/mol.oxygen.m4a',
  'assets/audio/narration/mol.water.m4a',
  'assets/audio/narration/recipe.carbonDioxide.m4a',
  'assets/audio/narration/recipe.hydrogen.m4a',
  'assets/audio/narration/recipe.methane.m4a',
  'assets/audio/narration/recipe.oxygen.m4a',
  'assets/audio/narration/recipe.water.m4a',
  'assets/audio/narration/room.back.m4a',
  'assets/audio/narration/room.kitchen.m4a',
  'assets/audio/narration/room.lab.m4a',
  'assets/audio/narration/sorter.done.m4a',
  'assets/audio/narration/sorter.hint.m4a',
  'assets/audio/narration/sorter.intro.m4a',
  'assets/audio/narration/sorter.pickLevel.m4a',
  'assets/audio/narration/sorter.tryAgain.m4a',
  'assets/audio/narration/state.gas.m4a',
  'assets/audio/narration/state.liquid.m4a',
  'assets/audio/narration/state.solid.m4a',
  'assets/audio/narration/undo.ask.m4a',
  'assets/audio/narration/undo.binNo.m4a',
  'assets/audio/narration/undo.binYes.m4a',
  'assets/audio/narration/undo.done.m4a',
  'assets/audio/narration/undo.intro.m4a',
  'assets/audio/narration/undo.right.m4a',
  'assets/audio/narration/undo.surprise.m4a',
  'assets/audio/narration/undo.test.m4a',
  'assets/icons/icon-180.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'index.html',
  'manifest.webmanifest',
  'src/art/atoms.js',
  'src/art/items.js',
  'src/builder/Atom.js',
  'src/builder/Balloon.js',
  'src/builder/shapes.js',
  'src/data/changes.json',
  'src/data/float.json',
  'src/data/heat.json',
  'src/data/items.json',
  'src/data/lab.json',
  'src/data/molecules.json',
  'src/data/narration.json',
  'src/data/rooms.json',
  'src/data/unmix.json',
  'src/float/art.js',
  'src/float/ui.js',
  'src/heat/ParticleView.js',
  'src/heat/Thermometer.js',
  'src/home/games.js',
  'src/intro/props.js',
  'src/lab/Beaker.js',
  'src/lab/Magnifier.js',
  'src/lab/Station.js',
  'src/lab/StickerBook.js',
  'src/lab/props.js',
  'src/layout.js',
  'src/main.js',
  'src/scenes/BootScene.js',
  'src/scenes/BuilderScene.js',
  'src/scenes/FloatScene.js',
  'src/scenes/HeatScene.js',
  'src/scenes/LabScene.js',
  'src/scenes/LayersScene.js',
  'src/scenes/MenuScene.js',
  'src/scenes/SorterIntroScene.js',
  'src/scenes/SorterScene.js',
  'src/scenes/UndoScene.js',
  'src/scenes/UnmixScene.js',
  'src/sorter/Bin.js',
  'src/systems/audio.js',
  'src/systems/drag.js',
  'src/systems/save.js',
  'src/ui/button.js',
  'src/ui/effects.js',
  'src/ui/emoji.js',
  'src/ui/parentCorner.js',
  'src/unmix/art.js',
  'src/version.js',
  'vendor/phaser.min.js',
];
// PRECACHE-END

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // cache: 'reload' skips the browser's HTTP cache (GitHub Pages lets it keep
      // files for 10 minutes), so a new version never stores the old files.
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(cacheFirst(req));
  }
});

// The page itself: try the network briefly so updates arrive, else use the cache.
async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await withTimeout(fetch(req), 3000);
    if (res.ok) cache.put('./', res.clone());
    return res;
  } catch {
    return (await cache.match('./')) || Response.error();
  }
}

// Everything else never changes within a version: cache first.
async function cacheFirst(req) {
  const cached = await caches.match(req, { ignoreSearch: true });
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, res.clone());
  }
  return res;
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}
