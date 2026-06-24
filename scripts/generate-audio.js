// generate-audio.js  — run locally with: node --env-file=.env scripts/generate-audio.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AZURE_KEY    = process.env.AZURE_TTS_KEY;
const AZURE_REGION = process.env.AZURE_TTS_REGION;
const ENDPOINT     = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

const TAMIL_RATE   = '-25%';
const ENGLISH_RATE = '-25%';

const MALE_TAMIL   = 'ta-IN-ValluvarNeural';
const FEMALE_TAMIL = 'ta-IN-PallaviNeural';
const MALE_EN      = 'en-GB-RyanNeural';
const FEMALE_EN    = 'en-GB-SoniaNeural';

const PAIR = { tamil: MALE_TAMIL, english: FEMALE_EN }; // Valluvar + Sonia

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function addEmphasis(escapedText) {
  return escapedText
    // Force TTS to read "A" as the letter name "ay", not the article "uh"
    .replace(
      /\bthe letter A\b/g,
      'the letter <say-as interpret-as="characters">A</say-as><break time="150ms"/>'
    )
    // Force injury pronunciation ("wuːnd"), not winding ("waʊnd")
    .replace(/\bwound\b/g, '<phoneme alphabet="ipa" ph="wuːnd">wound</phoneme>');
}

function buildSsml(tamilText, englishText, tamilVoice, englishVoice) {
  const processedEnglish = addEmphasis(escapeXml(englishText));
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ta-IN">
  <voice name="${tamilVoice}"><prosody rate="${TAMIL_RATE}">${escapeXml(tamilText)}<break time="700ms"/></prosody></voice>
  <voice name="${englishVoice}"><prosody rate="${ENGLISH_RATE}">${processedEnglish}</prosody></voice>
</speak>`;
}

async function synthesize(kural, pair, filename, outDir) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'kural-tts-generator',
    },
    body: buildSsml(kural.tamil, kural.english, pair.tamil, pair.english),
  });

  if (!res.ok) throw new Error(`Kural ${kural.number} (${pair.label}) failed: ${res.status} ${await res.text()}`);
  fs.writeFileSync(path.join(outDir, filename), Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${filename}`);
}

async function main() {
  const dataPath = path.resolve(__dirname, '../data/kurals.json');
  const raw      = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const kurals   = raw.chapters
    .flatMap(ch => ch.kurals)
    .filter(k => k.number >= 1);

  const outDir = path.resolve(__dirname, '../audio');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Generating ${kurals.length} kurals (all active, excl. chapters under review) — ${PAIR.tamil} / ${PAIR.english}\n`);

  for (const k of kurals) {
    await synthesize(k, PAIR, `${k.number}.mp3`, outDir);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone — ${kurals.length} files written to audio/`);
}

export { escapeXml, addEmphasis, buildSsml };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
