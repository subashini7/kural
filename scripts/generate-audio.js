// generate-audio.js  — run locally with: node --env-file=.env scripts/generate-audio.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AZURE_KEY    = process.env.AZURE_TTS_KEY;
const AZURE_REGION = process.env.AZURE_TTS_REGION;
const ENDPOINT     = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

const ENGLISH_RATE = '-15%'; // slow English down so opening syllables like "A" are clear

const MALE_TAMIL   = 'ta-IN-ValluvarNeural';
const FEMALE_TAMIL = 'ta-IN-PallaviNeural';
const MALE_EN      = 'en-US-GuyNeural';
const FEMALE_EN    = 'en-US-JennyNeural';

// Voice pairing schedule for kurals 1-40
const BATCHES = [
  { from: 1,  to: 10, tamil: MALE_TAMIL,   english: FEMALE_EN, label: 'male-female'   },
  { from: 11, to: 20, tamil: FEMALE_TAMIL, english: MALE_EN,   label: 'female-male'   },
  { from: 21, to: 30, tamil: FEMALE_TAMIL, english: FEMALE_EN, label: 'female-female' },
  { from: 31, to: 40, tamil: MALE_TAMIL,   english: MALE_EN,   label: 'male-male'     },
];

function pairFor(number) {
  return BATCHES.find(b => number >= b.from && number <= b.to);
}

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function addEmphasis(escapedText) {
  // Emphasise "A" when used as a letter name (kural 1 and similar)
  return escapedText.replace(/\bthe letter A\b/g, 'the letter <emphasis level="moderate">A</emphasis>');
}

function buildSsml(tamilText, englishText, tamilVoice, englishVoice) {
  const processedEnglish = addEmphasis(escapeXml(englishText));
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ta-IN">
  <voice name="${tamilVoice}">${escapeXml(tamilText)}<break time="700ms"/></voice>
  <voice name="${englishVoice}"><prosody rate="${ENGLISH_RATE}">${processedEnglish}</prosody></voice>
</speak>`;
}

async function synthesize(kural, outDir) {
  const pair = pairFor(kural.number);
  const res  = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'kural-tts-generator',
    },
    body: buildSsml(kural.tamil, kural.english, pair.tamil, pair.english),
  });

  if (!res.ok) throw new Error(`Kural ${kural.number} failed: ${res.status} ${await res.text()}`);
  fs.writeFileSync(path.join(outDir, `${kural.number}.mp3`), Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${kural.number}.mp3  [${pair.label}]`);
}

async function main() {
  const dataPath = path.resolve(__dirname, '../data/kurals.json');
  const raw      = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const kurals   = raw.chapters
    .flatMap(ch => ch.kurals)
    .filter(k => k.number >= 1 && k.number <= 40);

  const outDir = path.resolve(__dirname, '../audio');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Generating ${kurals.length} kurals (1–40)...\n`);
  for (const b of BATCHES) {
    console.log(`  ${b.from}–${b.to}: ${b.label}  (${b.tamil} / ${b.english})`);
  }
  console.log();

  for (const k of kurals) {
    await synthesize(k, outDir);
    await new Promise(r => setTimeout(r, 200)); // gentle on rate limits
  }

  console.log(`\nDone — ${kurals.length} files written to audio/`);
}

main();
