// Automated checks in a real browser, for errors that only show up while the game runs.
// Needs Playwright on this computer (it's not part of the app):
//   npm install -g playwright      then      node tools/browser-check.mjs
// Uses Playwright's Chromium; set PW_CHANNEL=msedge to drive Edge instead, or
// PW_BROWSER=webkit for Safari's engine (after: playwright install webkit).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

// Find Playwright locally or in the global npm folder.
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    try {
      return require(join(globalRoot, 'playwright'));
    } catch {
      console.error('Playwright is not installed. Run: npm install -g playwright   then: npx playwright install chromium');
      process.exit(2);
    }
  }
}
const engine = process.env.PW_BROWSER || 'chromium';
const browserType = loadPlaywright()[engine];

const root = fileURLToPath(new URL('..', import.meta.url));
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.m4a': 'audio/mp4', '.txt': 'text/plain',
};

// A tiny static server. The game is only reachable from tests on "localhost".
async function serveFiles(req, res) {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  const file = path || 'index.html';
  try {
    const body = await readFile(join(root, file));
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}

async function startServer() {
  const server = createServer(serveFiles);
  await new Promise((resolve) => server.listen(0, 'localhost', resolve));
  return { server, url: `http://localhost:${server.address().port}/` };
}
const { server, url: base } = await startServer();

const browser = await browserType.launch(engine === 'chromium' && process.env.PW_CHANNEL
  ? { channel: process.env.PW_CHANNEL } : {});
const results = [];

// Runs one check in a fresh browser (empty save). Any page error or console
// error during the check fails it.
async function check(name, fn) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 1024 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  try {
    await fn(page, context);
    if (errors.length) throw new Error(`page errors: ${errors.join(' | ')}`);
    results.push([name, null]);
  } catch (e) {
    results.push([name, e.message]);
  }
  await context.close();
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Opens the game and taps the big start button, as a kid would, to reach the Science House.
async function openHome(page, url = base) {
  await page.goto(url);
  await page.waitForFunction(() => window.__game?.scene.isActive('Boot'), null, { timeout: 15000 });
  // The start button sits in the middle of the game, which is centred on the page.
  const box = await page.locator('#game canvas').boundingBox();
  await pause(300);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForFunction(() => window.__game.scene.isActive('Menu'), null, { timeout: 10000 });
}

// Every game id in src/home/games.js, read from the running game.
let gameIds = [];

await check('the game loads to the Science House and every room opens', async (page) => {
  await openHome(page);
  await pause(1000);
  gameIds = await page.evaluate(async () => Object.keys((await import(`${location.origin}/src/home/games.js`)).GAMES));
  const rooms = await page.evaluate(() => window.__game.cache.json.get('rooms').rooms.map((r) => r.id));
  for (const id of rooms) {
    await page.evaluate((r) => window.__game.scene.getScene('Menu').showRoom(r, false), id);
    await pause(500);
  }
  await page.evaluate(() => window.__game.scene.getScene('Menu').showHouse(false));
  await pause(500);
});

if (!gameIds.length) results.push(['every game in src/home/games.js starts', 'could not read the game list']);

// Starts each game the way its Science House button does, then lets it run a moment.
for (const id of gameIds) {
  await check(`the "${id}" game starts`, async (page) => {
    await openHome(page);
    await page.evaluate(async (g) => {
      const { GAMES } = await import(`${location.origin}/src/home/games.js`);
      GAMES[g].start(window.__game.scene.getScene('Menu'));
    }, id);
    await page.waitForFunction(() => !window.__game.scene.isActive('Menu') && window.__game.scene.getScenes(true).length > 0,
      null, { timeout: 10000 });
    await pause(2000);
    const active = await page.evaluate(() => window.__game.scene.getScenes(true).map((s) => s.sys.settings.key));
    if (!active.length || active.includes('Menu') || active.includes('Boot')) throw new Error(`running scenes: ${active.join(', ') || 'none'}`);
  });
}

await check('the service worker caches every file in its precache list', async (page) => {
  await page.goto(`${base}?sw=1`);
  await page.waitForFunction(() => window.__game?.scene.isActive('Boot'), null, { timeout: 15000 });
  const missing = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    const source = await (await fetch(reg.active.scriptURL)).text();
    const list = source.match(/const PRECACHE = \[([\s\S]*?)\];/)[1].match(/'[^']+'/g).map((s) => s.slice(1, -1));
    const name = (await caches.keys()).find((n) => n.startsWith('chemistry-'));
    if (!name) return ['(no chemistry cache at all)'];
    const cached = new Set((await (await caches.open(name)).keys()).map((r) => r.url));
    return list.filter((f) => !cached.has(new URL(f, reg.scope).href));
  });
  if (missing.length) throw new Error(`not cached: ${missing.join(', ')}`);
});

await browser.close();
server.close();

console.log(`Browser: ${engine}${process.env.PW_CHANNEL ? ` (${process.env.PW_CHANNEL})` : ''}`);
for (const [name, problem] of results) console.log(`${problem ? 'FAIL' : 'ok  '} ${name}${problem ? `\n     ${problem}` : ''}`);
process.exit(results.some(([, problem]) => problem) ? 1 : 0);
