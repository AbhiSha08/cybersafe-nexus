import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Loader, ShieldAlert, Zap, 
  ShieldCheck, Binary, Play, BookOpen 
} from 'lucide-react';
import api from '../api';
import { useUIContext } from '../contexts/UIContext';
import Leaderboard from '../components/UIcomponents/Leaderboard'; // Ensure correct path

export default function Dashboard({ isDarkMode }) {
  const navigate = useNavigate();
  const { setDashboardStats, dashboardStats } = useUIContext();
  
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!localStorage.getItem('token');

  const fetchDashboardData = async () => {
    try {
      const lessonsRes = await api.get('/lessons');
      setLessons(lessonsRes.data);

      if (isLoggedIn) {
        const profileRes = await api.get('/users/me');
        const data = profileRes.data.user; 
        setDashboardStats({
          ...data,
          xp: profileRes.data.total_xp,
          streak: profileRes.data.daily_streak,
          role: data.role 
        });
      }
    } catch (error) {
      console.error("Nexus Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isLoggedIn]);

  // SORT LESSONS
  const sortedLessons = useMemo(() => {
    return lessons.sort((a, b) => {
        const numA = parseInt(a.id.split('_')[1] || 999);
        const numB = parseInt(b.id.split('_')[1] || 999);
        return numA - numB;
    });
  }, [lessons]);

  const handleRestrictedAction = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      alert("⚠️ ACCESS DENIED: Initialize your cadet profile to unlock tactical modules.");
      navigate('/register');
    }
  };

  const theme = {
    bg: 'bg-transparent',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    card: isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-600 backdrop-blur-sm' : 'bg-white/80 border-slate-200 shadow-sm hover:border-cyan-400 backdrop-blur-sm',
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent font-mono">
      <Loader className="animate-spin text-cyan-500 mb-4" size={32} />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Syncing...</p>
    </div>
  );

  return (
    // FIX: Using min-h-[100dvh] for mobile full height
    <div className={`min-h-[100dvh] transition-colors duration-500 ${theme.bg}`}>
      
      <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-8 pt-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-wide ${theme.text}`}>
              {isLoggedIn ? `Welcome, ${dashboardStats?.name || 'Operative'}` : 'CyberSafe Nexus'}
            </h1>
            <p className={`text-xs md:text-sm font-medium ${theme.subText} mt-1`}>
              Complete the modules in order to advance your clearance level.
            </p>
          </div>
          {isLoggedIn && dashboardStats?.role === 'admin' && (
            <Link to="/admin" className="self-start lg:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors">
              <ShieldAlert size={14} /> Root Access
            </Link>
          )}
        </div>

        {/* MAIN LAYOUT GRID (Stack on mobile, 12-col on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* MODULES (9 cols) */}
            <div className="lg:col-span-9 space-y-6 order-2 lg:order-1">
                
                {/* 1-Col Mobile, 2-Col Tablet, 4-Col Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedLessons.map((l, index) => (
                        <button 
                            key={l.id} 
                            onClick={(e) => isLoggedIn ? navigate(`/lesson/${l.id}`) : handleRestrictedAction(e)}
                            className={`relative overflow-hidden flex flex-col justify-between p-5 rounded-2xl border text-left group transition-all h-48 ${theme.card}`}
                        >
                            <span className={`absolute -bottom-6 -right-2 text-8xl font-black opacity-5 group-hover:opacity-10 transition-opacity ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                {index + 1}
                            </span>

                            <div className="relative z-10">
                                <div className={`w-8 h-8 mb-3 rounded-lg flex items-center justify-center bg-slate-500/10 text-slate-400`}>
                                    {index === 0 ? <Shield size={16}/> : 
                                     index === 1 ? <ShieldAlert size={16}/> :
                                     index === 2 ? <ShieldCheck size={16}/> :
                                     index === 3 ? <Binary size={16}/> :
                                     index === 4 ? <Zap size={16}/> :
                                     <BookOpen size={16}/>
                                    }
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-wider opacity-70 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Module 0{index + 1}
                                </span>
                                <h3 className={`text-sm font-bold leading-tight ${theme.text} group-hover:text-cyan-400 transition-colors mt-1 line-clamp-2`}>
                                    {l.title.replace(/Module \d+: /, "")}
                                </h3>
                            </div>

                            <div className={`relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide mt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                                Start Mission <Play size={10} fill="currentColor" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* LEADERBOARD (3 cols) */}
            <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
                <Leaderboard isDarkMode={isDarkMode} />
            </div>

        </div>
      </div>
    </div>
  );
}