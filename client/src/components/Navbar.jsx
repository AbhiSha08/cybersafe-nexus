import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sun, Moon, LogOut, Menu, X, 
  Terminal, Newspaper, Settings, Home, BarChart3, Search, Globe, ExternalLink, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NexusLogo from './NexusLogo';

export default function Navbar({ isDarkMode, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  
  // --- MOBILE DETECTION LOGIC (INTEGRATED) ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
    mobileMenu: isDarkMode ? 'bg-slate-950/95 border-r border-slate-800' : 'bg-white/95 border-r border-gray-200',
  };

  const glitchExit = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <>
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

            {/* SEARCH BAR (Desktop Only) */}
            {!isMobile && (
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
                      <button type="button" onClick={() => { setSearchQuery(''); setSearchResults(null); }} className="shrink-0 ml-1 p-1 -mr-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all z-20">
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </form>
                {/* Search History & Results Logic (Preserved) */}
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

            {/* DESKTOP TABS */}
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

            {/* CONTROLS */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 border-l border-slate-800/20 pl-4">
              {/* Profile (Desktop) */}
              {!isMobile && isLoggedIn && (
                <div onClick={() => navigate('/profile')} className="flex flex-col items-end cursor-pointer group">
                  <span className={`text-sm font-black uppercase tracking-tight group-hover:text-cyan-500 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                    {user?.name?.split(' ')[0] || 'Operative'}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">{user?.role || 'User'}</span>
                </div>
              )}

              {/* Theme Toggle */}
              <button onClick={toggleTheme} className={`p-2 rounded-xl hover:bg-slate-500/10 ${theme.text}`}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* HAMBURGER TRIGGER (Mobile Only) */}
              {isMobile && (
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className={`p-2 rounded-xl transition-all ${isMobileMenuOpen ? 'bg-cyan-500 text-white' : theme.text}`}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}

              {/* Desktop Logout */}
              {!isMobile && isLoggedIn && (
                <button onClick={handleLogout} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"><LogOut size={18} /></button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 right-0 z-50 w-[280px] shadow-2xl flex flex-col ${theme.mobileMenu}`}
            >
              <div className="p-6 border-b border-slate-800/20">
                <div className="flex items-center gap-3 mb-6">
                   <NexusLogo className="w-8 h-8" />
                   <span className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>NEXUS</span>
                </div>
                {/* Mobile Profile */}
                {isLoggedIn && (
                   <div onClick={() => navigate('/profile')} className="p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10 flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold">
                        {user?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name?.split(' ')[0]}</p>
                        <p className="text-[10px] text-cyan-500 uppercase tracking-widest">{user?.role}</p>
                      </div>
                   </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${isActive ? theme.active : `${theme.text} opacity-70 hover:opacity-100 hover:bg-slate-500/5`}`}
                  >
                    <link.icon size={18} />
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="p-4 border-t border-slate-800/20">
                 {isLoggedIn ? (
                   <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 font-bold uppercase text-xs hover:bg-red-500 hover:text-white transition-all">
                     <LogOut size={16} /> Terminate Session
                   </button>
                 ) : (
                   <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center p-3 rounded-xl bg-cyan-600 text-white font-bold uppercase text-xs">Initialize Login</NavLink>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}