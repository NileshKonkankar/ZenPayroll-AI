import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle, ArrowRight, History, PieChart, FileText, FileCode, FileDown, Loader2, Sparkles, AlertTriangle, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Payroll() {
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [customDeductions, setCustomDeductions] = useState({
    unpaidLeaves: 0,
    pfRate: 0.12
  });

  useEffect(() => {
    fetchHistory();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/payroll/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const processPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payroll/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          globalDeductions: {
            pfRate: 0.12,
            unpaidLeaves: 0
          }
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setProcessed(true);
        fetchHistory();
      } else {
        setError(data.message || "Failed to process payroll");
      }
    } catch (err) {
      setError("Network error: Failed to reach processing unit.");
    } finally {
      setLoading(false);
    }
  };

  const totalDisbursement = history.reduce((acc, curr) => acc + (curr.netSalary || 0), 0);
  const totalTax = history.reduce((acc, curr) => acc + (curr.tax || 0), 0);

  const processSinglePayroll = async () => {
    if (!selectedEmployeeId) {
      setError("Please select an employee node.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          deductions: customDeductions
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProcessed(true);
        fetchHistory();
      } else {
        setError(data.message || "Failed to process single payroll");
      }
    } catch (err) {
      setError("Network intersection failure: Node unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Payroll Architecture</h2>
        <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">Disbursement Control &bull; Cycle: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card-bg p-8 rounded-3xl border border-slate-800/60 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-600/20 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                  <Calculator size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Cycle Execution</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Ready for disbursement</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 tracking-widest">
                BATCH ID: {processed ? '8X-921-AF-DONE' : '8X-921-AF'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
              <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800/60 hover:border-cyan-500/20 transition-all group/card">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Recent Cycle Net</p>
                <p className="text-3xl font-black text-white group-hover/card:text-cyan-400 transition-colors">
                  ${totalDisbursement.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                   <span className="text-[10px] font-bold text-cyan-500/80 uppercase">Processing Queue: {history.length} Nodes</span>
                </div>
              </div>
              <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800/60 hover:border-indigo-500/20 transition-all group/card">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Gross Tax Matrix</p>
                <p className="text-3xl font-black text-white group-hover/card:text-indigo-400 transition-colors">
                  ${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                   <span className="text-[10px] font-bold text-indigo-500/80 uppercase">AI Verification Enabled</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {processed ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-emerald-400 uppercase tracking-tight">Execution Successful</h4>
                      <p className="text-xs text-emerald-500/80 font-bold uppercase tracking-widest leading-none mt-1">Audit logs generated &bull; Bank transmission complete</p>
                    </div>
                    <button 
                      onClick={() => setProcessed(false)}
                      className="ml-auto text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest"
                    >
                      Process New
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={processPayroll}
                      disabled={loading}
                      className="w-full py-5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-cyan-600/30 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={24} className="animate-spin" />
                          Initializing Ledger Processing...
                        </>
                      ) : (
                        <>
                          Execute Final Disbursement cycle
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                      {loading && (
                        <motion.div 
                          className="absolute bottom-0 left-0 h-1 bg-white/30"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2 }}
                        />
                      )}
                    </button>
                    {error && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold uppercase tracking-widest">
                        <AlertTriangle size={18} />
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
          </div>

          <div className="bg-card-bg p-8 rounded-3xl border border-slate-800/60 shadow-2xl relative overflow-hidden group">
            <h3 className="text-lg font-black text-white mb-8 uppercase tracking-tight flex items-center gap-2">
              <PlusCircle size={20} className="text-cyan-400" />
              Singular Node Insertion
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Personnel</label>
                  <select 
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer font-medium"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    <option value="">Select Identity...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unpaid Leaf Nodes</label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50 font-mono"
                    value={customDeductions.unpaidLeaves}
                    onChange={(e) => setCustomDeductions({...customDeductions, unpaidLeaves: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">PF Allocation Rate ({Math.round(customDeductions.pfRate * 100)}%)</label>
                <input 
                  type="range"
                  min="0"
                  max="0.25"
                  step="0.01"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  value={customDeductions.pfRate}
                  onChange={(e) => setCustomDeductions({...customDeductions, pfRate: parseFloat(e.target.value)})}
                />
              </div>

              <button 
                onClick={processSinglePayroll}
                disabled={loading || !selectedEmployeeId}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-900/50 disabled:text-slate-700 text-cyan-400 border border-cyan-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.99] flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Process Particular Node"}
              </button>
            </div>
          </div>

          <div className="bg-card-bg p-8 rounded-3xl border border-slate-800/60 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-8 uppercase tracking-tight flex items-center gap-2">
              <History size={20} className="text-slate-400" />
              Terminal Access: Historical Audits
            </h3>
            <div className="space-y-4">
              {history.length > 0 ? history.map((record, i) => (
                <div key={record.id || i} className="flex items-center justify-between p-5 bg-slate-900/40 rounded-2xl border border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/60 transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-slate-200 transition-colors font-mono font-bold text-[10px]">
                       {record.id?.substring(0, 4).toUpperCase() || 'CORE'}
                     </div>
                     <div>
                       <p className="text-sm font-black text-slate-100 uppercase tracking-tight">{record.employeeName || "Employee Node"}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{record.month} &bull; COMPLIANCE CLEAR</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white font-mono">${record.netSalary?.toLocaleString()}</p>
                    <button className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest mt-1">Download ISO Report</button>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">No records found in current node</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-card-bg to-slate-950 p-8 rounded-3xl border border-slate-800/60 shadow-2xl relative overflow-hidden group">
            <h3 className="text-lg font-black text-white mb-8 uppercase tracking-tight flex items-center gap-2">
              <PieChart size={20} className="text-indigo-400" />
              Structural Allocation
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Engineering Architecture', value: 64, color: 'bg-indigo-500' },
                { label: 'Marketing Matrix', value: 18, color: 'bg-cyan-500' },
                { label: 'Product Operations', value: 12, color: 'bg-emerald-500' },
                { label: 'System Overheads', value: 6, color: 'bg-orange-500' },
              ].map((dept, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <span>{dept.label}</span>
                    <span className="text-slate-200 font-mono tracking-tighter">{dept.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", dept.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
               <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Sparkles size={12} />
                  AI Structural Analysis
               </p>
               <p className="text-[11px] text-slate-400 leading-relaxed font-medium capitalize">
                  Current allocation shows a <span className="text-white font-bold">Basis Drift</span>. AI detected efficiency gains in cloud node distribution.
               </p>
            </div>
          </div>

          <div className="bg-card-bg p-8 rounded-3xl border border-slate-800/60 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
              <FileDown size={20} className="text-rose-400" />
              Compliance Exports
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-cyan-500/30 hover:bg-slate-900 transition-all group">
                <FileText size={24} className="text-slate-600 group-hover:text-cyan-400 mb-2 transition-colors" />
                <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest">Tax Matrix (PDF)</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-emerald-500/30 hover:bg-slate-900 transition-all group">
                <FileCode size={24} className="text-slate-600 group-hover:text-emerald-400 mb-2 transition-colors" />
                <span className="text-[9px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest">Bank XML (RAW)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
