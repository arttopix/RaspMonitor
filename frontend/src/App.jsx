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
  const [serverHost, setServerHost] = useState(localStorage.getItem('raspmonitor_server_host') || window.location.hostname || 'localhost');
  const [metrics, setMetrics] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const targetHost = serverHost || window.location.hostname || 'localhost';
      const wsUrl = `${protocol}://${targetHost}:8000/ws/metrics?token=${token}`;

      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket Connected successfully to:', targetHost);
        setIsConnected(true);
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
        console.error('WebSocket Error:', err);
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
    setToken('');
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

  if (!token) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
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
      <footer className="mt-8 text-center text-xs text-slate-500 border-t border-white/5 pt-4">
        RaspMonitor &bull; Raspberry Pi 4 Real-time System Telemetry ({serverHost}:8000)
      </footer>
    </div>
  );
}
