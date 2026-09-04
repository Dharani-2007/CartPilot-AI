# 🛒 CartPilot AI

### Agentic Shopping & Intelligent Checkout Assistant

CartPilot AI is an AI-powered commerce agent built for the **Razorpay AI Buildathon – AI Growth & Agentic Commerce Track**.

It helps customers discover products using natural language, understands shopping intent and budget constraints, recommends only products available in the merchant catalog, assists with upselling, and guides customers through a user-approved checkout flow.

---

## 🎯 Problem Statement

Traditional e-commerce requires customers to manually search, filter, compare, add products to cart, and complete checkout.

This creates friction and can reduce conversions.

Merchants also miss opportunities to intelligently recommend relevant products while maintaining customer trust and control.

CartPilot AI solves this by introducing an **agentic commerce experience** where an AI agent assists the customer throughout the shopping journey.

---

## 💡 Solution

Instead of navigating an online store manually, customers can simply describe what they need.

Example:

> "I need wireless earbuds under ₹2,000 for studying."

CartPilot AI:

1. Understands the customer's intent.
2. Extracts constraints such as category and budget.
3. Searches the merchant's closed product catalog.
4. Rejects products that violate hard constraints.
5. Recommends relevant catalog products.
6. Asks for explicit customer approval before modifying the cart.
7. Guides the customer to checkout.
8. Records agent actions in an audit trail.
9. Updates merchant analytics after completed orders.

---

## 🤖 Agentic Commerce Flow

```text
Customer Request
       ↓
Intent & Constraint Detection
       ↓
Closed-World Catalog Search
       ↓
Product Validation
       ↓
AI Recommendation
       ↓
Customer Approval Gate
       ↓
Add to Cart
       ↓
Checkout
       ↓
Sandbox Order Creation
       ↓
Merchant Analytics
       ↓
Audit Trail