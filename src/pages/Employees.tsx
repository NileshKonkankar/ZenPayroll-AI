import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Briefcase,
  Users,
  Eye,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error('Expected array from /api/employees, got:', data);
        setEmployees([]);
      }
    } catch (err) {
      console.error(err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const deleteEmployee = async (id: string) => {
    if (!confirm('Access Restriction: Permanent Deletion?')) return;
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      setEmployees(employees.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Active Personnel</h2>
          <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">Employee Directory &bull; Access Level: Admin</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Plus size={18} />
          Register Personnel
        </button>
      </div>

      <div className="bg-card-bg rounded-3xl border border-slate-800/60 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/60 bg-slate-900/30 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by identity or metadata..." 
              className="w-full pl-12 pr-4 py-3 text-sm bg-[#05060a] border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 outline-none transition-all text-slate-200 placeholder:text-slate-700 font-medium"
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-slate-200 transition-all">Filter</button>
            <button className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-slate-200 transition-all">Export Data</button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800/60">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Core Function</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Security Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Remuneration</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 w-48 bg-slate-800/40 rounded-lg"></div></td>
                    <td className="px-8 py-6"><div className="h-6 w-24 bg-slate-800/40 rounded-lg"></div></td>
                    <td className="px-8 py-6"><div className="h-6 w-20 bg-slate-800/40 rounded-lg mx-auto"></div></td>
                    <td className="px-8 py-6"><div className="h-6 w-16 bg-slate-800/40 rounded-lg"></div></td>
                    <td className="px-8 py-6 text-right"><div className="h-8 w-8 bg-slate-800/40 rounded-lg ml-auto"></div></td>
                  </tr>
                ))
              ) : employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-900/20 transition-all group border-l-4 border-l-transparent hover:border-l-cyan-500">
                  <td className="px-8 py-6">
                    <div 
                      className="flex items-center gap-4 cursor-pointer"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      <div className="w-11 h-11 bg-slate-800 text-cyan-400 rounded-full flex items-center justify-center font-black text-sm border border-slate-700 shadow-inner group-hover:border-cyan-500/30 transition-colors">
                        {emp.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-100 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{emp.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold uppercase mt-0.5">
                           {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Briefcase size={14} className="text-indigo-500" />
                      {emp.role}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className="flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                        Active
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-white font-mono">${(emp.salaryStructure?.basic || emp.salary?.basic)?.toLocaleString() ?? '0'}</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Base Structure</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700 shadow-lg"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all border border-transparent hover:border-cyan-500/30 shadow-lg">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteEmployee(emp.id)}
                        className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/30 shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && employees.length === 0 && (
            <div className="p-20 text-center text-slate-600 border-t border-slate-800/40">
              <div className="w-20 h-20 bg-slate-900 flex items-center justify-center rounded-3xl mx-auto mb-6 text-slate-700 shadow-inner">
                 <Users size={40} />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Personnel Core Empty</p>
              <p className="text-xs mt-2 font-medium">New records are required to begin architecture analysis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#020306]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0b10] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Register New Personnel</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Identity Integration Protocol</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                >
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    role: formData.get('role'),
                    department: formData.get('department'),
                    joiningDate: formData.get('joiningDate'),
                    salary: {
                      basic: Number(formData.get('basic')),
                      hra: Number(formData.get('hra')),
                      allowances: Number(formData.get('allowances')),
                    },
                    status: 'active'
                  };

                  try {
                    const res = await fetch('/api/employees', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });
                    if (res.ok) {
                      setIsModalOpen(false);
                      fetchEmployees();
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="p-8 space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Identity Name</label>
                    <input 
                      name="name"
                      required
                      type="text" 
                      placeholder="e.g. CASSIAN ANDOR" 
                      className="w-full px-4 py-3 bg-[#05060a] border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 outline-none transition-all text-slate-200 placeholder:text-slate-800 text-sm font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comms Interface (Email)</label>
                    <input 
                      name="email"
                      required
                      type="email" 
                      placeholder="identity@matrix.net" 
                      className="w-full px-4 py-3 bg-[#05060a] border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 outline-none transition-all text-slate-200 placeholder:text-slate-800 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Designated Role</label>
                    <input 
                      name="role"
                      required
                      type="text" 
                      placeholder="e.g. TACTICAL ANALYST" 
                      className="w-full px-4 py-3 bg-[#05060a] border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 outline-none transition-all text-slate-200 placeholder:text-slate-800 text-sm font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployment Date</label>
                    <input 
                      name="joiningDate"
                      required
                      type="date" 
                      className="w-full px-4 py-3 bg-[#05060a] border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/40 outline-none transition-all text-slate-200 placeholder:text-slate-800 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 space-y-6">
                   <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign size={14} />
                      Renuneration Allocation
                   </h4>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Basic</label>
                        <input name="basic" required type="number" className="w-full px-3 py-2 bg-[#020306] border border-slate-800 rounded-lg text-white font-mono text-xs focus:border-cyan-500/40 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">HRA</label>
                        <input name="hra" required type="number" className="w-full px-3 py-2 bg-[#020306] border border-slate-800 rounded-lg text-white font-mono text-xs focus:border-cyan-500/40 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Allowances</label>
                        <input name="allowances" required type="number" className="w-full px-3 py-2 bg-[#020306] border border-slate-800 rounded-lg text-white font-mono text-xs focus:border-cyan-500/40 outline-none" />
                      </div>
                   </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                  >
                    Abort Protocol
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                  >
                    Confirm Integration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
