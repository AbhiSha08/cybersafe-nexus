import React, { useEffect, useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

// --- PODIUM COMPONENT (Moved outside to prevent re-render bugs) ---
const PodiumUser = ({ user, rank, isDarkMode }) => {
  if (!user) return <div className="flex-1"></div>;
  
  let color = "text-slate-400";
  let height = "h-24"; // Taller bars
  let glow = "";
  let badgeColor = "bg-slate-700 text-slate-300";

  if (rank === 1) {
      color = "text-yellow-400";
      height = "h-32";
      glow = "shadow-[0_0_20px_rgba(250,204,21,0.4)] ring-2 ring-yellow-500";
      badgeColor = "bg-yellow-500 text-black";
  } else if (rank === 2) {
      color = "text-slate-300"; // Silver
      height = "h-28";
      badgeColor = "bg-slate-300 text-slate-900";
  } else if (rank === 3) {
      color = "text-amber-600"; // Bronze
      height = "h-24";
      badgeColor = "bg-amber-700 text-amber-100";
  }

  // Safe Name Handling
  const displayName = user.name ? user.name.split(' ')[0] : 'Unknown';

  return (
      <div className={`flex flex-col items-center justify-end ${rank === 1 ? '-mt-4 z-10' : ''}`}>
          <div className="flex flex-col items-center mb-3">
             <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-sm mb-2 relative ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} ${color} ${glow}`}>
                {displayName.charAt(0)}
                <div className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${badgeColor}`}>
                    #{rank}
                </div>
             </div>
             <p className={`text-[10px] font-bold truncate max-w-[80px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{displayName}</p>
             <p className="text-[9px] font-mono text-cyan-500 font-bold">{user.total_xp} XP</p>
          </div>
          {/* Podium Box */}
          <div className={`w-full rounded-t-xl flex items-start justify-center pt-2 ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-100/80'} ${height}`}>
              <div className={`font-black text-2xl opacity-30 ${color}`}>{rank}</div>
          </div>
      </div>
  );
};

export default function Leaderboard({ isDarkMode }) {
  const [leaders, setLeaders] = useState([]);
  const [category, setCategory] = useState('overall');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/lessons/leaderboard/top?category=${category}`);
        if (Array.isArray(res.data)) {
            setLeaders(res.data);
        } else {
            setLeaders([]);
        }
      } catch (err) { 
        console.error("Leaderboard Sync error:", err);
        setLeaders([]); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchLeaders();
  }, [category]);

  const theme = {
    container: isDarkMode 
      ? 'bg-slate-900/60 border border-slate-800 backdrop-blur-xl' 
      : 'bg-white/80 border border-slate-200 backdrop-blur-xl shadow-sm',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
  };

  return (
    <div className={`w-full p-6 rounded-[2rem] ${theme.container}`}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-1`}>Top Operatives</h3>
            <h2 className={`text-xl font-black ${theme.text}`}>Global Rankings</h2>
        </div>
        <Crown className="text-yellow-500 fill-yellow-500/20" size={24} />
      </div>

      {/* TABS (Rounded Pills) */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-slate-500/10 mb-8">
        {[['overall', 'All'], ['student', 'Cadets'], ['professional', 'Pros']].map(([id, label]) => (
          <button
            key={id} onClick={() => setCategory(id)}
            className={`w-full py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
            ${category === id ? 'bg-cyan-500 text-slate-900 shadow-md' : 'text-slate-500 hover:text-cyan-500 hover:bg-slate-500/5'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* --- PODIUM SECTION (TOP 3) --- */}
      {!loading && leaders.length > 0 ? (
          <div className="flex items-end justify-center gap-3 mb-8 px-2 pb-6 border-b border-dashed border-slate-700/30">
              <div className="flex-1 order-1"><PodiumUser user={leaders[1]} rank={2} isDarkMode={isDarkMode} /></div>
              <div className="flex-1 order-2"><PodiumUser user={leaders[0]} rank={1} isDarkMode={isDarkMode} /></div>
              <div className="flex-1 order-3"><PodiumUser user={leaders[2]} rank={3} isDarkMode={isDarkMode} /></div>
          </div>
      ) : (
          !loading && <div className="text-center py-10 text-xs text-slate-500">No active agents found.</div>
      )}

      {/* --- RUNNER UPS LIST (RANK 4+) --- */}
      <div className="space-y-1">
        {leaders.length > 3 && (
            <h4 className="text-[9px] font-black uppercase text-slate-500 mb-2 px-1">Runner Ups</h4>
        )}
        
        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
                <div className="text-center py-6 text-[10px] font-mono text-cyan-500 animate-pulse">SCANNING DATABASE...</div>
            ) : (
                leaders.slice(3).map((leader, index) => (
                <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={index + 3} 
                    className={`flex items-center justify-between p-3 rounded-xl hover:bg-slate-500/5 transition-colors group border border-transparent hover:border-slate-500/10`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`font-mono text-xs font-bold w-6 text-slate-500 opacity-50`}>
                            0{index + 4}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold bg-slate-800 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors`}>
                                {(leader.name || '?').charAt(0)}
                            </div>
                            <p className={`text-xs font-bold ${theme.text}`}>{leader.name || 'Unknown Agent'}</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-cyan-500 transition-colors font-mono">{leader.total_xp} XP</span>
                </motion.div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}