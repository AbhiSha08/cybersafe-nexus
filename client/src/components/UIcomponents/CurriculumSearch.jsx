import React, { useState } from 'react';
import { Search, Zap, Globe, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CurriculumSearch({ isDarkMode }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Convert "SQL Injection" to "sql-injection" for the URL
    const topicId = query.toLowerCase().replace(/\s+/g, '-');
    navigate(`/lesson/${topicId}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <form onSubmit={handleSearch} className="relative group">
        <div className={`absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-cyan-400' : 'text-gray-400'}`}>
          <Search size={20} />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any security topic (e.g. Ransomware, MFA, XSS)..."
          className={`w-full py-5 pl-14 pr-32 rounded-3xl border-2 outline-none transition-all font-bold
            ${isDarkMode 
              ? 'bg-slate-900/50 border-slate-800 text-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10' 
              : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
            }`}
        />
        
        <button 
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
        >
          <Zap size={14} /> GENERATE
        </button>
      </form>
      
      <div className="mt-3 flex gap-4 justify-center">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
          <Globe size={10} /> Powered by Wikipedia & Nexus AI
        </p>
      </div>
    </div>
  );
}