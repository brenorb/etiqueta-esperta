export const title = "Compare shelf prices";
export const state = (v) => ({
  empty: "Empty list",
  one: "One product, it leads",
  ranked: v.units === 1 ? "Ranked, one best buy" : "Ranked, a best buy per unit",
}[v.screen]);
const steps = {
  AddFirst: "you add a product",
  AddSameUnit: "you add a product in the same unit",
  AddOtherUnit: "you add a product in another unit",
  ClearList: "you clear the list",
  LoadDemo: "you load the example",
};
export const step = (action) => steps[action] ?? null;
