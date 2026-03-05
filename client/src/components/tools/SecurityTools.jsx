import React, { useState, useMemo, useRef } from 'react';
import { 
  Globe, Database, Key, Terminal, Loader2, ChevronDown, ChevronUp, Unlock, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

// --- 1. PHISHING ANALYZER ---
export const PhishingSimulator = ({ isDarkMode }) => {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  const analyzeURL = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setShowTechDetails(false);

    try {
      const response = await api.post('tools/analyze-url', { url: url });
      const result = response.data; 
      const safetyScore = Math.max(0, 100 - result.risk_score);

      setAnalysis({
        score: safetyScore,
        rawChecks: result.checks, 
        domain: result.target,
        verdict: result.verdict
      });

      try {
        await api.post('tools/log-simulation', {
          tool_name: "Phishing Analyzer",
          input_data: result.target || url,
          risk_level: result.verdict === "SAFE" ? "Low" : "Critical",
          result_summary: `Scan: ${result.verdict} | Trust Score: ${safetyScore}%`
        });
      } catch (logErr) { console.warn("SIEM Sync skipped"); }

    } catch (err) {
      setAnalysis({ error: "Target unreachable. Domain may be offline." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const theme = isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl';

  return (
    <div className="space-y-8">
      <form onSubmit={analyzeURL} className="relative group">
        <input 
          value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website link (e.g. amazon.com)..."
          className={`w-full p-5 pl-14 rounded-2xl border-2 outline-none transition-all focus:ring-2 focus:ring-cyan-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-100'}`}
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500">
          {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Globe size={20} />}
        </div>
        <button type="submit" disabled={isAnalyzing} className="absolute right-3 top-3 bottom-3 px-4 md:px-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
          {isAnalyzing ? 'SCANNING...' : 'CHECK_SAFETY'}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {analysis && !analysis.error && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-[2rem] border ${theme} flex flex-col items-center justify-center relative`}>
                   <div className="text-5xl font-black tracking-tighter mb-2">{Math.round(analysis.score)}%</div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Trust Score</p>
                </div>
                <div className={`p-8 rounded-[2rem] border ${theme} flex flex-col justify-center`}>
                  <div className={`p-3 rounded-xl mb-3 text-center border font-black uppercase ${analysis.verdict === 'SAFE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {analysis.verdict}
                  </div>
                  <p className="text-xs opacity-70 text-center">Executive Summary: {analysis.verdict === 'SAFE' ? "Domain is trustworthy." : "Security risks detected."}</p>
                </div>
            </div>
            <div className={`rounded-[2rem] border overflow-hidden ${theme}`}>
              <button onClick={() => setShowTechDetails(!showTechDetails)} className="w-full flex justify-between p-6 hover:bg-slate-800/5 transition-colors">
                <span className="font-black text-xs uppercase tracking-widest flex gap-2"><Terminal size={16}/> Technical Audit</span>
                {showTechDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </button>
              {showTechDetails && (
                <div className="p-6 pt-0 space-y-2">
                   {analysis.rawChecks?.map((check, i) => (
                      <div key={i} className="flex justify-between text-xs p-2 rounded bg-slate-900/20 border border-slate-800/20">
                        <span className={check.status === 'PASS' ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{check.status}</span>
                        <span className="opacity-70">{check.name}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 2. SQL INJECTION LAB ---
export const SQLiLab = ({ isDarkMode }) => {
  const [query, setQuery] = useState({ user: '', pass: '' });
  const [dbResult, setDbResult] = useState([]);
  const [isBreached, setIsBreached] = useState(false);
  const [loading, setLoading] = useState(false);

  const mockDB = [
    { id: 1, user: 'admin', pass: 'sUp3r_S3cr3t_K3y', role: 'root' },
    { id: 2, user: 'alice', pass: 'wonderland123', role: 'user' },
    { id: 3, user: 'bob', pass: 'builder2024', role: 'user' }
  ];

  const handleExecute = () => {
    setLoading(true);
    setTimeout(() => {
        const input = query.user;
        const tautologyPattern = /['"]\s+OR\s+['"]?(\w+)['"]?\s*=\s*['"]?\1['"]?/i;
        const commentPattern = /--/;
    
        let result = [];
        let breached = false;
        
        const validUser = mockDB.find(u => u.user === input);
        
        if (tautologyPattern.test(input) || (input.includes("'") && commentPattern.test(input))) {
            result = mockDB; 
            breached = true;
        } else if (validUser) {
            result = [validUser];
        }
    
        setDbResult(result);
        setIsBreached(breached);
        setLoading(false);
    
        if (breached) {
             api.post('/api/tools/log-simulation', {
                tool_name: "SQLi Playground",
                input_data: input,
                risk_level: "Critical",
                result_summary: "DB Dump: 3 records exposed via Logic Bypass."
            }).catch(e => console.warn("Log failed", e));
        }
    }, 800);
  };

  const handleClear = () => {
    setQuery({ user: '', pass: '' });
    setDbResult([]);
    setIsBreached(false);
  };

  return (
    // FIX: Stacked grid for mobile
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className={`p-6 md:p-8 rounded-[2.5rem] border flex flex-col justify-center ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white shadow-xl'}`}>
        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-2 opacity-50">
            <Terminal size={18} className="text-cyan-500"/> Authenticate
        </h3>
        <div className="space-y-6">
           <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Username (Try: ' OR '1'='1)</label>
              <input 
                value={query.user}
                type="text" 
                placeholder="admin"
                className="w-full p-4 pl-12 rounded-xl bg-black border border-slate-800 text-cyan-400 font-mono text-sm outline-none focus:border-cyan-500 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                onChange={(e) => setQuery({...query, user: e.target.value})}
              />
              <Database size={16} className="absolute left-4 top-[38px] text-slate-600"/>
           </div>
           <div className="relative group">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2 mb-2 block">Password</label>
              <input 
                value={query.pass}
                type="password" 
                placeholder="••••••"
                className="w-full p-4 pl-12 rounded-xl bg-black border border-slate-800 text-cyan-400 font-mono text-sm outline-none focus:border-cyan-500 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                onChange={(e) => setQuery({...query, pass: e.target.value})}
              />
              <Key size={16} className="absolute left-4 top-[38px] text-slate-600"/>
           </div>
        </div>

        <div className="flex gap-4 mt-8">
            <button 
                onClick={handleExecute}
                disabled={loading}
                className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={16}/> : 'EXECUTE_INJECTION'}
            </button>
            <button 
                onClick={handleClear}
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 font-bold uppercase text-xs transition-all"
            >
                Reset
            </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/50">
             <div className="text-xs font-mono text-slate-500 mb-2">Generated SQL Query:</div>
             <div className="p-3 rounded-lg bg-black/50 border border-slate-800 text-xs font-mono break-all leading-relaxed">
                <span className="text-purple-400">SELECT</span> * <span className="text-purple-400">FROM</span> users <br/>
                <span className="text-purple-400">WHERE</span> user = <span className="text-amber-400">'{query.user}'</span> <br/>
                <span className="text-purple-400">AND</span> pass = <span className="text-amber-400">'{query.pass}'</span>;
             </div>
        </div>
      </div>

      <div className={`p-6 md:p-8 rounded-[2.5rem] border relative overflow-hidden flex flex-col ${isBreached ? 'border-red-500/50 bg-red-950/10' : 'border-slate-800 bg-black'}`}>
        <div className="flex justify-between items-center mb-6 z-10">
          <span className="text-slate-500 uppercase tracking-widest text-[10px] font-black">// DATABASE_RESPONSE_NODE</span>
          {isBreached ? <Unlock size={18} className="text-red-500 animate-pulse"/> : <Lock size={18} className="text-emerald-500"/>}
        </div>
        
        {/* FIX: Horizontal Scroll for Table */}
        <div className="flex-1 overflow-y-auto overflow-x-auto z-10 font-mono text-xs w-full">
           <table className="w-full text-left border-collapse min-w-[300px]">
             <thead>
                 <tr className="text-slate-500 border-b border-slate-800">
                    <th className="py-2">ID</th>
                    <th className="py-2">USER</th>
                    <th className="py-2">ROLE</th>
                    <th className="py-2 text-right">PASSWORD_HASH</th>
                 </tr>
             </thead>
             <tbody>
                 {dbResult.length > 0 ? (
                    dbResult.map((row) => (
                       <motion.tr 
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={row.id} 
                          className={`border-b border-slate-800/50 ${isBreached ? 'text-red-400' : 'text-emerald-400'}`}
                       >
                          <td className="py-3 opacity-50">{row.id}</td>
                          <td className="py-3 font-bold">{row.user}</td>
                          <td className="py-3 opacity-70">{row.role}</td>
                          <td className="py-3 text-right font-mono opacity-50">{isBreached ? row.pass : '••••••••'}</td>
                       </motion.tr>
                    ))
                 ) : (
                    <tr><td colSpan="4" className="py-10 text-center text-slate-700 italic">No records found or access denied.</td></tr>
                 )}
             </tbody>
           </table>
        </div>
        {isBreached && <div className="absolute inset-0 bg-red-500/5 pointer-events-none z-0 animate-pulse"/>}
      </div>
    </div>
  );
};

// --- 3. PASSWORD AUDITOR ---
export const PasswordAuditor = ({ isDarkMode }) => {
    const [pwd, setPwd] = useState('');
    const lastLogged = useRef('');
    
    const entropy = useMemo(() => {
      if (!pwd) return 0;
      let pool = 0;
      if (/[a-z]/.test(pwd)) pool += 26;
      if (/[A-Z]/.test(pwd)) pool += 26;
      if (/[0-9]/.test(pwd)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
      return Math.floor(pwd.length * Math.log2(pool || 1));
    }, [pwd]);
  
    const crackTime = entropy > 60 ? "Centuries" : entropy > 40 ? "Years" : entropy > 25 ? "Days" : "Seconds";
    const strengthColor = entropy > 60 ? "text-emerald-500" : entropy > 40 ? "text-cyan-500" : entropy > 25 ? "text-amber-500" : "text-red-500";
  
    const handleLog = async () => {
      if (entropy < 10 || pwd === lastLogged.current) return;
      try {
        await api.post('tools/log-simulation', {
          tool_name: "Password Auditor",
          input_data: "[REDACTED_NODE]",
          risk_level: entropy < 40 ? "Medium" : "Low",
          result_summary: `Entropy: ${entropy} bits. Strength: ${crackTime}`
        });
        lastLogged.current = pwd;
      } catch (e) { console.error("SIEM Sync Failed"); }
    };
  
    const theme = isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white shadow-xl';
  
    return (
      <div className="space-y-6">
        <div className="relative">
          <input 
            type="password" placeholder="Test password entropy..." 
            className={`w-full p-5 rounded-2xl border-2 font-mono outline-none transition-all focus:ring-2 focus:ring-amber-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white'}`}
            onChange={(e) => setPwd(e.target.value)}
            onBlur={handleLog}
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30">
            <Key size={18} />
          </div>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${Math.min(entropy, 100)}%`, backgroundColor: entropy > 50 ? '#10b981' : entropy > 30 ? '#f59e0b' : '#ef4444' }} className="h-full transition-all duration-500" />
        </div>
        
        {/* FIX: Stacked grid for results on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-8 rounded-[2.5rem] border ${theme} text-center`}>
            <p className="text-4xl font-black tracking-tighter">{entropy}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Entropy_Bits</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border ${theme} text-center`}>
            <p className={`text-4xl font-black tracking-tighter ${strengthColor}`}>{crackTime}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">Brute_Force_TTL</p>
          </div>
        </div>
      </div>
    );
};