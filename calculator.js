export function calculateProduct(input) {
  const name = String(input.name || "").trim();
  const price = Number(input.price);
  const unitCount = Number(input.unitCount);
  const amountPerUnit = Number(input.amountPerUnit);
  const comparisonBase = Number(input.comparisonBase || 1);
  const currency = String(input.currency || "BRL");
  const measureLabel = String(input.measureLabel || "").trim();

  if (!name) throw new Error("Nome do produto e obrigatorio.");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Preco invalido.");
  if (!Number.isFinite(unitCount) || unitCount <= 0) throw new Error("Numero de unidades invalido.");
  if (!Number.isFinite(amountPerUnit) || amountPerUnit <= 0) {
    throw new Error("Quantidade por unidade invalida.");
  }
  if (!Number.isFinite(comparisonBase) || comparisonBase <= 0) {
    throw new Error("Base de comparacao invalida.");
  }
  if (!measureLabel) throw new Error("Unidade da medida obrigatoria.");

  const totalMeasure = unitCount * amountPerUnit;
  const pricePerUnit = price / unitCount;
  const pricePerMeasure = price / totalMeasure;
  const pricePerComparisonBase = pricePerMeasure * comparisonBase;

  return {
    id: input.id || crypto.randomUUID(),
    name,
    price,
    unitCount,
    amountPerUnit,
    comparisonBase,
    currency,
    measureLabel,
    totalMeasure,
    pricePerUnit,
    pricePerMeasure,
    pricePerComparisonBase
  };
}

export function rankProducts(products) {
  if (!Array.isArray(products)) return [];

  const groups = new Map();
  for (const product of products) {
    const key = JSON.stringify([product.currency, product.measureLabel]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }

  return [...groups.values()].flatMap((group) => {
    group.sort((a, b) => a.pricePerMeasure - b.pricePerMeasure);
    const leader = group[0];
    return group.map((product, index) => {
      const delta = product.pricePerMeasure - leader.pricePerMeasure;
      const deltaPercent = leader.pricePerMeasure > 0 ? (delta / leader.pricePerMeasure) * 100 : 0;

      return {
        ...product,
        rank: index + 1,
        isLeader: index === 0,
        deltaFromLeader: delta,
        deltaPercentFromLeader: deltaPercent
      };
    });
  });
}

export function formatCurrency(value, currency, locale = "pt-BR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatNumber(value, locale = "pt-BR") {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2
  }).format(value);
}
