import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitCommit, Calendar, CheckCircle, Server, 
  FileText, ShieldCheck, User, Globe, 
  ArrowUp, X, LayoutGrid, KeyRound 
} from 'lucide-react';

// --- FULL CHANGELOG ---
const CHANGELOG = [
  {
    id: "v2.5",
    version: "v2.5.0",
    date: "March 1 - March 5, 2026",
    title: "System Validation & Hardening",
    icon: ShieldCheck,
    desc: "Executed rigorous QA testing, Vulnerability Assessment and Penetration Testing (VAPT), and compiled final system documentation.",
    changes: [
      "Comprehensive QA testing across all system components",
      "Vulnerability Assessment and Penetration Testing (VAPT) completed",
      "Final system documentation and architecture review",
      "Security hardening and performance optimization",
      "API routing validation and COOP policy fixes"
    ]
  },
  {
    id: "v2.0",
    version: "v2.0.0",
    date: "Feb 20 - March 1, 2026",
    title: "Tool Integration & AI Orchestration",
    icon: Globe,
    desc: "Deployed the heuristic phishing engine and integrated Google Gemini 2.5 Flash for real-time security tutoring.",
    changes: [
      "Deployed heuristic phishing link analyzer",
      "Integrated Google Gemini 2.5 Flash AI assistant",
      "Real-time security tutoring and contextual learning",
      "Advanced threat intelligence integration",
      "AI-powered quiz generation and content analysis"
    ]
  },
  {
    id: "v1.5",
    version: "v1.5.0",
    date: "Feb 10 - Feb 20, 2026",
    title: "Frontend & UI Engineering",
    icon: LayoutGrid,
    desc: "Built the React.js component library, implemented state management, and applied responsive design system using Tailwind CSS.",
    changes: [
      "Complete React.js component library development",
      "Advanced state management with Context API",
      "Responsive design system with Tailwind CSS",
      "Mobile-first responsive layouts",
      "Component-based architecture implementation"
    ]
  },
  {
    id: "v1.0",
    version: "v1.0.0",
    date: "Jan 25 - Feb 10, 2026",
    title: "Core Backend Infrastructure",
    icon: Server,
    desc: "Deployed FastAPI server, implemented stateless JWT-based authentication, and established MongoDB Atlas connection.",
    changes: [
      "FastAPI server deployment and configuration",
      "Stateless JWT-based authentication system",
      "MongoDB Atlas cloud database integration",
      "RESTful API architecture implementation",
      "Security middleware and CORS configuration"
    ]
  },
  {
    id: "v0.1",
    version: "v0.1.0-alpha",
    date: "Jan 15 - Jan 25, 2026",
    title: "Conceptualization & Architecture",
    icon: FileText,
    desc: "Finalized system requirements, architectural blueprinting, and NoSQL database schema modeling.",
    changes: [
      "System requirements finalization and analysis",
      "Complete architectural blueprinting",
      "NoSQL database schema modeling",
      "Security framework design",
      "Educational curriculum structure planning"
    ]
  }
];

export default function Updates({ isDarkMode }) {
  const [selectedId, setSelectedId] = useState(null);

  const theme = {
    bg: 'bg-transparent',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    card: isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 backdrop-blur-sm' : 'bg-white/80 border-slate-200 hover:border-cyan-500/50 backdrop-blur-sm',
    modal: isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    arrow: isDarkMode ? 'text-cyan-500' : 'text-cyan-600',
    line: isDarkMode ? 'from-cyan-500/0 via-cyan-500/20 to-cyan-500/0' : 'from-cyan-600/0 via-cyan-600/20 to-cyan-600/0'
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 overflow-x-hidden ${theme.bg} ${theme.text}`}>
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-16 text-center"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 flex items-center justify-center gap-3">
            <GitCommit className="text-cyan-500" /> 
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Evolution</span>
          </h1>
          <p className={`${theme.subText} text-[10px] font-black uppercase tracking-[0.3em]`}>
            Transmission History // Update_Protocol_Active
          </p>
        </motion.header>

        {/* VERTICAL TIMELINE STACK */}
        <div className="flex flex-col items-center gap-0">
          
          {CHANGELOG.map((log, index, array) => (
            <React.Fragment key={log.id}>
              
              {/* CARD */}
              <motion.div 
                layoutId={log.id} 
                onClick={() => setSelectedId(log.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative w-full p-6 md:p-8 rounded-[2rem] border cursor-pointer group transition-all duration-300 z-10 ${theme.card}`}
                whileHover={{ y: -4, boxShadow: "0 0 30px rgba(6,182,212,0.1)" }}
              >
                {/* Status Indicator for Latest Release */}
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-cyan-500 border-4 border-slate-950 flex items-center justify-center text-[9px] font-black text-white">LIVE</span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Icon Box */}
                  <div className="p-4 bg-cyan-500/10 rounded-2xl group-hover:bg-cyan-500 group-hover:text-white transition-colors shrink-0">
                    <log.icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded-lg bg-slate-500/10 text-[10px] font-black uppercase tracking-widest opacity-70">
                            {log.version}
                        </span>
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${theme.subText}`}>
                            <Calendar size={12} /> {log.date}
                        </span>
                    </div>
                    <h3 className="font-black text-xl md:text-2xl leading-tight group-hover:text-cyan-500 transition-colors mb-2">
                        {log.title}
                    </h3>
                    <p className={`text-sm font-medium leading-relaxed ${theme.subText}`}>
                        {log.desc}
                    </p>
                  </div>

                  {/* "Open" Indicator */}
                  <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-2 rounded-full border border-cyan-500/30 text-cyan-500">
                          <ArrowUp className="rotate-45" size={20} />
                      </div>
                  </div>
                </div>
              </motion.div>

              {/* UPWARD ARROW CONNECTOR */}
              {index !== array.length - 1 && (
                <div className="h-16 flex flex-col items-center justify-center relative">
                  {/* Glowing Line */}
                  <div className={`absolute inset-y-0 w-[1px] bg-gradient-to-b ${theme.line}`} />
                  
                  {/* Up Arrow Animation */}
                  <motion.div
                    animate={{ y: [10, -10, 10], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className={`relative z-10 bg-slate-950 p-1.5 rounded-full border border-cyan-500/30 ${theme.arrow}`}
                  >
                    <ArrowUp size={16} />
                  </motion.div>
                </div>
              )}

            </React.Fragment>
          ))}
        </div>

        {/* MODAL POPUP (Restored & Responsive) */}
        <AnimatePresence>
          {selectedId && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
              />

              <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4">
                {CHANGELOG.filter(l => l.id === selectedId).map(log => (
                  <motion.div 
                    layoutId={selectedId} 
                    key={log.id}
                    initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    exit={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                    className={`pointer-events-auto w-full max-w-xl p-6 md:p-10 rounded-[2.5rem] border shadow-2xl relative overflow-hidden ${theme.modal}`}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedId(null); }} 
                      className="absolute top-6 right-6 p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                      <X size={24} />
                    </button>

                    <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                      <div className="p-5 bg-cyan-500/10 rounded-2xl shrink-0">
                        <log.icon size={36} className="text-cyan-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">{log.title}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 rounded-lg bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest">
                            {log.version}
                          </span>
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${theme.subText}`}>
                            <Calendar size={14} /> {log.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {log.changes.map((change, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx} 
                          className={`flex items-start gap-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}
                        >
                          <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <p className={`text-sm font-medium leading-relaxed ${theme.subText}`}>
                            {change}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}