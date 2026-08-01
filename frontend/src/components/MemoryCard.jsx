import React from 'react';
import { Database, HardDrive, RefreshCw } from 'lucide-react';

export default function MemoryCard({ memory }) {
  const percent = memory?.percent || 0;
  const used = memory?.used_mb || 0;
  const total = memory?.total_mb || 1;
  const avail = memory?.available_mb || 0;
  const swapPercent = memory?.swap_percent || 0;
  const swapUsed = memory?.swap_used_mb || 0;
  const swapTotal = memory?.swap_total_mb || 1;

  const usedGb = (used / 1024).toFixed(2);
  const totalGb = (total / 1024).toFixed(2);

  return (
    <div className={`glass-card p-5 relative overflow-hidden ${percent >= 90 ? 'pulse-critical border-rose-500/50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">LPDDR4 RAM</h3>
            <p className="text-xs text-slate-400">{totalGb} GB System Memory</p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold mono border ${
          percent >= 90 
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
            : percent >= 75 
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        }`}>
          {percent}% USED
        </span>
      </div>

      {/* Main RAM Bar */}
      <div className="mb-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-2">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Used: <strong className="mono text-white">{usedGb} GB</strong> ({used} MB)</span>
          <span>Free: <strong className="mono text-emerald-400">{(avail / 1024).toFixed(2)} GB</strong></span>
        </div>

        <div className="progress-track h-3">
          <div
            className={`progress-fill ${
              percent >= 90 
                ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                : 'bg-gradient-to-r from-purple-500 to-cyan-400'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Swap Space Section */}
      <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Swap Memory
          </span>
          <span className="mono text-slate-300 font-semibold">{swapUsed} MB / {swapTotal} MB ({swapPercent}%)</span>
        </div>

        <div className="progress-track h-2">
          <div
            className="progress-fill bg-cyan-400"
            style={{ width: `${swapPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
