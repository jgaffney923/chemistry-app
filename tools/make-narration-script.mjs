// Writes narration-script.md: every line to record, and which are still missing.
// Usage: node tools/make-narration-script.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const at = (p) => new URL(`../${p}`, import.meta.url);
const lines = JSON.parse(readFileSync(at('src/data/narration.json'), 'utf8'));

let done = 0;
const rows = Object.entries(lines).map(([id, { text, recorded, placeholder }]) => {
  const hasFile = existsSync(at(`assets/audio/narration/${id}.m4a`));
  let status = 'TO RECORD';
  if (hasFile && recorded && placeholder) status = 'TO RECORD (computer voice for now)';
  else if (hasFile && recorded) status = 'done';
  else if (hasFile) status = 'file present, but not marked recorded';
  else if (recorded) status = 'MISSING FILE (marked recorded)';
  if (status === 'done') done += 1;
  return `| \`${id}\` | ${text} | ${status} |`;
});

const md = `# Narration script

**${done} of ${rows.length} lines recorded.** Lines marked "computer voice for now"
play a stand-in voice until you record them.

How to add a recording (details in README.md):
1. Record the line (iPhone Voice Memos is fine) and save it into \`recordings-raw/\`.
2. Run \`node tools/prepare-narration.mjs "recordings-raw/<file>.m4a" <id>\`.
3. Regenerate this file with \`node tools/make-narration-script.mjs\`.

Tips: quiet room, phone about a hand's width from your mouth, a short pause
before and after each line, one line per file. Upbeat and slow, as if talking
to a 6-year-old.

| File name (id) | Say this | Status |
|---|---|---|
${rows.join('\n')}
`;

writeFileSync(at('narration-script.md'), md);
console.log(`narration-script.md: ${done} of ${rows.length} recorded`);
