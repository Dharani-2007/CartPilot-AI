import { Type } from '@google/genai';
import { SAMPLE_PRODUCTS } from '../../data/mockData.js';

/**
 * Tool Declarations for Gemini Function Calling
 */
export const searchCatalogDeclaration = {
  name: 'search_catalog',
  description: 'Search the merchant\'s verified product catalog. Product/category intent is a HARD constraint: if the customer asks for earbuds, ONLY return earbuds/audio products. Never substitute unrelated products. Explicit budgets are hard constraints. If no exact match fits within budget, the nearest same-category alternative outside budget is identified with the price difference.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Product type keywords (e.g. "wireless earbuds", "power bank", "diffuser", "wallet", "desk lamp").'
      },
      category: {
        type: Type.STRING,
        description: 'Optional category: "Electronics", "Gifts", or "Accessories".'
      },
      max_price: {
        type: Type.NUMBER,
        description: 'Maximum customer budget in ₹ (hard constraint by default).'
      },
      use_case: {
        type: Type.STRING,
        description: 'Customer context/use case (e.g. "studying", "travel", "birthday").'
      }
    },
    required: ['query']
  }
};

export const getProductDetailsDeclaration = {
  name: 'get_product_details',
  description: 'Retrieve full specifications, stock status, and features for a specific product by its ID.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      product_id: {
        type: Type.STRING,
        description: 'The unique product ID (e.g. "prod-1", "prod-2").'
      }
    },
    required: ['product_id']
  }
};

export const compareProductsDeclaration = {
  name: 'compare_products',
  description: 'Compare 2 or 3 products from the merchant catalog side-by-side by price, rating, features, and target use case.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      product_ids: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of 2 to 3 product IDs to compare.'
      }
    },
    required: ['product_ids']
  }
};

export const suggestUpsellDeclaration = {
  name: 'suggest_upsell',
  description: 'Find a complementary accessory or gift add-on for a primary product. Respects stated budget constraints unless explicitly disclosed.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      primary_product_id: {
        type: Type.STRING,
        description: 'The ID of the primary product the customer is considering.'
      },
      max_additional_budget: {
        type: Type.NUMBER,
        description: 'Optional maximum extra budget in ₹ for the upsell.'
      }
    },
    required: ['primary_product_id']
  }
};

export const agentToolDeclarations = [
  searchCatalogDeclaration,
  getProductDetailsDeclaration,
  compareProductsDeclaration,
  suggestUpsellDeclaration
];

/**
 * Helper to identify product intent matching
 */
function matchesProductIntent(product, queryText, categoryFilter) {
  const q = (queryText || '').toLowerCase().trim();
  const cat = (categoryFilter || '').toLowerCase().trim();

  // If explicit category is provided, it must match
  if (cat && cat !== 'all' && product.category.toLowerCase() !== cat) {
    return false;
  }

  if (!q) return true;

  // Specific Product Intent Checks (HARD INTENT CONSTRAINTS)
  const isAudioIntent = /(earbud|earbuds|headphone|headphones|earphone|audio|tws|music)/i.test(q);
  if (isAudioIntent) {
    return product.tags.includes('earbuds') || product.tags.includes('audio');
  }

  const isPowerIntent = /(power bank|powerbank|charger|magsafe|battery)/i.test(q);
  if (isPowerIntent) {
    return product.tags.includes('power bank') || product.tags.includes('charger');
  }

  const isLampIntent = /(lamp|light|lighting|ambient|desk lamp)/i.test(q);
  if (isLampIntent) {
    return product.tags.includes('lamp') || product.tags.includes('lighting');
  }

  const isDiffuserIntent = /(diffuser|aroma|perfume|fragrance|cedarwood|scent)/i.test(q);
  if (isDiffuserIntent) {
    return product.tags.includes('diffuser') || product.tags.includes('fragrance');
  }

  const isCoffeeIntent = /(coffee|brewer|pour-over|mug)/i.test(q);
  if (isCoffeeIntent) {
    return product.tags.includes('coffee') || product.tags.includes('kitchen');
  }

  const isPlanterIntent = /(planter|succulent|pot|herbs|plants)/i.test(q);
  if (isPlanterIntent) {
    return product.tags.includes('plants') || product.tags.includes('decor');
  }

  const isWalletIntent = /(wallet|cardholder|leather wallet)/i.test(q);
  if (isWalletIntent) {
    return product.tags.includes('wallet') || product.tags.includes('leather');
  }

  const isGlassesIntent = /(glass|glasses|blue light|spectacles)/i.test(q);
  if (isGlassesIntent) {
    return product.tags.includes('glasses') || product.tags.includes('wellness');
  }

  // General fallback keyword match only within legitimate product tokens
  const matchName = product.name.toLowerCase().includes(q);
  const matchDesc = product.description.toLowerCase().includes(q);
  const matchCategory = product.category.toLowerCase().includes(q);
  const matchTag = product.tags.some(t => q.includes(t.toLowerCase()) || t.toLowerCase().includes(q));

  return matchName || matchDesc || matchCategory || matchTag;
}

/**
 * Local Catalog Tool Implementations (Strictly Grounded execution)
 */
export function executeSearchCatalog({ query = '', category = '', max_price = null, use_case = '' }) {
  const q = (query || '').toLowerCase().trim();
  const cat = (category || '').toLowerCase().trim();
  const budget = max_price !== null && max_price !== undefined ? Number(max_price) : null;

  // Step 1: Enforce Product Intent as a HARD CONSTRAINT
  const intentCandidates = [];
  const rejectedDueToIntent = [];

  for (const product of SAMPLE_PRODUCTS) {
    if (matchesProductIntent(product, q, cat)) {
      intentCandidates.push(product);
    } else {
      rejectedDueToIntent.push({
        id: product.id,
        name: product.name,
        category: product.category,
        reason: 'Rejected: Product intent mismatch'
      });
    }
  }

  // Step 2: Enforce Budget as a HARD CONSTRAINT on intent-matched items
  const exactMatches = [];
  const rejectedOverBudget = [];

  for (const product of intentCandidates) {
    if (budget !== null && budget > 0 && product.price > budget) {
      const diff = product.price - budget;
      rejectedOverBudget.push({
        id: product.id,
        name: product.name,
        price: product.price,
        budget,
        difference: diff,
        reason: `Rejected from exact matches: Price ₹${product.price} exceeds budget ₹${budget} by ₹${diff}`
      });
    } else {
      exactMatches.push(product);
    }
  }

  // Step 3: Identify nearest alternative ONLY if no exact match satisfies both intent & budget
  let nearestAlternative = null;
  if (exactMatches.length === 0 && rejectedOverBudget.length > 0) {
    // Sort by smallest price difference above budget
    rejectedOverBudget.sort((a, b) => a.difference - b.difference);
    const closest = rejectedOverBudget[0];
    const fullProduct = SAMPLE_PRODUCTS.find(p => p.id === closest.id);
    if (fullProduct) {
      nearestAlternative = {
        id: fullProduct.id,
        name: fullProduct.name,
        price: fullProduct.price,
        originalPrice: fullProduct.originalPrice,
        rating: fullProduct.rating,
        category: fullProduct.category,
        description: fullProduct.description,
        budgetDiff: closest.difference,
        reason: `Closest option matching product intent, but ₹${closest.difference} over stated ₹${budget} budget.`
      };
    }
  }

  return {
    constraintsApplied: {
      productIntent: q || cat || 'all',
      maxPrice: budget,
      useCase: use_case || 'general',
      hardConstraints: ['product_intent', ...(budget ? ['max_price'] : [])]
    },
    exactMatchesCount: exactMatches.length,
    exactMatches: exactMatches.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating,
      badge: p.badge,
      description: p.description,
      inStock: p.inStock
    })),
    nearestAlternative,
    rejections: [
      ...rejectedOverBudget,
      ...rejectedDueToIntent
    ]
  };
}

export function executeGetProductDetails({ product_id }) {
  const product = SAMPLE_PRODUCTS.find(p => p.id === product_id);
  if (!product) {
    return { error: `Product ID "${product_id}" not found in merchant catalog.` };
  }
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    badge: product.badge,
    description: product.description,
    tags: product.tags,
    inStock: product.inStock,
    delivery: "Next-day express delivery available"
  };
}

export function executeCompareProducts({ product_ids = [] }) {
  const products = product_ids
    .map(id => SAMPLE_PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  if (products.length === 0) {
    return { error: "None of the specified product IDs were found in catalog." };
  }

  return {
    comparisonCount: products.length,
    comparison: products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: `₹${p.price.toLocaleString('en-IN')}`,
      rating: `${p.rating}★ (${p.reviewsCount} reviews)`,
      keyBenefit: p.description,
      badge: p.badge
    }))
  };
}

export function executeSuggestUpsell({ primary_product_id, max_additional_budget = null }) {
  const primary = SAMPLE_PRODUCTS.find(p => p.id === primary_product_id);
  if (!primary) {
    return { error: `Primary product "${primary_product_id}" not found.` };
  }

  // Find complementary products in catalog
  let candidates = [];
  if (primary.category === 'Electronics') {
    candidates = SAMPLE_PRODUCTS.filter(p => p.id !== primary.id && (p.id === 'prod-3' || p.id === 'prod-8'));
  } else if (primary.category === 'Gifts') {
    candidates = SAMPLE_PRODUCTS.filter(p => p.id !== primary.id && (p.id === 'prod-4' || p.id === 'prod-7'));
  } else {
    candidates = SAMPLE_PRODUCTS.filter(p => p.id !== primary.id && (p.id === 'prod-1' || p.id === 'prod-3'));
  }

  const withinBudget = max_additional_budget
    ? candidates.filter(p => p.price <= max_additional_budget)
    : candidates;

  const upsellItem = withinBudget.length > 0 ? withinBudget[0] : candidates[0];

  return {
    primaryItem: { id: primary.id, name: primary.name, price: primary.price },
    recommendedUpsell: upsellItem ? {
      id: upsellItem.id,
      name: upsellItem.name,
      price: upsellItem.price,
      combinedTotal: primary.price + upsellItem.price,
      exceedsBudget: max_additional_budget ? upsellItem.price > max_additional_budget : false,
      reason: `Pairs great with ${primary.name} for extra convenience.`
    } : null
  };
}

/**
 * Dispatcher to execute any tool by name with arguments
 */
export function executeTool(toolName, args = {}) {
  switch (toolName) {
    case 'search_catalog':
      return executeSearchCatalog(args);
    case 'get_product_details':
      return executeGetProductDetails(args);
    case 'compare_products':
      return executeCompareProducts(args);
    case 'suggest_upsell':
      return executeSuggestUpsell(args);
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
