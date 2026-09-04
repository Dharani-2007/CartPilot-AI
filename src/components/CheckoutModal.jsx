import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ isOpen, onClose, cartItems, onOrderCompleted }) {
  const [step, setStep] = useState('review'); // 'review' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal > 999 ? subtotal : subtotal + 99);

  const handleCompleteOrder = async () => {
  try {
    setIsProcessing(true);

    const response = await fetch('http://localhost:3001/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: total
      })
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Order creation failed');

    }

    console.log('Checkout order created:', data);

    setOrderId(data.order?.id || 'SIMULATED-ORDER');
    setPaidAmount(total);
    setStep('success');

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      // Safe fallback
    }
    
   setTimeout(() => {
  onOrderCompleted({
    id: data.order?.id || 'SIMULATED-ORDER',
    amount: total,
    mode: data.mode || 'SIMULATED_SANDBOX',
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    createdAt: new Date().toISOString(),
    aiAssisted: true
  });
}, 300);

    

  } catch (error) {
    console.error('Checkout error:', error);
    alert('Unable to create the sandbox order. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};

  const handleCloseAndReset = () => {
    setStep('review');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleCloseAndReset}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {step === 'review' ? 'CartPilot Intelligent Checkout' : 'Order Confirmed!'}
            </h3>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'review' ? (
          <div className="p-6 space-y-5">
            {/* Agent Verification Badge */}
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-violet-800 text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
              <div>
                <span className="font-bold">Agent Verified: </span>
                <span>Best discounts applied & items reserved in stock.</span>
              </div>
            </div>

            {/* Delivery Details Mock */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-600" />
                  Express Delivery Address
                </span>
                <span className="text-brand-600 cursor-pointer hover:underline">Edit</span>
              </div>
              <p className="text-xs text-slate-600">
                Aakash Sharma, Tech Residency, Indiranagar, Bengaluru, 560038
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">
                Estimated Delivery: Tomorrow by 2:00 PM
              </p>
            </div>

            {/* Order Items Preview */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Summary ({cartItems.length} items)
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                    <span className="truncate max-w-[240px] text-slate-700 font-medium">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Payment Methods */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Method (Buildathon Sandbox)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-brand-600 bg-brand-50/50 font-bold text-brand-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>UPI / GPay</span>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${paymentMethod === 'upi' ? 'text-brand-600' : 'text-slate-300'}`} />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Fast 1-click pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    paymentMethod === 'card'
                      ? 'border-brand-600 bg-brand-50/50 font-bold text-brand-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Card / NetBanking</span>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${paymentMethod === 'card' ? 'text-brand-600' : 'text-slate-300'}`} />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Debit / Credit</span>
                </button>
              </div>
            </div>

            {/* Total Payable and Submit */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Total Payable:</span>
                <span className="text-xl font-black text-slate-900">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleCompleteOrder}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Agent Finalizing Checkout...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simulate Complete Order (Demo)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Order Confirmation Step */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-extrabold text-slate-900">Order Placed Successfully!</h4>
              <p className="text-xs text-slate-500">
               Order ID: <strong className="text-slate-800">{orderId}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Total Amount Paid:</span>
                <span>₹{paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Payment Status:</span>
                <span className="font-bold">Sandbox Verified</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>AI Assist:</span>
                <span>CartPilot Agent Auto-Optimized</span>
              </div>
            </div>

            <button
              onClick={handleCloseAndReset}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Continue Shopping with CartPilot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
