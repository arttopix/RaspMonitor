import React from 'react';
import { HardDrive, Disc } from 'lucide-react';

export default function StorageCard({ storage }) {
  const percent = storage?.percent || 0;
  const usedGb = storage?.used_gb || 0;
  const freeGb = storage?.free_gb || 0;
  const totalGb = storage?.total_gb || 1;

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <HardDrive className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">System Storage</h3>
            <p className="text-xs text-slate-400">Primary Mount (/) - MicroSD / SSD</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg text-xs font-bold mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
          {percent}% USED
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400">Used Space</span>
            <div className="mono font-bold text-white text-sm">{usedGb} GB</div>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Available Free</span>
            <div className="mono font-bold text-emerald-400 text-sm">{freeGb} GB</div>
          </div>
        </div>

        <div className="progress-track h-3">
          <div
            className={`progress-fill ${
              percent >= 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-white/5 pt-2">
          <span>Capacity: <strong className="text-slate-200">{totalGb} GB</strong></span>
          <span className="flex items-center gap-1"><Disc className="w-3 h-3 text-emerald-400" /> Healthy State</span>
        </div>
      </div>
    </div>
  );
}
