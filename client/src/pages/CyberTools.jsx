import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Globe, Database, Key, Activity, AlertTriangle, ListOrdered
} from 'lucide-react';
import api from '../api'; 

import { PhishingSimulator, SQLiLab, PasswordAuditor } from '../components/tools/SecurityTools';
import SecurityLogs from '../components/tools/SecurityLogs';

export default function CyberTools({ isDarkMode }) {
  const [activeTool, setActiveTool] = useState('phishing');
  const [alerts, setAlerts] = useState([
    "Authorized research protocols apply. Unauthorized use strictly prohibited."
  ]);
  const [alertIndex, setAlertIndex] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        /** * FIX: Corrected syntax for endpoint and cache-buster.
         * Path matches FastAPI: /api/tools/live-alerts
         */
        const res = await api.get(`/api/tools/live-alerts?v=${Date.now()}`);
        
        if (res.data && res.data.length > 0) {
          setAlerts([
              "Authorized research protocols apply. Unauthorized use strictly prohibited.",
              ...res.data
          ]);
        }
      } catch (err) {
        console.warn("Live Intel Offline: Using local fallback alerts.");
      }
    };
    fetchAlerts();
    
    const interval = setInterval(() => {
        setAlertIndex(prev => (prev + 1)); 
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const glitchVariant = {
    hidden: { opacity: 0, skewX: 10, filter: "blur(4px)" },
    visible: { 
      opacity: [0, 1, 0.8, 1], 
      skewX: [5, -5, 0],
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeInOut" } 
    }
  };

  const tools = [
    { 
      id: 'phishing', 
      name: 'Phishing Link Analyzer', 
      icon: Globe, 
      desc: 'Analyze URLs for deceptive patterns, typosquatting, and protocol integrity.',
      steps: [
        "Enter the suspicious URL into the analysis field.",
        "System scans for character substitutions (homographs).",
        "Verification of SSL/TLS protocol and TLD risk factors.",
        "Review intelligence report and confidence score."
      ]
    },
    { 
      id: 'sqli', 
      name: 'SQLi Playground', 
      icon: Database, 
      desc: 'Simulate unsanitized input attacks to understand database query manipulation.',
      steps: [
        "Input standard bypass payloads (e.g. ' OR '1'='1).",
        "Monitor the Live SQL Query Monitor for logic changes.",
        "Observe if the logic evaluates to a 'TRUE' state.",
        "Verify if the database dumps protected records."
      ]
    },
    { 
      id: 'password', 
      name: 'Brute-Force Auditor', 
      icon: Key, 
      desc: 'Test password entropy and estimate crack time against modern GPU clusters.',
      steps: [
        "Input a test password into the entropy engine.",
        "Analyze bit-depth calculations ($L \\times \\log_2(R)$).",
        "Check Time-To-Live (TTL) against brute-force nodes.",
        "Review compliance with 12+ character security baselines."
      ]
    },
    { 
      id: 'logs', 
      name: 'SIEM Audit Trail', 
      icon: Activity, 
      desc: 'Review live logs of simulation events captured by the Nexus SIEM system.',
      steps: [
        "Click the Refresh node to poll the latest logs.",
        "Filter entries based on 'Critical' or 'High' risk levels.",
        "Expand logs to view raw simulation payloads.",
        "Analyze timestamps for incident response documentation."
      ]
    }
  ];

  const theme = {
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    card: isDarkMode ? 'bg-slate-900/40 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-xl',
    sidebar: isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200',
    procedureBg: isDarkMode ? 'bg-cyan-500/5 border-cyan-500/10' : 'bg-cyan-50 border-cyan-100'
  };

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 font-sans min-h-screen overflow-x-hidden">
      
      {/* ETHICAL DIRECTIVE SECTION (Glitch Effect Preserved) */}
      <motion.section 
        initial="hidden" animate="visible" variants={glitchVariant}
        className={`mb-10 p-8 rounded-[2.5rem] border-2 border-red-500/30 ${isDarkMode ? 'bg-red-500/5' : 'bg-red-50'} relative overflow-hidden`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <AlertTriangle className="text-red-500 animate-pulse" size={44} />
            <h1 className={`text-3xl md:text-4xl font-black uppercase tracking-tighter ${theme.text}`}>
              Ethical <span className="text-red-500">Directive</span>
            </h1>
          </div>
          <div className="hidden md:block w-px h-14 bg-red-500/20" />
          
          <div className="flex-1 overflow-hidden relative h-14 flex items-center">
            <AnimatePresence mode="wait">
                <motion.p 
                  key={alertIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-lg font-bold leading-tight ${theme.text} opacity-90`}
                >
                  {alerts[alertIndex % alerts.length]}
                </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Header with Animation Preserved */}
      <motion.header initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10 flex items-center gap-6">
        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
          <ShieldAlert className="text-cyan-500" size={36} />
        </div>
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${theme.text}`}>Cyber Tools Terminal</h1>
          <p className={`${theme.subText} font-black uppercase tracking-[0.3em] text-[10px]`}>
            Vulnerability Research Node // Active_Session: 2026.
          </p>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with Button Transitions Preserved */}
        <aside className={`lg:w-1/4 h-fit p-6 rounded-[2.5rem] border ${theme.sidebar}`}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6 px-2">Operational Modules</p>
          <div className="space-y-3">
            {tools.map((tool) => (
              <motion.button
                key={tool.id}
                whileHover={{ x: 8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border-2 ${
                  activeTool === tool.id 
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-500 shadow-lg shadow-cyan-500/10' 
                  : `border-transparent ${theme.subText} hover:bg-cyan-500/5 hover:border-cyan-500/20`
                }`}
              >
                <tool.icon size={20} className={activeTool === tool.id ? 'text-cyan-500' : 'opacity-50'} />
                <span className="font-black text-sm tracking-tight uppercase">{tool.name}</span>
              </motion.button>
            ))}
          </div>
        </aside>

        {/* Main Content Area with Scale/Opacity Transitions Preserved */}
        <main className="lg:w-3/4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className={`p-10 rounded-[3rem] border min-h-[650px] overflow-hidden ${theme.card}`}
            >
              <div className="mb-8 pb-6 border-b border-slate-800/20">
                <h2 className={`text-3xl font-black tracking-tighter mb-2 ${theme.text}`}>
                  {activeToolData.name}
                </h2>
                <p className={`${theme.subText} text-sm font-medium italic opacity-70`}>
                  {activeToolData.desc}
                </p>
              </div>

              <div className={`mb-8 p-6 rounded-2xl border ${theme.procedureBg}`}>
                <div className="flex items-center gap-2 mb-4 text-cyan-500">
                  <ListOrdered size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Tactical Procedures</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {activeToolData.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="font-mono text-cyan-500 font-bold text-xs">{idx + 1}.</span>
                      <p className={`text-xs font-bold leading-relaxed opacity-80 ${theme.text}`}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                {activeTool === 'phishing' && <PhishingSimulator key="tool-phish" isDarkMode={isDarkMode} />}
                {activeTool === 'sqli' && <SQLiLab key="tool-sql" isDarkMode={isDarkMode} />}
                {activeTool === 'password' && <PasswordAuditor key="tool-pass" isDarkMode={isDarkMode} />}
                {activeTool === 'logs' && <SecurityLogs key="tool-logs" isDarkMode={isDarkMode} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}