import React from 'react';
import { Cpu, Wifi, WifiOff, LogOut, Clock, ShieldAlert, Server } from 'lucide-react';

export default function Header({ system, isConnected, onLogout }) {
  const formatUptime = (seconds) => {
    if (!seconds) return '0m';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m`;
  };

  const throttled = system?.throttled || {};

  return (
    <header className="glass-card mb-6 p-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-cyan-500/20">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-400/30 flex items-center justify-center shadow-inner">
          <Cpu className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">RaspMonitor</h1>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
              RPi 4
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>{system?.hostname || 'RaspberryPi4'} &bull; {system?.os || 'Linux'}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        {/* Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
          isConnected 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
        }`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isConnected ? 'Real-time Live (1s)' : 'Reconnecting...'}</span>
        </div>

        {/* Uptime */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Uptime:</span>
          <span className="mono font-semibold text-white">{formatUptime(system?.uptime_seconds)}</span>
        </div>

        {/* Throttling Badge */}
        {throttled.under_voltage && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold animate-bounce">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Under-voltage!</span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
