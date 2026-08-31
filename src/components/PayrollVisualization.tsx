import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Coins, 
  PieChart as LucidePieChart, 
  BarChart3, 
  Sparkles, 
  Layers, 
  DollarSign, 
  Users, 
  Percent,
  Building2,
  Filter,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';
import DepartmentFilter, { DepartmentOption } from './DepartmentFilter';

interface PayrollVisualizationProps {
  employees: any[];
  history: any[];
  initialDepartment?: string;
  onDepartmentChange?: (dept: string) => void;
}

const DEPT_COLORS = [
  '#22d3ee', // Cyan
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f43f5e'  // Rose
];

export default function PayrollVisualization({ 
  employees = [], 
  history = [],
  initialDepartment = 'ALL',
  onDepartmentChange
}: PayrollVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'distribution'>('trends');
  const [trendView, setTrendView] = useState<'area' | 'bar'>('area');
  const [distributionView, setDistributionView] = useState<'pie' | 'composition'>('pie');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDepartment);

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    if (onDepartmentChange) {
      onDepartmentChange(dept);
    }
  };

  // --- 1. Compute Available Departments List with Color mapping ---
  const departmentOptions: DepartmentOption[] = useMemo(() => {
    const counts: Record<string, number> = {};

    employees.forEach(emp => {
      const rawDept = emp.department || emp.role || 'Other';
      const formattedDept = rawDept.trim().charAt(0).toUpperCase() + rawDept.trim().slice(1).toLowerCase();
      counts[formattedDept] = (counts[formattedDept] || 0) + 1;
    });

    // Fallback if no employees exist yet
    if (Object.keys(counts).length === 0) {
      return [
        { id: 'Engineering', name: 'Engineering', count: 4, color: DEPT_COLORS[0] },
        { id: 'Product', name: 'Product', count: 2, color: DEPT_COLORS[1] },
        { id: 'Operations', name: 'Operations', count: 3, color: DEPT_COLORS[2] },
        { id: 'Marketing', name: 'Marketing', count: 2, color: DEPT_COLORS[3] },
        { id: 'Design', name: 'Design', count: 1, color: DEPT_COLORS[4] },
      ];
    }

    return Object.entries(counts).map(([name, count], index) => ({
      id: name,
      name,
      count,
      color: DEPT_COLORS[index % DEPT_COLORS.length]
    }));
  }, [employees]);

  // Color lookup map
  const deptColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    departmentOptions.forEach(d => {
      if (d.color) map[d.name.toLowerCase()] = d.color;
    });
    return map;
  }, [departmentOptions]);

  // Map employee IDs to departments for historical records matching
  const employeeDeptMap = useMemo(() => {
    const map: Record<string, string> = {};
    employees.forEach(emp => {
      const rawDept = emp.department || emp.role || 'Other';
      const formattedDept = rawDept.trim().charAt(0).toUpperCase() + rawDept.trim().slice(1).toLowerCase();
      if (emp.id) map[emp.id] = formattedDept;
    });
    return map;
  }, [employees]);

  // Filtered employee list based on department selection
  const filteredEmployees = useMemo(() => {
    if (!selectedDepartment || selectedDepartment === 'ALL') {
      return employees;
    }
    return employees.filter(emp => {
      const rawDept = emp.department || emp.role || 'Other';
      const formattedDept = rawDept.trim().charAt(0).toUpperCase() + rawDept.trim().slice(1).toLowerCase();
      return formattedDept.toLowerCase() === selectedDepartment.toLowerCase();
    });
  }, [employees, selectedDepartment]);

  // --- 2. Monthly Expenditure Trends Processing ---
  const { trendData, isSimulated } = useMemo(() => {
    // If we have actual history data, we aggregate it by month, respecting the department filter
    const historyMap: Record<string, { month: string, net: number, tax: number, pf: number, total: number }> = {};
    
    // Sort history chronologically (processedAt ascends)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.processedAt || 0).getTime() - new Date(b.processedAt || 0).getTime()
    );

    let matchingHistoryCount = 0;

    sortedHistory.forEach(record => {
      // Check department filtering if record has employeeId
      if (selectedDepartment && selectedDepartment !== 'ALL') {
        const empDept = employeeDeptMap[record.employeeId];
        if (empDept && empDept.toLowerCase() !== selectedDepartment.toLowerCase()) {
          return;
        }
      }

      matchingHistoryCount++;
      const month = record.month || 'Current';
      if (!historyMap[month]) {
        historyMap[month] = { month, net: 0, tax: 0, pf: 0, total: 0 };
      }
      historyMap[month].net += Number(record.netSalary || 0);
      historyMap[month].tax += Number(record.tax || 0);
      historyMap[month].pf += Number(record.pf || 0);
      historyMap[month].total += Number(record.gross || 0);
    });

    const parsedHistory = Object.values(historyMap);

    // If actual matching history is too short (< 3 points), compute dynamic proportional trend
    if (parsedHistory.length < 3) {
      const targetEmployees = (filteredEmployees.length > 0) ? filteredEmployees : employees;

      const baseMonthlyGross = targetEmployees.reduce((acc, emp) => {
        const basic = Number(emp.salaryStructure?.basic || 0);
        const hra = Number(emp.salaryStructure?.hra || 0);
        const allowances = Number(emp.salaryStructure?.allowances || 0);
        return acc + basic + hra + allowances;
      }, 0) || (selectedDepartment !== 'ALL' ? 140000 : 450000);

      const baseMonthlyNet = baseMonthlyGross * 0.78;
      const baseMonthlyTax = baseMonthlyGross * 0.14;
      const baseMonthlyPf = baseMonthlyGross * 0.08;

      const mockMonths = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'];
      
      const simulatedData = mockMonths.map((m, idx) => {
        const multiplier = 1 + (Math.sin(idx * 1.5) * 0.04) + (idx * 0.015);
        return {
          month: m,
          net: Math.round(baseMonthlyNet * multiplier),
          tax: Math.round(baseMonthlyTax * multiplier),
          pf: Math.round(baseMonthlyPf * multiplier),
          total: Math.round(baseMonthlyGross * multiplier),
          isSimulated: true
        };
      });

      return { trendData: simulatedData, isSimulated: true };
    }

    return { trendData: parsedHistory, isSimulated: false };
  }, [history, employees, filteredEmployees, selectedDepartment, employeeDeptMap]);

  // --- 3. Salary Distribution Processing ---
  // A. All Departments Breakdown
  const allDeptDistribution = useMemo(() => {
    const deptMap: Record<string, { 
      name: string; 
      basic: number; 
      hra: number; 
      allowances: number; 
      total: number;
      headcount: number;
      color: string;
    }> = {};

    employees.forEach(emp => {
      const rawDept = emp.department || emp.role || 'Other';
      const formattedDept = rawDept.trim().charAt(0).toUpperCase() + rawDept.trim().slice(1).toLowerCase();

      const basic = Number(emp.salaryStructure?.basic || 0);
      const hra = Number(emp.salaryStructure?.hra || 0);
      const allowances = Number(emp.salaryStructure?.allowances || 0);
      const total = basic + hra + allowances;

      if (!deptMap[formattedDept]) {
        deptMap[formattedDept] = { 
          name: formattedDept, 
          basic: 0, 
          hra: 0, 
          allowances: 0, 
          total: 0, 
          headcount: 0,
          color: deptColorMap[formattedDept.toLowerCase()] || '#22d3ee'
        };
      }

      deptMap[formattedDept].basic += basic;
      deptMap[formattedDept].hra += hra;
      deptMap[formattedDept].allowances += allowances;
      deptMap[formattedDept].total += total;
      deptMap[formattedDept].headcount += 1;
    });

    const parsedDepts = Object.values(deptMap);

    if (parsedDepts.length === 0) {
      return [
        { name: 'Engineering', basic: 160000, hra: 40000, allowances: 30000, total: 230000, headcount: 4, color: '#22d3ee' },
        { name: 'Product', basic: 100000, hra: 25000, allowances: 15000, total: 140000, headcount: 2, color: '#6366f1' },
        { name: 'Operations', basic: 80000, hra: 20000, allowances: 10000, total: 110000, headcount: 3, color: '#ec4899' },
        { name: 'Marketing', basic: 65000, hra: 15000, allowances: 10000, total: 90000, headcount: 2, color: '#f59e0b' },
        { name: 'Design', basic: 55000, hra: 12000, allowances: 8000, total: 75000, headcount: 1, color: '#10b981' }
      ];
    }

    return parsedDepts;
  }, [employees, deptColorMap]);

  // B. Specific Department Inner Composition & Employee Breakdown
  const specificDeptBreakdown = useMemo(() => {
    if (!selectedDepartment || selectedDepartment === 'ALL') {
      return null;
    }

    const deptEmps = filteredEmployees.length > 0 
      ? filteredEmployees 
      : employees.filter(e => (e.department || e.role || '').toLowerCase() === selectedDepartment.toLowerCase());

    let basicTotal = 0;
    let hraTotal = 0;
    let allowancesTotal = 0;

    const employeeBars = deptEmps.map((emp, index) => {
      const basic = Number(emp.salaryStructure?.basic || 0);
      const hra = Number(emp.salaryStructure?.hra || 0);
      const allowances = Number(emp.salaryStructure?.allowances || 0);
      const total = basic + hra + allowances;

      basicTotal += basic;
      hraTotal += hra;
      allowancesTotal += allowances;

      return {
        name: emp.name || `Employee ${index + 1}`,
        role: emp.role || 'Specialist',
        basic,
        hra,
        allowances,
        total,
        color: DEPT_COLORS[index % DEPT_COLORS.length]
      };
    });

    // If no specific employee records found for this dept in mock state, construct realistic representation
    if (employeeBars.length === 0) {
      const baseSalary = 140000;
      basicTotal = baseSalary * 0.65;
      hraTotal = baseSalary * 0.20;
      allowancesTotal = baseSalary * 0.15;

      return {
        componentPie: [
          { name: 'Basic Pay', value: basicTotal, color: '#22d3ee' },
          { name: 'House Rent Allowance (HRA)', value: hraTotal, color: '#6366f1' },
          { name: 'Special Allowances', value: allowancesTotal, color: '#ec4899' }
        ],
        employeeBars: [
          { name: 'Lead Architect', role: 'Staff Lead', basic: 70000, hra: 20000, allowances: 15000, total: 105000, color: '#22d3ee' },
          { name: 'Senior Engineer', role: 'Senior', basic: 50000, hra: 15000, allowances: 10000, total: 75000, color: '#6366f1' },
          { name: 'Associate Engineer', role: 'Associate', basic: 40000, hra: 10000, allowances: 8000, total: 58000, color: '#ec4899' }
        ],
        totalBudget: basicTotal + hraTotal + allowancesTotal,
        headcount: 3
      };
    }

    const totalBudget = basicTotal + hraTotal + allowancesTotal;

    const componentPie = [
      { name: 'Basic Pay', value: basicTotal, color: '#22d3ee' },
      { name: 'House Rent Allowance (HRA)', value: hraTotal, color: '#6366f1' },
      { name: 'Special Allowances', value: allowancesTotal, color: '#ec4899' }
    ].filter(item => item.value > 0);

    return {
      componentPie,
      employeeBars,
      totalBudget,
      headcount: deptEmps.length
    };
  }, [selectedDepartment, filteredEmployees, employees]);

  const totalOverallBudget = useMemo(() => {
    return allDeptDistribution.reduce((acc, curr) => acc + curr.total, 0);
  }, [allDeptDistribution]);

  const activeDepartmentOption = departmentOptions.find(
    d => d.name.toLowerCase() === selectedDepartment.toLowerCase()
  );

  return (
    <div className="bg-card-bg rounded-3xl border border-slate-800/60 p-8 shadow-2xl relative overflow-hidden" id="payroll-visualization-card">
      {/* Decorative Blur Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header & Filter Controls Section */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Coins size={22} className="text-cyan-400 animate-pulse" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Payroll Analytics Platform</h3>
          </div>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
            Interactive visualization of compensation distributions and monthly cashflow trends
          </p>
        </div>

        {/* Action Controls: Department Filter Dropdown & Chart View Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter Dropdown */}
          <div className="flex items-center gap-2">
            <DepartmentFilter
              departments={departmentOptions}
              selectedDepartment={selectedDepartment}
              onSelectDepartment={handleDepartmentChange}
              totalEmployeesCount={employees.length || 12}
            />
          </div>

          {/* Tab Controller */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850 shadow-inner">
            <button
              onClick={() => setActiveTab('trends')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                activeTab === 'trends' 
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10 font-extrabold" 
                  : "text-slate-400 hover:text-slate-200"
              )}
              id="tab-trends-btn"
            >
              <TrendingUp size={14} />
              Expenditure Trends
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                activeTab === 'distribution' 
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10 font-extrabold" 
                  : "text-slate-400 hover:text-slate-200"
              )}
              id="tab-distribution-btn"
            >
              <LucidePieChart size={14} />
              Salary Distribution
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Notice Badge */}
      {selectedDepartment && selectedDepartment !== 'ALL' && (
        <div className="relative z-10 mb-6 p-3.5 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-slate-900/40 border border-cyan-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: activeDepartmentOption?.color || '#22d3ee' }} 
            />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Viewing Department: <span className="text-cyan-400">{selectedDepartment}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-800">
              {activeDepartmentOption ? `${activeDepartmentOption.count} Staff Members` : 'Filtered Node'}
            </span>
          </div>

          <button
            onClick={() => handleDepartmentChange('ALL')}
            className="text-[10px] font-black text-slate-400 hover:text-cyan-400 uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1.5"
          >
            Reset to All Departments &rarr;
          </button>
        </div>
      )}

      {/* Main Chart Body with Smooth AnimatePresence Transitions */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${activeTab}-${selectedDepartment}`}
          initial={{ opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
        {activeTab === 'trends' ? (
          /* ========================================================
             Tab 1: Monthly Expenditure Trends
             ======================================================== */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-cyan-400" />
                  {selectedDepartment && selectedDepartment !== 'ALL' 
                    ? `${selectedDepartment} Monthly Expenditure Trend` 
                    : 'Company-Wide Monthly Expenditure Trends'}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Net payout, tax withholdings and provident fund liabilities over time
                </p>
              </div>

              {/* Graphic Representation Toggles */}
              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setTrendView('area')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    trendView === 'area' ? "bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-sm" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Area Stream
                </button>
                <button
                  onClick={() => setTrendView('bar')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    trendView === 'bar' ? "bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-sm" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Grouped Bar
                </button>
              </div>
            </div>

            {/* Simulated Banner Indicator if history is small */}
            {isSimulated && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 overflow-hidden"
              >
                <Sparkles size={14} className="flex-shrink-0 text-cyan-400 animate-spin-slow" />
                <span>Simulated Historical Baseline &bull; Calibrated to {selectedDepartment !== 'ALL' ? `${selectedDepartment} compensation scale` : 'aggregate payroll structure'}</span>
              </motion.div>
            )}

            {/* Recharts Container */}
            <div className="h-[320px] w-full bg-slate-950/30 border border-slate-900 p-4 rounded-2xl relative">
              {trendView === 'area' ? (
                <ResponsiveContainer key={`resp-area-${selectedDepartment}`} width="100%" height="100%">
                  <AreaChart 
                    data={trendData} 
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="netColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="taxColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="pfColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis 
                      tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      dx={-4}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid #1e293b', padding: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'black', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Area 
                      key={`area-net-${selectedDepartment}`}
                      type="monotone" 
                      name="Net Paid Out" 
                      dataKey="net" 
                      stroke="#22d3ee" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#netColor)" 
                      isAnimationActive={true}
                      animationDuration={850}
                      animationEasing="ease-out"
                      animationBegin={40}
                    />
                    <Area 
                      key={`area-tax-${selectedDepartment}`}
                      type="monotone" 
                      name="Income Tax Withheld" 
                      dataKey="tax" 
                      stroke="#f59e0b" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#taxColor)" 
                      isAnimationActive={true}
                      animationDuration={850}
                      animationEasing="ease-out"
                      animationBegin={90}
                    />
                    <Area 
                      key={`area-pf-${selectedDepartment}`}
                      type="monotone" 
                      name="Provident Fund" 
                      dataKey="pf" 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#pfColor)" 
                      isAnimationActive={true}
                      animationDuration={850}
                      animationEasing="ease-out"
                      animationBegin={140}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer key={`resp-bar-${selectedDepartment}`} width="100%" height="100%">
                  <BarChart 
                    data={trendData} 
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis 
                      tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      dx={-4}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid #1e293b', padding: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'black', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Bar 
                      key={`bar-net-${selectedDepartment}`}
                      name="Net Payout" 
                      dataKey="net" 
                      fill="#22d3ee" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={true}
                      animationDuration={750}
                      animationEasing="ease-out"
                      animationBegin={40}
                    />
                    <Bar 
                      key={`bar-tax-${selectedDepartment}`}
                      name="Tax Withheld" 
                      dataKey="tax" 
                      fill="#f59e0b" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={true}
                      animationDuration={750}
                      animationEasing="ease-out"
                      animationBegin={90}
                    />
                    <Bar 
                      key={`bar-pf-${selectedDepartment}`}
                      name="Provident Fund" 
                      dataKey="pf" 
                      fill="#6366f1" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={true}
                      animationDuration={750}
                      animationEasing="ease-out"
                      animationBegin={140}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Trends Bottom Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <motion.div 
                key={`metric-net-${selectedDepartment}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.05 }}
                className="bg-slate-900/30 p-4 rounded-2xl border border-slate-900 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                  <DollarSign size={16} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">
                    {selectedDepartment !== 'ALL' ? `${selectedDepartment} Avg Net` : 'Avg Net Cashout'}
                  </p>
                  <p className="text-sm font-bold text-white font-mono">
                    ${Math.round(trendData.reduce((acc, c) => acc + c.net, 0) / trendData.length).toLocaleString()}
                  </p>
                </div>
              </motion.div>

              <motion.div 
                key={`metric-tax-${selectedDepartment}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.1 }}
                className="bg-slate-900/30 p-4 rounded-2xl border border-slate-900 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                  <Percent size={16} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Effective Tax Rate</p>
                  <p className="text-sm font-bold text-white font-mono">
                    {trendData.reduce((acc, c) => acc + c.total, 0) > 0 
                      ? Math.round((trendData.reduce((acc, c) => acc + c.tax, 0) / trendData.reduce((acc, c) => acc + c.total, 0)) * 100)
                      : 14}%
                  </p>
                </div>
              </motion.div>

              <motion.div 
                key={`metric-gross-${selectedDepartment}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.15 }}
                className="bg-slate-900/30 p-4 rounded-2xl border border-slate-900 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                  <Layers size={16} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Monthly Gross Volume</p>
                  <p className="text-sm font-bold text-white font-mono">
                    ${Math.round(trendData[trendData.length - 1]?.total || 0).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* ========================================================
             Tab 2: Departmental / Specific Salary Distribution
             ======================================================== */
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <LucidePieChart size={16} className="text-indigo-400" />
                  {selectedDepartment && selectedDepartment !== 'ALL'
                    ? `${selectedDepartment} Compensation Structure`
                    : 'Departmental Payroll Distribution'}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {selectedDepartment && selectedDepartment !== 'ALL'
                    ? 'Internal component split & individual node compensation allocations'
                    : 'Budget allocation breakdown divided by operational nodes'}
                </p>
              </div>

              {/* View toggle */}
              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setDistributionView('pie')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    distributionView === 'pie' ? "bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-sm" : "text-slate-500 hover:text-slate-350"
                  )}
                >
                  {selectedDepartment && selectedDepartment !== 'ALL' ? 'Component Donut' : 'Donut Breakdown'}
                </button>
                <button
                  onClick={() => setDistributionView('composition')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    distributionView === 'composition' ? "bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-sm" : "text-slate-500 hover:text-slate-350"
                  )}
                >
                  {selectedDepartment && selectedDepartment !== 'ALL' ? 'Team Members' : 'Component Stack'}
                </button>
              </div>
            </div>

            {/* If 'ALL' is selected, render Company-Wide Department Distribution */}
            {(!selectedDepartment || selectedDepartment === 'ALL') ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Visual Graphic Representation */}
                <div className="lg:col-span-7 flex justify-center items-center h-[320px] bg-slate-950/30 border border-slate-900 rounded-2xl p-4 relative">
                  {distributionView === 'pie' ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            key={`pie-all-${selectedDepartment}`}
                            data={allDeptDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="total"
                            isAnimationActive={true}
                            animationDuration={900}
                            animationEasing="ease-out"
                            animationBegin={40}
                          >
                            {allDeptDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid #1e293b', padding: '12px' }}
                            itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Total Allocation']}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Centered Budget Sum */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
                      >
                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">TOTAL BUDGET</span>
                        <span className="text-lg font-black text-white font-mono leading-none">
                          ${totalOverallBudget.toLocaleString()}
                        </span>
                        <span className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest mt-1">MONTHLY BASE</span>
                      </motion.div>
                    </div>
                  ) : (
                    <ResponsiveContainer key={`resp-comp-${selectedDepartment}`} width="100%" height="100%">
                      <BarChart 
                        data={allDeptDistribution} 
                        layout="vertical" 
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis 
                          type="number"
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid #1e293b', padding: '12px' }}
                          itemStyle={{ fontWeight: 'bold' }}
                          formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                        />
                        <Legend 
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '10px' }}
                        />
                        <Bar 
                          key={`bar-basic-${selectedDepartment}`}
                          name="Basic Pay" 
                          dataKey="basic" 
                          stackId="a" 
                          fill="#22d3ee" 
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-out"
                          animationBegin={40}
                        />
                        <Bar 
                          key={`bar-hra-${selectedDepartment}`}
                          name="HRA" 
                          dataKey="hra" 
                          stackId="a" 
                          fill="#6366f1" 
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-out"
                          animationBegin={90}
                        />
                        <Bar 
                          key={`bar-allowances-${selectedDepartment}`}
                          name="Allowances" 
                          dataKey="allowances" 
                          stackId="a" 
                          fill="#ec4899" 
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-out"
                          animationBegin={140}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Data Table / Interactive Department Selector list */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-slate-900 pb-2 flex items-center justify-between">
                    <span>Distribution By Node</span>
                    <span className="text-slate-600">Click to filter</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {allDeptDistribution.map((dept, idx) => {
                      const percentage = totalOverallBudget > 0 
                        ? Math.round((dept.total / totalOverallBudget) * 100) 
                        : 0;

                      return (
                        <motion.button 
                          key={dept.name}
                          type="button"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.22, delay: idx * 0.04 }}
                          onClick={() => handleDepartmentChange(dept.name)}
                          className="w-full text-left p-3 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700/60 rounded-xl border border-slate-900 flex items-center justify-between transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-slate-200 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                                {dept.name}
                              </h5>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                <Users size={10} className="text-slate-600" />
                                {dept.headcount} {dept.headcount === 1 ? 'member' : 'members'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 font-mono">
                            <p className="text-xs font-black text-white">${dept.total.toLocaleString()}</p>
                            <p className="text-[9px] text-cyan-400 font-bold">{percentage}% Share</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="p-3.5 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Select any department node above or via the filter dropdown to inspect individual salary structures.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Specific Department View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 flex justify-center items-center h-[320px] bg-slate-950/30 border border-slate-900 rounded-2xl p-4 relative">
                  {distributionView === 'pie' && specificDeptBreakdown ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            key={`pie-dept-${selectedDepartment}`}
                            data={specificDeptBreakdown.componentPie}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={true}
                            animationDuration={900}
                            animationEasing="ease-out"
                            animationBegin={40}
                          >
                            {specificDeptBreakdown.componentPie.map((entry, index) => (
                              <Cell key={`comp-cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid #1e293b', padding: '12px' }}
                            itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Centered Department Total */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
                      >
                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">DEPT TOTAL</span>
                        <span className="text-lg font-black text-white font-mono leading-none">
                          ${specificDeptBreakdown.totalBudget.toLocaleString()}
                        </span>
                        <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest mt-1">{selectedDepartment}</span>
                      </motion.div>
                    </div>
                  ) : specificDeptBreakdown ? (
                    <ResponsiveContainer key={`resp-emp-${selectedDepartment}`} width="100%" height="100%">
                      <BarChart 
                        data={specificDeptBreakdown.employeeBars} 
                        margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid #1e293b', padding: '12px' }}
                          itemStyle={{ fontWeight: 'bold' }}
                          formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                        />
                        <Legend 
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        />
                        <Bar 
                          key={`bar-emp-basic-${selectedDepartment}`}
                          name="Basic Pay" 
                          dataKey="basic" 
                          stackId="emp" 
                          fill="#22d3ee" 
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-out"
                          animationBegin={40}
                        />
                        <Bar 
                          key={`bar-emp-hra-${selectedDepartment}`}
                          name="HRA" 
                          dataKey="hra" 
                          stackId="emp" 
                          fill="#6366f1" 
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-out"
                          animationBegin={90}
                        />
                        <Bar 
                          key={`bar-emp-allowances-${selectedDepartment}`}
                          name="Allowances" 
                          dataKey="allowances" 
                          stackId="emp" 
                          fill="#ec4899" 
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-out"
                          animationBegin={140}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>

                {/* Specific Department Breakdown Details Pane */}
                <div className="lg:col-span-5 space-y-4">
                  <motion.div 
                    key={`dept-panel-${selectedDepartment}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-cyan-400" />
                        <h5 className="text-xs font-black text-white uppercase tracking-wider">{selectedDepartment} Overview</h5>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                        {totalOverallBudget > 0 && specificDeptBreakdown
                          ? `${Math.round((specificDeptBreakdown.totalBudget / totalOverallBudget) * 100)}% of Payroll`
                          : 'Active Node'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Monthly Allocation</p>
                        <p className="text-sm font-bold text-white font-mono mt-0.5">
                          ${specificDeptBreakdown?.totalBudget.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Team Headcount</p>
                        <p className="text-sm font-bold text-white font-mono mt-0.5">
                          {specificDeptBreakdown?.headcount} Members
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Component Legend / Details */}
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {specificDeptBreakdown?.componentPie.map((comp, idx) => {
                      const pct = specificDeptBreakdown.totalBudget > 0 
                        ? Math.round((comp.value / specificDeptBreakdown.totalBudget) * 100)
                        : 0;

                      return (
                        <motion.div 
                          key={`${selectedDepartment}-${comp.name}`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.22, delay: idx * 0.05 }}
                          className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-900 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: comp.color }} />
                            <span className="font-bold text-slate-300">{comp.name}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-bold text-white">${comp.value.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({pct}%)</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDepartmentChange('ALL')}
                    className="w-full py-2.5 bg-slate-900/80 hover:bg-slate-850 text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer text-center"
                  >
                    View All Departments
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
