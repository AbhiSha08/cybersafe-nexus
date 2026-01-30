import React, { useState } from 'react';
import { Github, Linkedin, ShieldCheck, Mail, Copy, Check, Zap, Database, Code2 } from 'lucide-react';

export default function Footer({ isDarkMode }) {
  const currentYear = new Date().getFullYear(); // 2026
  const [copied, setCopied] = useState(false);
  
  const theme = {
    bg: isDarkMode ? 'bg-slate-950/80' : 'bg-gray-100/80',
    border: isDarkMode ? 'border-slate-800' : 'border-gray-200',
    text: isDarkMode ? 'text-slate-400' : 'text-gray-600',
    heading: isDarkMode ? 'text-white' : 'text-gray-900',
    accent: isDarkMode ? 'text-cyan-400' : 'text-blue-600',
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CyberSafe Nexus',
          text: 'Check out this interactive cybersecurity learning platform!',
          url: url,
        });
        return;
      } catch (err) {
        console.log('Native share failed, falling back to clipboard');
      }
    }
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    // FIX: Optimized padding for 18:9 screens (Compact Footer)
    <footer className={`mt-auto border-t py-6 transition-colors duration-300 backdrop-blur-sm ${theme.bg} ${theme.border}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* RESPONSIVE GRID: Stacks on mobile, 3-columns on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-center">
          
          {/* 1. BRAND SECTION */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className={theme.accent} size={20} />
              <span className={`text-lg font-bold tracking-tight ${theme.heading}`}>
                CyberSafe Nexus
              </span>
            </div>
            <p className={`text-xs leading-relaxed max-w-xs mx-auto md:mx-0 ${theme.text}`}>
              Interactive cybersecurity learning & simulation platform.
            </p>
          </div>

          {/* 2. DEVELOPER INFO (Centered) */}
          <div className="flex flex-col items-center text-center">
            <div className={`text-xs space-y-1 ${theme.text}`}>
              <p>Developed by <span className="font-bold text-cyan-500">Abhijeet Sharma</span></p>
              <p className="opacity-80">Full-Stack Architect & CyberSecurity Analyst</p>
              
              <div className="flex justify-center gap-4 mt-3">
                <a href="https://github.com/abhijeetsharma" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme.text} hover:${theme.accent}`}>
                  <Github size={18} />
                </a>
                <a href="https://linkedin.com/in/abhijeetsharma" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme.text} hover:${theme.accent}`}>
                  <Linkedin size={18} />
                </a>
                <a href="mailto:abhijeet.sharma@example.com" className={`transition-colors ${theme.text} hover:${theme.accent}`}>
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* 3. SHARE & TECH (Right Aligned on Desktop, Centered on Mobile) */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium ${theme.border} ${theme.text} hover:${theme.accent} hover:border-cyan-500/50 transition-all group`}
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Link Copied' : 'Share Platform'}</span>
            </button>

            {/* Tech Stack Icons */}
            <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
              <Code2 size={16} className="text-cyan-400" title="React" />
              <Zap size={16} className="text-yellow-400" title="FastAPI" />
              <Database size={16} className="text-green-500" title="MongoDB" />
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className={`mt-8 pt-4 border-t ${theme.border} flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left`}>
          <p className={`text-[10px] uppercase tracking-wider ${theme.text}`}>
            &copy; {currentYear} CyberSafe Nexus. Mumbai University.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            System Version 2.0
          </div>
        </div>
      </div>
    </footer>
  );
}