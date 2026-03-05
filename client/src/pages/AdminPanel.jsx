import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, Radio, Trash2, Activity, 
  Terminal, BarChart3, Database, Cpu, HardDrive 
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminPanel({ isDarkMode }) {
  const [users, setUsers] = useState([]);
  const [intel, setIntel] = useState(null);
  const [health, setHealth] = useState(null);
  const [tickerMsg, setTickerMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [userRes, intelRes, healthRes] = await Promise.all([
        api.get('/admin/all-users'),
        api.get('/admin/intel/global-analytics'),
        api.get('/api/admin/system/health')
      ]);
      setUsers(userRes.data);
      setIntel(intelRes.data);
      setHealth(healthRes.data);
    } catch (err) {
      console.error("Root Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(() => {
        // Poll health and intel every 30s
        api.get('/admin/system/health').then(res => setHealth(res.data));
        api.get('/admin/intel/global-analytics').then(res => setIntel(res.data));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const pushGlobalAlert = async () => {
    if (!tickerMsg) return;
    try {
      await api.post('/admin/push-alert', { message: tickerMsg });
      alert("Nexus Broadcast Executed Successfully.");
      setTickerMsg('');
    } catch (err) { alert("Broadcast Link Failed."); }
  };

  const handleSystemReset = async () => {
    const confirm1 = window.confirm("CRITICAL: Resetting will purge all progress, logs, and alerts. Continue?");
    if (!confirm1) return;
    const confirm2 = window.prompt("Type 'PURGE' to confirm master reset:");
    if (confirm2 !== 'PURGE') return;

    try {
      await api.post('/admin/system/reset');
      alert("System has been returned to factory defaults.");
      window.location.reload();
    } catch (err) { alert("Reset Protocol Aborted."); }
  };

  const theme = {
    card: isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200 shadow-xl',
    text: isDarkMode ? 'text-white' : 'text-slate-900',
    sub: isDarkMode ? 'text-slate-500' : 'text-slate-400'
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono">
      <Terminal className="text-red-500 mb-4 animate-pulse" size={48} />
      <span className="text-red-500 tracking-widest uppercase text-xs">Initializing_Root_Environment...</span>
    </div>
  );

  return (
    // FIX: px-4 and responsive spacing
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 space-y-8 md:space-y-10">
      
      {/* 1. HEADER & HEALTH MONITOR (Stacked on Mobile) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${theme.text}`}>Root Command Center</h1>
          <p className="text-[10px] font-black uppercase text-red-500 opacity-60 flex items-center gap-2 mt-1">
            <Activity size={12} className="animate-pulse" /> Operational Status: {health?.status || 'Online'}
          </p>
        </div>

        {/* Health Metrics wrap nicely */}
        <div className={`flex flex-wrap gap-4 md:gap-8 p-4 rounded-2xl border ${theme.card} w-full lg:w-auto`}>
          <HealthMetric icon={Cpu} label="CPU" value={health?.cpu} />
          <HealthMetric icon={HardDrive} label="RAM" value={health?.memory} />
          <HealthMetric icon={Database} label="DB LATENCY" value={health?.db_latency} isValueOnly />
        </div>
      </div>

      {/* 2. ANALYTICAL INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Personnel Ratio (Doughnut) */}
        <div className={`p-6 md:p-8 rounded-3xl border ${theme.card}`}>
          <h3 className="text-xs font-black uppercase mb-6 opacity-50 flex items-center gap-2">
            <Users size={14} /> Identity Distribution
          </h3>
          <div className="h-48">
            <Doughnut 
              data={{
                labels: ['Cadets', 'Specialists'],
                datasets: [{
                  data: [intel?.demographics?.student || 0, intel?.demographics?.professional || 0],
                  backgroundColor: ['#06b6d4', '#8b5cf6'],
                  borderWidth: 0
                }]
              }}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: isDarkMode ? '#fff' : '#000', font: { size: 10, weight: 'bold' } } } } }}
            />
          </div>
        </div>

        {/* Threat Landscape (Bar) */}
        <div className={`lg:col-span-2 p-6 md:p-8 rounded-3xl border ${theme.card}`}>
          <h3 className="text-xs font-black uppercase mb-6 opacity-50 flex items-center gap-2">
            <BarChart3 size={14} /> Global Threat Simulation Activity
          </h3>
          <div className="h-48">
            <Bar 
              data={{
                labels: intel?.threat_landscape?.map(t => t._id) || [],
                datasets: [{
                  data: intel?.threat_landscape?.map(t => t.count) || [],
                  backgroundColor: '#f43f5e',
                  borderRadius: 6
                }]
              }}
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { ticks: { color: isDarkMode ? '#94a3b8' : '#64748b', font: { size: 9, weight: 'bold' } } } } }}
            />
          </div>
        </div>
      </div>

      {/* 3. BROADCAST & REGISTRY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`p-6 md:p-8 rounded-3xl border ${theme.card} space-y-6`}>
          <div className="flex items-center gap-2">
            <Radio className="text-cyan-500 animate-pulse" size={20} />
            <h3 className={`font-black uppercase text-xs tracking-widest ${theme.text}`}>Global Intel Broadcast</h3>
          </div>
          <textarea 
            value={tickerMsg}
            onChange={(e) => setTickerMsg(e.target.value)}
            placeholder="Push urgent intelligence to all cadets..."
            className="w-full h-32 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-cyan-400 outline-none focus:border-cyan-500 transition-all"
          />
          <button onClick={pushGlobalAlert} className="w-full py-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500 transition-all">
            EXECUTE BROADCAST
          </button>
        </div>

        <div className={`lg:col-span-2 p-6 md:p-8 rounded-3xl border ${theme.card}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-black uppercase text-xs tracking-widest ${theme.text}`}>Personnel Registry</h3>
            <span className="text-[10px] font-mono opacity-40">{users.length} Nodes Active</span>
          </div>
          
          {/* FIX: Table overflow for mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="text-[10px] font-black uppercase opacity-40 border-b border-slate-800">
                  <th className="pb-4">Cadet</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4">XP</th>
                  <th className="pb-4 text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((u) => (
                  <tr key={u.id} className="text-xs group hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 font-bold">{u.name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${u.role === 'admin' ? 'border-red-500 text-red-500' : 'border-cyan-500/30 text-cyan-500'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 font-mono">{u.xp || 0}</td>
                    <td className="py-4 text-right">
                      <button className="p-2 text-slate-500 hover:text-red-500 disabled:opacity-10" disabled={u.role === 'admin'}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. DANGER ZONE (GLOBAL RESET) */}
      <div className="mt-12 md:mt-20 pt-8 md:pt-10 border-t border-red-500/20">
        <div className="p-6 md:p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
            <h3 className="text-red-500 font-black uppercase text-xs flex items-center gap-2 mb-2">
                <ShieldAlert size={16} /> Emergency Purge Protocol
            </h3>
            <p className="text-[10px] text-red-500/60 font-bold uppercase mb-6">
                Executing a system reset will permanently erase all cadet progress, SIEM logs, and broadcasts.
            </p>
            <button 
                onClick={handleSystemReset}
                className="px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-700 transition-all w-full md:w-auto"
            >
                Initiate Master Reset
            </button>
        </div>
      </div>
    </div>
  );
}

function HealthMetric({ icon: Icon, label, value, isValueOnly }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-slate-500" />
      <div>
        <p className="text-[8px] font-black opacity-40 uppercase">{label}</p>
        <p className={`text-xs font-black ${isValueOnly ? 'text-emerald-500' : 'text-slate-200'}`}>{value || '0%'}</p>
      </div>
    </div>
  );
}