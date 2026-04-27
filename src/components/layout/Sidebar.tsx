import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/firebase';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: CreditCard, label: 'Payroll', path: '/payroll' },
  { icon: MessageSquare, label: 'AI Assistant', path: '/ai-assistant' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

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
        {navItems.map((item) => (
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

      <div className="p-6 border-t border-slate-800/50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-3 py-3 text-slate-500 hover:text-rose-400 transition-colors w-full group"
        >
          <LogOut size={22} />
          <span className="hidden lg:block font-bold text-sm tracking-wide">Terminal Exit</span>
        </button>
      </div>
    </aside>
  );
}
