import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut,
  LayoutDashboard,
  Bell,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout, db } from '@/lib/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../AuthProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Employees', path: '/employees', roles: ['ADMIN', 'HR'] },
  { icon: CreditCard, label: 'Payroll', path: '/payroll', roles: ['ADMIN', 'HR'] },
  { icon: MessageSquare, label: 'AI Assistant', path: '/ai-assistant', roles: ['ADMIN', 'HR'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [allPayrollRecords, setAllPayrollRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
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

  // Dynamic system/notification state listener
  useEffect(() => {
    if (!user) return;

    // Subscribe to payroll records
    let qPayroll;
    if (role === 'ADMIN' || role === 'HR') {
      qPayroll = query(collection(db, 'payrollRecords'));
    } else {
      qPayroll = query(collection(db, 'payrollRecords'), where('employeeId', '==', user.uid));
    }

    const unsubscribePayroll = onSnapshot(qPayroll, (snapshot) => {
      const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllPayrollRecords(records);
    }, (error) => {
      console.error("Error in Sidebar payroll snapshot listener:", error);
    });

    // Subscribe to employees (only needed for admins/HR to count unprocessed active staff)
    let unsubscribeEmployees = () => {};
    if (role === 'ADMIN' || role === 'HR') {
      const qEmp = query(collection(db, 'employees'));
      unsubscribeEmployees = onSnapshot(qEmp, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setEmployees(list);
      }, (error) => {
        console.error("Error fetching employees in Sidebar:", error);
      });
    }

    return () => {
      unsubscribePayroll();
      unsubscribeEmployees();
    };
  }, [user, role]);

  // Calculate dynamic alerts and payday reminders
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

  const filteredItems = navItems.filter(item => !item.roles || item.roles.includes(role));

  return (
    <aside className="w-20 lg:w-64 bg-sidebar-bg border-r border-slate-800/50 flex flex-col h-screen sticky top-0 z-20 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
          <CreditCard size={22} className="text-white" />
        </div>
        <div className="hidden lg:block overflow-hidden">
          <h1 className="text-xl font-bold text-white tracking-tight">ZenPayroll</h1>
          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">AI Immersive</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-4">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                isActive 
                  ? "text-cyan-400 bg-cyan-500/5" 
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/40"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className={cn("transition-colors", isActive ? "text-cyan-400" : "group-hover:text-slate-300")} />
                <span className="hidden lg:block font-bold text-sm tracking-wide">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-[-16px] w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/50 space-y-2">
        {/* Interactive In-App Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={cn(
              "flex items-center gap-4 px-3 py-3 text-slate-500 hover:text-cyan-400 hover:bg-slate-800/40 transition-all duration-300 w-full group rounded-xl relative",
              isNotifOpen && "text-cyan-400 bg-cyan-500/5"
            )}
          >
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <Bell size={22} className={cn("transition-colors", isNotifOpen ? "text-cyan-400" : "group-hover:text-slate-300")} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-cyan-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center border border-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="hidden lg:block font-bold text-sm tracking-wide">Alert Center</span>
          </button>

          {/* Sidebar Alert Flyout */}
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, x: -15, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -15, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-full ml-3 bottom-0 w-80 bg-slate-950/95 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.05)] z-50 text-left overflow-hidden cursor-default"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                
                <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-400 animate-pulse" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">
                      System Alerts
                    </h4>
                  </div>
                  <button 
                    onClick={() => setIsNotifOpen(false)}
                    className="text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto relative z-10 pr-1 divide-y divide-slate-900">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center">
                      <CheckCircle2 size={28} className="text-slate-700 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">All system clear</p>
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div 
                        key={notif.id}
                        className={cn(
                          "flex items-start gap-3 p-2 rounded-xl transition-colors hover:bg-slate-900/40",
                          idx > 0 && "pt-3 border-t border-slate-900"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg border flex-shrink-0 mt-0.5",
                          notif.severity === 'warning' 
                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                            : notif.severity === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        )}>
                          {notif.iconType === 'warning' ? (
                            <AlertCircle size={14} />
                          ) : notif.iconType === 'success' ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Calendar size={14} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider",
                              notif.severity === 'warning' 
                                ? 'text-orange-400' 
                                : notif.severity === 'success'
                                ? 'text-emerald-400'
                                : 'text-cyan-400'
                            )}>
                              {notif.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                            {notif.description}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-tight">
                              {notif.meta}
                            </span>
                            {notif.type === 'approval' && (
                              <button 
                                onClick={() => {
                                  setIsNotifOpen(false);
                                  navigate('/payroll');
                                }}
                                className="text-[8px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest inline-flex items-center gap-1"
                              >
                                View &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 border-t border-slate-800/40 pt-3 flex items-center justify-between text-[8px] font-mono text-slate-600 relative z-10 w-full uppercase">
                  <span>SYSTEM FEED &bull; ON</span>
                  <span className="flex items-center gap-1"><Sparkles size={8} className="text-cyan-400 animate-pulse" /></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-3 py-3 text-slate-500 hover:text-rose-400 transition-colors w-full group rounded-xl hover:bg-rose-500/[0.02]"
        >
          <LogOut size={22} className="flex-shrink-0" />
          <span className="hidden lg:block font-bold text-sm tracking-wide">Terminal Exit</span>
        </button>
      </div>
    </aside>
  );
}
