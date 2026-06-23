import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kurals = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/kurals.json'), 'utf-8'));
const underReview = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/chapters_under_review.json'), 'utf-8'));

const flatKurals = kurals.chapters.flatMap(ch => ch.kurals);
const removedChapterNums = new Set(underReview.chapters.map(ch => ch.chapter_number));
const removedKuralNums = new Set(underReview.chapters.flatMap(ch => ch.kurals.map(k => k.number)));

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

test('chapters under review are excluded from main data', () => {
  const chapterNums = new Set(kurals.chapters.map(ch => ch.chapter_number));
  for (const num of removedChapterNums) {
    assert.ok(!chapterNums.has(num), `chapter ${num} should be excluded but is present`);
  }
});

test('kural numbers from removed chapters are absent', () => {
  const presentNums = new Set(flatKurals.map(k => k.number));
  for (const num of removedKuralNums) {
    assert.ok(!presentNums.has(num), `kural ${num} from a removed chapter should not be in main data`);
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
