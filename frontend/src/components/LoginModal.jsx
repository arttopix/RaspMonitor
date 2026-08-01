import React, { useState } from 'react';
import { Lock, Cpu, Key, AlertCircle, Server } from 'lucide-react';

export default function LoginModal({ onLoginSuccess }) {
  const [serverHost, setServerHost] = useState(localStorage.getItem('raspmonitor_server_host') || '');
  const [serverPort, setServerPort] = useState(localStorage.getItem('raspmonitor_server_port') || '8000');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanHost = serverHost.trim().replace(/^https?:\/\//, '');
      const cleanPort = serverPort.trim() || '8000';
      const apiUrl = `http://${cleanHost}:${cleanPort}/api/login`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('raspmonitor_token', data.access_token);
        localStorage.setItem('raspmonitor_server_host', cleanHost);
        localStorage.setItem('raspmonitor_server_port', cleanPort);
        onLoginSuccess(data.access_token, cleanHost, cleanPort);
      } else {
        setError(data.detail || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError(`ไม่สามารถเชื่อมต่อกับ Raspberry Pi ที่ http://${serverHost}:${serverPort} ได้ (กรุณาตรวจสอบ IP, Port และสถานะ Backend บน Raspberry Pi)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-8 glass-card border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-lg">
            <Cpu className="w-9 h-9 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">RaspMonitor</h2>
          <p className="text-sm text-slate-400 mt-1">Raspberry Pi 4 Real-time Telemetry System</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Raspberry Pi IP / Host
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={serverHost}
                  onChange={(e) => setServerHost(e.target.value)}
                  className="w-full glass-input pl-10 mono text-sm"
                  placeholder="เช่น 192.168.1.50"
                  required
                />
                <Server className="w-4 h-4 text-cyan-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Port
              </label>
              <input
                type="text"
                value={serverPort}
                onChange={(e) => setServerPort(e.target.value)}
                className="w-full glass-input mono text-sm text-center"
                placeholder="8000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full glass-input pl-10"
                placeholder="admin"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input pl-10"
                placeholder="Default: admin"
                required
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-glow mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'กำลังเชื่อมต่อกับ Raspberry Pi...' : 'เข้าสู่ระบบ Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Raspberry Pi 4 System Monitor &bull; Configurable Host & Port
        </div>
      </div>
    </div>
  );
}
