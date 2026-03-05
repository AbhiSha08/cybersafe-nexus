import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, ShieldQuestion, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import api from '../api';

export default function ForgotPassword({ isDarkMode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter token

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      setStep(2); // Show token input step
      
      // Log the message (token will be in backend console)
      console.log("Check backend logs/console for the recovery token");
    } catch (err) {
      console.error("Forgot Password Error:", err);
      const detail = err.response?.data?.detail;
      
      if (detail === "Email not found" || err.response?.status === 404) {
          setError("Identity not found. Please register first.");
      } else if (typeof detail === 'string') {
          setError(detail);
      } else {
          setError("Transmission failed. Verify connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      setError("Recovery token is required.");
      return;
    }
    // Redirect to reset password page with token
    navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xl',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    input: isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900',
    accent: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
  };

  return (
    // FIX: min-h-[100dvh] + px-4 for mobile edges
    <div className={`flex items-center justify-center min-h-[100dvh] px-4 py-8 transition-colors duration-500 font-sans ${theme.bg}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-[100px] opacity-10 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-400'}`}></div>
          <div className={`absolute bottom-0 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-[100px] opacity-10 ${isDarkMode ? 'bg-cyan-600' : 'bg-cyan-400'}`}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className={`relative overflow-hidden p-8 md:p-10 rounded-[2.5rem] w-full max-w-md border backdrop-blur-xl ${theme.card}`}
      >
        
        {/* --- BACK BUTTON (INSIDE CARD) --- */}
        <button 
            onClick={() => navigate('/login')} 
            className="absolute top-6 left-6 md:top-8 md:left-8 p-2 rounded-full hover:bg-slate-500/10 text-slate-500 transition-all group"
            title="Return to Login"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Scan-line Animation */}
        <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }} 
            className="absolute left-0 right-0 h-[1px] bg-cyan-500/20 blur-sm z-20 pointer-events-none" 
        />

        <div className="text-center mb-8 md:mb-10 mt-6 relative z-10">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 mb-6 shadow-lg shadow-cyan-500/10"
          >
            <ShieldQuestion className={`w-8 h-8 ${theme.accent}`} />
          </motion.div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tighter ${theme.text}`}>Recovery Protocol</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Identify yourself, Operative.</p>
        </div>

        <AnimatePresence mode="wait">
          {success && step === 2 ? (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 relative z-10"
            >
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center gap-3">
                    <CheckCircle className="text-emerald-500" size={32} />
                    <div>
                        <h3 className="text-emerald-500 font-black uppercase text-xs tracking-widest mb-1">Token Sent</h3>
                        <p className="text-[10px] font-medium text-slate-500">Check backend console for recovery token (docker logs)</p>
                    </div>
                </div>
                
                <form onSubmit={handleTokenSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Recovery Token</label>
                    <input 
                        className={`w-full p-4 rounded-2xl text-sm outline-none border transition-all focus:border-cyan-500 ${theme.input}`} 
                        type="text" 
                        placeholder="Paste token from backend logs here" 
                        value={resetToken} 
                        onChange={(e) => setResetToken(e.target.value)} 
                        required 
                    />
                  </div>

                  {error && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase rounded-xl text-center flex items-center justify-center gap-2">
                        <AlertTriangle size={12}/> {error}
                    </motion.div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    type="submit" 
                    className={`w-full py-4 rounded-2xl text-white font-black text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 uppercase bg-gradient-to-r from-cyan-600 to-blue-700 shadow-cyan-500/20`}
                  >
                    CONTINUE TO RESET
                  </motion.button>

                  <button 
                    type="button"
                    onClick={() => { setSuccess(false); setStep(1); setResetToken(''); }}
                    className="w-full py-3 rounded-xl border border-slate-500/30 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/50 text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    ← Back to Email
                  </button>
                </form>
            </motion.div>
          ) : (
            <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-6 relative z-10"
            >
              {error && (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase rounded-xl text-center flex items-center justify-center gap-2">
                      <AlertTriangle size={12}/> {error}
                  </motion.div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Registered Email ID</label>
                <div className="relative">
                    <input 
                        className={`w-full p-4 pl-12 rounded-2xl text-sm outline-none border transition-all focus:border-cyan-500 ${theme.input}`} 
                        type="email" 
                        autoComplete="email"
                        placeholder="cadet@nexus.secure" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="submit" 
                disabled={loading} 
                className={`w-full py-5 rounded-2xl text-white font-black text-xs tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 uppercase bg-gradient-to-r from-cyan-600 to-blue-700 shadow-cyan-500/20`}
              >
                {loading ? <Loader className="animate-spin" size={16} /> : "INITIATE RECOVERY"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-800/10 dark:border-slate-800/50 text-[10px] font-black text-center uppercase tracking-widest text-slate-500">
          Remember your key? <Link to="/login" className="text-cyan-500 hover:underline">Access Terminal</Link>
        </div>
      </motion.div>
    </div>
  );
}