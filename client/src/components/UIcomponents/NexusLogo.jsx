import React from 'react';
import { motion } from 'framer-motion';

export default function NexusLogo({ className = "w-8 h-8" }) {
  return (
    <div className={`${className} relative flex items-center justify-center shrink-0`}>
      {/* 1. OUTER GLOW BLUR */}
      <div className="absolute inset-0 bg-cyan-500 blur-[10px] opacity-30 rounded-full" />

      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full"
      >
        <defs>
          <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* STATIC HEXAGON WITH PULSATING GLOW */}
        <motion.path
          d="M50 10 L85 27.5 V72.5 L50 90 L15 72.5 V27.5 Z"
          stroke="url(#cyber-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ 
            strokeOpacity: [0.4, 1, 0.4],
            filter: [
              "drop-shadow(0 0 2px rgba(34, 211, 238, 0.4))",
              "drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))",
              "drop-shadow(0 0 2px rgba(34, 211, 238, 0.4))"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* INNER BRACKETS (Axis visualizers) */}
        <path d="M38 38 L30 38 L30 62 L38 62" stroke="white" strokeWidth="4" strokeLinecap="square" className="opacity-90" />
        <path d="M62 62 L70 62 L70 38 L62 38" stroke="white" strokeWidth="4" strokeLinecap="square" className="opacity-90" />

        {/* STEADY CENTRAL CORE */}
        <motion.circle
          cx="50"
          cy="50"
          r="6"
          fill="url(#cyber-grad)"
          animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}