import React, { useEffect, useState, useRef } from 'react';
import { Bell, Search, User, CreditCard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, onSnapshot, doc, getDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../AuthProvider';

export default function Header() {
  const { user, role } = useAuth();
  const [toasts, setToasts] = useState<any[]>([]);
  const mountTimeRef = useRef(new Date().toISOString());

  useEffect(() => {
    if (!user) return;

    let q;
    if (role === 'ADMIN' || role === 'HR') {
      q = query(collection(db, 'payrollRecords'));
    } else {
      q = query(collection(db, 'payrollRecords'), where('employeeId', '==', user.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Only alert for payroll processed after this component loaded
          if (data.processedAt && data.processedAt > mountTimeRef.current) {
            const toastId = change.doc.id;

            // Fetch the employee's name for a beautiful customized toast
            let employeeName = `Employee ID: ${data.employeeId.slice(0, 6)}...`;
            try {
              const empDoc = await getDoc(doc(db, 'employees', data.employeeId));
              if (empDoc.exists()) {
                employeeName = empDoc.data().name;
              }
            } catch (err) {
              console.error("Error fetching employee name for notification:", err);
            }

            const newToast = {
              id: toastId,
              employeeName,
              month: data.month,
              netSalary: data.netSalary,
              processedAt: data.processedAt,
            };

            setToasts((prev) => [newToast, ...prev]);

            // Auto-dismiss in 7 seconds
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== toastId));
            }, 7000);
          }
        }
      });
    }, (error) => {
      console.error("Error in real-time payroll snapshot listener:", error);
    });

    return () => unsubscribe();
  }, [user, role]);

  return (
    <>
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

      {/* Floating Holographic Toasts */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 w-96 max-w-[calc(100vw-3rem)] pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full bg-slate-950/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(16,185,129,0.1)] flex items-start gap-4 relative overflow-hidden"
            >
              {/* Highlight Gradient strip decoration */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-500" />

              <div className="p-2 sm:p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <CreditCard size={18} className="animate-pulse" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  PAYROLL SYSTEM ALERT
                </p>
                <p className="text-sm font-bold text-slate-100 truncate mt-1">
                  {toast.employeeName}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Billing Cycle: <span className="font-semibold text-slate-300">{toast.month}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 font-mono font-bold">NET DISBURSEMENT:</span>
                  <span className="text-sm font-black text-emerald-300 font-mono">
                    ${toast.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors p-1 hover:bg-slate-900 rounded-lg"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
