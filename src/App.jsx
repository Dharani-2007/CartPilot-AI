import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductsSection from './components/ProductsSection';
import AIAssistantSection from './components/AIAssistantSection';
import MerchantDashboard from './components/MerchantDashboard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';
import { Sparkles, Check, ShoppingBag } from 'lucide-react';
import { SAMPLE_PRODUCTS } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Cart state: items are added ONLY upon explicit customer selection or approval
  const [cartItems, setCartItems] = useState([]);
const [completedOrders, setCompletedOrders] = useState(() => {
  try {
    const savedOrders = localStorage.getItem('cartpilot_completed_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error('Failed to load saved orders:', error);
    return [];
  }
});
 useEffect(() => {
  try {
    localStorage.setItem(
      'cartpilot_completed_orders',
      JSON.stringify(completedOrders)
    );
  } catch (error) {
    console.error('Failed to save orders:', error);
  }
}, [completedOrders]);
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });

    showToast(`Added "${product.name}" to cart!`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (orderData) => {
  if (orderData) {
    setCompletedOrders(prev => [orderData, ...prev]);
  }

  setCartItems([]);
};

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const addedProductIds = cartItems.map(item => item.id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Top Banner for Buildathon */}
      <div className="bg-gradient-to-r from-brand-700 via-indigo-700 to-violet-700 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span>AI Commerce Buildathon Preview – Autonomous Shopping & Intelligent Checkout</span>
        <span className="hidden md:inline px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-bold">₹ INR Ready</span>
      </div>

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartItemCount={totalCartCount}
        setIsCartOpen={setIsCartOpen}
      />

      {/* Dynamic Main View */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <HeroSection
              onShopWithAI={() => {
                setActiveTab('assistant');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBrowseProducts={() => {
                const el = document.getElementById('products-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setActiveTab('products');
                }
              }}
            />

            {/* Embedded AI Assistant directly accessible on Home page */}
            <AIAssistantSection
              onAddToCart={handleAddToCart}
              addedProductIds={addedProductIds}
            />

            {/* Featured Products Catalog Section */}
            <ProductsSection
              onAddToCart={handleAddToCart}
              addedProductIds={addedProductIds}
            />
          </>
        )}

        {activeTab === 'products' && (
          <div className="pt-4">
            <ProductsSection
              onAddToCart={handleAddToCart}
              addedProductIds={addedProductIds}
            />
          </div>
        )}

        {activeTab === 'assistant' && (
          <div className="pt-4 pb-8">
            <AIAssistantSection
              onAddToCart={handleAddToCart}
              addedProductIds={addedProductIds}
            />
          </div>
        )}

        {activeTab === 'merchant' && (
          <MerchantDashboard completedOrders={completedOrders} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Simulated 1-Click Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
