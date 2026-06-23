import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml, addEmphasis, buildSsml } from '../scripts/generate-audio.js';

test('escapeXml: escapes ampersand', () => {
  assert.equal(escapeXml('a & b'), 'a &amp; b');
});

test('escapeXml: escapes less-than', () => {
  assert.equal(escapeXml('a < b'), 'a &lt; b');
});

test('escapeXml: escapes greater-than', () => {
  assert.equal(escapeXml('a > b'), 'a &gt; b');
});

test('escapeXml: escapes multiple special chars', () => {
  assert.equal(escapeXml('<tag attr="&">'), '&lt;tag attr="&amp;"&gt;');
});

test('escapeXml: leaves plain text unchanged', () => {
  assert.equal(escapeXml('hello world'), 'hello world');
});

test('addEmphasis: wraps "the letter A" with say-as tag', () => {
  const result = addEmphasis('learn the letter A today');
  assert.ok(result.includes('<say-as interpret-as="characters">A</say-as>'), 'missing say-as tag');
  assert.ok(result.includes('<break time="150ms"/>'), 'missing break tag');
});

test('addEmphasis: leaves text without "the letter A" unchanged', () => {
  const input = 'just a regular sentence';
  assert.equal(addEmphasis(input), input);
});

test('addEmphasis: only matches whole-word "A", not mid-word', () => {
  const input = 'the letter ABCD';
  assert.equal(addEmphasis(input), input);
});

test('buildSsml: contains both voice names', () => {
  const ssml = buildSsml('Tamil text', 'English text', 'ta-IN-ValluvarNeural', 'en-GB-SoniaNeural');
  assert.ok(ssml.includes('ta-IN-ValluvarNeural'), 'Tamil voice missing');
  assert.ok(ssml.includes('en-GB-SoniaNeural'), 'English voice missing');
});

test('buildSsml: contains both text bodies', () => {
  const ssml = buildSsml('Tamil text', 'English text', 'ta-IN-ValluvarNeural', 'en-GB-SoniaNeural');
  assert.ok(ssml.includes('Tamil text'), 'Tamil text missing');
  assert.ok(ssml.includes('English text'), 'English text missing');
});

test('buildSsml: XML-escapes special chars in text', () => {
  const ssml = buildSsml('a & b', 'x < y', 'ta-IN-ValluvarNeural', 'en-GB-SoniaNeural');
  assert.ok(ssml.includes('a &amp; b'), 'Tamil text not escaped');
  assert.ok(ssml.includes('x &lt; y'), 'English text not escaped');
});

test('buildSsml: includes break between voices', () => {
  const ssml = buildSsml('Tamil', 'English', 'ta-IN-ValluvarNeural', 'en-GB-SoniaNeural');
  assert.ok(ssml.includes('<break time="700ms"/>'), 'inter-voice break missing');
});

test('buildSsml: produces valid speak root element', () => {
  const ssml = buildSsml('Tamil', 'English', 'ta-IN-ValluvarNeural', 'en-GB-SoniaNeural');
  assert.ok(ssml.startsWith('<speak '), 'must start with <speak>');
  assert.ok(ssml.trimEnd().endsWith('</speak>'), 'must end with </speak>');
});
