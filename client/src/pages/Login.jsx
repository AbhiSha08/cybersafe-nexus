import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Lock, Loader, AlertTriangle, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function Login({ isDarkMode, setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { email: email, password: password };
      const res = await api.post('/api/auth/login', payload);

      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        if (setIsAuthenticated) {
            setIsAuthenticated(true);
        }
        navigate('/dashboard');
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) { 
      console.error("Login Error:", err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') setError(detail);
      else if (Array.isArray(detail)) setError(detail[0].msg || "Validation Error");
      else setError("Connection failed.");
    } finally { 
      setLoading(false); 
    }
  };

  const themeClasses = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xl',
    textMain: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    input: isDarkMode ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900',
    button: isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-blue-700 shadow-cyan-500/20' : 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-500/20'
  };

  return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-500 font-sans ${themeClasses.bg}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-20 ${isDarkMode ? 'bg-cyan-600' : 'bg-cyan-400'}`}></div>
          <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[100px] opacity-20 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className={`relative overflow-hidden p-12 rounded-[3rem] w-full max-w-md border backdrop-blur-xl ${themeClasses.card}`}
      >
        
        {/* --- BACK BUTTON (INSIDE CARD) --- */}
        <button 
            onClick={() => navigate('/')} 
            className="absolute top-8 left-8 p-2 rounded-full hover:bg-slate-500/10 text-slate-500 transition-all group"
            title="Return Home"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* SCAN-LINE ANIMATION */}
        <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
            className="absolute left-0 right-0 h-[2px] bg-cyan-500/20 blur-sm z-20 pointer-events-none" 
        />

        <div className="text-center mb-10 relative z-10">
          <motion.div 
            whileHover={{ rotate: 180 }} 
            transition={{ duration: 0.6 }} 
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 mb-6 shadow-lg shadow-cyan-500/10"
          >
            <Shield className="w-8 h-8 text-cyan-500" />
          </motion.div>
          <h1 className={`text-4xl font-black tracking-tighter ${themeClasses.textMain}`}>CyberSafe Nexus</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Biometric Cadet Access</p>
        </div>

        {error && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center rounded-xl flex items-center justify-center gap-2"
            >
                <AlertTriangle size={14} /> {error}
            </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Email ID</label>
            <input 
                className={`w-full p-4 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all border ${themeClasses.input}`} 
                type="email" 
                placeholder="cadet@nexus.secure" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Access Key</label>
              <Link to="/forgot-password" size={10} className="text-[9px] font-black text-cyan-500 uppercase hover:underline">Lost Key?</Link>
            </div>
            <div className="relative">
              <input 
                className={`w-full p-4 pr-12 rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all border ${themeClasses.input}`} 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={loading} 
            className={`w-full py-5 rounded-2xl text-white font-black text-sm tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 uppercase ${themeClasses.button}`}
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <><Lock size={18} /> Authenticate & Access</>}
          </motion.button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-800/50 text-[10px] font-black text-center uppercase tracking-widest text-slate-500">
          New recruit? <Link to="/register" className="text-cyan-500 hover:underline">Initialize Identity</Link>
        </div>
      </motion.div>
    </div>
  );
}