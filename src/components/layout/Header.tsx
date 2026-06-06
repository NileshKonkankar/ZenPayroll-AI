import React, { useEffect, useState, useRef } from 'react';
import { Bell, Search, User, CreditCard, X, Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, onSnapshot, doc, getDoc, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../AuthProvider';

export default function Header() {
  const { user, role } = useAuth();
  const [toasts, setToasts] = useState<any[]>([]);
  const mountTimeRef = useRef(new Date().toISOString());

  // Dynamic system/notification states
  const [employees, setEmployees] = useState<any[]>([]);
  const [ownEmployee, setOwnEmployee] = useState<any | null>(null);
  const [allPayrollRecords, setAllPayrollRecords] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    if (!user) return;

    // 1. Subscribe to payroll records (all for staff, or user-specific)
    let qPayroll;
    if (role === 'ADMIN' || role === 'HR') {
      qPayroll = query(collection(db, 'payrollRecords'));
    } else {
      qPayroll = query(collection(db, 'payrollRecords'), where('employeeId', '==', user.uid));
    }

    const unsubscribePayroll = onSnapshot(qPayroll, (snapshot) => {
      const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllPayrollRecords(records);

      // Handle real-time toasts for new additions
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
      handleFirestoreError(error, OperationType.LIST, 'payrollRecords');
    });

    // 2. Subscribe to employees: staff reads entire collection, employee reads their own doc
    let unsubscribeEmployees = () => {};
    if (role === 'ADMIN' || role === 'HR') {
      const qEmp = query(collection(db, 'employees'));
      unsubscribeEmployees = onSnapshot(qEmp, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setEmployees(list);
      }, (error) => {
        console.error("Error fetching employees in Header:", error);
        handleFirestoreError(error, OperationType.LIST, 'employees');
      });
    } else {
      const empDocRef = doc(db, 'employees', user.uid);
      unsubscribeEmployees = onSnapshot(empDocRef, (snapshot) => {
        if (snapshot.exists()) {
          setOwnEmployee({ id: snapshot.id, ...snapshot.data() });
        }
      }, (error) => {
        console.error("Error fetching own employee profile in Header:", error);
        handleFirestoreError(error, OperationType.GET, `employees/${user.uid}`);
      });
    }

    return () => {
      unsubscribePayroll();
      unsubscribeEmployees();
    };
  }, [user, role]);

  // Derive notifications list dynamically based on database state
  const getNotifications = () => {
    const list: any[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth(); // 0-11
    
    // Upcoming salary disbursement date (last working day of the month)
    const lastDayOfMonth = new Date(currentYear, currentMonthNum + 1, 0);
    const formattedLastDay = lastDayOfMonth.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    const diffTime = lastDayOfMonth.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    list.push({
      id: 'disbursement-date',
      type: 'disbursement',
      title: 'Disbursement Target Live',
      description: `Payroll disbursement auto-targets for ${formattedLastDay}.`,
      meta: diffDays > 0 ? `${diffDays} days left` : 'Due Today',
      iconType: 'calendar',
      severity: 'info',
    });

    const activeMonthStr = today.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (role === 'ADMIN' || role === 'HR') {
      // Admin Alert: Which active employees still need a payroll record compiled for this month?
      const activeEmps = employees.filter(e => e.status === 'active');
      const processedEmpIds = new Set(
        allPayrollRecords
          .filter(r => r.month === activeMonthStr)
          .map(r => r.employeeId)
      );
      
      const unprocessedEmployees = activeEmps.filter(e => !processedEmpIds.has(e.id));
      const unprocessedCount = unprocessedEmployees.length;

      if (unprocessedCount > 0) {
        list.push({
          id: 'pending-approvals',
          type: 'approval',
          title: 'Pending Payroll Cycle',
          description: `${unprocessedCount} active employees require payroll cycle processing for ${activeMonthStr}.`,
          meta: 'Action Required',
          iconType: 'warning',
          severity: 'warning',
        });
      } else if (activeEmps.length > 0) {
        list.push({
          id: 'all-processed',
          type: 'approval',
          title: 'Ledgers Compiled Safe',
          description: `All ${activeEmps.length} active employee profiles processed for ${activeMonthStr}.`,
          meta: 'Zero Pending',
          iconType: 'success',
          severity: 'success',
        });
      }
    } else {
      // Standard employee status alerts
      const myRecord = allPayrollRecords.find(r => r.month === activeMonthStr);
      
      if (myRecord) {
        list.push({
          id: `payroll-${activeMonthStr}`,
          type: 'status',
          title: 'Your Payslip is Compiled',
          description: `Your monthly payroll report for ${activeMonthStr} is processed and disbursed.`,
          meta: `Net: $${Number(myRecord.netSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          iconType: 'success',
          severity: 'success',
        });
      } else {
        list.push({
          id: `payroll-${activeMonthStr}-pending`,
          type: 'status',
          title: 'Payslip Compilation',
          description: `Your statement for ${activeMonthStr} is pending HR administrator action.`,
          meta: 'Status: Pending',
          iconType: 'pending',
          severity: 'warning',
        });
      }
    }

    return list;
  };

  const notifications = getNotifications();
  const unreadCount = notifications.length;

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
            {/* Interactive Bell / Notification container */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center border border-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-96 bg-slate-950/95 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.05)] z-50 text-left cursor-default overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 mb-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-cyan-400 animate-pulse" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">
                          Active Alerts
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-widest">
                        {unreadCount} Task{unreadCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto relative z-10 pr-1 divide-y divide-slate-900">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <CheckCircle2 size={32} className="text-slate-700 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No active system alerts</p>
                        </div>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div 
                            key={notif.id}
                            className={`flex items-start gap-3 p-2 rounded-xl transition-colors hover:bg-slate-900/40 ${idx > 0 ? 'pt-3' : ''}`}
                          >
                            <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${
                              notif.severity === 'warning' 
                                ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                                : notif.severity === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                            }`}>
                              {notif.iconType === 'warning' ? (
                                <AlertCircle size={15} />
                              ) : notif.iconType === 'success' ? (
                                <CheckCircle2 size={15} />
                              ) : (
                                <Calendar size={15} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider ${
                                  notif.severity === 'warning' 
                                    ? 'text-orange-400' 
                                    : notif.severity === 'success'
                                    ? 'text-emerald-400'
                                    : 'text-cyan-400'
                                }`}>
                                  {notif.title}
                                </span>
                                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tight">
                                  {notif.meta}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                                {notif.description}
                              </p>
                              {notif.type === 'approval' && (
                                <div className="mt-2 text-right">
                                  <a 
                                    href="/payroll" 
                                    onClick={() => setIsNotifOpen(false)}
                                    className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest inline-flex items-center gap-1 border-b border-cyan-400/20 pb-0.5 hover:border-cyan-300 transition-all"
                                  >
                                    Execute Cycle &rarr;
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-3 border-t border-slate-800/40 pt-3 flex items-center justify-between text-[8px] font-mono text-slate-600 relative z-10 w-full uppercase">
                      <span>STABLE RUNS &bull; {new Date().toLocaleDateString([], { month: '2-digit', day: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><Sparkles size={8} className="text-cyan-400" /> SECURED GATE</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-200">
                  {role === 'ADMIN' || role === 'HR' ? 'Admin Terminal' : (ownEmployee?.name || user?.email?.split('@')[0] || 'Employee Node')}
                </p>
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none mt-1">
                  {role === 'ADMIN' ? 'Superuser' : role === 'HR' ? 'HR Manager' : 'Employee'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-lg shadow-black/40 uppercase">
                {role === 'ADMIN' || role === 'HR' ? 'AD' : (ownEmployee?.name ? ownEmployee.name.slice(0, 2) : 'EM')}
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
