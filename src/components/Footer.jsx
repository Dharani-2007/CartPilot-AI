import React from 'react';
import { Sparkles, ShoppingBag, Bot, ShieldCheck, Heart, Github } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-violet-500 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">CartPilot AI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-900 text-brand-300 border border-brand-700">
                Buildathon Prototype
              </span>
            </div>
            
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              CartPilot AI is an autonomous, agentic shopping co-pilot designed to eliminate friction in modern e-commerce. From intent discovery to 1-click checkout optimization, shopping has never been smarter.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ₹ INR Pricing Ready
              </span>
              <span>•</span>
              <span>Frontend Prototype v1.0</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-white transition-colors">
                  Product Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assistant')} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>AI Shopping Assistant</span>
                  <span className="text-[10px] bg-violet-900/80 text-violet-300 px-1.5 py-0.2 rounded font-bold">Agent</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('merchant')} className="hover:text-white transition-colors">
                  Merchant Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hackathon Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Buildathon Project</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for the AI Commerce Buildathon. Demonstrates agentic customer interaction, dynamic basket generation, and merchant intelligence.
            </p>
            <div className="pt-2">
              <div className="text-[11px] text-slate-500 font-mono">
                Built with React, Vite & Tailwind CSS
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} CartPilot AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted for AI Commerce Buildathon</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
