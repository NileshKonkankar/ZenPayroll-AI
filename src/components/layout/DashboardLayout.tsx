import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  return (
    <div className="flex bg-brand-bg min-h-screen text-slate-200 overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main className="p-8 overflow-y-auto overflow-x-hidden flex-1">
          <Outlet />
        </main>
      </div>

      {/* Decorative Glowing Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
    </div>
  );
}
