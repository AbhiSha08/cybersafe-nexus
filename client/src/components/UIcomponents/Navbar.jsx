import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Sun, Moon, LogOut, 
  Terminal, Newspaper, Settings, Home, BarChart3, Search, Globe, ExternalLink, History, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusLogo from './NexusLogo';

export default function Navbar({ isDarkMode, toggleTheme }) {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Search State
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

  // Navigation Config
  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/tools', label: 'Tools', icon: Terminal },
    { path: '/news', label: 'Intel', icon: Newspaper },
    { path: '/updates', label: 'Updates', icon: Settings },
  ];

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

  const performSearch = async (query) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setShowHistory(false);
    setSearchResults(null);
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=5&srsearch=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data.query && data.query.search.length > 0) {
        setSearchResults(data.query.search);
        setHistory(prev => {
          const filtered = prev.filter(item => item !== query);
          return [query, ...filtered].slice(0, 5);
        });
      } else {
        setSearchResults([]);
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
    mobileIconActive: 'text-cyan-500 bg-cyan-500/10',
    mobileIconInactive: isDarkMode ? 'text-slate-500' : 'text-slate-400'
  };

  const glitchExit = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-md w-full overflow-visible transition-colors ${theme.nav}`}>
       {/* --- CYBER GRID BACKGROUND --- */}
       <div className={`absolute inset-0 z-0 pointer-events-none opacity-20`}>
           <div className={`absolute inset-0 cyber-grid ${!isDarkMode ? 'light-mode' : ''}`}></div>
       </div>

       <div className="max-w-[1600px] mx-auto px-4 lg:px-6 relative z-10">
         
         {/* --- TOP ROW: BRAND & CONTROLS --- */}
         <div className="flex h-16 items-center justify-between gap-4">
           
           {/* BRAND */}
           <div className="flex items-center gap-3 cursor-pointer shrink-0 group" onClick={() => navigate('/')}>
             <NexusLogo className="w-8 h-8 md:w-9 md:h-9 group-hover:scale-110 transition-transform duration-300" />
             <span className={`text-xl md:text-2xl font-black tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               NEXUS
             </span>
           </div>

           {/* DESKTOP NAV (Hidden on Mobile) */}
           {!isMobile && (
             <div className="flex items-center gap-x-1">
               {navLinks.map((link) => (
                 <NavLink
                   key={link.path}
                   to={link.path}
                   className={({ isActive }) => `flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all border border-transparent ${isActive ? theme.active : theme.text}`}
                 >
                   <link.icon size={16} />
                   <span>{link.label}</span>
                 </NavLink>
               ))}
             </div>
           )}

           {/* SEARCH BAR (Desktop Only) */}
           {!isMobile && (
             <div className="flex-1 max-w-sm relative" ref={searchRef}>
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
                      <button type="button" onClick={() => { setSearchQuery(''); setSearchResults(null); }} className="shrink-0 ml-1 p-1 -mr-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all z-20">
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </form>
                {/* Search Logic (Hidden on mobile here, moved below) */}
                {/* ... (Same search result dropdown code as desktop) ... */}
                <AnimatePresence>
                  {showHistory && history.length > 0 && !searchResults && !isSearching && (
                    <motion.div initial="initial" animate="animate" exit="exit" variants={glitchExit} className={`absolute top-12 left-0 right-0 p-2 rounded-2xl border shadow-2xl z-[100] ${theme.dropdown}`}>
                       <div className="flex justify-between items-center px-3 py-1 mb-1 border-b border-slate-500/10 pb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><History size={12}/> Recent</span>
                         <button onClick={(e) => { e.stopPropagation(); setHistory([]); }} className="text-[9px] font-bold text-red-500 hover:underline uppercase">Wipe</button>
                       </div>
                       {history.map((item, idx) => (
                         <button key={idx} onClick={() => { setSearchQuery(item); performSearch(item); }} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400' : 'hover:bg-slate-100 text-slate-700'}`}>
                           <Search size={12} className="opacity-40" /> {item}
                         </button>
                       ))}
                    </motion.div>
                  )}
                  {searchResults && searchResults.length > 0 && (
                    <motion.div initial="initial" animate="animate" exit="exit" variants={glitchExit} className={`absolute top-12 left-0 right-0 p-3 rounded-2xl border shadow-2xl z-[100] ${theme.dropdown}`}>
                       <div className="flex justify-between items-start mb-2 px-2">
                          <div className="text-cyan-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> External Intel (Wiki)</div>
                          <button onClick={() => setSearchResults(null)} className="hover:text-red-500 text-slate-500"><X size={14}/></button>
                       </div>
                       {searchResults.map((result, idx) => (
                         <a key={idx} href={`https://en.wikipedia.org/?curid=${result.pageid}`} target="_blank" rel="noreferrer" className={`block w-full text-left px-3 py-2.5 rounded-xl mb-1 last:mb-0 transition-colors group ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                            <div className="flex justify-between items-center">
                                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200 group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-cyan-600'}`}>{result.title}</p>
                                <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500"/>
                            </div>
                            <p className={`text-[10px] mt-0.5 line-clamp-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{result.snippet.replace(/<[^>]*>?/gm, '')}</p>
                         </a>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
           )}

           {/* CONTROLS */}
           <div className="flex items-center gap-2 sm:gap-3 shrink-0 pl-4 border-l border-slate-800/20">
             {/* Profile (Always Visible) */}
             {isLoggedIn ? (
               <div onClick={() => navigate('/profile')} className="flex items-center gap-2 cursor-pointer group">
                 <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} group-hover:border-cyan-500`}>
                    <span className="font-black text-xs text-cyan-500">{user?.name?.[0] || 'U'}</span>
                 </div>
               </div>
             ) : (
                <button onClick={() => navigate('/login')} className="px-4 py-2 bg-cyan-600 rounded-xl text-white text-xs font-bold uppercase">Login</button>
             )}

             {/* Theme Toggle */}
             <button onClick={toggleTheme} className={`p-2 rounded-xl hover:bg-slate-500/10 ${theme.text}`}>
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             {/* Logout (Icon Only) */}
             {isLoggedIn && (
               <button onClick={handleLogout} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"><LogOut size={18} /></button>
             )}
           </div>
         </div>

         {/* --- ROW 2: MOBILE NAVIGATION ICONS --- */}
         {isMobile && (
           <div className="pb-3 border-t border-slate-800/20 pt-3">
             <div className="flex justify-between items-center px-1">
               {navLinks.map((link) => (
                 <NavLink
                   key={link.path}
                   to={link.path}
                   className={({ isActive }) => `flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive ? theme.mobileIconActive : theme.mobileIconInactive}`}
                 >
                   <link.icon size={20} />
                   {/* Optional labels below icons if needed, keeping mostly clean for now */}
                 </NavLink>
               ))}
             </div>
           </div>
         )}

         {/* --- ROW 3: MOBILE SEARCH BAR --- */}
         {isMobile && (
            <div className="pb-3 px-1 relative" ref={searchRef}>
                <form onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery); }} className="w-full">
                  <div className={`relative flex items-center w-full rounded-xl border px-3 py-2 transition-all ${theme.searchBg}`}>
                    <Search size={16} className="text-slate-500 mr-2" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Intel..."
                      className="bg-transparent border-none outline-none text-xs w-full font-medium placeholder-slate-500"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => { setSearchQuery(''); setSearchResults(null); }} className="text-slate-500">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </form>
                
                {/* Mobile Search Results Dropdown */}
                <AnimatePresence>
                  {searchResults && searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-xl border shadow-2xl z-[100] ${theme.dropdown}`}>
                       {searchResults.map((result, idx) => (
                         <a key={idx} href={`https://en.wikipedia.org/?curid=${result.pageid}`} target="_blank" rel="noreferrer" className="block w-full text-left px-3 py-2.5 rounded-lg mb-1 last:mb-0 border border-transparent hover:border-slate-700 bg-slate-800/50">
                            <p className="text-xs font-bold text-cyan-400">{result.title}</p>
                            <p className="text-[10px] mt-0.5 text-slate-400 line-clamp-1">{result.snippet.replace(/<[^>]*>?/gm, '')}</p>
                         </a>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
         )}

       </div>
    </nav>
  );
}