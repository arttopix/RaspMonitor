import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ShieldAlert, Volume2, VolumeX, X } from 'lucide-react';

export default function AlertBanner({ alerts }) {
  const [muted, setMuted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const audioCtxRef = useRef(null);

  // Play synthetic alert beep using Web Audio API when critical alert appears
  const playAlertSound = () => {
    if (muted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  const hasCritical = alerts?.some(a => a.level === 'critical');

  useEffect(() => {
    if (hasCritical && !muted && !dismissed) {
      playAlertSound();
    }
  }, [alerts, muted, dismissed]);

  if (!alerts || alerts.length === 0 || dismissed) return null;

  return (
    <div className={`mb-6 p-4 rounded-xl border backdrop-blur-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl transition-all ${
      hasCritical 
        ? 'bg-rose-950/70 border-rose-500/60 text-rose-200 pulse-critical' 
        : 'bg-amber-950/70 border-amber-500/50 text-amber-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${hasCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {hasCritical ? <ShieldAlert className="w-5 h-5 animate-bounce" /> : <AlertTriangle className="w-5 h-5 animate-pulse" />}
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            System Alerts ({alerts.length})
          </h4>
          <div className="mt-1 space-y-1">
            {alerts.map((alert, idx) => (
              <div key={idx} className="text-xs flex items-center gap-2 font-medium">
                <span className={`w-1.5 h-1.5 rounded-full ${alert.level === 'critical' ? 'bg-rose-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center">
        <button
          onClick={() => setMuted(!muted)}
          className="p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition"
          title={muted ? "Unmute alert sounds" : "Mute alert sounds"}
        >
          {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
          <span>{muted ? 'Muted' : 'Sound On'}</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 text-slate-300 transition"
          title="Dismiss alert banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
