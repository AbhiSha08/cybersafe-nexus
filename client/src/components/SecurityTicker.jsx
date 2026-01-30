import React, { useState, useEffect } from 'react';
import { Shield, Zap, Lock, AlertTriangle, Trophy } from 'lucide-react';
import api from '../../api'; // Adjusted path

export default function SecurityTicker({ isDarkMode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [dynamicItems, setDynamicItems] = useState([]);

  // --- 1. THE COOL STATIC TIPS ---
  const STATIC_INTEL = [
    { icon: Shield, text: "TIP: Use unique passwords. Managers like Bitwarden make it easy.", color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
    { icon: Lock, text: "ALERT: Enable 2FA! It stops 99.9% of automated attacks.", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
    { icon: AlertTriangle, text: "THREAT: Phishing attempts up 400% via SMS ('Smishing').", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
    { icon: Zap, text: "FACT: A 12-char password takes centuries to crack.", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  ];

  // --- 2. FETCH REAL DATA ---
  useEffect(() => {
    const fetchLiveIntel = async () => {
      try {
        const res = await api.get('/api/lessons/leaderboard/top?limit=1');
        const topCadet = res.data[0];
        
        // Create a special Gold Item for the Leader
        const leaderItem = topCadet ? {
            icon: Trophy,
            text: `LEADERBOARD: ${topCadet.name} is #1 with ${topCadet.total_xp} XP!`,
            color: "text-yellow-400",
            border: "border-yellow-500/50",
            bg: "bg-yellow-500/10"
        } : null;

        setDynamicItems(leaderItem ? [leaderItem] : []);
      } catch (err) {
        // Silent fail? No problem, we have static intel.
      }
    };
    fetchLiveIntel();
  }, []);

  // Merge Real Data + Static Data
  const tickerItems = [...dynamicItems, ...STATIC_INTEL, ...STATIC_INTEL]; 

  return (
    // FIX: Reduced height to h-8 on mobile, h-10 on desktop. Added select-none.
    <div 
      className={`relative w-full h-8 md:h-10 border-b flex items-center overflow-hidden z-40 transition-colors duration-300 font-mono text-[10px] md:text-xs select-none
      ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* --- LEFT LABEL (GLITCH EFFECT) --- */}
      <div className={`h-full px-3 md:px-4 flex items-center gap-2 md:gap-3 border-r z-20 relative overflow-hidden shrink-0
        ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        
        {/* Pulsing Red Dot */}
        <div className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500"></span>
        </div>

        {/* Glitch Text */}
        <div className="font-black tracking-[0.2em] relative group">
          <span className={isDarkMode ? 'text-cyan-500' : 'text-blue-600'}>
            NEXUS<span className="hidden sm:inline">_INTEL</span>
          </span>
        </div>
        
        {/* Diagonal Scanline Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* --- SCROLLING CONTENT --- */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        {/* Gradient Fade Edges */}
        <div className={`absolute left-0 top-0 bottom-0 w-4 md:w-8 z-10 bg-gradient-to-r ${isDarkMode ? 'from-slate-950 to-transparent' : 'from-white to-transparent'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-4 md:w-8 z-10 bg-gradient-to-l ${isDarkMode ? 'from-slate-950 to-transparent' : 'from-white to-transparent'}`} />

        <div className={`flex items-center whitespace-nowrap ${isHovered ? 'paused' : 'animate-marquee'}`}>
          {tickerItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-2 mx-2 md:mx-4 px-2 md:px-3 py-0.5 md:py-1 rounded-md border ${item.border} ${item.bg} ${item.color} transition-all duration-300 hover:scale-105 hover:brightness-125`}
              >
                <Icon size={10} strokeWidth={3} className="md:w-3 md:h-3" />
                <span className="font-bold tracking-tight uppercase">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .paused {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Mobile speed adjustment */
        @media (max-width: 768px) {
            .animate-marquee {
                animation-duration: 30s; /* Faster on mobile since less distance */
            }
        }
      `}</style>
    </div>
  );
}