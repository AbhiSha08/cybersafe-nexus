import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitCommit, Calendar, CheckCircle, Server, Code, 
  FileText, ShieldCheck, User, Globe, 
  ArrowRight, X, LayoutGrid, KeyRound 
} from 'lucide-react';

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
    arrow: isDarkMode ? 'text-cyan-500/30' : 'text-cyan-600/20'
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 overflow-x-hidden ${theme.bg} ${theme.text}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <motion.header 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-2 flex items-center gap-3">
            <GitCommit className="text-cyan-500" /> 
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Evolution</span>
          </h1>
          <p className={`${theme.subText} text-[10px] font-black uppercase tracking-[0.3em]`}>
            Transmission History // Update_Protocol_Active
          </p>
        </motion.header>

        {/* CHRONOLOGICAL FLOW GRID */}
        <div className="relative flex flex-row flex-wrap gap-6 items-center justify-center lg:justify-start">
          
          {/* SMOOTH DATA FLOW PACKET LOOP */}
          {/* Moves from left (start of chronological row) to right */}
          <motion.div
            initial={{ left: "0%", opacity: 0 }}
            animate={{ 
              left: ["0%", "100%"],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/2 -translate-y-1/2 h-[2px] w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px] z-0 hidden lg:block"
          />

          {/* Render in Reverse Chronological Order (Latest First) */}
          {[...CHANGELOG].map((log, index, array) => (
            <React.Fragment key={log.id}>
              
              {/* COMPACT CARD */}
              <motion.div 
                layoutId={log.id} 
                onClick={() => setSelectedId(log.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative w-72 h-44 p-6 rounded-[2rem] border cursor-pointer group transition-all duration-300 z-10 ${theme.card}`}
                whileHover={{ y: -8, boxShadow: "0 0 20px rgba(6,182,212,0.15)" }}
              >
                {/* Status Indicator for Latest Release */}
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-cyan-500 border-4 border-slate-950 flex items-center justify-center text-[8px] font-black text-white">LIVE</span>
                  </div>
                )}

                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                        <log.icon size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{log.version}</span>
                    </div>
                    <h3 className="font-black text-lg leading-tight group-hover:text-cyan-500 transition-colors">{log.title}</h3>
                  </div>
                  <p className="text-xs opacity-60 line-clamp-2 mt-2 font-medium leading-relaxed">{log.desc}</p>
                </div>
              </motion.div>

              {/* CHRONOLOGICAL ARROW */}
              {index !== array.length - 1 && (
                <div className="hidden xl:block">
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <ArrowRight size={20} className={theme.arrow} />
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* MODAL POPUP */}
        <AnimatePresence>
          {selectedId && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
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
                    className={`pointer-events-auto w-full max-w-xl p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden ${theme.modal}`}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedId(null); }} 
                      className="absolute top-6 right-6 p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>

                    <div className="flex items-center gap-5 mb-8">
                      <div className="p-4 bg-cyan-500/10 rounded-2xl">
                        <log.icon size={32} className="text-cyan-500" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">{log.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="px-3 py-1 rounded-lg bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest">
                            {log.version}
                          </span>
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${theme.subText}`}>
                            <Calendar size={14} /> {log.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
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