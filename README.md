# திருக்குறள் · Thirukkural

A minimal, accessible web reader for the **Thirukkural** — 1,080 couplets composed by the Tamil poet-philosopher **Thiruvalluvar**, covering ethics (*Arathuppal*), wealth and governance (*Porrutpal*), and love.

## Live App

Open `index.html` directly in a browser — no build step or server required.

## Features

- Browse all 108 chapters and 1,080 kurals
- Keyboard navigation (← / → arrow keys)
- Random kural button
- Search by Tamil word, English phrase, or kural number
- Deep-linkable URLs (`?kural=610`)
- Fully accessible (ARIA live regions, skip link, focus management)

## Sources

### Tamil text

The Tamil couplets are sourced from [tk120404/thirukkural](https://github.com/tk120404/thirukkural), a structured dataset of all 1,080 kurals with chapter and section metadata.

### English translation

The English translations are a **modernized rendering**, written to read naturally to a contemporary audience rather than following any single classical translation word-for-word. Traditional 19th-century translations (such as G.U. Pope's 1886 edition) used archaic diction that can obscure the directness and wit of the original Tamil. The translations here restate each kural in plain, current English while preserving its meaning and imagery.

## Structure

```
kural/
├── index.html        # Single-file web app
└── data/
    └── kurals.json   # All 1,080 kurals with Tamil, English, chapter, and section fields
```

## Coverage

| Section | Chapters | Kurals |
|---|---|---|
| அறத்துப்பால் (Arathuppal — Virtue) | 1–38 | 1–380 |
| பொருட்பால் (Porrutpal — Wealth) | 39–108 | 381–1080 |

The third book, *Kamattupal* (Love), is not included in this dataset.
