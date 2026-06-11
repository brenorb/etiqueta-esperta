import { calculateProduct, rankProducts, formatCurrency, formatNumber } from "./calculator.js";

const ITEM_STORAGE_KEY = "etiqueta-esperta-items-v1";
const HISTORY_STORAGE_KEY = "etiqueta-esperta-history-v1";
const LOCALE = "pt-BR";

const presets = {
  "toilet-paper": {
    productName: "Papel higiênico",
    unitCount: 12,
    amountPerUnit: 20,
    measureLabel: "m",
    comparisonBase: 10
  },
  "paper-towel": {
    productName: "Papel toalha",
    unitCount: 2,
    amountPerUnit: 120,
    measureLabel: "folhas",
    comparisonBase: 100
  },
  coffee: {
    productName: "Cafe",
    unitCount: 1,
    amountPerUnit: 250,
    measureLabel: "g",
    comparisonBase: 100
  },
  liquid: {
    productName: "Liquido",
    unitCount: 1,
    amountPerUnit: 1,
    measureLabel: "l",
    comparisonBase: 1
  }
};

const demoItems = [
  {
    name: "Papel higiênico folha dupla",
    price: 24.9,
    unitCount: 12,
    amountPerUnit: 20,
    comparisonBase: 10,
    currency: "BRL",
    measureLabel: "m"
  },
  {
    name: "Papel higiênico premium",
    price: 32.5,
    unitCount: 16,
    amountPerUnit: 18,
    comparisonBase: 10,
    currency: "BRL",
    measureLabel: "m"
  }
];

const form = document.querySelector("#calculatorForm");
const liveSummary = document.querySelector("#liveSummary");
const leaderboard = document.querySelector("#leaderboard");
const resultsList = document.querySelector("#resultsList");
const itemTemplate = document.querySelector("#itemCardTemplate");
const historyTemplate = document.querySelector("#historyItemTemplate");
const resetFormButton = document.querySelector("#resetFormButton");
const clearItemsButton = document.querySelector("#clearItemsButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const loadDemoButton = document.querySelector("#loadDemoButton");
const presetButtons = document.querySelectorAll(".preset-button");
const historyList = document.querySelector("#historyList");

let items = loadItems();
let history = loadHistory();

render();
updateLiveSummary();
setDefaultPurchaseDate();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const formData = readFormData();
    const product = calculateProduct(formData);
    items.push(product);
    history.unshift(createHistoryEntry(product, formData));
    history = history.slice(0, 60);
    persistItems();
    persistHistory();
    render();
    form.reset();
    document.querySelector("#comparisonBase").value = "1";
    document.querySelector("#currency").value = product.currency;
    setDefaultPurchaseDate();
    updateLiveSummary();
  } catch (error) {
    window.alert(error.message);
  }
});

form.addEventListener("input", () => {
  updateLiveSummary();
});

resetFormButton.addEventListener("click", () => {
  form.reset();
  document.querySelector("#comparisonBase").value = "1";
  document.querySelector("#currency").value = "BRL";
  setDefaultPurchaseDate();
  updateLiveSummary();
});

clearItemsButton.addEventListener("click", () => {
  items = [];
  persistItems();
  render();
});

loadDemoButton.addEventListener("click", () => {
  items = demoItems.map((item) => calculateProduct(item));
  persistItems();
  render();
});

clearHistoryButton.addEventListener("click", () => {
  history = [];
  persistHistory();
  render();
  updateLiveSummary();
});

resultsList.addEventListener("click", (event) => {
  const button = event.target.closest(".icon-button");
  if (!button) return;

  const { id } = button.dataset;
  items = items.filter((item) => item.id !== id);
  persistItems();
  render();
});

historyList.addEventListener("click", (event) => {
  const useButton = event.target.closest(".history-use-button");
  if (useButton) {
    const record = history.find((entry) => entry.id === useButton.dataset.id);
    if (record) fillFormFromHistory(record);
    return;
  }

  const removeButton = event.target.closest(".history-remove-button");
  if (!removeButton) return;

  history = history.filter((entry) => entry.id !== removeButton.dataset.id);
  persistHistory();
  render();
  updateLiveSummary();
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

function readFormData() {
  const data = new FormData(form);

  return {
    name: data.get("productName"),
    price: data.get("price"),
    currency: data.get("currency"),
    unitCount: data.get("unitCount"),
    amountPerUnit: data.get("amountPerUnit"),
    measureLabel: data.get("measureLabel"),
    comparisonBase: data.get("comparisonBase"),
    purchaseDate: data.get("purchaseDate"),
    storeNote: data.get("storeNote")
  };
}

function updateLiveSummary() {
  try {
    const draft = calculateProduct({
      ...readFormData(),
      id: "preview"
    });

    liveSummary.innerHTML = `
      <p class="summary-title">${escapeHtml(draft.name)}</p>
      <p class="summary-highlight">${formatCurrency(draft.pricePerComparisonBase, draft.currency, LOCALE)} por ${formatNumber(draft.comparisonBase, LOCALE)} ${escapeHtml(draft.measureLabel)}</p>
      <p class="summary-detail">${formatCurrency(draft.pricePerUnit, draft.currency, LOCALE)} por unidade • ${formatNumber(draft.totalMeasure, LOCALE)} ${escapeHtml(draft.measureLabel)} no total</p>
      <p class="summary-detail">${buildHistoryHint(draft)}</p>
    `;
  } catch {
    liveSummary.innerHTML = `
      <p class="summary-title">preencha os campos</p>
      <p class="summary-highlight">R$ 0,00 por medida</p>
      <p class="summary-detail">O resultado aparece aqui antes de entrar na lista.</p>
    `;
  }
}

function render() {
  const ranked = rankProducts(items);

  if (ranked.length === 0) {
    leaderboard.className = "leaderboard empty-state";
    leaderboard.textContent = "Adicione pelo menos um item para comecar.";
    resultsList.innerHTML = "";
    renderHistory();
    return;
  }

  const leader = ranked[0];
  leaderboard.className = "leaderboard";
  leaderboard.innerHTML = `
    <p class="leaderboard-kicker">melhor custo por medida</p>
    <h3>${escapeHtml(leader.name)}</h3>
    <p class="leaderboard-price">${formatCurrency(leader.pricePerComparisonBase, leader.currency, LOCALE)} por ${formatNumber(leader.comparisonBase, LOCALE)} ${escapeHtml(leader.measureLabel)}</p>
    <p class="leaderboard-detail">${formatCurrency(leader.price, leader.currency, LOCALE)} por ${formatNumber(leader.unitCount, LOCALE)} unidades de ${formatNumber(leader.amountPerUnit, LOCALE)} ${escapeHtml(leader.measureLabel)}</p>
  `;

  resultsList.innerHTML = "";

  ranked.forEach((item) => {
    const node = itemTemplate.content.firstElementChild.cloneNode(true);
    node.classList.toggle("leader", item.isLeader);
    node.querySelector(".item-rank").textContent = item.isLeader
      ? "melhor compra"
      : `${item.rank}o lugar`;
    node.querySelector(".item-name").textContent = item.name;
    node.querySelector(".item-price-base").textContent = `${formatCurrency(item.pricePerComparisonBase, item.currency, LOCALE)} por ${formatNumber(item.comparisonBase, LOCALE)} ${item.measureLabel}`;
    node.querySelector(".item-total-measure").textContent = `${formatNumber(item.totalMeasure, LOCALE)} ${item.measureLabel}`;
    node.querySelector(".item-price-unit").textContent = formatCurrency(item.pricePerUnit, item.currency, LOCALE);
    node.querySelector(".item-price-measure").textContent = `${formatCurrency(item.pricePerMeasure, item.currency, LOCALE)} por 1 ${item.measureLabel}`;
    node.querySelector(".item-vs-leader").textContent = item.isLeader
      ? "referencia"
      : `${formatNumber(item.deltaPercentFromLeader, LOCALE)}% mais caro`;

    const removeButton = node.querySelector(".icon-button");
    removeButton.dataset.id = item.id;

    resultsList.appendChild(node);
  });

  renderHistory();
}

function persistItems() {
  window.localStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));
}

function loadItems() {
  const saved = window.localStorage.getItem(ITEM_STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved).map((item) => calculateProduct(item));
  } catch {
    return [];
  }
}

function persistHistory() {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function loadHistory() {
  const saved = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function applyPreset(presetKey) {
  const preset = presets[presetKey];
  if (!preset) return;

  document.querySelector("#productName").value = preset.productName;
  document.querySelector("#unitCount").value = String(preset.unitCount);
  document.querySelector("#amountPerUnit").value = String(preset.amountPerUnit);
  document.querySelector("#measureLabel").value = preset.measureLabel;
  document.querySelector("#comparisonBase").value = String(preset.comparisonBase);
  setDefaultPurchaseDate();
  updateLiveSummary();
}

function createHistoryEntry(product, formData) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    unitCount: product.unitCount,
    amountPerUnit: product.amountPerUnit,
    comparisonBase: product.comparisonBase,
    currency: product.currency,
    measureLabel: product.measureLabel,
    totalMeasure: product.totalMeasure,
    pricePerUnit: product.pricePerUnit,
    pricePerMeasure: product.pricePerMeasure,
    pricePerComparisonBase: product.pricePerComparisonBase,
    purchaseDate: formData.purchaseDate || todayISO(),
    storeNote: String(formData.storeNote || "").trim()
  };
}

function renderHistory() {
  if (history.length === 0) {
    historyList.className = "history-list empty-state";
    historyList.textContent = "Ainda nao existe historico salvo neste navegador.";
    return;
  }

  historyList.className = "history-list";
  historyList.innerHTML = "";

  history.forEach((entry) => {
    const node = historyTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".history-name").textContent = entry.name;
    node.querySelector(".history-price").textContent = `${formatCurrency(entry.pricePerComparisonBase, entry.currency, LOCALE)} por ${formatNumber(entry.comparisonBase, LOCALE)} ${entry.measureLabel}`;
    node.querySelector(".history-meta").textContent = `${formatDate(entry.purchaseDate)} • ${formatCurrency(entry.price, entry.currency, LOCALE)} total • ${entry.storeNote || "sem anotacao"}`;
    node.querySelector(".history-use-button").dataset.id = entry.id;
    node.querySelector(".history-remove-button").dataset.id = entry.id;
    historyList.appendChild(node);
  });
}

function fillFormFromHistory(entry) {
  document.querySelector("#productName").value = entry.name;
  document.querySelector("#price").value = String(entry.price);
  document.querySelector("#currency").value = entry.currency;
  document.querySelector("#unitCount").value = String(entry.unitCount);
  document.querySelector("#amountPerUnit").value = String(entry.amountPerUnit);
  document.querySelector("#measureLabel").value = entry.measureLabel;
  document.querySelector("#comparisonBase").value = String(entry.comparisonBase);
  document.querySelector("#purchaseDate").value = todayISO();
  document.querySelector("#storeNote").value = entry.storeNote || "";
  updateLiveSummary();
}

function buildHistoryHint(draft) {
  const latest = history.find((entry) => normalizeName(entry.name) === normalizeName(draft.name));
  if (!latest) return "Sem registro anterior desse produto neste aparelho.";

  const diff = draft.price - latest.price;
  const direction = diff === 0 ? "igual ao ultimo registro" : diff > 0 ? `${formatCurrency(diff, draft.currency, LOCALE)} acima do ultimo registro` : `${formatCurrency(Math.abs(diff), draft.currency, LOCALE)} abaixo do ultimo registro`;
  return `Ultimo registro: ${formatDate(latest.purchaseDate)} • ${formatCurrency(latest.price, latest.currency, LOCALE)} total • ${direction}.`;
}

function formatDate(value) {
  if (!value) return "sem data";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "short"
  }).format(parsed);
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function todayISO() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setDefaultPurchaseDate() {
  document.querySelector("#purchaseDate").value = todayISO();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
