import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-brand-bg/80 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="relative w-96 group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="System query: employee data, payroll metrics..." 
          className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all text-sm text-slate-200 placeholder:text-slate-600 shadow-inner"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
          <span className="text-[10px] font-mono text-slate-400 tracking-tighter uppercase">GEMINI-1.5-PRO CONNECTED</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-200">Admin Terminal</p>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1">Superuser</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-lg shadow-black/40">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
