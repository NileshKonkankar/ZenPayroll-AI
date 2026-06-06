import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Activity, User, Clock, Terminal, AlertCircle } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  details?: string;
  timestamp: string;
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorString, setErrorString] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AuditLogEntry[];
        setLogs(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching audit logs:', error);
        setErrorString('Permission denied or connection issue');
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'auditLogs');
      }
    );

    return () => unsubscribe();
  }, []);

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Pending';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-card-bg border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
        <h5 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Terminal size={16} className="text-cyan-400 animate-pulse" />
          Active Audit Ledger
        </h5>
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Last 5 Actions
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-3">
          <div className="w-6 h-6 border-2 border-cyan-500/25 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Synchronizing Log Feed...
          </p>
        </div>
      ) : errorString ? (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
          <AlertCircle size={18} className="flex-shrink-0" />
          <div className="text-xs font-bold uppercase tracking-wide">
            {errorString}
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10">
          <Activity size={32} className="text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">No system actions logged yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/30">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="py-3 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-900/10 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 flex-shrink-0 mt-0.5">
                  <Activity size={14} className="text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black text-white uppercase tracking-tight">
                      {log.action}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/50 uppercase tracking-wider flex items-center gap-1 max-w-[200px] truncate">
                      <User size={10} className="text-slate-400" />
                      {log.user}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end justify-start flex-shrink-0">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                  <Clock size={11} className="text-slate-500" />
                  {formatTime(log.timestamp)}
                </div>
                <span className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                  {formatDate(log.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
