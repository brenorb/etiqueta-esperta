import test from "node:test";
import assert from "node:assert/strict";

import { calculateProduct, rankProducts } from "../calculator.js";

const item = (id, price, amount, measureLabel, currency = "BRL") =>
  calculateProduct({ id, name: id, price, unitCount: 1, amountPerUnit: amount, measureLabel, currency });

test("products with different units are never ranked against each other", () => {
  // 0.02 BRL per gram is not cheaper than 0.10 BRL per meter.
  const ranked = rankProducts([item("paper", 10, 100, "m"), item("coffee", 5, 250, "g")]);
  const byId = Object.fromEntries(ranked.map((product) => [product.id, product]));
  assert.equal(byId.paper.isLeader, true);
  assert.equal(byId.coffee.isLeader, true);
  assert.equal(byId.paper.deltaFromLeader, 0);
});

test("the same unit is compared regardless of spelling and currency stays apart", () => {
  const ranked = rankProducts([item("a", 10, 100, "m"), item("b", 8, 100, " M "), item("c", 1, 100, "m", "USD")]);
  const byId = Object.fromEntries(ranked.map((product) => [product.id, product]));
  assert.equal(byId.b.isLeader, true);
  assert.equal(byId.a.rank, 2);
  assert.equal(byId.c.isLeader, true);
});
