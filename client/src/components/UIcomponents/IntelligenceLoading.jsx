import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Globe, Cpu, Lock, Database } from 'lucide-react';

const LOADING_STEPS = [
  { icon: Globe, text: "Accessing Global Intelligence Archives...", color: "text-blue-500" },
  { icon: Database, text: "Scraping Wikipedia Data Streams...", color: "text-cyan-500" },
  { icon: Cpu, text: "Nexus AI: Analyzing Threat Vectors...", color: "text-purple-500" },
  { icon: Lock, text: "Generating Interactive Simulation Quiz...", color: "text-emerald-500" },
  { icon: ShieldCheck, text: "Finalizing Secure Module Environment...", color: "text-blue-400" }
];

export default function IntelligenceLoading({ isDarkMode }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Cycles through the steps to show the user what the backend is doing
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = LOADING_STEPS[step].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="relative mb-12">
        {/* Pulsing Outer Ring for Cyber Effect */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl"
        />
        
        {/* Main Animated Icon */}
        <div className={`relative p-8 rounded-full border-2 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-2xl'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ActiveIcon size={48} className={LOADING_STEPS[step].color} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-2"
        >
          <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {LOADING_STEPS[step].text}
          </h3>
          <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">
            Protocol: NEXUS_GEN_V2 // Topic: SEC_INTEL
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar Animation */}
      <div className="w-64 h-1 bg-slate-800/30 rounded-full mt-10 overflow-hidden relative">
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-600 to-blue-600"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}