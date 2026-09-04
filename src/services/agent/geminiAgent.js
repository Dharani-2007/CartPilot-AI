import { GoogleGenAI } from '@google/genai';
import { CARTPILOT_AGENT_SYSTEM_PROMPT } from './systemPrompt.js';
import { agentToolDeclarations, executeTool } from './tools.js';
import { auditLogger } from './auditLogger.js';
import { SAMPLE_PRODUCTS } from '../../data/mockData.js';

// Storage key for runtime API key configuration
const API_KEY_STORAGE = 'cartpilot_gemini_api_key';

export function getStoredApiKey() {
  if (typeof localStorage !== 'undefined') {
    const local = localStorage.getItem(API_KEY_STORAGE);
    if (local) return local;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  return '';
}

export function setStoredApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
}

/**
 * Deterministic Grounded Agent Engine
 * Enforces strict hard constraints for product intent and budget,
 * identifies nearest same-category alternatives when over budget,
 * and completely prevents unrelated product substitution.
 */
function runDeterministicAgentTurn(userMessage, chatHistory = []) {
  const startTime = performance.now();
  const queryLower = userMessage.toLowerCase().trim();

  // A. Customer Explicit Approval Turn (e.g. "Yes, add it", "Add to cart", "I want this")
  const isApproval = /^(yes|yes please|add it|add to cart|please add|i want this|confirm|approve|buy it|go ahead|add this|proceed with it|sure add it)/i.test(queryLower) ||
    (queryLower.includes('add') && (queryLower.includes('cart') || queryLower.includes('it') || queryLower.includes('earbud')));

  if (isApproval) {
    // Find the most recent product recommended in chat history
    let targetProduct = null;
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      const turn = chatHistory[i];
      if (turn.sender === 'assistant' && turn.productIds && turn.productIds.length > 0) {
        targetProduct = SAMPLE_PRODUCTS.find(p => p.id === turn.productIds[0]);
        if (targetProduct) break;
      }
    }

    if (!targetProduct && queryLower.includes('earbud')) {
      targetProduct = SAMPLE_PRODUCTS.find(p => p.id === 'prod-1');
    }

    if (targetProduct) {
      const auditEntry = auditLogger.log({
        userQuery: userMessage,
        reasoningSummary: `Customer explicitly approved adding "${targetProduct.name}" (₹${targetProduct.price}) to cart. State transition: RECOMMENDED -> APPROVED -> ADDED_TO_CART. Payment remains uninitiated.`,
        toolName: 'cart_add_approved',
        toolInput: { productId: targetProduct.id, customerApproval: userMessage },
        toolResult: { status: 'ADDED_TO_CART', item: targetProduct.name, price: targetProduct.price },
        matchedProductIds: [targetProduct.id],
        status: 'SUCCESS',
        executionMs: Math.round(performance.now() - startTime)
      });

      return {
        text: `I've added the **${targetProduct.name}** (₹${targetProduct.price.toLocaleString('en-IN')}) to your shopping cart as requested.\n\nYou can click the Cart button at the top right whenever you are ready to review your order or proceed to checkout!`,
        productIds: [targetProduct.id],
        cartAction: { action: 'add', product: targetProduct },
        auditEntry
      };
    }
  }

  // B. Customer Decline Turn (e.g. "No", "Don't add it", "No thanks")
  const isDecline = /^(no|don't add|do not add|cancel|no thanks|pass|skip)/i.test(queryLower);
  if (isDecline) {
    const auditEntry = auditLogger.log({
      userQuery: userMessage,
      reasoningSummary: `Customer declined alternative recommendation. Zero cart modification executed.`,
      toolName: 'customer_declined',
      toolInput: { customerResponse: userMessage },
      toolResult: { status: 'NOT_ADDED' },
      matchedProductIds: [],
      status: 'SUCCESS',
      executionMs: Math.round(performance.now() - startTime)
    });

    return {
      text: `Understood! I will not add it to your cart. Let me know if you would like to explore another product category or adjust your budget.`,
      productIds: [],
      auditEntry
    };
  }

  // 1. Extract budget constraint (e.g. "under ₹1800", "under 1800", "₹1,800", "budget 1500")
  let maxPrice = null;
  const priceMatch = queryLower.match(/(?:under|below|budget|less than|within)?\s*₹?\s*(\d+[\d,]*)/i);
  if (priceMatch && priceMatch[1]) {
    const parsed = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    if (parsed > 100 && parsed < 100000) {
      maxPrice = parsed;
    }
  }

  // 2. Extract use-case constraint
  let useCase = '';
  if (queryLower.includes('study') || queryLower.includes('studying')) useCase = 'studying';
  else if (queryLower.includes('gym') || queryLower.includes('workout')) useCase = 'workout';
  else if (queryLower.includes('travel')) useCase = 'travel';
  else if (queryLower.includes('birthday') || queryLower.includes('gift')) useCase = 'gift';
  else if (queryLower.includes('desk') || queryLower.includes('work')) useCase = 'productivity';

  // 3. Extract product type intent (HARD CONSTRAINT)
  let productType = '';
  let queryKeyword = '';
  let categoryFilter = '';

  if (/(earbud|earbuds|headphone|headphones|audio|tws|earphone)/i.test(queryLower)) {
    productType = 'wireless earbuds';
    queryKeyword = 'wireless earbuds';
    categoryFilter = 'Electronics';
  } else if (/(power bank|powerbank|charger|magsafe)/i.test(queryLower)) {
    productType = 'magnetic power bank';
    queryKeyword = 'power bank';
    categoryFilter = 'Electronics';
  } else if (/(diffuser|aroma|perfume|fragrance|cedarwood)/i.test(queryLower)) {
    productType = 'aroma diffuser';
    queryKeyword = 'diffuser';
    categoryFilter = 'Gifts';
  } else if (/(coffee|brewer|pour-over|mug)/i.test(queryLower)) {
    productType = 'coffee maker set';
    queryKeyword = 'coffee';
    categoryFilter = 'Gifts';
  } else if (/(planter|succulent|pot|plants)/i.test(queryLower)) {
    productType = 'ceramic planters';
    queryKeyword = 'planter';
    categoryFilter = 'Gifts';
  } else if (/(wallet|cardholder|leather)/i.test(queryLower)) {
    productType = 'minimalist leather wallet';
    queryKeyword = 'wallet';
    categoryFilter = 'Accessories';
  } else if (/(lamp|desk lamp|ambient light)/i.test(queryLower)) {
    productType = 'ambient desk lamp';
    queryKeyword = 'lamp';
    categoryFilter = 'Electronics';
  } else if (/(glass|glasses|blue light|spectacles)/i.test(queryLower)) {
    productType = 'blue-light computer glasses';
    queryKeyword = 'glasses';
    categoryFilter = 'Accessories';
  }

  // 4. Check for out-of-catalog items (e.g. smartphones, laptops, clothing, shoes, etc.)
  const outOfCatalogList = ['iphone', 'smartphone', 'phone', 'laptop', 'macbook', 'tv', 'television', 'shoe', 'shirt', 'dress', 'pizza', 'grocery'];
  const isOutOfCatalog = outOfCatalogList.some(kw => queryLower.includes(kw));

  if (isOutOfCatalog && !productType) {
    const auditEntry = auditLogger.log({
      userQuery: userMessage,
      reasoningSummary: `Refused request for out-of-catalog category. Enforced catalog boundary: only Curated Electronics, Artisan Gifts, and Everyday Accessories are supported.`,
      toolName: 'search_catalog',
      toolInput: { query: userMessage, hard_constraints: ['product_intent'] },
      toolResult: { matchedCount: 0, products: [], rejections: 'Category not stocked by merchant' },
      matchedProductIds: [],
      status: 'NO_MATCH',
      executionMs: Math.round(performance.now() - startTime)
    });

    return {
      text: `I checked our merchant catalog for your request. Currently, we specialize exclusively in **Curated Electronics**, **Artisan Gifts**, and **Everyday Accessories**. We do not carry smartphones, laptops, or apparel.\n\nWould you like to explore our available audio, smart charging, or home essentials instead?`,
      productIds: [],
      auditEntry
    };
  }

  // 5. Comparison queries
  if (queryLower.includes('compare') || queryLower.includes('versus') || queryLower.includes(' vs ')) {
    let idsToCompare = ['prod-1', 'prod-3'];
    if (queryLower.includes('lamp') && queryLower.includes('diffuser')) idsToCompare = ['prod-6', 'prod-2'];
    else if (queryLower.includes('wallet') && queryLower.includes('glasses')) idsToCompare = ['prod-4', 'prod-8'];

    const comparisonResult = executeTool('compare_products', { product_ids: idsToCompare });
    const auditEntry = auditLogger.log({
      userQuery: userMessage,
      reasoningSummary: `Compared products side-by-side using verified catalog specifications.`,
      toolName: 'compare_products',
      toolInput: { product_ids: idsToCompare },
      toolResult: comparisonResult,
      matchedProductIds: idsToCompare,
      status: 'SUCCESS',
      executionMs: Math.round(performance.now() - startTime)
    });

    return {
      text: `Here is a side-by-side comparison of the requested products:\n\n` +
        comparisonResult.comparison.map(c => `• **${c.name}** (${c.price}) — Rating: ${c.rating}. Key highlight: ${c.keyBenefit}`).join('\n\n') +
        `\n\nWhich of these would you prefer to explore further?`,
      productIds: idsToCompare,
      auditEntry
    };
  }

  // 6. Execute Search Tool with Hard Intent and Hard Budget
  const searchArgs = {
    query: queryKeyword || userMessage,
    category: categoryFilter,
    max_price: maxPrice,
    use_case: useCase
  };

  const searchResult = executeTool('search_catalog', searchArgs);
  const exactMatches = searchResult.exactMatches || [];
  const nearestAlternative = searchResult.nearestAlternative;

  let responseText = "";
  let matchedIds = [];
  let auditStatus = 'SUCCESS';

  if (exactMatches.length > 0) {
    // Exact match found that satisfies BOTH product intent and budget
    const topItem = exactMatches[0];
    matchedIds = exactMatches.map(p => p.id);
    const budgetNote = maxPrice ? ` within your ₹${maxPrice.toLocaleString('en-IN')} budget` : '';
    const useCaseNote = useCase ? ` tailored for ${useCase}` : '';
    responseText = `I found **${exactMatches.length} verified item(s)** matching ${productType || 'your request'}${budgetNote}${useCaseNote}!\n\nTop Match: **${topItem.name}** at **₹${topItem.price.toLocaleString('en-IN')}** (${topItem.rating}★).\n\nWhy it fits: ${topItem.description}\n\nWould you like to review and add it to your cart?`;
  } else if (nearestAlternative) {
    // Over-budget nearest alternative matching EXACT product intent
    matchedIds = [nearestAlternative.id];
    auditStatus = 'BUDGET_OVERRUN_PROPOSED';
    const budgetStr = maxPrice ? `₹${maxPrice.toLocaleString('en-IN')}` : 'your';
    
    // Explicit phrasing matching user requirement:
    responseText = `I couldn't find ${productType || 'products'} within your ${budgetStr} budget. The closest relevant option is **${nearestAlternative.name}** at **₹${nearestAlternative.price.toLocaleString('en-IN')}**, which is **₹${nearestAlternative.budgetDiff} over your budget**.\n\nWould you like to consider it?`;
  } else {
    // No product matches product intent at all
    auditStatus = 'NO_MATCH';
    responseText = `I couldn't find any ${productType || 'matching products'} in our catalog. Would you like to explore other categories in our collection?`;
  }

  // Record complete audit entry
  const rejectionSummary = (searchResult.rejections || [])
    .slice(0, 4)
    .map(r => `${r.name || r.id}: ${r.reason}`)
    .join('; ');

  const auditEntry = auditLogger.log({
    userQuery: userMessage,
    reasoningSummary: `Hard constraints: productIntent="${productType || queryKeyword}", maxPrice=${maxPrice ? '₹' + maxPrice : 'None'}, useCase="${useCase || 'general'}". Exact matches: ${exactMatches.length}. Nearest alternative: ${nearestAlternative ? nearestAlternative.name + ' (+₹' + nearestAlternative.budgetDiff + ')' : 'None'}. Zero unrelated cross-category substitutions permitted.`,
    toolName: 'search_catalog',
    toolInput: searchArgs,
    toolResult: {
      constraints: searchResult.constraintsApplied,
      exactMatchesCount: exactMatches.length,
      nearestAlternative: nearestAlternative ? { name: nearestAlternative.name, price: nearestAlternative.price, budgetDiff: nearestAlternative.budgetDiff } : null,
      rejectionsSample: rejectionSummary
    },
    matchedProductIds: matchedIds,
    status: auditStatus,
    executionMs: Math.round(performance.now() - startTime)
  });

  return {
    text: responseText,
    productIds: matchedIds,
    nearestAlternative,
    auditEntry
  };
}

/**
 * Real Gemini Agent Turn with Function Calling
 */
async function runGeminiAgentTurn(apiKey, userMessage, chatHistory = []) {
  const startTime = performance.now();
  const ai = new GoogleGenAI({ apiKey });

  const contents = [];
  const recentTurns = chatHistory.slice(-6);
  for (const turn of recentTurns) {
    if (turn.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: turn.text }] });
    } else if (turn.sender === 'assistant') {
      contents.push({ role: 'model', parts: [{ text: turn.text }] });
    }
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    const initialResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: CARTPILOT_AGENT_SYSTEM_PROMPT,
        tools: [{ functionDeclarations: agentToolDeclarations }],
        temperature: 0.1
      }
    });

    let toolExecutions = [];
    let matchedProductIds = [];
    let nearestAlt = null;

    if (initialResponse.functionCalls && initialResponse.functionCalls.length > 0) {
      const toolResponses = [];

      for (const call of initialResponse.functionCalls) {
        const toolResult = executeTool(call.name, call.args);
        toolExecutions.push({
          toolName: call.name,
          toolArgs: call.args,
          toolResult
        });

        // Collect exact matches
        if (toolResult.exactMatches && toolResult.exactMatches.length > 0) {
          toolResult.exactMatches.forEach(p => {
            if (!matchedProductIds.includes(p.id)) matchedProductIds.push(p.id);
          });
        } else if (toolResult.nearestAlternative) {
          // Add nearest alternative if no exact match exists
          nearestAlt = toolResult.nearestAlternative;
          if (!matchedProductIds.includes(toolResult.nearestAlternative.id)) {
            matchedProductIds.push(toolResult.nearestAlternative.id);
          }
        }

        if (toolResult.comparison) {
          toolResult.comparison.forEach(p => {
            if (!matchedProductIds.includes(p.id)) matchedProductIds.push(p.id);
          });
        }

        toolResponses.push({
          name: call.name,
          response: toolResult
        });
      }

      const followUpContents = [
        ...contents,
        {
          role: 'model',
          parts: initialResponse.functionCalls.map(call => ({
            functionCall: {
              name: call.name,
              args: call.args
            }
          }))
        },
        {
          role: 'user',
          parts: toolResponses.map(res => ({
            functionResponse: {
              name: res.name,
              response: res.response
            }
          }))
        }
      ];

      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: followUpContents,
        config: {
          systemInstruction: CARTPILOT_AGENT_SYSTEM_PROMPT,
          temperature: 0.2
        }
      });

      const primaryTool = toolExecutions[0];
      const finalAuditEntry = auditLogger.log({
        userQuery: userMessage,
        reasoningSummary: `Gemini 2.5 Flash executed ${primaryTool.toolName} with strict product intent & budget enforcement. Rejections evaluated: ${primaryTool.toolResult?.rejections?.length || 0}.`,
        toolName: primaryTool.toolName,
        toolInput: primaryTool.toolArgs,
        toolResult: {
          exactMatchesCount: primaryTool.toolResult?.exactMatchesCount || 0,
          nearestAlternative: primaryTool.toolResult?.nearestAlternative || null
        },
        matchedProductIds,
        status: nearestAlt ? 'BUDGET_OVERRUN_PROPOSED' : (matchedProductIds.length > 0 ? 'SUCCESS' : 'NO_MATCH'),
        executionMs: Math.round(performance.now() - startTime)
      });

      return {
        text: finalResponse.text,
        productIds: matchedProductIds,
        nearestAlternative: nearestAlt,
        auditEntry: finalAuditEntry
      };
    } else {
      const auditEntry = auditLogger.log({
        userQuery: userMessage,
        reasoningSummary: `Direct conversational guidance within strict system boundaries.`,
        toolName: 'conversational_dialog',
        toolInput: {},
        toolResult: { text: initialResponse.text },
        matchedProductIds: [],
        status: 'SUCCESS',
        executionMs: Math.round(performance.now() - startTime)
      });

      return {
        text: initialResponse.text,
        productIds: [],
        auditEntry
      };
    }
  } catch (error) {
    console.warn('Gemini API call failed, falling back to deterministic agent:', error);
    return runDeterministicAgentTurn(userMessage, chatHistory);
  }
}

/**
 * Main Public Agent Turn Dispatcher
 */
export async function executeAgentTurn(userMessage, chatHistory = []) {
  const queryLower = userMessage.toLowerCase().trim();

  const isCartDecision =
    /^(yes|yes please|add it|add to cart|please add|i want this|confirm|approve|buy it|go ahead|add this|proceed with it|sure add it)/i.test(queryLower) ||
    /^(no|don't add|do not add|cancel|no thanks|pass|skip)/i.test(queryLower) ||
    (queryLower.includes('add') &&
      (queryLower.includes('cart') ||
       queryLower.includes('it') ||
       queryLower.includes('earbud')));

  // Approval/decline is handled locally so it can use chat history
  // and never add an item without explicit customer approval.
  if (isCartDecision) {
    return runDeterministicAgentTurn(userMessage, chatHistory);
  }

  try {
    const response = await fetch('http://localhost:3001/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        chatHistory
      })
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.reply,
      productIds: data.productIds || [],
      nearestAlternative: data.nearestAlternative || null,
      auditEntry: data.auditEntry || null
    };

  } catch (error) {
    console.warn(
      'Backend unavailable. Using local grounded agent:',
      error
    );

    return runDeterministicAgentTurn(userMessage, chatHistory);
  }
}