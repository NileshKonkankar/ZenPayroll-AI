import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Check, Building2, Users, X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface DepartmentOption {
  id: string;
  name: string;
  count: number;
  color?: string;
}

interface DepartmentFilterProps {
  departments: DepartmentOption[];
  selectedDepartment: string;
  onSelectDepartment: (department: string) => void;
  className?: string;
  totalEmployeesCount?: number;
}

export default function DepartmentFilter({
  departments,
  selectedDepartment,
  onSelectDepartment,
  className,
  totalEmployeesCount
}: DepartmentFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeDept = departments.find(d => d.id === selectedDepartment || d.name.toLowerCase() === selectedDepartment.toLowerCase());
  const isAll = !selectedDepartment || selectedDepartment === 'ALL';

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef} id="department-filter-dropdown">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer select-none",
            isAll 
              ? "bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 shadow-sm"
              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/15 shadow-md shadow-cyan-500/5"
          )}
          aria-haspopup="true"
          aria-expanded={isOpen}
          id="department-filter-trigger"
        >
          <Filter size={14} className={isAll ? "text-slate-400" : "text-cyan-400"} />
          <span className="truncate max-w-[160px]">
            {isAll ? "All Departments" : activeDept?.name || selectedDepartment}
          </span>
          {!isAll && activeDept && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
              {activeDept.count}
            </span>
          )}
          <ChevronDown 
            size={14} 
            className={cn("text-slate-400 transition-transform duration-200 ml-1", isOpen && "rotate-180")} 
          />
        </button>

        {!isAll && (
          <button
            type="button"
            onClick={() => onSelectDepartment('ALL')}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            title="Reset to All Departments"
            aria-label="Reset filter"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {isOpen && (
        <div 
          className="absolute right-0 md:left-0 md:right-auto mt-2 w-64 rounded-2xl bg-[#0b1120] border border-slate-800 shadow-2xl shadow-black/80 z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          id="department-filter-menu"
        >
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={12} className="text-cyan-400" />
              Filter by Department
            </span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">
              {departments.length} Units
            </span>
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5 custom-scrollbar">
            {/* All Departments Option */}
            <button
              type="button"
              onClick={() => {
                onSelectDepartment('ALL');
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer",
                isAll 
                  ? "bg-cyan-500/15 text-cyan-300 font-extrabold border border-cyan-500/20" 
                  : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 flex-shrink-0" />
                <span className="truncate">All Departments</span>
              </div>
              <div className="flex items-center gap-2">
                {totalEmployeesCount !== undefined && (
                  <span className="text-[10px] font-mono text-slate-500">
                    {totalEmployeesCount}
                  </span>
                )}
                {isAll && <Check size={14} className="text-cyan-400" />}
              </div>
            </button>

            {/* Individual Department Options */}
            {departments.map((dept) => {
              const isSelected = selectedDepartment.toLowerCase() === dept.id.toLowerCase() || 
                                 selectedDepartment.toLowerCase() === dept.name.toLowerCase();

              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => {
                    onSelectDepartment(dept.name);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group",
                    isSelected 
                      ? "bg-cyan-500/15 text-cyan-300 font-extrabold border border-cyan-500/20" 
                      : "text-slate-300 hover:bg-slate-900/80 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: dept.color || '#22d3ee' }} 
                    />
                    <span className="truncate">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                      {dept.count} {dept.count === 1 ? 'member' : 'members'}
                    </span>
                    {isSelected && <Check size={14} className="text-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
