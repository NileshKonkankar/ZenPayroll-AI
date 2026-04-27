import React from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Jan', cost: 45000 },
  { name: 'Feb', cost: 52000 },
  { name: 'Mar', cost: 48000 },
  { name: 'Apr', cost: 61000 },
  { name: 'May', cost: 55000 },
  { name: 'Jun', cost: 67000 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, isAccent }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "bg-card-bg p-6 rounded-2xl border border-slate-800/60 shadow-lg transition-all relative overflow-hidden group hover:border-slate-700/80 hover:shadow-cyan-500/5",
      isAccent && "border-cyan-500/20 shadow-cyan-500/5"
    )}
  >
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      <div className={cn(
        "flex items-center text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
        trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
      )}>
        {trend === 'up' ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
        {trendValue}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none mb-2">{title}</h3>
      <p className={cn("text-2xl font-black text-white mt-1", isAccent && "text-cyan-400")}>{value}</p>
    </div>
    
    {/* Decorative internal glow */}
    {isAccent && (
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <Icon size={64} className="text-cyan-400" />
      </div>
    )}
  </motion.div>
);

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">System Architecture</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Admin Dashboard &bull; AI-Powered Insights Active</p>
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
            LIVE TELEMETRY
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Employees" 
          value="1,248" 
          icon={Users} 
          trend="up" 
          trendValue="12%" 
          color="bg-indigo-600 shadow-indigo-600/30 shadow-lg"
        />
        <StatCard 
          title="Monthly Disbursement" 
          value="$428,500.00" 
          icon={DollarSign} 
          trend="up" 
          trendValue="4.2%" 
          color="bg-cyan-600 shadow-cyan-600/30 shadow-lg"
          isAccent
        />
        <StatCard 
          title="Tax Liability" 
          value="$92,140.22" 
          icon={TrendingUp} 
          trend="down" 
          trendValue="1.2%" 
          color="bg-emerald-600 shadow-emerald-600/30 shadow-lg"
        />
        <StatCard 
          title="Anomalies Detected" 
          value="03" 
          icon={AlertCircle} 
          trend="up" 
          trendValue="URGENT" 
          color="bg-orange-600 shadow-orange-600/30 shadow-lg"
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-card-bg p-8 rounded-3xl border border-slate-800/60 shadow-xl flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-cyan-400" />
              Payroll Expenditure Trend
            </h3>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-200 transition-colors">6M</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 text-white shadow-lg shadow-cyan-600/20">1Y</button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} 
                  dy={10} 
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#06b6d4" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCost)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-950/40 via-card-bg to-card-bg border border-indigo-500/20 rounded-3xl p-8 flex-1 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-lg font-black text-indigo-100 uppercase tracking-tight">AI Smart Insights</h3>
              </div>
              
              <div className="space-y-5">
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 hover:border-indigo-500/30 transition-colors">
                  <p className="text-xs text-indigo-300 font-black uppercase tracking-widest mb-1">Anomaly Detected</p>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">Engineering dept saw a 12% spike in overtime. Suggest reviewing March milestone logs.</p>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 hover:border-indigo-500/30 transition-colors">
                  <p className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-1">Tax Optimized</p>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">Proposed shift in HRA structure could save company <span className="text-emerald-400 font-bold">$12,400/yr</span>.</p>
                </div>
                <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mt-4">
                  Generate Analytical Report
                </button>
              </div>
            </div>
            
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
          </div>

          <div className="bg-card-bg border border-slate-800 p-2 rounded-2xl flex items-center shadow-2xl">
            <input 
               type="text" 
               placeholder="Ask Assistant: 'Process March Payroll'..." 
               className="bg-transparent border-none focus:ring-0 text-xs flex-1 text-slate-300 px-4 py-2 outline-none"
            />
            <button className="w-10 h-10 bg-cyan-600 hover:bg-cyan-700 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-cyan-600/20 active:scale-90 flex-shrink-0">
               <ArrowRight size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Ledger Activity */}
      <div className="bg-card-bg border border-slate-800/60 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
           <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse"></div>
             Recent Ledger Activity
           </h5>
           <span className="text-[10px] font-bold text-slate-600 cursor-pointer hover:text-cyan-400 transition-colors uppercase tracking-widest">View Full Audit Log</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ActivityItem status="cyan" title="Payslip Gen: Alex Rivera" time="2 mins ago" />
          <ActivityItem status="emerald" title="Salary Credit: Marketing Team" time="14 mins ago" />
          <ActivityItem status="orange" title="Bank Detail Update: Sarah Chen" time="1 hour ago" />
          <ActivityItem status="indigo" title="AI Optimization Triggered" time="3 hours ago" />
        </div>
      </div>
    </div>
  );
}

const ActivityItem = ({ status, title, time }: { status: string, title: string, time: string }) => {
  const statusColors: any = {
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500'
  };
  
  return (
    <div className="flex items-center space-x-4 group cursor-default">
      <div className={cn("w-2 h-2 rounded-full", statusColors[status])}></div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-200 font-bold group-hover:text-white transition-colors truncate uppercase tracking-tighter">{title}</p>
        <p className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">{time}</p>
      </div>
    </div>
  );
};
