import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import Razorpay from 'razorpay';
import {
  searchCatalog,
  extractBudget,
  isOutOfCatalogRequest
} from './agentTools.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ]
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CartPilot AI backend is running'
  });
});

// CartPilot grounded AI endpoint
app.post('/api/agent', async (req, res) => {
  try {
    const { message } = req.body;

    console.log('🌐 Website contacted backend:', message);

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured on the server.'
      });
    }

    // STEP 1: Reject unsupported product categories
    if (isOutOfCatalogRequest(message)) {
      return res.json({
        success: true,
        reply:
          'I checked the CartPilot merchant catalog, but that product category is not currently stocked. We currently offer Curated Electronics, Artisan Gifts, and Premium Accessories.',
        productIds: [],
        auditEntry: {
          action: 'CATALOG_SEARCH',
          status: 'NO_MATCH',
          reason: 'Requested product category is not stocked.'
        }
      });
    }

    // STEP 2: Extract customer's hard budget constraint
    const maxPrice = extractBudget(message);

    // STEP 3: Search only the verified merchant catalog
    const catalogResult = searchCatalog(message, maxPrice);

    const exactMatches = catalogResult.exactMatches || [];
    const nearestAlternative = catalogResult.nearestAlternative;

    // STEP 4: No matching product intent at all
    if (exactMatches.length === 0 && !nearestAlternative) {
      return res.json({
        success: true,
        reply:
          'I could not find a verified product matching that request in the CartPilot merchant catalog. I will not substitute an unrelated product.',
        productIds: [],
        auditEntry: {
          action: 'CATALOG_SEARCH',
          status: 'NO_MATCH',
          budget: maxPrice,
          reason: 'No catalog product satisfied the requested product intent.'
        }
      });
    }

    // STEP 5: Build grounded context for Gemini
    const groundedData = {
      customerRequest: message,
      maximumBudget: maxPrice,
      exactMatches,
      nearestAlternative
    };

    const ai = new GoogleGenAI({
      apiKey
    });

    const systemInstruction = `
You are CartPilot AI, an agentic commerce shopping assistant.

You MUST follow these rules:

1. Recommend ONLY products contained in VERIFIED_CATALOG_RESULTS.
2. Never invent product names, prices, ratings, features, discounts or stock.
3. Product intent is a hard constraint.
4. An explicit maximum budget is a hard constraint.
5. Never claim an over-budget product fits the customer's budget.
6. If there are no exact matches but a nearest alternative exists:
   - clearly state that no exact match exists within budget;
   - state the alternative's exact price;
   - state exactly how many rupees it exceeds the budget by;
   - ask the customer whether they want to consider it.
7. Never claim that a product has already been added to the cart.
8. Adding to cart requires explicit customer approval.
9. Payment or checkout requires a separate explicit customer approval.
10. Keep the response concise and helpful.
`;

    const prompt = `
CUSTOMER_MESSAGE:
${message}

VERIFIED_CATALOG_RESULTS:
${JSON.stringify(groundedData, null, 2)}

Using ONLY the verified information above, respond to the customer.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.1
      }
    });

    // STEP 6: Determine which verified product cards may be displayed
    const productIds =
      exactMatches.length > 0
        ? exactMatches.map(product => product.id)
        : nearestAlternative
          ? [nearestAlternative.id]
          : [];

    // STEP 7: Return response + explainable audit information
    res.json({
      success: true,
      reply: response.text,
      productIds,
      nearestAlternative,
      auditEntry: {
        action: 'GROUNDED_CATALOG_RECOMMENDATION',
        status:
          exactMatches.length > 0
            ? 'SUCCESS'
            : 'BUDGET_OVERRUN_PROPOSED',
        customerRequest: message,
        hardConstraints: {
          productIntent: true,
          maxPrice
        },
        matchedProductIds: productIds
      }
    });

  } catch (error) {
    console.error('CartPilot Agent Error:', error);

    res.status(500).json({
      success: false,
      message: 'CartPilot AI is temporarily unavailable.'
    });
  }
});

// Razorpay Test Mode / Sandbox order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid order amount is required.'
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Buildathon fallback when legitimate Razorpay Test credentials
    // are not available yet.
    if (!keyId || !keySecret) {
      const simulatedOrder = {
        id: `sim_order_${Date.now()}`,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        status: 'created',
        simulated: true
      };

      console.log(
        `🧪 Simulated sandbox order created: ₹${Number(amount)}`
      );

      return res.json({
        success: true,
        mode: 'SIMULATED_SANDBOX',
        message: 'Simulated sandbox order created. No real payment was processed.',
        order: simulatedOrder
      });
    }

    // This runs only when legitimate Razorpay TEST credentials exist.
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `cartpilot_${Date.now()}`
    });

    return res.json({
      success: true,
      mode: 'RAZORPAY_TEST',
      order
    });

  } catch (error) {
    console.error('Order creation error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create checkout order.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`CartPilot backend running on http://localhost:${PORT}`);
});