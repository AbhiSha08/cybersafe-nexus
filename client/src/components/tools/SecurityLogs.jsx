import React, { useEffect, useState } from 'react';
import { RefreshCw, Activity, Filter, Search } from 'lucide-react';
import api from '../../api';

export default function SecurityLogs({ isDarkMode }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterModule, setFilterModule] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tools/security-logs');
      setLogs(res.data);
    } catch (err) {
      console.error("SIEM Extraction Failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {
    const toolName = log.tool || log.tool_name || '';
    if (filterModule !== 'ALL' && !toolName.includes(filterModule)) return false;

    const riskLevel = log.risk || log.risk_level || '';
    if (filterRisk !== 'ALL' && riskLevel.toLowerCase() !== filterRisk.toLowerCase()) return false;

    const timeStr = new Date(log.timestamp).toLocaleString();
    if (searchTerm && !timeStr.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;
  });

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const themeInput = isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h3 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Activity size={24} className="text-cyan-500" /> SIEM Audit Trail
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Real-time Session Monitoring</p>
        </div>
        <button onClick={fetchLogs} className="self-end p-3 rounded-xl bg-slate-800/10 border border-slate-800/20 text-cyan-500 hover:scale-105 transition-all transition-colors">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 ${isDarkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
         <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"/>
            <input 
              placeholder="Search timestamp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-2 pl-9 pr-4 rounded-lg text-xs font-bold outline-none border focus:border-cyan-500 transition-all ${themeInput}`}
            />
         </div>
         <div className="relative">
             <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"/>
             <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className={`w-full md:w-auto py-2 pl-9 pr-8 rounded-lg text-xs font-bold outline-none border focus:border-cyan-500 appearance-none cursor-pointer ${themeInput}`}>
                <option value="ALL">All Modules</option>
                <option value="Phishing">Phishing</option>
                <option value="SQLi">SQL Injection</option>
                <option value="Password">Password</option>
             </select>
         </div>
         <div className="relative">
             <div className={`w-2 h-2 rounded-full absolute left-3 top-1/2 -translate-y-1/2 ${filterRisk === 'Critical' ? 'bg-red-500' : 'bg-slate-400'}`}/>
             <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className={`w-full md:w-auto py-2 pl-8 pr-8 rounded-lg text-xs font-bold outline-none border focus:border-cyan-500 appearance-none cursor-pointer ${themeInput}`}>
                <option value="ALL">All Risks</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
             </select>
         </div>
      </div>

      <div className={`rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white shadow-xl'}`}>
        {/* FIX: Added overflow-x-auto wrapper */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'bg-slate-800/50 text-slate-500' : 'bg-gray-50 text-gray-400'}`}>
                <th className="p-6">Timestamp</th>
                <th className="p-6">Module</th>
                <th className="p-6">Risk</th>
                <th className="p-6">Event Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/20">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log._id} className="text-sm hover:bg-cyan-500/5 transition-colors">
                  <td className="p-6 font-mono text-[10px] opacity-40">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <span className="block opacity-50 text-[8px]">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </td>
                  <td className="p-6 font-black uppercase tracking-tighter text-cyan-500">{log.tool || log.tool_name}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase ${getRiskColor(log.risk || log.risk_level)}`}>
                      {log.risk || log.risk_level}
                    </span>
                  </td>
                  <td className="p-6 text-xs italic opacity-60 font-medium whitespace-nowrap md:whitespace-normal">{log.summary || log.result_summary}</td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">No matching events found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}