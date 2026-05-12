import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import { useAuth } from '../components/AuthProvider';

export default function AIAssistant() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: "Terminal ready. I can analyze architecture payroll costs, detect anomalies, or suggest optimizations for the current cycle. What's your inquiry?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = await getToken();
      const context = {
        totalEmployees: 1248,
        monthlyCost: 428500,
        anomalies: ["Overtime spike in Engineering"]
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: input, context })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "System error: Connection to AI core interrupted." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-card-bg rounded-3xl border border-slate-800/60 overflow-hidden shadow-2xl relative">
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot size={26} />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-tight">ZenPayroll Core AI</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Secure Neural Link Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] text-indigo-400 font-black tracking-widest">
          <Sparkles size={12} />
          PRO INSIGHTS v3.1
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative z-10" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex max-w-[85%] ",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold",
                msg.role === 'user' ? "ml-4 bg-slate-800 text-slate-400" : "mr-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              )}>
                {msg.role === 'user' ? "USR" : "AI"}
              </div>
              <div className={cn(
                "p-5 rounded-2xl text-sm leading-relaxed font-medium relative transition-all",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-600/10" 
                  : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none shadow-xl"
              )}>
                {msg.text}
                {msg.role === 'assistant' && (
                   <div className="absolute top-0 right-0 p-1 opacity-5">
                      <Sparkles size={32} />
                   </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex mr-auto max-w-[85%]">
              <div className="mr-4 w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-[10px] font-bold">
                AI
              </div>
              <div className="p-5 bg-slate-900 text-slate-500 font-mono text-[10px] uppercase tracking-widest rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-3">
                <Loader2 size={14} className="animate-spin" />
                Retrieving data from neural core...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={sendMessage} className="p-6 bg-slate-950/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3 bg-[#05060a] p-2 border border-slate-800 rounded-2xl focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:border-cyan-500/40 transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Analytical query: 'Explain the 12% spike in Engineering overtime'..." 
            className="flex-1 px-4 py-3 text-sm outline-none bg-transparent text-slate-200 placeholder:text-slate-700"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg shadow-cyan-600/20 active:scale-95 flex items-center justify-center group"
          >
            <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-600 mt-4 font-mono font-bold tracking-widest uppercase">
          AI SYSTEM &bull; END-TO-END ENCRYPTED &bull; LOGS PURGED EVERY 24H
        </p>
      </form>

      {/* Decorative pulse background */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
}
