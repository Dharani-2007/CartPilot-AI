export const SAMPLE_PRODUCTS = [
  {
    id: "prod-1",
    name: "AeroTune Pro True Wireless Earbuds",
    category: "Electronics",
    price: 1899,
    originalPrice: 3999,
    rating: 4.8,
    reviewsCount: 328,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    badge: "AI Top Pick",
    description: "Active Noise Cancellation, 36h playback, low-latency gaming mode, and IPX5 water resistance.",
    tags: ["earbuds", "audio", "wireless", "electronics", "music", "under 2000"],
    inStock: true
  },
  {
    id: "prod-2",
    name: "Artisan Amber Cedarwood Aroma Diffuser Gift Set",
    category: "Gifts",
    price: 1299,
    originalPrice: 2199,
    rating: 4.9,
    reviewsCount: 194,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80",
    badge: "Best Gift",
    description: "Handcrafted ceramic ultrasonic diffuser with pure cedarwood and lavender botanical oils in luxury gift packaging.",
    tags: ["gift", "birthday", "home", "fragrance", "under 1500"],
    inStock: true
  },
  {
    id: "prod-3",
    name: "MagSnap Ultra-Slim 10,000mAh Power Bank",
    category: "Electronics",
    price: 1999,
    originalPrice: 2999,
    rating: 4.7,
    reviewsCount: 412,
    image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80",
    badge: "Bestseller",
    description: "22.5W magnetic fast wireless charging with aerospace-grade aluminum casing and LED battery readout.",
    tags: ["power bank", "charger", "electronics", "travel", "under 2000"],
    inStock: true
  },
  {
    id: "prod-4",
    name: "Handstitched Full-Grain Leather Minimalist Wallet",
    category: "Accessories",
    price: 899,
    originalPrice: 1599,
    rating: 4.6,
    reviewsCount: 156,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
    badge: "Trending",
    description: "RFID blocking slim cardholder with quick-access thumb slot and cash compartment, crafted from vegetable-tanned leather.",
    tags: ["wallet", "accessories", "leather", "gift", "under 1000"],
    inStock: true
  },
  {
    id: "prod-5",
    name: "Gourmet Pour-Over Coffee Maker & Double-Wall Mug Set",
    category: "Gifts",
    price: 1450,
    originalPrice: 2400,
    rating: 4.9,
    reviewsCount: 220,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    badge: "Curated",
    description: "Heat-resistant borosilicate glass carafe with permanent stainless-steel mesh filter and insulated barista mug.",
    tags: ["coffee", "gift", "kitchen", "birthday", "under 1500"],
    inStock: true
  },
  {
    id: "prod-6",
    name: "AuraGlow Smart Ambient Desk Lamp",
    category: "Electronics",
    price: 2199,
    originalPrice: 3499,
    rating: 4.8,
    reviewsCount: 188,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    badge: "Smart Living",
    description: "16M RGB colors, adaptive circadian lighting, wireless phone charging base, and touch slider brightness control.",
    tags: ["lamp", "desk", "electronics", "smart home", "lighting"],
    inStock: true
  },
  {
    id: "prod-7",
    name: "Nordic Ceramic Matte Planter Set (Trio with Gold Trays)",
    category: "Gifts",
    price: 1199,
    originalPrice: 1899,
    rating: 4.7,
    reviewsCount: 95,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80",
    badge: "Eco-Gift",
    description: "Three minimalist textured planters with drainage plugs and brushed brass drip trays. Perfect for succulents and herbs.",
    tags: ["plants", "decor", "gift", "birthday", "under 1500"],
    inStock: true
  },
  {
    id: "prod-8",
    name: "Titanium Blue-Light Filtering Computer Glasses",
    category: "Accessories",
    price: 1150,
    originalPrice: 2200,
    rating: 4.6,
    reviewsCount: 264,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
    badge: "Wellness",
    description: "Ultra-lightweight memory titanium frames with anti-reflective, UV400, and 99% blue light blocking coated lenses.",
    tags: ["glasses", "accessories", "work", "tech", "under 1500"],
    inStock: true
  }
];

export const SAMPLE_PROMPT_SUGGESTIONS = [
  "I need wireless earbuds under ₹1800 for studying",
  "Find wireless earbuds under ₹2,000",
  "I need a birthday gift under ₹1,500",
  "Suggest stylish accessories for college or daily carry"
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: "msg-0",
    sender: "assistant",
    timestamp: "Just now",
    text: "Hello! I am your CartPilot AI Shopping Agent. Tell me what you're looking for, your budget in ₹, or the occasion, and I'll find and evaluate the best products for you!",
    productIds: []
  }
];

export const MERCHANT_METRICS = {
  totalOrders: {
    value: "1,482",
    change: "+18.4%",
    positive: true,
    timeframe: "vs last 7 days"
  },
  totalRevenue: {
    value: "₹18,45,200",
    change: "+24.2%",
    positive: true,
    timeframe: "vs last 7 days"
  },
  aiAssistedSales: {
    value: "₹12,80,000",
    percentage: "69.4%",
    change: "+31.0%",
    positive: true,
    timeframe: "of total store GMV"
  },
  aiUpsellRevenue: {
    value: "₹3,64,800",
    percentage: "19.8%",
    change: "+38.5%",
    positive: true,
    timeframe: "from agent bundle recommendations"
  }
};

export const MERCHANT_RECENT_CONVERSIONS = [
  {
    id: "conv-1",
    customer: "Priya S.",
    query: "Find wireless earbuds under ₹2,000",
    purchasedItem: "AeroTune Pro True Wireless Earbuds",
    amount: "₹1,899",
    aiUpsell: "Added MagSnap Power Bank (+₹1,999)",
    time: "4 mins ago",
    status: "Completed"
  },
  {
    id: "conv-2",
    customer: "Rohan M.",
    query: "Need a birthday gift under ₹1,500 for my sister",
    purchasedItem: "Artisan Amber Cedarwood Aroma Diffuser",
    amount: "₹1,299",
    aiUpsell: "Gift wrapping & customized note added",
    time: "18 mins ago",
    status: "Completed"
  },
  {
    id: "conv-3",
    customer: "Ananya K.",
    query: "Minimalist leather wallet with RFID",
    purchasedItem: "Handstitched Full-Grain Leather Wallet",
    amount: "₹899",
    aiUpsell: "Direct checkout via CartPilot",
    time: "42 mins ago",
    status: "Completed"
  },
  {
    id: "conv-4",
    customer: "Vikram D.",
    query: "Smart lamp for home office video calls",
    purchasedItem: "AuraGlow Smart Ambient Desk Lamp",
    amount: "₹2,199",
    aiUpsell: "Bundle discount applied (-₹200)",
    time: "1 hr ago",
    status: "Completed"
  }
];

export const FUNNEL_STATS = [
  { step: "Store Visitors", count: "12,450", rate: "100%" },
  { step: "CartPilot AI Chats Initiated", count: "8,920", rate: "71.6%" },
  { step: "AI Product Cards Interacted", count: "6,240", rate: "69.9%" },
  { step: "Cart Additions via AI Agent", count: "3,110", rate: "49.8%" },
  { step: "Completed Intelligent Checkouts", count: "1,482", rate: "47.6%" }
];
