import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CreditCard,
  Building2,
  Shield,
  Clock,
  User as UserIcon,
  ChevronRight,
  Printer,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/employees/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setEmployee(data);
        } else {
          navigate('/employees');
        }
      } catch (err) {
        console.error(err);
        navigate('/employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, navigate, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.3em]">Decrypting Identity...</p>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-20">
      {/* Navigation Header */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 backdrop-blur-xl">
        <Link 
          to="/employees" 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Personnel Hub</span>
        </Link>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
            <Printer size={16} />
            Fetch Physical Copy
          </button>
          <div className="w-px h-4 bg-slate-800" />
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
            <Share2 size={16} />
            Distribute Identity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0b10] border border-slate-800/80 rounded-[2.5rem] p-8 relative overflow-hidden"
          >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[60px] pointer-events-none" />
            
            <div className="relative flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-[2rem] bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-4xl font-black text-cyan-400 shadow-2xl mb-6 ring-4 ring-cyan-500/5">
                {employee.name?.[0]}
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">{employee.name}</h1>
              <p className="text-cyan-500 font-black text-xs uppercase tracking-[0.2em] mt-2 mb-6">{employee.role}</p>
              
              <div className="flex gap-2 mb-8">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                  Active Node
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800/50 text-slate-400 border border-slate-700/50 text-[9px] font-black uppercase tracking-widest">
                  Level 03
                </span>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/50 group hover:border-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Comms Interface</p>
                    <p className="text-xs font-bold text-slate-200 truncate uppercase mt-0.5">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/50 group hover:border-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                    <Building2 size={18} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Department Unit</p>
                    <p className="text-xs font-bold text-slate-200 truncate uppercase mt-0.5">{employee.department || 'GLOBAL ARCHITECTURE'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/50 group hover:border-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-rose-400 transition-colors">
                    <Calendar size={18} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deployment Date</p>
                    <p className="text-xs font-bold text-slate-200 truncate uppercase mt-0.5">{employee.joiningDate || '2023.01.15'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-slate-900/20 border border-slate-800/60 rounded-[2rem] p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Shield size={14} className="text-cyan-500" />
              Access Privileges
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['SERVER_ROOT', 'DATA_XFER', 'PAYROLL_OPS', 'AI_CORE'].map((perm, i) => (
                <div key={perm} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    {i === 2 && <div className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-1.5 rounded uppercase">Restricted</div>}
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Panels */}
        <div className="lg:col-span-2 space-y-8">
          {/* Salary Structure */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0b10] border border-slate-800/80 rounded-[2.5rem] p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Renuneration Architecture</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">Financial Structure Allocation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Annual CTC</p>
                <p className="text-2xl font-black text-white font-mono">
                  ${((employee.salary?.basic || 0) + (employee.salary?.hra || 0) + (employee.salary?.allowances || 0)).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/40 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                <div className="absolute top-0 right-0 p-3 text-slate-800 group-hover:text-cyan-500/20 transition-colors">
                  <CreditCard size={40} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Core Component</p>
                <p className="text-2xl font-black text-white font-mono mb-1">${employee.salary?.basic?.toLocaleString() || '0'}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Base Allocation (BASIC)</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/40 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute top-0 right-0 p-3 text-slate-800 group-hover:text-indigo-500/20 transition-colors">
                  <Building2 size={40} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Facility Credit</p>
                <p className="text-2xl font-black text-white font-mono mb-1">${employee.salary?.hra?.toLocaleString() || '0'}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Housing Reallocation (HRA)</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/40 relative overflow-hidden group hover:border-violet-500/30 transition-all">
                <div className="absolute top-0 right-0 p-3 text-slate-800 group-hover:text-violet-500/20 transition-colors">
                  <Clock size={40} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Utility Credits</p>
                <p className="text-2xl font-black text-white font-mono mb-1">${employee.salary?.allowances?.toLocaleString() || '0'}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Subsistence Allocation</p>
              </div>
            </div>
          </motion.div>

          {/* Bank Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0a0b10] border border-slate-800/80 rounded-[2.5rem] p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Settlement Protocol</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">Banking Endpoint Configuration</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all">
                Modify Protocol
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/20">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/60 font-mono">
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Financial Institution</p>
                      <p className="text-lg font-black text-white uppercase italic">FEDERAL RESERVE SYSTEM</p>
                    </div>
                    <div className="w-12 h-8 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700">
                      <span className="text-[8px] font-black text-slate-400">CHIP-ID</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Routing Matrix</p>
                    <p className="text-lg font-black text-white tracking-tighter">021000021 &bull; 4492</p>
                  </div>
                </div>
                <div className="p-6 space-y-6 bg-slate-900/40">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Account Denominator</p>
                    <p className="text-lg font-black text-cyan-400 tracking-tighter">**** **** 8829</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Verification</p>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded uppercase tracking-tighter">VERIFIED</span>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Identity Match 99.4%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                    <MapPin size={12} />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Main Settlement Branch &bull; New York District</p>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">
                      V{i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
