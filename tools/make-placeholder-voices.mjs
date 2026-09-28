// Makes stand-in narration with a built-in Windows voice (Microsoft Zira) for every
// line that has no recording yet, so the game has a real voice everywhere.
// Each file is marked "placeholder": the checklist still lists it as "to record",
// and recording it for real (prepare-narration.mjs) replaces it.
// Usage: node tools/make-placeholder-voices.mjs            (only lines with no audio)
//        node tools/make-placeholder-voices.mjs --redo     (also remake existing placeholders)
// Windows only (uses System.Speech). Needs ffmpeg, like prepare-narration.mjs.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VOICE = 'Microsoft Zira Desktop';
const RATE = -1; // a little slower than normal, for young listeners

const redo = process.argv.includes('--redo');
const root = fileURLToPath(new URL('..', import.meta.url));
const lines = JSON.parse(readFileSync(join(root, 'src/data/narration.json'), 'utf8'));
const todo = Object.entries(lines)
  .filter(([, line]) => !line.recorded || (redo && line.placeholder))
  .map(([id, line]) => ({ id, text: line.text }));

if (!todo.length) {
  console.log('Every line already has audio.');
  process.exit(0);
}

const work = join(tmpdir(), 'chemistry-placeholder-voices');
mkdirSync(work, { recursive: true });
const list = todo.map(({ id, text }) => ({ text, out: join(work, `${id}.wav`) }));
writeFileSync(join(work, 'lines.json'), JSON.stringify(list));

// One PowerShell run speaks every line into its own WAV file.
const script = `
Add-Type -AssemblyName System.Speech
$lines = Get-Content -Raw -Encoding UTF8 '${join(work, 'lines.json')}' | ConvertFrom-Json
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SelectVoice('${VOICE}')
$voice.Rate = ${RATE}
foreach ($line in $lines) {
  $voice.SetOutputToWaveFile($line.out)
  $voice.Speak($line.text)
}
$voice.SetOutputToNull()
$voice.Dispose()
`;
writeFileSync(join(work, 'speak.ps1'), script);
execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(work, 'speak.ps1')], { stdio: 'inherit' });

for (const { id } of todo) {
  execFileSync(process.execPath, [join(root, 'tools/prepare-narration.mjs'), join(work, `${id}.wav`), id, '--placeholder'], { stdio: 'inherit', cwd: root });
}
console.log(`Made ${todo.length} placeholder lines with ${VOICE}.`);
