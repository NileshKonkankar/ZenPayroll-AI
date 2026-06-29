import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, Clock, Activity, Settings } from 'lucide-react';
import { logout } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

// Standard inactive limit: 30 minutes
const DEFAULT_INACTIVE_LIMIT_MS = 30 * 60 * 1000;
// Modal warning countdown: 60 seconds
const WARNING_COUNTDOWN_SECS = 60;

export default function AutoLogout() {
  const { user } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_COUNTDOWN_SECS);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    // Check if user previously enabled demo mode
    return localStorage.getItem('auto_logout_demo_mode') === 'true';
  });

  const lastActiveTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inactivity threshold based on active mode
  const inactiveThreshold = isDemoMode ? 15 * 1000 : DEFAULT_INACTIVE_LIMIT_MS; // 15 seconds in demo mode

  // Record user activity
  const recordActivity = () => {
    lastActiveTimeRef.current = Date.now();
    // If the modal is already showing, activity doesn't reset it automatically (must click Stay Logged In)
    if (!showWarning) {
      // Just refresh the active timestamp
    }
  };

  // Toggle demo/test mode helper
  const toggleDemoMode = () => {
    const nextState = !isDemoMode;
    setIsDemoMode(nextState);
    localStorage.setItem('auto_logout_demo_mode', String(nextState));
    lastActiveTimeRef.current = Date.now();
    setShowWarning(false);
  };

  // Setup global event listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'click', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, recordActivity);
    });

    // Run active tracking interval check every 1 second
    timerIntervalRef.current = setInterval(() => {
      if (showWarning) return; // Warning countdown handles itself

      const timeSinceLastActivity = Date.now() - lastActiveTimeRef.current;
      if (timeSinceLastActivity >= inactiveThreshold) {
        setShowWarning(true);
        setCountdown(WARNING_COUNTDOWN_SECS);
      }
    }, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, recordActivity);
      });
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [user, inactiveThreshold, showWarning]);

  // Handle countdown when warning is active
  useEffect(() => {
    if (!showWarning || !user) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning, user]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    lastActiveTimeRef.current = Date.now();
    setCountdown(WARNING_COUNTDOWN_SECS);
  };

  const handleLogout = async () => {
    try {
      setShowWarning(false);
      await logout();
    } catch (error) {
      console.error('Auto-logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Demo Mode controller inside dev/preview environment */}
      <div className="fixed bottom-4 right-4 z-40 bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-sm transition-all text-xs font-bold flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity size={12} className={cn("text-cyan-400", isDemoMode && "animate-pulse")} />
          <span className="text-[10px] uppercase tracking-wider">Auto-Logout Test</span>
        </div>
        <button
          onClick={toggleDemoMode}
          className={cn(
            "px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider font-black transition-all",
            isDemoMode 
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
              : "bg-slate-900 text-slate-500 border border-slate-850 hover:text-slate-350"
          )}
        >
          {isDemoMode ? "Demo (15s Inactive)" : "30 Min Standard"}
        </button>
      </div>

      {/* Warning Alert Modal */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="auto-logout-modal-wrapper">
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleStayLoggedIn}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(34,211,238,0.05)] overflow-hidden"
              id="auto-logout-modal"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[45px] pointer-events-none"></div>
              
              <div className="flex flex-col items-center text-center">
                {/* Warning Alert Emblem */}
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                  <ShieldAlert size={32} className="animate-bounce" />
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
                  Security Inactivity Warning
                </h3>
                
                <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-sm mb-6">
                  You have been inactive for {isDemoMode ? "15 seconds" : "30 minutes"}. For compliance security, you will be signed out automatically.
                </p>

                {/* Circular Countdown Tracker */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-8 bg-slate-900/30 rounded-full border border-slate-900">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-slate-900 fill-none"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-cyan-500 fill-none"
                      strokeWidth="6"
                      strokeDasharray="301.6"
                      animate={{ strokeDashoffset: 301.6 - (301.6 * countdown) / WARNING_COUNTDOWN_SECS }}
                      transition={{ duration: 1, ease: "linear" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white tracking-tight leading-none">
                      {countdown}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">SECONDS</span>
                  </div>
                </div>

                {/* Buttons Container */}
                <div className="flex flex-col sm:flex-row w-full gap-3 mt-2">
                  <button
                    onClick={handleStayLoggedIn}
                    className="flex-1 px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20"
                  >
                    <Clock size={14} />
                    Stay Logged In
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-5 py-3 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-700 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <LogOut size={14} />
                    Log Out
                  </button>
                </div>
              </div>

              {/* Secure connection bottom badge */}
              <div className="mt-6 pt-4 border-t border-slate-900 flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase">
                <span>SES_STATE &bull; INACTIVE</span>
                <span className="text-cyan-500/60 font-bold">STATION_LOCKED</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
