import React, { useState } from 'react';
import { loginWithGoogle } from '@/lib/firebase';
import { CreditCard, Shield, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'System override failed: Connection error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/30 mb-6 group hover:scale-110 transition-transform">
            <CreditCard size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">ZenPayroll</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mt-2">AI Neural Terminal Access</p>
        </div>

        <div className="bg-card-bg p-10 rounded-3xl border border-slate-800/60 shadow-3xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30"></div>
          
          <div className="space-y-8 relative z-10">
            <div className="text-center">
              <p className="text-slate-400 font-medium text-sm">Enterprise Grade Identity Authentication Required</p>
            </div>

            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl font-black text-xs text-slate-200 uppercase tracking-widest transition-all active:scale-95 group shadow-inner"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin text-cyan-400" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
                  Authorize via Google Node
                  <ArrowRight size={20} className="text-slate-600 group-hover:text-cyan-400 transition-colors ml-auto" />
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-950/50 border border-slate-800/40 rounded-2xl">
                <Shield size={20} className="text-indigo-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">End-to-End</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-slate-950/50 border border-slate-800/40 rounded-2xl">
                <Lock size={20} className="text-cyan-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Biometric Enc</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
        </div>
        
        <p className="text-[10px] text-center text-slate-600 mt-8 font-mono font-bold tracking-widest uppercase italic">
          ZENPAYROLL ARCHITECTURE &bull; SECURE NODE 7A2
        </p>
      </motion.div>
    </div>
  );
}
