import React, { useState, useEffect, useCallback } from 'react';
import { Shield, UserPlus, Trash2, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';

export default function Settings() {
  const { getToken, role: currentUserRole } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({ uid: '', email: '', role: 'HR' });

  const fetchAdmins = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/admins', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      } else {
        setError("Failed to fetch admin list");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching admins");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleUpdateRole = async (uid: string, email: string, newRole: string) => {
    setUpdating(uid);
    try {
      const token = await getToken();
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid, email, role: newRole })
      });

      if (res.ok) {
        await fetchAdmins();
      } else {
        const data = await res.json();
        setError(data.message || "Update failed");
      }
    } catch (err) {
      setError("An error occurred during update");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this user from admin/HR roles? They will revert to standard EMPLOYEE access.')) return;
    
    setUpdating(id);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchAdmins();
      } else {
        setError("Removal failed");
      }
    } catch (err) {
      setError("An error occurred during removal");
    } finally {
      setUpdating(null);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setForm({ uid: '', email: '', role: 'HR' });
        await fetchAdmins();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to add admin");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (currentUserRole !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-8">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Access Restricted</h2>
        <p className="text-slate-400 mt-2">Only system administrators can access role management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">System Permissions</h2>
          <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">Manage Administrative & HR Access Levels</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2 font-bold uppercase text-sm tracking-tighter"
        >
          <UserPlus size={18} /> Provision Access
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-500">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/30">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Identity</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Level</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading && admins.length === 0 ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={3} className="px-6 py-8 bg-slate-900/30">
                        <div className="h-4 bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <Shield size={20} className={admin.role === 'ADMIN' ? 'text-blue-500' : 'text-emerald-500'} />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm tracking-tight">{admin.email}</p>
                            <p className="text-slate-500 text-xs font-mono">{admin.uid}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          disabled={updating === admin.id}
                          value={admin.role}
                          onChange={(e) => handleUpdateRole(admin.uid, admin.email, e.target.value)}
                          className={cn(
                            "bg-slate-800 border-none text-xs font-black uppercase tracking-widest rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer",
                            admin.role === 'ADMIN' ? 'text-blue-400' : 'text-emerald-400'
                          )}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="HR">HR</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleRemove(admin.id)}
                          disabled={updating === admin.id}
                          className="text-slate-600 hover:text-red-500 transition-colors p-2"
                        >
                          {updating === admin.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl">
            <ShieldCheck size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Role Definitions</h3>
            <div className="mt-6 space-y-4">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1">ADMINISTRATOR</p>
                <p className="text-sm font-medium leading-relaxed opacity-90">Full system access. Can manage employees, process payroll, and control permissions for other users.</p>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-xs font-black text-emerald-200 uppercase tracking-widest mb-1">HR MANAGER</p>
                <p className="text-sm font-medium leading-relaxed opacity-90">Operational access. Can manage employee data and payroll, but cannot modify system settings or permissions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-2xl shadow-2xl"
            >
              <h3 className="text-2xl font-black text-white italic uppercase mb-6 flex items-center gap-2">
                <UserPlus className="text-blue-500" /> Provision Access
              </h3>
              
              <form onSubmit={handleAddAdmin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">User Unique ID (UID)</label>
                  <input 
                    required
                    value={form.uid}
                    onChange={e => setForm({...form, uid: e.target.value})}
                    placeholder="Enter Firebase UID"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-500 uppercase tracking-tight">Obtain UID from Firebase Authentication console</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">User Email</label>
                  <input 
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="name@company.com"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operational Role</label>
                  <select 
                    value={form.role}
                    onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="HR">HR Manager</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-slate-700 text-slate-400 font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Assign Role'}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
