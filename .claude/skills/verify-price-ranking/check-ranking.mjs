// Generated-input check of rankProducts in calculator.js.
// Usage: node .claude/skills/verify-price-ranking/check-ranking.mjs [CASES] [SEED]
import { calculateProduct, comparisonGroup, rankProducts } from "../../../calculator.js";

const cases = Number(process.argv[2] ?? 2000);
let seed = Number(process.argv[3] ?? 1);
const rand = () => { seed = (seed * 1103515245 + 12345) % 2 ** 31; return seed / 2 ** 31; };
const pick = (list) => list[Math.floor(rand() * list.length)];
const failures = [];
const fail = (rule, detail) => { if (failures.length < 10) failures.push(`${rule}: ${detail}`); };

for (let c = 0; c < cases; c += 1) {
  const count = 1 + Math.floor(rand() * 6);
  const products = Array.from({ length: count }, (_, i) => calculateProduct({
    id: `p${i}`,
    name: `p${i}`,
    price: 1 + Math.floor(rand() * 50),
    unitCount: 1 + Math.floor(rand() * 4),
    amountPerUnit: 1 + Math.floor(rand() * 300),
    measureLabel: pick(["m", "M", " m", "g", "folhas", "l"]),
    currency: pick(["BRL", "BRL", "USD"]),
  }));
  const ranked = rankProducts(products);
  if (ranked.length !== products.length) fail("EveryProductRanked", `${products.length} in, ${ranked.length} out`);
  const groups = new Map();
  for (const product of ranked) {
    const key = comparisonGroup(product);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }
  for (const [key, members] of groups) {
    const leaders = members.filter((product) => product.isLeader);
    // OneLeaderPerUnit: each unit and currency has exactly one best buy.
    if (leaders.length !== 1) fail("OneLeaderPerUnit", `${key} has ${leaders.length} leaders`);
    const cheapest = Math.min(...members.map((product) => product.pricePerMeasure));
    // LeaderIsCheapestComparable: the best buy is the lowest price per measure
    // among products of its own unit and currency, and deltas use it.
    if (leaders[0] && leaders[0].pricePerMeasure !== cheapest) fail("LeaderIsCheapestComparable", key);
    for (const product of members) {
      if (Math.abs(product.deltaFromLeader - (product.pricePerMeasure - cheapest)) > 1e-12) {
        fail("DeltaAgainstOwnLeader", `${product.id} in ${key}`);
      }
    }
    const ranks = members.map((product) => product.rank).sort((a, b) => a - b);
    if (ranks.some((rank, index) => rank !== index + 1)) fail("RanksCountWithinUnit", `${key}: ${ranks}`);
  }
}

console.log(`checked ${cases} generated lists, seed ${process.argv[3] ?? 1}`);
if (failures.length) { console.log(failures.join("\n")); process.exit(1); }
console.log("all ranking rules hold");
