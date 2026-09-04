import { PRODUCTS } from './catalog.js';

/*
 * CartPilot Backend Catalog Tools
 * These functions keep Gemini grounded in the verified merchant catalog.
 */

function matchesIntent(product, query = '') {
  const q = query.toLowerCase();

  if (/(earbud|earbuds|headphone|headphones|earphone|audio|tws)/i.test(q)) {
    return product.tags.includes('earbuds') || product.tags.includes('audio');
  }

  if (/(power bank|powerbank|charger|battery|magsafe)/i.test(q)) {
    return product.tags.includes('power bank') || product.tags.includes('charger');
  }

  if (/(lamp|light|lighting|desk lamp)/i.test(q)) {
    return product.tags.includes('lamp') || product.tags.includes('lighting');
  }

  if (/(diffuser|aroma|perfume|fragrance|scent)/i.test(q)) {
    return product.tags.includes('fragrance');
  }

  if (/(coffee|brewer|pour-over|mug)/i.test(q)) {
    return product.tags.includes('coffee');
  }

  if (/(planter|plant|plants|succulent|pot)/i.test(q)) {
    return product.tags.includes('plants');
  }

  if (/(wallet|cardholder|leather)/i.test(q)) {
    return product.tags.includes('wallet');
  }

  if (/(glass|glasses|blue light|spectacles)/i.test(q)) {
    return product.tags.includes('glasses');
  }

  return false;
}

/*
 * Search catalog while enforcing:
 * 1. Product intent
 * 2. Stock
 * 3. Maximum budget
 */
export function searchCatalog(query, maxPrice = null) {
  const intentMatches = PRODUCTS.filter(product =>
    product.inStock && matchesIntent(product, query)
  );

  const budget =
    maxPrice !== null && maxPrice !== undefined
      ? Number(maxPrice)
      : null;

  const exactMatches = intentMatches.filter(product => {
    if (!budget) return true;
    return product.price <= budget;
  });

  let nearestAlternative = null;

  if (
    exactMatches.length === 0 &&
    intentMatches.length > 0 &&
    budget
  ) {
    const overBudget = intentMatches
      .filter(product => product.price > budget)
      .sort((a, b) => a.price - b.price);

    if (overBudget.length > 0) {
      const product = overBudget[0];

      nearestAlternative = {
        ...product,
        budgetDifference: product.price - budget
      };
    }
  }

  return {
    query,
    maxPrice: budget,

    exactMatches: exactMatches.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      rating: product.rating,
      description: product.description,
      inStock: product.inStock
    })),

    nearestAlternative: nearestAlternative
      ? {
          id: nearestAlternative.id,
          name: nearestAlternative.name,
          category: nearestAlternative.category,
          price: nearestAlternative.price,
          rating: nearestAlternative.rating,
          description: nearestAlternative.description,
          budgetDifference: nearestAlternative.budgetDifference,
          inStock: nearestAlternative.inStock
        }
      : null
  };
}

/*
 * Extract an explicit maximum budget from the customer message.
 *
 * Examples:
 * "earbuds under 1800"
 * "budget ₹1500"
 * "below 2,000"
 * "within ₹1000"
 */
export function extractBudget(message = '') {
  const match = message.match(
    /(?:under|below|budget|within|less than)\s*(?:of\s*)?₹?\s*([\d,]+)/i
  );

  if (!match) {
    return null;
  }

  const value = Number(match[1].replace(/,/g, ''));

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

/*
 * Detect requests for categories CartPilot does not sell.
 */
export function isOutOfCatalogRequest(message = '') {
  const q = message.toLowerCase();

  const unsupported = [
    'iphone',
    'smartphone',
    'phone',
    'laptop',
    'macbook',
    'television',
    'tv',
    'shoe',
    'shoes',
    'shirt',
    'dress',
    'grocery'
  ];

  return unsupported.some(keyword => q.includes(keyword));
}