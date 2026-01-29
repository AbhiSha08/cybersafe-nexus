import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, RefreshCw, AlertTriangle, Smartphone, Rocket, Car, ShieldAlert } from 'lucide-react';
import { useUIContext } from '../contexts/UIContext';

export default function News({ isDarkMode }) {
  const { setNewsData, isHighlighted } = useUIContext();
  const [loading, setLoading] = useState(true);
  const [feeds, setFeeds] = useState({ cyber: [], gadgets: [], automotive: [], space: [] });

  const categories = [
    { id: 'cyber', name: 'Cyber Intel', icon: ShieldAlert, color: 'text-red-500', url: 'https://thehackernews.com/rss.xml' },
    { id: 'gadgets', name: 'Gadgets', icon: Smartphone, color: 'text-cyan-500', url: 'https://www.theverge.com/rss/gadgets/index.xml' },
    { id: 'automotive', name: 'Automotive', icon: Car, color: 'text-amber-500', url: 'https://www.theverge.com/rss/cars/index.xml' },
    { id: 'space', name: 'Space Tech', icon: Rocket, color: 'text-purple-500', url: 'https://www.theverge.com/rss/science/index.xml' }
  ];

  const fetchAllFeeds = useCallback(async () => {
    setLoading(true);
    const newFeeds = {};
    try {
      await Promise.all(categories.map(async (cat) => {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${cat.url}`);
        const data = await res.json();
        newFeeds[cat.id] = data.items?.slice(0, 5) || [];
      }));
      setFeeds(newFeeds);
      setNewsData(newFeeds);
    } catch (err) { console.error("Multi-feed fetch error", err); }
    finally { setLoading(false); }
  }, [setNewsData]);

  useEffect(() => { fetchAllFeeds(); }, [fetchAllFeeds]);

  const theme = {
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-600',
    card: isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 15 },
    show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 font-sans">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end mb-12 border-b border-slate-800/50 pb-8">
        <div>
          <h1 className={`text-4xl font-black flex items-center gap-5 tracking-tighter ${theme.text}`}>
            <AlertTriangle className="text-amber-500 animate-pulse" size={44} /> Global Intelligence Feed
          </h1>
          <p className={`${theme.subText} mt-3 text-lg font-medium`}>Multi-domain technical intelligence tracking.</p>
        </div>
        <button onClick={fetchAllFeeds} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-500/20">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> {loading ? 'SYNCING...' : 'REFRESH FEEDS'}
        </button>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <motion.div key={cat.id} variants={itemVariants} className="flex flex-col">
            <div className={`flex items-center gap-3 p-5 rounded-t-[2rem] border-x border-t border-slate-800/50 ${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-100'}`}>
              <cat.icon className={cat.color} size={24} />
              <h2 className={`font-black uppercase tracking-widest text-xs ${theme.text}`}>{cat.name}</h2>
            </div>
            <div className={`flex-grow p-6 rounded-b-[2rem] border border-slate-800/50 ${isDarkMode ? 'bg-slate-950/40' : 'bg-white shadow-xl shadow-slate-200/50'}`}>
              {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-24 w-full bg-slate-800/20 animate-pulse rounded-2xl mb-4" />) 
              : feeds[cat.id].map((item, idx) => (
                <motion.a key={idx} variants={itemVariants} whileHover={{ x: 5 }} href={item.link} target="_blank" rel="noopener noreferrer" className={`block p-5 mb-4 rounded-2xl border transition-all ${theme.card} hover:border-cyan-500/50 group`}>
                   <p className="text-[9px] font-black opacity-30 mb-2 uppercase tracking-widest">{new Date(item.pubDate).toLocaleDateString()}</p>
                   <h4 className={`text-sm font-black mb-3 line-clamp-2 leading-tight group-hover:text-cyan-400 ${theme.text}`}>{item.title}</h4>
                   <div className="flex items-center gap-1 text-[9px] font-black text-cyan-500 uppercase tracking-widest">Read Intel <ExternalLink size={10} /></div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}