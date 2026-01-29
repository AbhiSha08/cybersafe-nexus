import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Download, Share2, Award, Fingerprint } from 'lucide-react';

export default function Certification({ topic, score, total, isDarkMode }) {
  const certificateRef = useRef();
  const userName = JSON.parse(localStorage.getItem('user'))?.name || "Abhijeet";

  const handlePrint = () => { window.print(); };

  const theme = {
    card: isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-900',
    hash: isDarkMode ? 'bg-slate-900/50 text-cyan-500/50' : 'bg-slate-100 text-slate-400'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-4xl mx-auto p-4 font-sans"
    >
      <div 
        ref={certificateRef}
        className={`relative p-16 rounded-none border-[16px] overflow-hidden transition-colors duration-500 ${theme.card}`}
        style={{ borderStyle: 'double' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none"
        >
          <ShieldCheck size={500} />
        </motion.div>

        <div className="relative z-10 text-center space-y-10">
          <div className="flex flex-col items-center gap-2 mb-6">
            <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
              <Award className="text-cyan-500" size={56} />
            </motion.div>
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] opacity-40">CyberSafe Nexus // Verified Node</span>
          </div>
          
          <h1 className="text-sm font-black uppercase tracking-[0.6em] text-cyan-600">Certificate of Achievement</h1>
          
          <div className="space-y-4">
            <p className="font-serif italic text-2xl opacity-60">This tactical document certifies that</p>
            <h2 className="text-6xl font-black tracking-tighter text-white uppercase">{userName}</h2>
            <div className="w-24 h-1 bg-cyan-500 mx-auto rounded-full" />
          </div>

          <div className="max-w-xl mx-auto py-10 border-y border-slate-800/30">
            <p className="text-lg leading-relaxed font-medium">Has successfully neutralized all simulated threats and verified technical proficiency for the 6th-semester module:</p>
            <h3 className="text-3xl font-black mt-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">{topic}</h3>
          </div>

          <div className="grid grid-cols-3 items-end pt-12 gap-8">
            <div className="text-center">
              <div className="w-full h-px bg-slate-800/50 mb-3 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Authority</p>
              <p className="text-[8px] font-bold mt-1 opacity-30 italic">Mumbai University Node</p>
            </div>
            <div className="flex flex-col items-center">
               <Fingerprint className="text-cyan-500/40 mb-2" size={40} />
               <div className={`px-3 py-1 rounded-md font-mono text-[8px] ${theme.hash}`}>SIG_HASH: 0xNEXUS_2026_V2</div>
            </div>
            <div className="text-center">
              <div className="w-full h-px bg-slate-800/50 mb-3 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date Issued</p>
              <p className="text-[10px] font-black mt-1 text-cyan-600">JAN 24, 2026</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-12 flex flex-col sm:flex-row gap-5 justify-center print:hidden"
      >
        <button onClick={handlePrint} className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl">
          <Download size={18} /> Download_Official_Credential
        </button>
        <button className="flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 border border-slate-800 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl">
          <Share2 size={18} /> Share_Intel_Report
        </button>
      </motion.div>
    </motion.div>
  );
}