import test from "node:test";
import assert from "node:assert/strict";

import { calculateProduct, rankProducts } from "../calculator.js";

test("calculateProduct derives total and unit costs", () => {
  const product = calculateProduct({
    id: "paper",
    name: "Papel higienico",
    price: 24,
    unitCount: 12,
    amountPerUnit: 20,
    comparisonBase: 10,
    currency: "BRL",
    measureLabel: "m"
  });

  assert.equal(product.totalMeasure, 240);
  assert.equal(product.pricePerUnit, 2);
  assert.equal(product.pricePerMeasure, 0.1);
  assert.equal(product.pricePerComparisonBase, 1);
});

test("rankProducts orders cheaper measure first", () => {
  const ranked = rankProducts([
    calculateProduct({
      id: "a",
      name: "Opcao A",
      price: 22,
      unitCount: 10,
      amountPerUnit: 20,
      comparisonBase: 10,
      currency: "BRL",
      measureLabel: "m"
    }),
    calculateProduct({
      id: "b",
      name: "Opcao B",
      price: 25,
      unitCount: 16,
      amountPerUnit: 18,
      comparisonBase: 10,
      currency: "BRL",
      measureLabel: "m"
    })
  ]);

  assert.equal(ranked[0].id, "b");
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[1].isLeader, false);
  assert.ok(ranked[1].deltaPercentFromLeader > 0);
});

test("calculateProduct rejects invalid values", () => {
  assert.throws(
    () =>
      calculateProduct({
        name: "",
        price: 0,
        unitCount: 0,
        amountPerUnit: 0,
        comparisonBase: 0,
        currency: "BRL",
        measureLabel: ""
      }),
    /Nome do produto/
  );
});

test("rankProducts compares only matching currencies and measures", () => {
  const product = (id, price, currency, measureLabel, comparisonBase = 1) => calculateProduct({
    id,
    name: id,
    price,
    unitCount: 1,
    amountPerUnit: 100,
    currency,
    measureLabel,
    comparisonBase
  });

  const ranked = rankProducts([
    product("paper", 20, "BRL", "m"),
    product("coffee", 4, "BRL", "g"),
    product("dollar-paper", 10, "USD", "m"),
    product("paper-alt", 30, "BRL", "m", 10)
  ]);

  assert.deepEqual(ranked.map(({ id, rank, isLeader }) => [id, rank, isLeader]), [
    ["paper", 1, true],
    ["paper-alt", 2, false],
    ["coffee", 1, true],
    ["dollar-paper", 1, true]
  ]);
  assert.equal(Math.round(ranked[1].deltaPercentFromLeader), 50);
  assert.equal(ranked[2].deltaPercentFromLeader, 0);
  assert.equal(ranked[3].deltaPercentFromLeader, 0);
});
