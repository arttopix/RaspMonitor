import React, { useState, useEffect } from 'react';
import { Network, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function NetworkCard({ network }) {
  const [history, setHistory] = useState([]);

  const upload = network?.upload_kbps || 0;
  const download = network?.download_kbps || 0;
  const sentMb = network?.total_sent_mb || 0;
  const recvMb = network?.total_recv_mb || 0;

  useEffect(() => {
    if (network) {
      setHistory((prev) => {
        const timeStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
        const newPoint = {
          time: timeStr,
          upload,
          download
        };
        const updated = [...prev, newPoint];
        if (updated.length > 20) updated.shift();
        return updated;
      });
    }
  }, [network]);

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Network className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">Network Bandwidth</h3>
            <p className="text-xs text-slate-400">Real-time Data Transfer</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ArrowDownLeft className="w-3.5 h-3.5" /> {download} KB/s
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <ArrowUpRight className="w-3.5 h-3.5" /> {upload} KB/s
          </span>
        </div>
      </div>

      {/* Live Bandwidth Area Chart */}
      <div className="h-36 w-full mb-3 p-2 rounded-xl bg-slate-900/50 border border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7928ca" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7928ca" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
            />
            <Area type="monotone" dataKey="download" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#downloadGrad)" name="Download (KB/s)" />
            <Area type="monotone" dataKey="upload" stroke="#7928ca" strokeWidth={2} fillOpacity={1} fill="url(#uploadGrad)" name="Upload (KB/s)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Total Data Sent/Received */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-white/5 flex items-center justify-between">
          <span className="text-slate-400">Total Rx</span>
          <span className="mono font-semibold text-cyan-300">{recvMb} MB</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-white/5 flex items-center justify-between">
          <span className="text-slate-400">Total Tx</span>
          <span className="mono font-semibold text-purple-300">{sentMb} MB</span>
        </div>
      </div>
    </div>
  );
}
