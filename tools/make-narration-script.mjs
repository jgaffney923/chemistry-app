// Writes narration-script.md: every line to record, and which are still missing.
// Usage: node tools/make-narration-script.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const at = (p) => new URL(`../${p}`, import.meta.url);
const lines = JSON.parse(readFileSync(at('src/data/narration.json'), 'utf8'));

const rows = Object.entries(lines).map(([id, { text, recorded }]) => {
  const file = `assets/audio/narration/${id}.m4a`;
  const hasFile = existsSync(at(file));
  let status = hasFile ? 'done' : 'TO RECORD';
  if (hasFile && !recorded) status = 'file present, set "recorded": true';
  if (!hasFile && recorded) status = 'MISSING FILE (marked recorded)';
  return `| \`${id}\` | ${text} | ${status} |`;
});

const md = `# Narration script

Record each line below and save it as \`assets/audio/narration/<id>.m4a\`.
Then set \`"recorded": true\` for that line in \`src/data/narration.json\`.
Regenerate this file with \`node tools/make-narration-script.mjs\`.

Tips: quiet room, phone about a hand's width from your mouth, a short pause
before and after each line, one line per file. Upbeat and slow, as if talking
to a 6-year-old. The iPhone Voice Memos app records .m4a.

| File name (id) | Say this | Status |
|---|---|---|
${rows.join('\n')}
`;

writeFileSync(at('narration-script.md'), md);
console.log(`narration-script.md: ${rows.length} lines`);
