import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import CpuCard from './components/CpuCard';
import MemoryCard from './components/MemoryCard';
import StorageCard from './components/StorageCard';
import NetworkCard from './components/NetworkCard';
import AlertBanner from './components/AlertBanner';
import LoginModal from './components/LoginModal';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('raspmonitor_token') || '');
  const [serverHost, setServerHost] = useState(localStorage.getItem('raspmonitor_server_host') || '');
  const [metrics, setMetrics] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connErrorCount, setConnErrorCount] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // If no host is saved yet, clear token to force LoginModal to ask for Host IP
  useEffect(() => {
    if (!localStorage.getItem('raspmonitor_server_host')) {
      handleLogout();
    }
  }, []);

  useEffect(() => {
    if (!token || !serverHost) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const cleanHost = serverHost.trim();
      const wsUrl = `${protocol}://${cleanHost}:8000/ws/metrics?token=${token}`;

      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket Connected successfully to:', cleanHost);
        setIsConnected(true);
        setConnErrorCount(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMetrics(data);
        } catch (e) {
          console.error('Error parsing metrics data:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket Error connecting to host:', cleanHost, err);
        setConnErrorCount((prev) => prev + 1);
      };

      ws.onclose = (event) => {
        console.warn('WebSocket Closed:', event);
        setIsConnected(false);

        if (event.code === 1008) {
          handleLogout();
          return;
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          if (localStorage.getItem('raspmonitor_token')) {
            connectWebSocket();
          }
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [token, serverHost]);

  const handleLogout = () => {
    localStorage.removeItem('raspmonitor_token');
    localStorage.removeItem('raspmonitor_server_host');
    setToken('');
    setServerHost('');
    setMetrics(null);
    setIsConnected(false);
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const handleLoginSuccess = (newToken, newHost) => {
    setServerHost(newHost);
    setToken(newToken);
  };

  // If no token or no server host configured, show Login & Server IP Modal
  if (!token || !serverHost) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Connection Warning Banner if host is unreachable */}
      {connErrorCount > 2 && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <span>ไม่สามารถเชื่อมต่อกับ Raspberry Pi ที่ <strong>{serverHost}:8000</strong> ได้ กรุณาตรวจสอบ IP หรือเลือกเปลี่ยนเซิร์ฟเวอร์</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold transition"
          >
            เปลี่ยน IP เซิร์ฟเวอร์
          </button>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        system={metrics?.system}
        isConnected={isConnected}
        onLogout={handleLogout}
      />

      {/* Real-time Hardware Alerts */}
      <AlertBanner alerts={metrics?.alerts} />

      {/* Main Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CpuCard cpu={metrics?.cpu} />
        <MemoryCard memory={metrics?.memory} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StorageCard storage={metrics?.storage} />
        <NetworkCard network={metrics?.network} />
      </div>

      {/* Footer Info */}
      <footer className="mt-8 text-center text-xs text-slate-500 border-t border-white/5 pt-4 flex items-center justify-center gap-4">
        <span>RaspMonitor &bull; Connected to: <strong>{serverHost}:8000</strong></span>
        <button onClick={handleLogout} className="text-cyan-400 hover:underline">
          (เปลี่ยน IP)
        </button>
      </footer>
    </div>
  );
}
