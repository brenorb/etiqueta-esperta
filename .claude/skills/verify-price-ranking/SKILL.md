---
name: verify-price-ranking
description: Run generated product lists through the real price ranking to check that each unit and currency gets exactly one best buy, the cheapest comparable product, with deltas against it. Use when changing calculateProduct, comparisonGroup, rankProducts or restoreProducts in calculator.js, or the leaderboard in app.js.
---

# Verify the price ranking

**Properties**, checked on the real `calculator.js`:

- `EveryProductRanked`: every product in the list is ranked.
- `OneLeaderPerUnit`: each measure label (trimmed, case-insensitive) and currency has exactly one best buy.
- `LeaderIsCheapestComparable`: that best buy has the lowest price per measure in its group.
- `DeltaAgainstOwnLeader`: "x% mais caro" is measured against the leader of the product's own group.
- `RanksCountWithinUnit`: ranks run 1, 2, 3... within each group.

**Harm if broken.** The page tells a shopper to buy the wrong product, comparing a price per gram with a price per meter.

## Run

```sh
node .claude/skills/verify-price-ranking/check-ranking.mjs 2000 1
npm test
```

The arguments are the number of generated lists and the seed. The check prints `all ranking rules hold`.

## Able to fail

In `rankProducts`, replace `const key = comparisonGroup(product);` with `const key = "all";`. The check then reports `DeltaAgainstOwnLeader` and `RanksCountWithinUnit`. Restore the file afterwards.

## Coverage

Synced with the code at commit `5b7e1ef`. Covered: `calculateProduct`, `comparisonGroup`, `rankProducts`; `restoreProducts` through `tests/ranking-rules.test.js`. Not covered: unit conversion (kg against g is still two groups), the history list, and the DOM rendering in `app.js`, which was checked by hand in a browser.
