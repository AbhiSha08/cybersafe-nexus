import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Star } from 'lucide-react';

export default function EliteBadge({ isDarkMode }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-500/50 bg-amber-500/10"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full animate-pulse" />
      
      <Star size={14} className="text-amber-500 fill-amber-500 animate-spin-slow" />
      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
        Elite Nexus Rank
      </span>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}