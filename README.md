# திருக்குறள் · Thirukkural

A minimal, accessible web reader for the **Thirukkural** — 1,080 couplets composed by the Tamil poet-philosopher **Thiruvalluvar**, covering ethics (*Arathuppal*), wealth and governance (*Porrutpal*), and love (*Kamattupal*).

## Live App

**[https://subashini7.github.io/kural/](https://subashini7.github.io/kural/?kural=1)**

Or open `index.html` directly in a browser — no build step or server required.

## Features

- Browse all chapters and kurals with Tamil and English side by side
- Keyboard navigation (← / → arrow keys)
- Random kural button
- Search by Tamil word, English phrase, or kural number
- Deep-linkable URLs (`?kural=610`)
- Per-kural audio playback (Tamil + English, read aloud)
- **Play Randomly (1–230)** — shuffles all 210 available kurals and plays them in a fresh random order each time
- Fully accessible (ARIA live regions, skip link, focus management)

## Translation Philosophy

The English translations in this project are not a word-for-word rendering of any classical edition. They were written from the Tamil source with four guiding principles:

### 1. Accuracy
Every translation is cross-checked against the Tamil text to ensure the core meaning, imagery, and logical structure of each kural is preserved. Where classical English translations introduced errors — reversals of meaning, omitted key Tamil words, or invented concepts not present in the original — those have been corrected.

### 2. Inclusivity
Traditional translations sometimes used disability as a metaphor for moral failure (e.g. "eyes that cannot see" to mean "useless"). This edition replaces such language with functional, non-hurtful alternatives that preserve the poetic intent without treating any physical difference as a stand-in for inadequacy.

### 3. Gender Neutrality
Thiruvalluvar's philosophy is universal. Where the Tamil uses male-specific terms as a grammatical convention (a common feature of classical Tamil), this edition uses gender-neutral language — "they/them/a person" rather than "he/him" — so the wisdom speaks to every reader equally.

### 4. Layman Simplicity for a Global Audience
The translations are written to read naturally to a contemporary global audience in 2026. Corporate jargon, academic abstractions, and archaic diction have all been removed. The goal is for each kural to land with the same directness and wit it carries in Tamil — no footnotes required.

## Audio

Audio files are generated using **Azure Cognitive Services Text-to-Speech**:

- **Tamil**: `ta-IN-ValluvarNeural` (male) at −25% speed
- **English**: `en-GB-SoniaNeural` (female) at −25% speed
- Format: 24 kHz mono MP3

Audio is available for kurals **1–230** (210 kurals; chapters under review are excluded). The script to regenerate audio is in `scripts/generate-audio.js` and requires an `.env` file with `AZURE_TTS_KEY` and `AZURE_TTS_REGION`.

## Sources

### Tamil text

The Tamil couplets are sourced from [tk120404/thirukkural](https://github.com/tk120404/thirukkural), a structured dataset of all 1,080 kurals with chapter and section metadata.

### English translation

Original modernised rendering written for this project, cross-checked against the Tamil source and reviewed for accuracy, inclusivity, gender neutrality, and plain-language clarity.

## Project Structure

```
kural/
├── index.html              # Single-file web app (no build step)
├── data/
│   ├── kurals.json         # Active kurals with Tamil, English, chapter, and section fields
│   └── chapters_under_review.json  # Chapters temporarily removed pending translation review
├── audio/
│   └── {number}.mp3        # Pre-generated TTS audio for kurals 1–230
└── scripts/
    └── generate-audio.js   # Azure TTS generation script (requires .env)
```

## Coverage

| Section | Chapters | Kurals |
|---|---|---|
| அறத்துப்பால் (Arathuppal — Virtue) | 1–38 | 1–380 |
| பொருட்பால் (Porrutpal — Wealth) | 39–108 | 381–1080 |

> **Note:** Three chapters (6, 15, 92) are currently in `data/chapters_under_review.json` and not displayed in the app. They are being reviewed for gendered framing before being reintroduced with updated translations.

Audio playback is available for kurals 1–230 (210 kurals, skipping the chapters under review).
