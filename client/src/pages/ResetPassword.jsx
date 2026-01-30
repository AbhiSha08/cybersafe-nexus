import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Check, X, Loader, ArrowLeft, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import api from '../api';

export default function ResetPassword({ isDarkMode }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation Logic
  const validations = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    match: newPassword === confirmPassword && newPassword !== ''
  }), [newPassword, confirmPassword]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!Object.values(validations).every(v => v)) { 
        setError("Please satisfy all security requirements."); 
        return; 
    }
    setLoading(true);
    setError('');
    
    try {
      await api.post('/api/auth/reset-password', { token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) { 
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') setError(detail);
        else if (Array.isArray(detail)) setError(detail[0].msg || "Validation error");
        else setError("Invalid or expired token.");
    } finally { 
        setLoading(false); 
    }
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xl',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    input: isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900',
    accent: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
  };

  return (
    // FIX: min-h-[100dvh] + responsive px-4
    <div className={`flex items-center justify-center min-h-[100dvh] px-4 py-8 transition-colors duration-500 ${theme.bg}`}>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden p-8 md:p-10 rounded-[2.5rem] w-full max-w-md border ${theme.card}`}
      >
        {/* --- BACK BUTTON (INSIDE CARD) --- */}
        <button 
            onClick={() => navigate('/login')} 
            className="absolute top-6 left-6 md:top-8 md:left-8 p-2 rounded-full hover:bg-slate-500/10 text-slate-500 transition-all group"
            title="Cancel"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <motion.div animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-[1px] bg-cyan-500/20 blur-sm z-20" />

        <div className="text-center mb-8 md:mb-10 mt-6">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <KeyRound className={`w-8 h-8 ${theme.accent}`} />
          </div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tighter ${theme.text}`}>New Access Key</h1>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-2 text-slate-500`}>Securely re-initialize identity credentials.</p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">✓ Access Key Updated</div>
              <p className={`text-[10px] font-bold text-slate-500`}>Redirecting to terminal...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5 md:space-y-6">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase rounded-xl text-center flex items-center justify-center gap-2"><AlertTriangle size={12}/> {error}</div>}
              
              {/* TOKEN INPUT */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Recovery Token</label>
                <input 
                    className={`w-full p-4 rounded-2xl text-xs font-mono outline-none border transition-all focus:border-cyan-500 ${theme.input}`} 
                    type="text" 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)} 
                    placeholder="Paste token here"
                    required 
                />
              </div>

              {/* NEW PASSWORD */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">New Password</label>
                <div className="relative">
                    <input 
                        className={`w-full p-4 pr-12 rounded-2xl text-sm outline-none border transition-all focus:border-cyan-500 ${theme.input}`} 
                        type={showNew ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowNew(!showNew)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-500"
                    >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                    <input 
                        className={`w-full p-4 pr-12 rounded-2xl text-sm outline-none border transition-all focus:border-cyan-500 ${theme.input} ${!validations.match && confirmPassword ? 'border-red-500/50' : ''}`} 
                        type={showConfirm ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowConfirm(!showConfirm)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-500"
                    >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {validations.match && <Check size={16} className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-500" />}
                </div>
              </div>

              {/* VALIDATION GRID */}
              <div className={`mt-4 p-4 rounded-2xl border flex flex-wrap gap-2 md:gap-3 text-[9px] font-black uppercase tracking-tighter justify-center ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  {Object.entries(validations).filter(([k]) => k !== 'match').map(([key, met]) => (
                    <div key={key} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${met ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500 opacity-50'}`}>
                      {met ? <Check size={10} strokeWidth={4} /> : <X size={10} />} 
                      {key.replace('has', '').replace('minLength', '8+ Chars')}
                    </div>
                  ))}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading || !validations.match || !validations.minLength} type="submit" className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-xs tracking-[0.3em] rounded-2xl shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed">
                {loading ? <Loader className="animate-spin mx-auto" size={20} /> : "CONFIRM NEW KEY"}
              </motion.button>
            </form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}