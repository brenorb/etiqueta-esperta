# Price ranking verification

| Skill | What it checks | Tool |
| --- | --- | --- |
| [verify-price-ranking](../../.claude/skills/verify-price-ranking/SKILL.md) | Each unit and currency gets one best buy, the cheapest comparable product | 2,000 generated lists per run against `calculator.js` |

Fixed along the way:

1. Products in different units or currencies were ranked against each other, so the page crowned a coffee priced per gram over toilet paper priced per meter.
2. One damaged saved item emptied the whole list on the next load.

## Compare shelf prices

Generated with pstack `/statechart` from [ComparePrices.tla](flows/compare-prices/ComparePrices.tla) ([TLC report](flows/compare-prices/report.md)).

```mermaid
---
title: "Compare shelf prices"
---
stateDiagram-v2
  s0: Empty list
  s1: One product, it leads
  s2: Ranked, one best buy
  s3: Ranked, a best buy per unit
  [*] --> s0
  s0 --> s1: you add a product
  s0 --> s2: you load the example
  s1 --> s0: you clear the list
  s1 --> s2: you add a product in the same unit or you load the example
  s1 --> s3: you add a product in another unit
  s2 --> s0: you clear the list
  s2 --> s3: you add a product in another unit
  s3 --> s0: you clear the list
  s3 --> s2: you load the example
```
