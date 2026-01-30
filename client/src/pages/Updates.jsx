import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitCommit, Calendar, CheckCircle, Server, Code, 
  FileText, ShieldCheck, User, Globe, 
  ArrowUp, X, LayoutGrid, KeyRound 
} from 'lucide-react';

// --- FULL CHANGELOG ---
const CHANGELOG = [
  {
    id: "v2.5",
    version: "v2.5.0",
    date: "Jan 29, 2026",
    title: "System Hardening & UX Overhaul",
    icon: KeyRound,
    desc: "Real-time security ops, enhanced profile management, and global intel integration.",
    changes: [
      "Deployed Real-Time Password Recovery (Console/Email Simulation).",
      "Integrated Local Storage Profile Picture Upload (WhatsApp-style).",
      "Refactored Navbar with Wikipedia-powered Global Intel Search.",
      "Optimized Dashboard layout: 4-Column Grid & Sidebar Leaderboard.",
      "Enhanced 'Forgot Password' flow with in-app token handling."
    ]
  },
  {
    id: "v2.4",
    version: "v2.4.0",
    date: "Jan 26, 2026",
    title: "Identity & Profile Ops",
    icon: User,
    desc: "User profile management with secure editing.",
    changes: [
      "Deployed 'Operative Profile' page with Avatar support.",
      "Implemented Secure Edit Mode: Password verification required.",
      "Added 'Live Preview' for profile image URLs.",
      "Visual overhaul of Stats & Credentials cards."
    ]
  },
  {
    id: "v2.3",
    version: "v2.3.0",
    date: "Jan 26, 2026",
    title: "Tactical Dashboard 2.0",
    icon: LayoutGrid,
    desc: "New Topic Tracks & Compact Grid Layout.",
    changes: [
      "Replaced levels with 5 Tracks: Hygiene, Crypto, Malware, Web, Red Team.",
      "Migrated to a 3-Column Grid for maximum density.",
      "Redesigned Lesson Cards to be horizontal.",
      "Implemented dynamic filtering for specialized topics."
    ]
  },
  {
    id: "v2.2",
    version: "v2.2.0",
    date: "Jan 25, 2026",
    title: "Lesson Interface Refactor",
    icon: FileText,
    desc: "Compact headers and unified reading experience.",
    changes: [
      "Removed large headers for a slim metadata navbar.",
      "Standardized UI blocks for Objectives and Key Concepts.",
      "Reduced vertical padding to minimize scrolling."
    ]
  },
  {
    id: "v2.1",
    version: "v2.1.0",
    date: "Jan 25, 2026",
    title: "Global Intel Search",
    icon: Globe,
    desc: "Integrated Wikipedia API for instant definitions.",
    changes: [
      "Replaced local AI search with Wikipedia API.",
      "Added instant search dropdown in the Navbar.",
      "Enabled 'Quick Brief' view for search results."
    ]
  },
  {
    id: "v2.0",
    version: "v2.0.0",
    date: "Jan 24, 2026",
    title: "Nexus Security Update",
    icon: ShieldCheck,
    desc: "RBAC and Root Command Center.",
    changes: [
      "Implemented Role-Based Access Control (Student/Admin).",
      "Deployed Root Command Center for user management.",
      "Integrated Live Intel Broadcasts ticker."
    ]
  },
  {
    id: "v1.5",
    version: "v1.5.0",
    date: "Jan 23, 2026",
    title: "Cloud Deployment",
    icon: Server,
    desc: "Production launch on Render & Vercel.",
    changes: [
      "Backend deployed to Render (FastAPI).",
      "Frontend hosted on Vercel.",
      "Database migrated to MongoDB Atlas Cloud."
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