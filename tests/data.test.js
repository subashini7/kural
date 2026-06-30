import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kurals = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/kurals.json'), 'utf-8'));

const flatKurals = kurals.chapters.flatMap(ch => ch.kurals);

test('every kural has required fields', () => {
  for (const k of flatKurals) {
    assert.ok(typeof k.number === 'number', `kural ${k.number}: number must be a number`);
    assert.ok(k.line1?.trim(), `kural ${k.number}: missing line1`);
    assert.ok(k.line2?.trim(), `kural ${k.number}: missing line2`);
    assert.ok(k.tamil?.trim(), `kural ${k.number}: missing tamil`);
    assert.ok(k.english?.trim(), `kural ${k.number}: missing english`);
  }
});

test('tamil field matches line1 + newline + line2', () => {
  for (const k of flatKurals) {
    assert.equal(k.tamil, `${k.line1}\n${k.line2}`, `kural ${k.number}: tamil mismatch`);
  }
});

test('no duplicate kural numbers', () => {
  const seen = new Set();
  for (const k of flatKurals) {
    assert.ok(!seen.has(k.number), `duplicate kural number: ${k.number}`);
    seen.add(k.number);
  }
});

test('kural numbers are positive integers', () => {
  for (const k of flatKurals) {
    assert.ok(Number.isInteger(k.number) && k.number > 0, `invalid kural number: ${k.number}`);
  }
});

test('each chapter has at least one kural', () => {
  for (const ch of kurals.chapters) {
    assert.ok(ch.kurals.length > 0, `chapter ${ch.chapter_number} has no kurals`);
  }
});

test('meta total_kurals matches actual count', () => {
  assert.equal(flatKurals.length, kurals.meta.total_kurals,
    `meta says ${kurals.meta.total_kurals} but found ${flatKurals.length}`);
});

test('no invalid Tamil Unicode codepoints in Tamil text', () => {
  const validRanges = [
    [0x0B82, 0x0B83], [0x0B85, 0x0B8A], [0x0B8E, 0x0B90],
    [0x0B92, 0x0B95], [0x0B99, 0x0B9A], [0x0B9C, 0x0B9C],
    [0x0B9E, 0x0B9F], [0x0BA3, 0x0BA4], [0x0BA8, 0x0BAA],
    [0x0BAE, 0x0BB9], [0x0BBE, 0x0BC2], [0x0BC6, 0x0BC8],
    [0x0BCA, 0x0BCD], [0x0BD0, 0x0BD0], [0x0BD7, 0x0BD7],
  ];
  const isValid = cp => validRanges.some(([lo, hi]) => cp >= lo && cp <= hi);
  for (const k of flatKurals) {
    for (const [field, text] of [['line1', k.line1], ['line2', k.line2]]) {
      for (const ch of text) {
        const cp = ch.codePointAt(0);
        if (cp >= 0x0B80 && cp <= 0x0BFF) {
          assert.ok(isValid(cp), `kural ${k.number} [${field}]: invalid Tamil codepoint U+${cp.toString(16).toUpperCase()} in "${text}"`);
        }
      }
    }
  }
});

test('each couplet has 4 words in line1 and 3 words in line2', () => {
  for (const k of flatKurals) {
    const w1 = k.line1.trim().split(/\s+/).length;
    const w2 = k.line2.trim().replace(/\.$/, '').split(/\s+/).length;
    assert.equal(w1, 4, `kural ${k.number} line1 has ${w1} words: ${k.line1}`);
    assert.equal(w2, 3, `kural ${k.number} line2 has ${w2} words: ${k.line2}`);
  }
});
