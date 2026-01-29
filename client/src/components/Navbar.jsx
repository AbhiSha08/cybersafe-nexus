import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sun, Moon, LogOut, Menu, X, 
  Terminal, Newspaper, Settings, Home, BarChart3, Search, Globe, ExternalLink, History, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusLogo from './NexusLogo';

export default function Navbar({ isDarkMode, toggleTheme }) {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('nexus_search_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    localStorage.setItem('nexus_search_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- WIKIPEDIA SEARCH (Frontend Only) ---
  const performSearch = async (query) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setShowHistory(false);
    setSearchResults(null);
    
    try {
      // Wiki API with CORS fix (origin=*)
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=5&srsearch=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.query && data.query.search.length > 0) {
        // Return top 5 results
        setSearchResults(data.query.search);

        // Update History (Limit 5)
        setHistory(prev => {
          const filtered = prev.filter(item => item !== query);
          return [query, ...filtered].slice(0, 5);
        });
      } else {
        setSearchResults([]); // Empty array means "No Intel Found"
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const theme = {
    nav: isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-gray-200',
    text: isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900',
    active: isDarkMode ? 'bg-slate-800 text-cyan-400 border-cyan-500/30' : 'bg-gray-100 text-teal-600 border-teal-200',
    searchBg: isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    dropdown: isDarkMode ? 'bg-slate-900 border-slate-700 shadow-cyan-900/20' : 'bg-white border-slate-200 shadow-xl',
  };

  // Glitch Animation for Dropdowns
  const glitchExit = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } }
  };

  // PRESERVED NAV ITEM SIZING
  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all border border-transparent ${
          isActive ? theme.active : theme.text
        }`
      }
    >
      {Icon && <Icon size={16} />}
      <span className="hidden xl:inline">{label}</span>
    </NavLink>
  );

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-md w-full overflow-visible ${theme.nav}`}>
      
      {/* --- CYBER GRID BACKGROUND --- */}
      <div className={`absolute inset-0 z-0 pointer-events-none opacity-20`}>
         <div className={`absolute inset-0 cyber-grid ${!isDarkMode ? 'light-mode' : ''}`}></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* BRAND */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0 group" onClick={() => navigate('/')}>
            <span className={`hidden lg:block text-xs font-black uppercase tracking-[0.2em] transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              CyberSafe
            </span>
            <NexusLogo className="w-8 h-8 md:w-9 md:h-9 group-hover:scale-110 transition-transform duration-300" />
            <span className={`text-xl md:text-2xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              NEXUS
            </span>
          </div>

          {/* SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-sm relative" ref={searchRef}>
            <form onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery); }} className="w-full">
              <div className={`relative flex items-center w-full rounded-2xl border px-4 py-1.5 transition-all overflow-hidden ${theme.searchBg} ${isSearching ? 'border-cyan-500/50' : ''}`}>
                
                {isSearching && (
                  <motion.div 
                    initial={{ left: '-100%' }}
                    animate={{ left: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                  />
                )}

                <Search size={16} className={`${isSearching ? 'text-cyan-500' : 'text-slate-500'} mr-2`} />

                <input 
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowHistory(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isSearching ? "Decrypting..." : "Search Wiki Intel..."}
                  className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder-slate-500 relative z-10"
                />

                {searchQuery && !isSearching && (
                  <button 
                    type="button" 
                    onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                    className="shrink-0 ml-1 p-1 -mr-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all z-20"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
            </form>

            <AnimatePresence>
              {/* HISTORY */}
              {showHistory && history.length > 0 && !searchResults && !isSearching && (
                <motion.div 
                  initial="initial" animate="animate" exit="exit" variants={glitchExit}
                  className={`absolute top-12 left-0 right-0 p-2 rounded-2xl border shadow-2xl z-[100] ${theme.dropdown}`}
                >
                  <div className="flex justify-between items-center px-3 py-1 mb-1 border-b border-slate-500/10 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <History size={12}/> Recent
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setHistory([]); }} className="text-[9px] font-bold text-red-500 hover:underline uppercase">Wipe</button>
                  </div>
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSearchQuery(item); performSearch(item); }}
                      className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400' : 'hover:bg-slate-100 text-slate-700'}`}
                    >
                      <Search size={12} className="opacity-40" /> {item}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* RESULTS */}
              {searchResults && searchResults.length > 0 && (
                <motion.div 
                  initial="initial" animate="animate" exit="exit" variants={glitchExit}
                  className={`absolute top-12 left-0 right-0 p-3 rounded-2xl border shadow-2xl z-[100] ${theme.dropdown}`}
                >
                  <div className="flex justify-between items-start mb-2 px-2">
                      <div className="text-cyan-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Globe size={12}/> External Intel (Wiki)
                      </div>
                      <button onClick={() => setSearchResults(null)} className="hover:text-red-500 text-slate-500"><X size={14}/></button>
                  </div>
                  
                  {searchResults.map((result, idx) => (
                    <a
                      key={idx}
                      href={`https://en.wikipedia.org/?curid=${result.pageid}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`block w-full text-left px-3 py-2.5 rounded-xl mb-1 last:mb-0 transition-colors group ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                        <div className="flex justify-between items-center">
                            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200 group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-cyan-600'}`}>{result.title}</p>
                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500"/>
                        </div>
                        <p className={`text-[10px] mt-0.5 line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            {result.snippet.replace(/<[^>]*>?/gm, '')}
                        </p>
                    </a>
                  ))}
                </motion.div>
              )}

              {/* NO RESULTS */}
              {searchResults && searchResults.length === 0 && !isSearching && (
                 <motion.div initial="initial" animate="animate" exit="exit" variants={glitchExit} className={`absolute top-12 left-0 right-0 p-4 rounded-2xl border shadow-xl z-[100] text-center ${theme.dropdown}`}>
                    <p className="text-xs font-bold text-slate-500">No matching intel found.</p>
                 </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TABS (PRESERVED SIZING) */}
          <div className="hidden lg:flex items-center gap-x-1">
            <NavItem to="/" label="Home" icon={Home} />
            <NavItem to="/dashboard" label="Dashboard" icon={BarChart3} />
            <NavItem to="/tools" label="Tools" icon={Terminal} />
            <NavItem to="/news" label="Intel" icon={Newspaper} />
            <NavItem to="/updates" label="Updates" icon={Settings} />
          </div>

          {/* PROFILE / LOGOUT */}
          <div className="flex items-center gap-3 shrink-0 border-l border-slate-800/20 pl-4">
            {isLoggedIn ? (
              <>
                <div onClick={() => navigate('/profile')} className="flex flex-col items-end cursor-pointer group">
                  <span className={`text-sm font-black uppercase tracking-tight group-hover:text-cyan-500 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                    {user?.name?.split(' ')[0] || 'Operative'}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">{user?.role || 'User'}</span>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"><LogOut size={18} /></button>
              </>
            ) : (
              <NavLink to="/login" className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-2xl text-xs font-black uppercase">Join</NavLink>
            )}
            <button onClick={toggleTheme} className={`p-2 ${theme.text}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}