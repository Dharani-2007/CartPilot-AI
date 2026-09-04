import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  ShoppingBag, 
  Check, 
  Star, 
  RefreshCw, 
  ArrowRight, 
  Settings, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ShieldCheck, 
  Key, 
  X 
} from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_PROMPT_SUGGESTIONS, INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { executeAgentTurn, getStoredApiKey, setStoredApiKey } from '../services/agent/geminiAgent';

// Clean renderer for chat messages that parses markdown bold and bullets cleanly without raw asterisks
function FormattedMessage({ text, isAssistant }) {
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');

        return (
          <p key={pIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              const isBullet = trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
              const contentLine = isBullet ? trimmed.replace(/^[•\-*]\s*/, '') : line;

              const parts = [];
              const regex = /\*\*(.*?)\*\*/g;
              let lastIndex = 0;
              let match;
              let keyCount = 0;

              while ((match = regex.exec(contentLine)) !== null) {
                if (match.index > lastIndex) {
                  parts.push(contentLine.substring(lastIndex, match.index));
                }
                parts.push(
                  <strong
                    key={keyCount++}
                    className={`font-bold ${isAssistant ? 'text-slate-900' : 'text-white'}`}
                  >
                    {match[1]}
                  </strong>
                );
                lastIndex = match.index + match[0].length;
              }

              if (lastIndex < contentLine.length) {
                parts.push(contentLine.substring(lastIndex));
              }

              if (isBullet) {
                return (
                  <span key={lIdx} className="flex items-start gap-1.5 mt-1">
                    <span className={isAssistant ? 'text-brand-600 font-bold' : 'text-brand-200'}>•</span>
                    <span>{parts}</span>
                  </span>
                );
              }

              return (
                <React.Fragment key={lIdx}>
                  {parts}
                  {lIdx < lines.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function AIAssistantSection({ onAddToCart, addedProductIds = [] }) {
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAuditTab, setActiveAuditTab] = useState({}); // toggle audit trail per message
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [keySavedFeedback, setKeySavedFeedback] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const hasApiKey = Boolean(getStoredApiKey());

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text,
      productIds: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Execute the real agent turn (Gemini 2.5 Flash tool-calling or deterministic fallback)
      const agentResult = await executeAgentTurn(text, messages);

      // Handle conversational approval cart action if customer explicitly said "Yes, add it"
      if (agentResult.cartAction?.action === 'add' && agentResult.cartAction.product && onAddToCart) {
        onAddToCart(agentResult.cartAction.product);
      }

      const assistantMessage = {
        id: `msg-asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: agentResult.text,
        productIds: agentResult.productIds || [],
        nearestAlternative: agentResult.nearestAlternative,
        auditEntry: agentResult.auditEntry
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Agent execution failed:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "I encountered a transient issue evaluating your request. Please try again or rephrase your budget/item preference.",
          productIds: []
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleAudit = (msgId) => {
    setActiveAuditTab(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setStoredApiKey(apiKeyInput);
    setKeySavedFeedback(true);
    setTimeout(() => {
      setKeySavedFeedback(false);
      setSettingsModalOpen(false);
    }, 1000);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_CHAT_MESSAGES);
    setInputValue('');
  };

  return (
    <section id="ai-assistant-section" className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Autonomous Shopping Co-pilot</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CartPilot AI Shopping Assistant
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Ask natural shopping queries, define budgets in ₹, or pick one of the quick suggestions below.
          </p>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Try these prompt suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                className="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200/80 hover:border-brand-200 shadow-sm transition-all flex items-center gap-1.5 group text-left"
              >
                <span>"{suggestion}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Window Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden flex flex-col h-[620px] sm:h-[680px]">
          
          {/* Chat Window Top Bar */}
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-violet-500 flex items-center justify-center font-bold shadow-sm">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">CartPilot Shopping Agent</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.2 rounded-full border border-emerald-500/30">
                    {hasApiKey ? 'Gemini 2.5 Flash' : 'Grounded Agent'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {hasApiKey ? 'Tool calling active via Google Gemini API' : 'Strict catalog grounding with live audit trail'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSettingsModalOpen(true)}
                title="Agent API Key & Settings"
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
                aria-label="Agent Settings"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px] font-medium">Settings</span>
              </button>

              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Reset Conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              const matchedProducts = (msg.productIds || [])
                .map(id => SAMPLE_PRODUCTS.find(p => p.id === id))
                .filter(Boolean);

              const isAuditOpen = Boolean(activeAuditTab[msg.id]);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[88%] sm:max-w-[78%] space-y-3 ${isAssistant ? '' : 'items-end'}`}>
                    
                    {/* Speech bubble */}
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isAssistant
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                          : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-sm'
                      }`}
                    >
                      <FormattedMessage text={msg.text} isAssistant={isAssistant} />
                      <div className={`text-[10px] mt-2 font-medium ${isAssistant ? 'text-slate-400' : 'text-brand-200 text-right'}`}>
                        {msg.timestamp}
                      </div>
                    </div>

                    {/* Agent Audit & Tool Trail (Expandable) */}
                    {isAssistant && msg.auditEntry && (
                      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden text-xs">
                        <button
                          onClick={() => toggleAudit(msg.id)}
                          className="w-full px-3 py-2 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between text-slate-600 font-semibold transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-brand-600" />
                            <span>Agent Reasoning & Tool Audit</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 font-bold">
                              {msg.auditEntry.toolName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <span>{msg.auditEntry.executionMs}ms</span>
                            {isAuditOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                        </button>

                        {isAuditOpen && (
                          <div className="p-3 space-y-2 bg-slate-50/50 border-t border-slate-100 text-[11px] font-mono text-slate-700">
                            <div>
                              <strong className="text-slate-900 font-sans">Reasoning Intent: </strong>
                              <span>{msg.auditEntry.reasoningSummary}</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                              <span className="text-brand-700 font-bold">Tool Input: </span>
                              <code>{JSON.stringify(msg.auditEntry.toolInput)}</code>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                              <span>Status: <strong className="text-emerald-600 font-semibold">{msg.auditEntry.status}</strong></span>
                              <span>Timestamp: {msg.auditEntry.timestamp}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Embedded Product Cards rendered directly inside Chat stream */}
                    {matchedProducts.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          {msg.auditEntry?.status === 'BUDGET_OVERRUN_PROPOSED' ? (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-amber-800 font-extrabold">Closest Available Option (Over Budget):</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                              <span className="text-slate-500">Recommended Catalog Items ({matchedProducts.length}):</span>
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {matchedProducts.map((prod) => {
                            const isAdded = addedProductIds.includes(prod.id);
                            const isOverBudget = msg.auditEntry?.status === 'BUDGET_OVERRUN_PROPOSED';
                            const budgetDiff = msg.nearestAlternative?.budgetDiff || (prod.price - 1800 > 0 ? prod.price - 1800 : null);

                            return (
                              <div
                                key={prod.id}
                                className={`bg-white rounded-xl p-3 border shadow-sm transition-all flex flex-col justify-between group ${
                                  isOverBudget ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 hover:border-brand-300'
                                }`}
                              >
                                <div className="flex gap-3">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-700">
                                        {prod.category}
                                      </span>
                                      {isOverBudget && budgetDiff && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                          +₹{budgetDiff} over budget
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mt-1 group-hover:text-brand-600 transition-colors">
                                      {prod.name}
                                    </h4>
                                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mt-0.5">
                                      <Star className="w-3 h-3 fill-amber-400" />
                                      <span>{prod.rating}</span>
                                    </div>
                                    <div className="text-xs font-extrabold text-slate-900 mt-1">
                                      ₹{prod.price.toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => onAddToCart(prod)}
                                  className={`mt-2.5 w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    isAdded
                                      ? 'bg-emerald-600 text-white'
                                      : isOverBudget
                                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                                      : 'bg-slate-900 hover:bg-brand-600 text-white'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Added to Cart</span>
                                    </>
                                  ) : isOverBudget ? (
                                    <>
                                      <ShoppingBag className="w-3 h-3" />
                                      <span>Consider & Add (₹{prod.price})</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-3 h-3" />
                                      <span>Add to Cart</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Agent Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 font-medium ml-1.5">
                    CartPilot agent is evaluating catalog constraints...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask CartPilot: e.g. 'Find gifts for a tech lover under ₹2,000'..."
                  disabled={isTyping}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5 shrink-0"
                aria-label="Send message to CartPilot"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[11px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1.5">
              <span>🛡️ Closed-world catalog grounding: no hallucinated items or unauthorized cart additions</span>
            </div>
          </div>

        </div>

        {/* API Key & Agent Configuration Modal */}
        {settingsModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div 
              onClick={() => setSettingsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">CartPilot Agent Settings</h3>
                    <p className="text-xs text-slate-500">Google Gemini API Configuration</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettingsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  CartPilot AI uses <strong>Google Gemini 2.5 Flash</strong> with native Function Calling. You can input your API key below or leave it empty to use the zero-latency grounded local engine.
                </p>
                <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 text-[11px] text-brand-800 space-y-1">
                  <div className="font-semibold">Current Agent Mode:</div>
                  <div>
                    {hasApiKey ? '🟢 Live Gemini 2.5 Flash (Online Tool Calling)' : '🟡 Grounded Local Agent (Offline / Buildathon Mode)'}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gemini API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Get a key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-brand-600 underline">Google AI Studio</a>. Saved in your browser's localStorage.
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
                  >
                    {keySavedFeedback ? 'Saved Successfully!' : 'Save Configuration'}
                  </button>
                  {apiKeyInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setApiKeyInput('');
                        setStoredApiKey('');
                      }}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
