import React from 'react';
import { Cpu, Flame, Gauge, Zap } from 'lucide-react';

export default function CpuCard({ cpu }) {
  const percent = cpu?.percent || 0;
  const temp = cpu?.temp_c || 0;
  const cores = cpu?.per_core || [0, 0, 0, 0];
  const freq = cpu?.freq_ghz || 1.5;
  const loadAvg = cpu?.load_avg || [0, 0, 0];

  // Temperature color logic
  const getTempColor = (t) => {
    if (t >= 75) return { text: 'text-rose-500', bg: 'bg-rose-500/20', border: 'border-rose-500/50', badge: 'bg-rose-500 text-white' };
    if (t >= 65) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', badge: 'bg-amber-500 text-black' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' };
  };

  const tempStyle = getTempColor(temp);

  return (
    <div className={`glass-card p-5 relative overflow-hidden ${temp >= 75 ? 'pulse-critical border-rose-500/50' : ''}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">CPU & Thermal</h3>
            <p className="text-xs text-slate-400">Broadcom BCM2711 (4 Cores)</p>
          </div>
        </div>

        {/* Temp Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${tempStyle.bg} ${tempStyle.border} ${tempStyle.text} text-sm font-bold`}>
          <Flame className="w-4 h-4 animate-bounce" />
          <span className="mono">{temp}°C</span>
        </div>
      </div>

      {/* Main Gauge & Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Main CPU Load Percentage */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/50 border border-white/5">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Ring Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${percent > 85 ? 'text-rose-500' : percent > 60 ? 'text-amber-400' : 'text-cyan-400'} transition-all duration-500 ease-out`}
                strokeDasharray={`${percent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold mono text-white">{percent}%</span>
              <span className="text-[10px] uppercase text-slate-400 tracking-wider">CPU LOAD</span>
            </div>
          </div>
        </div>

        {/* Load & Frequency Info */}
        <div className="flex flex-col justify-between space-y-2">
          <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Frequency</span>
              <span className="mono font-semibold text-slate-200">{freq} GHz</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill bg-gradient-to-r from-cyan-400 to-blue-500"
                style={{ width: `${Math.min((freq / 2.0) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/40 border border-white/5">
            <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-purple-400" /> Load Average (1m, 5m, 15m)
            </div>
            <div className="flex justify-between text-xs font-semibold mono">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">{loadAvg[0]}</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">{loadAvg[1]}</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">{loadAvg[2]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Core Breakdown */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Per-Core Usage</h4>
        <div className="grid grid-cols-2 gap-2">
          {cores.map((cPercent, idx) => (
            <div key={idx} className="p-2 rounded bg-slate-900/40 border border-white/5 flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Core {idx + 1}</span>
                <span className="mono text-slate-200">{cPercent}%</span>
              </div>
              <div className="progress-track">
                <div
                  className={`progress-fill ${cPercent > 85 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                  style={{ width: `${cPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
