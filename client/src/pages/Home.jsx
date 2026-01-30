import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, BookOpen, Award, Newspaper, Target, Cpu, 
  Fingerprint, BarChart3, Terminal, ArrowRight, Code, User, ChevronRight, ChevronLeft, LayoutDashboard
} from 'lucide-react';

export default function Home({ isDarkMode }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // --- AUTH CHECK ---
  const isLoggedIn = !!localStorage.getItem('token');

  // Scroll/Swipe Throttling
  const lastScrollTime = useRef(0);
  const SCROLL_COOLDOWN = 500; 

  const modules = [
    { id: 'courseware', icon: BookOpen, title: "COURSEWARE", desc: "Interactive learning covering CIA Fundamentals, Network Security, and Forensics.", path: "/dashboard", color: "text-indigo-500" },
    { id: 'siem', icon: BarChart3, title: "SIEM Audit Trail", desc: "Experience real-time threat monitoring and incident response tracking.", path: "/tools", color: "text-purple-500" },
    { id: 'phishing', icon: Target, title: "Phishing Analyzer", desc: "Deploy controlled phishing simulations and analyze email headers.", path: "/tools", color: "text-orange-500" },
    { id: 'credentials', icon: Award, title: "Digital Credentials", desc: "View your earned badges, certificates, and operative clearance level.", path: "/profile", color: "text-emerald-500" },
    { id: 'intel', icon: Newspaper, title: "News/Intel", desc: "Real-time global security news, exploit alerts, and disclosures.", path: "/news", color: "text-blue-500" }
  ];

  const nextCard = () => {
    const now = Date.now();
    if (now - lastScrollTime.current > SCROLL_COOLDOWN) {
      setActiveIndex((prev) => (prev + 1) % modules.length);
      lastScrollTime.current = now;
    }
  };

  const prevCard = () => {
    const now = Date.now();
    if (now - lastScrollTime.current > SCROLL_COOLDOWN) {
      setActiveIndex((prev) => (prev - 1 + modules.length) % modules.length);
      lastScrollTime.current = now;
    }
  };

  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > 20) {
      if (e.deltaX > 0) nextCard();
      else prevCard();
    }
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -50) nextCard();
    else if (info.offset.x > 50) prevCard();
  };

  const theme = {
    text: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    heading: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    cardBg: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl',
    accent: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
  };

  const getCardStyle = (index) => {
    const total = modules.length;
    let offset = (index - activeIndex + total) % total;
    if (offset > total / 2) offset -= total; 

    const style = { pointerEvents: 'none', display: 'flex' };

    if (offset === 0) return { ...style, x: 0, scale: 1, zIndex: 30, opacity: 1, rotateY: 0, pointerEvents: 'auto' };
    else if (offset === 1) return { ...style, x: '35%', scale: 0.85, zIndex: 20, opacity: 0.7, rotateY: -5, pointerEvents: 'auto' };
    else if (offset === -1) return { ...style, x: '-35%', scale: 0.85, zIndex: 20, opacity: 0.7, rotateY: 5, pointerEvents: 'auto' };
    else if (offset === 2 || offset === -3) return { ...style, x: '65%', scale: 0.70, zIndex: 10, opacity: 0.4, rotateY: -10, pointerEvents: 'auto' };
    else if (offset === -2 || offset === 3) return { ...style, x: '-65%', scale: 0.70, zIndex: 10, opacity: 0.4, rotateY: 10, pointerEvents: 'auto' };
    else return { ...style, x: 0, scale: 0, zIndex: 0, opacity: 0, display: 'none' };
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 font-sans overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20 md:mb-24 px-2"
      >
        <h1 className={`flex flex-col md:block items-center justify-center font-black mb-6 md:mb-8 tracking-tighter leading-none ${theme.heading}`}>
            <span className="text-3xl sm:text-5xl md:text-6xl tracking-[0.2em] md:tracking-normal mb-2 md:mb-0 md:mr-4">CYBERSAFE</span>
            <span className="relative inline-block">
              {/* FIX: Massive NEXUS text */}
              <span className="text-6xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">NEXUS</span>
              <motion.span 
                animate={{ opacity: [0, 1, 0], x: [2, -2, 2] }}
                transition={{ repeat: Infinity, duration: 0.1, repeatDelay: 4 }}
                className="absolute inset-0 text-cyan-400 opacity-50 blur-[2px] hidden sm:block"
                style={{ clipPath: 'inset(10% 0 10% 0)' }}
              >
                NEXUS
              </motion.span>
            </span>
        </h1>

        <p className={`text-base sm:text-xl md:text-2xl max-w-3xl mx-auto mb-10 md:mb-12 font-medium leading-relaxed ${theme.text}`}>
          <span className="opacity-50 font-mono text-cyan-500 mr-2 block sm:inline">[SYSTEM_READY]</span>
          A Unified Cybersecurity Learning, Monitoring & Attack Simulation Platform.
        </p>

        <div className="flex justify-center w-full">
          {isLoggedIn ? (
             <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all active:scale-95 flex items-center justify-center gap-3">
                <LayoutDashboard size={24} /> Access Command Center
             </Link>
          ) : (
             <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-lg text-center hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95">
                    Initialize Access
                </Link>
                <Link to="/login" className={`w-full sm:w-auto px-8 py-4 rounded-2xl border-2 font-black text-lg text-center transition-all ${isDarkMode ? 'border-slate-800 text-white hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    Operative Login
                </Link>
             </div>
          )}
        </div>
      </motion.div>

      {/* 2. THE NEXUS INITIATIVE */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={`mb-24 md:mb-32 p-6 md:p-16 rounded-[2rem] md:rounded-[2.5rem] border ${theme.cardBg} relative overflow-hidden`}
      >
        <div className="absolute -top-24 -right-24 w-64 md:w-96 h-64 md:h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="lg:w-3/5">
            <h2 className={`text-3xl md:text-4xl font-black mb-6 md:mb-8 flex items-center gap-3 md:gap-4 ${theme.heading}`}>
              <Shield className={theme.accent} size={32} /> The Nexus Initiative
            </h2>
            <p className={`text-base md:text-lg leading-relaxed mb-8 ${theme.text}`}>
              Developed as a <strong>Final Year Project for Mumbai University</strong>, CyberSafe Nexus bridges the gap 
              between theoretical concepts and real-world security operations.
            </p>
            
            <div className={`p-6 md:p-8 rounded-3xl border-l-4 md:border-l-8 border-cyan-500 ${isDarkMode ? 'bg-slate-950/50' : 'bg-cyan-50/50'} mb-8`}>
              <h3 className={`text-xl md:text-2xl font-black mb-4 ${theme.heading}`}>Mission & Vision</h3>
              <p className={`font-medium text-base md:text-lg mb-4 ${theme.text}`}>
                "Democratizing cybersecurity education through practical simulation."
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-cyan-500 mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"/> Tech Stack
                  </h4>
                  <p className={`text-sm ${theme.text}`}>React, FastAPI, MongoDB Atlas, Google Gemini AI</p>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-500 mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-500 animate-pulse"/> Capabilities
                  </h4>
                  <p className={`text-sm ${theme.text}`}>SQLi Labs, Phishing Analysis, & Live SIEM</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/5 grid grid-cols-2 gap-4 w-full">
            {[
              { icon: Terminal, label: 'Simulation', color: 'text-cyan-500' },
              { icon: BarChart3, label: 'Analytics', color: 'text-purple-500' },
              { icon: Cpu, label: 'AI-Aided', color: 'text-blue-500' },
              { icon: Fingerprint, label: 'Forensics', color: 'text-emerald-500' }
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-3xl border ${theme.cardBg} flex flex-col items-center justify-center text-center aspect-square`}>
                <item.icon className={`${item.color} mb-3`} size={32} />
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${theme.heading}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 3. COMMAND CENTER (CAROUSEL) */}
      <div className="mb-24 md:mb-40">
        <div className="text-center mb-10 md:mb-16">
          <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tight ${theme.heading}`}>Command Center</h2>
          <div className="flex items-center justify-center gap-4">
             <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-cyan-500" />
             <p className={`text-xs md:text-lg font-mono uppercase tracking-widest ${theme.text}`}>Tactical_Modules</p>
             <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-cyan-500" />
          </div>
        </div>

        {/* --- CAROUSEL CONTAINER --- */}
        <motion.div 
            className="relative h-[400px] md:h-[450px] w-full mx-auto flex items-center justify-center perspective-1000 cursor-grab active:cursor-grabbing overflow-hidden md:overflow-visible"
            onWheel={handleWheel}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
        >
            {modules.map((item, index) => {
              const style = getCardStyle(index);
              
              return (
                <motion.div
                  key={item.id}
                  className={`absolute w-[90%] md:w-[600px] h-[350px] md:h-[400px] p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border backdrop-blur-md ${theme.cardBg} flex flex-col justify-between shadow-2xl transition-shadow duration-300`}
                  animate={style}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  onClick={(e) => {
                      e.stopPropagation();
                      if (style.zIndex === 30) navigate(item.path);
                      else if (style.x.toString().includes('35%') || style.x.toString().includes('65%')) nextCard();
                      else prevCard();
                  }}
                >
                    {/* Card Content */}
                    <div>
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-cyan-50'}`}>
                                <item.icon className={`w-6 h-6 md:w-8 md:h-8 ${item.color}`} />
                            </div>
                            <div className={`p-2 md:p-3 rounded-full border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                                <ArrowRight className={theme.text} size={16} />
                            </div>
                        </div>
                        <h3 className={`text-2xl md:text-3xl font-black mb-3 md:mb-4 ${theme.heading}`}>{item.title}</h3>
                        <p className={`text-sm md:text-lg leading-relaxed ${theme.text} line-clamp-3`}>{item.desc}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`h-1.5 flex-1 rounded-full ${index === activeIndex ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                        <span className="text-[10px] font-black uppercase text-slate-500">
                             0{index + 1}
                        </span>
                    </div>
                </motion.div>
              );
            })}
        </motion.div>

        {/* Navigation Controls */}
        <div className="flex justify-center gap-6 mt-6 md:mt-4">
            <button 
                onClick={prevCard}
                className={`p-3 md:p-4 rounded-full border transition-all ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-700'}`}
            >
                <ChevronLeft size={20} />
            </button>
            <button 
                onClick={nextCard}
                className="p-3 md:p-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/30 transition-all"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {/* 4. PROJECT ARCHITECTURE FOOTER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className={`mt-24 md:mt-32 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-50'}`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 ${theme.heading}`}>
              Project Architecture
            </h2>
            <p className={`text-xs md:text-sm font-medium ${theme.text} max-w-xl leading-relaxed`}>
              CyberSafe Nexus is an academic initiative engineered by the Final Year B.Sc. Computer Science cohort. 
              Designed to simulate enterprise-grade security environments for educational purposes.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {['Frontend', 'Backend', 'Creators'].map((label, i) => (
               <div key={i} className={`p-3 md:p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'} group cursor-help flex flex-col items-center min-w-[80px]`}>
                  {i === 0 && <Code size={20} className="text-cyan-500 mb-1" />}
                  {i === 1 && <Terminal size={20} className="text-emerald-500 mb-1" />}
                  {i === 2 && <User size={20} className="text-purple-500 mb-1" />}
                  <span className={`text-[9px] font-bold uppercase ${theme.text}`}>{label}</span>
               </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700/20 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest opacity-60 text-center gap-2">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
            Mumbai University // Batch 2026
          </motion.span>
          <span>Dept. of Computer Science</span>
        </div>
      </motion.div>

    </div>
  );
}