import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Scale, 
  Receipt, 
  ShieldCheck, 
  Clock, 
  Check, 
  HelpCircle,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ComplianceItem {
  id: string;
  category: 'tax' | 'labor';
  title: string;
  description: string;
  status: 'compliant' | 'pending' | 'warning';
  percentage: number;
  dueDate?: string;
  actionLabel?: string;
}

export default function ComplianceWidget() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditMessage, setAuditMessage] = useState('');
  
  // Compliance item states
  const [items, setItems] = useState<ComplianceItem[]>([
    {
      id: 'tax-941',
      category: 'tax',
      title: 'Federal Form 941 Filing',
      description: 'Quarterly Employer Tax Return for wage withholdings',
      status: 'compliant',
      percentage: 100,
    },
    {
      id: 'tax-w2',
      category: 'tax',
      title: 'W-2 & W-3 Annual Reporting',
      description: 'Copy A & transmittal filings to Social Security Administration',
      status: 'compliant',
      percentage: 100,
    },
    {
      id: 'tax-940',
      category: 'tax',
      title: 'Federal Unemployment Tax (Form 940)',
      description: 'Annual FUTA returns and quarterly payment match audits',
      status: 'compliant',
      percentage: 100,
    },
    {
      id: 'tax-state',
      category: 'tax',
      title: 'State Income Tax Withholding',
      description: 'Localized payroll income tax compliance across active jurisdictions',
      status: 'compliant',
      percentage: 100,
    },
    {
      id: 'labor-flsa',
      category: 'labor',
      title: 'FLSA Employee Status Audit',
      description: 'Validate Exempt vs Non-exempt status classifications',
      status: 'compliant',
      percentage: 100,
    },
    {
      id: 'labor-erisa',
      category: 'labor',
      title: 'ERISA Benefit Plan Reporting',
      description: 'Prepare Form 5500 and mandate SPD distribution',
      status: 'warning',
      percentage: 60,
      dueDate: 'in 12 days',
      actionLabel: 'Submit Form 5500',
    },
    {
      id: 'labor-equal',
      category: 'labor',
      title: 'Equal Pay Standards Compliance',
      description: 'Perform internal wage disparity check and statutory metrics',
      status: 'compliant',
      percentage: 100,
    },
    {
      id: 'labor-meal',
      category: 'labor',
      title: 'Break & Meal Period Policies',
      description: 'Adapt schedules & logs to strict state-level rest break statutes',
      status: 'pending',
      percentage: 50,
      dueDate: 'Requires signoff',
      actionLabel: 'Sign Policy PDF',
    }
  ]);

  const handleResolve = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'compliant',
          percentage: 100,
          dueDate: undefined,
          actionLabel: undefined
        };
      }
      return item;
    }));
  };

  const runLiveAudit = () => {
    setIsAuditing(true);
    setAuditProgress(0);
    setAuditMessage('Initializing network-wide payroll checksums...');

    const steps = [
      { progress: 15, msg: 'Comparing state withholdings with ledger accounts...' },
      { progress: 35, msg: 'Auditing timesheet exempt flag distributions (FLSA)...' },
      { progress: 55, msg: 'FUTA Form 940 tax bracket ceilings validated...' },
      { progress: 75, msg: 'Generating structural compensation gap matrix...' },
      { progress: 95, msg: 'Validating cryptographic signature schemas...' },
      { progress: 100, msg: 'All systems green. Auditor logs synced.' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setAuditProgress(step.progress);
        setAuditMessage(step.msg);
        if (step.progress === 100) {
          setTimeout(() => {
            setIsAuditing(false);
          }, 1000);
        }
      }, (idx + 1) * 600);
    });
  };

  // Calculate stats based on current items
  const taxItems = items.filter(i => i.category === 'tax');
  const laborItems = items.filter(i => i.category === 'labor');

  const taxProgress = Math.round(taxItems.reduce((acc, curr) => acc + curr.percentage, 0) / taxItems.length);
  const laborProgress = Math.round(laborItems.reduce((acc, curr) => acc + curr.percentage, 0) / laborItems.length);
  const overallScore = Math.round((taxProgress + laborProgress) / 2);

  const pendingRemediations = items.filter(item => item.status !== 'compliant');

  return (
    <div className="bg-card-bg p-8 rounded-3xl border border-slate-800/60 shadow-xl" id="payroll-compliance-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-cyan-400" size={20} />
              Payroll Compliance Status
            </h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest leading-none",
              overallScore === 100 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
            )}>
              {overallScore === 100 ? "FULLY SECURED" : "ACTION REQUESTED"}
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold mt-1">Real-time legislative & tax filing ledger validator</p>
        </div>
        
        <button
          onClick={runLiveAudit}
          disabled={isAuditing}
          className={cn(
            "px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
            isAuditing && "opacity-50 pointer-events-none"
          )}
        >
          <RefreshCw className={cn("text-cyan-400", isAuditing && "animate-spin")} size={14} />
          {isAuditing ? "Auditing Network..." : "Run Compliance Scan"}
        </button>
      </div>

      {/* Audit progress animation state overlay */}
      <AnimatePresence>
        {isAuditing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-cyan-950/20 border border-cyan-800/30 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">{auditMessage}</span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">{auditProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/40">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                animate={{ width: `${auditProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        {/* BIG COMPLIANCE CIRCLE METER */}
        <div className="lg:col-span-4 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/40 flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle track */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-slate-900 fill-none"
                strokeWidth="10"
              />
              <motion.circle
                cx="72"
                cy="72"
                r="64"
                className={cn(
                  "fill-none",
                  overallScore === 100 ? "stroke-emerald-500" : "stroke-cyan-500"
                )}
                strokeWidth="10"
                strokeDasharray="402"
                initial={{ strokeDashoffset: 402 }}
                animate={{ strokeDashoffset: 402 - (402 * overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Central Score Text */}
            <div className="relative flex flex-col items-center">
              <motion.span 
                className="text-4xl font-black text-white leading-none tracking-tight"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                key={overallScore}
              >
                {overallScore}%
              </motion.span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">HEALTH SCORE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 w-full gap-4 mt-6 border-t border-slate-800/60 pt-4 text-center">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">TAX METRICS</span>
              <p className="text-lg font-black text-white mt-1">{taxProgress}%</p>
            </div>
            <div className="border-l border-slate-800/60">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">LABOR STANDARDS</span>
              <p className="text-lg font-black text-white mt-1">{laborProgress}%</p>
            </div>
          </div>
        </div>

        {/* PROGRESS METRICS BREAKDOWN */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Receipt size={14} className="text-indigo-400" />
                Tax Filings & Remittances Compliance
              </h4>
              <span className="text-xs font-black text-emerald-400 font-mono">{taxProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/40 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                animate={{ width: `${taxProgress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Scale size={14} className="text-amber-400" />
                Labor Standards & Benefit Adherence
              </h4>
              <span className="text-xs font-black text-amber-400 font-mono">{laborProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/40 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                animate={{ width: `${laborProgress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Remediation Callout Cards if not 100% */}
          <AnimatePresence mode="popLayout">
            {pendingRemediations.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h5 className="text-xs font-bold text-amber-200 uppercase tracking-wide">Tasks Required for Optimum Ledger Protection</h5>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      You have {pendingRemediations.length} unresolved payroll compliance item{pendingRemediations.length > 1 ? 's' : ''}. Complete the outstanding action plans below.
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest select-none whitespace-nowrap bg-amber-500/10 px-2.5 py-1 rounded-md text-amber-400">
                  {pendingRemediations.length} Pending Actions
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3"
              >
                <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={18} />
                <div>
                  <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">Audit Safe Configuration Confirmed</h5>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    No discrepancies detected. Every entity meets regulatory standards.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800/60 pt-8">
        {/* Left pane: Details list for Tax */}
        <div>
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            Tax Filing & Remittance Elements
          </h4>
          <div className="space-y-4">
            {taxItems.map(item => (
              <div 
                key={item.id} 
                className="p-4 bg-slate-950/20 border border-slate-800/40 rounded-xl hover:border-slate-850 hover:bg-slate-950/50 transition-all flex items-start justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-white leading-none">{item.title}</h5>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">{item.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {item.percentage === 100 ? (
                    <span className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{item.percentage}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right pane: Details list for Labor Laws */}
        <div>
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            Labor & Benefits Standards Checklist
          </h4>
          <div className="space-y-4">
            {laborItems.map(item => (
              <div 
                key={item.id} 
                className={cn(
                  "p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3",
                  item.status === 'warning' 
                    ? "bg-rose-500/[0.01] border-rose-500/20 hover:border-rose-500/30" 
                    : item.status === 'pending'
                    ? "bg-amber-500/[0.02] border-amber-500/20 hover:border-amber-500/30"
                    : "bg-slate-950/20 border-slate-800/40 hover:bg-slate-950/50"
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-white leading-none">{item.title}</h5>
                    {item.dueDate && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide leading-none",
                        item.status === 'warning' ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                      )}>
                        {item.dueDate}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">{item.description}</p>
                </div>
                
                <div className="flex-shrink-0 flex items-center justify-end">
                  {item.status === 'compliant' ? (
                    <span className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolve(item.id)}
                      className={cn(
                        "px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 active:scale-95 transition-all text-white",
                        item.status === 'warning' 
                          ? "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10" 
                          : "bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/10"
                      )}
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
