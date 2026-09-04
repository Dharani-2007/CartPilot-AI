import React from 'react';
import { Sparkles, Bot, ShoppingBag, ArrowRight, ShieldCheck, Zap, Tag, Star } from 'lucide-react';

export default function HeroSection({ onShopWithAI, onBrowseProducts }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-300/20 via-violet-300/30 to-cyan-200/20 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 right-10 w-72 h-72 bg-brand-400/15 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Buildathon / AI Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs sm:text-sm font-semibold shadow-sm animate-pulse-slow">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>AI Commerce Buildathon Edition</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="text-slate-500 font-normal">Autonomous Shopper v1.0</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Shop Smarter with <br />
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                CartPilot AI
              </span>
            </h1>

            {/* Subtitle explicitly answering prompt requirements */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Simply describe what you need in natural language. Our autonomous AI shopping assistant analyzes your preferences, compares prices in <span className="font-semibold text-slate-800">₹</span>, discovers the best products, and curates your checkout instantly.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopWithAI}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white font-semibold text-base shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Shop with AI</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBrowseProducts}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-semibold text-base shadow-sm hover:bg-slate-50 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                <span>Explore Products</span>
              </button>
            </div>

            {/* Trust and feature bullet highlights */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Sub-second</div>
                  <div className="text-[11px] text-slate-500">Natural matching</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1 rounded-md bg-brand-50 text-brand-600 mt-0.5">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">₹ INR Prices</div>
                  <div className="text-[11px] text-slate-500">Instant discounts</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="p-1 rounded-md bg-violet-50 text-violet-600 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Verified</div>
                  <div className="text-[11px] text-slate-500">Curated sellers</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Visual: Interactive Mock AI Agent Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-5 space-y-4">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">CartPilot Active Agent</h3>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Listening to natural shopping intent
                    </p>
                  </div>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                  Live Demo
                </span>
              </div>

              {/* Chat Simulation Bubble (User) */}
              <div className="flex justify-end">
                <div className="bg-brand-600 text-white text-xs sm:text-sm rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow-sm">
                  "Find high-rated wireless earbuds under ₹2,000 for gym and study"
                </div>
              </div>

              {/* Chat Simulation Response (AI Agent) */}
              <div className="flex justify-start items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="bg-slate-100 text-slate-800 text-xs sm:text-sm rounded-2xl rounded-tl-none p-3.5 max-w-[90%] space-y-3">
                  <p className="text-xs text-slate-600">
                    Found the perfect match! <strong>AeroTune Pro TWS</strong> has Active Noise Cancellation and sweat resistance at just ₹1,899.
                  </p>

                  {/* Embedded Micro Product Card */}
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=80" 
                      alt="AeroTune Earbuds" 
                      className="w-14 h-14 rounded-lg object-cover bg-slate-50 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">AeroTune Pro Earbuds</div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>4.8 (328 reviews)</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xs font-extrabold text-brand-700">₹1,899</span>
                        <span className="text-[10px] text-slate-400 line-through">₹3,999</span>
                      </div>
                    </div>
                    <button 
                      onClick={onShopWithAI}
                      className="px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shrink-0 shadow-sm transition-colors"
                    >
                      Try AI
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom tag line */}
              <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-500" />
                <span>Simulated Agentic Checkout with Smart Upsells</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
