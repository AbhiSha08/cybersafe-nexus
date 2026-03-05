import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Lock, Loader, AlertTriangle, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/google-auth', {
        token: credentialResponse.credential
      });

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
      console.error("Google Login Error:", err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') setError(detail);
      else setError("Google authentication failed.");
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
    // FIX: min-h-[100dvh] for mobile, added px-4 for side margins
    <div className={`flex items-center justify-center min-h-[100dvh] px-4 py-8 transition-colors duration-500 font-sans ${themeClasses.bg}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-[100px] opacity-20 ${isDarkMode ? 'bg-cyan-600' : 'bg-cyan-400'}`}></div>
          <div className={`absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-[100px] opacity-20 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        // FIX: Responsive padding (p-8 on mobile, p-12 desktop) and max-width safety
        className={`relative overflow-hidden p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] w-full max-w-md min-w-[28rem] border backdrop-blur-xl ${themeClasses.card}`}
      >
        
        {/* --- BACK BUTTON (INSIDE CARD) --- */}
        <button 
            onClick={() => navigate('/')} 
            className="absolute top-6 left-6 md:top-8 md:left-8 p-2 rounded-full hover:bg-slate-500/10 text-slate-500 transition-all group"
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

        <div className="text-center mb-4 md:mb-6 relative z-10 pt-4">
          <motion.div 
            whileHover={{ rotate: 180 }} 
            transition={{ duration: 0.6 }} 
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 mb-6 shadow-lg shadow-cyan-500/10"
          >
            <Shield className="w-8 h-8 text-cyan-500" />
          </motion.div>
          {/* FIX: Fluid font size via Tailwind/Index.css or explicit override */}
          <h1 className={`text-3xl md:text-4xl font-black tracking-tighter ${themeClasses.textMain}`}>CyberSafe Nexus</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Biometric Cadet Access</p>
        </div>

        {error && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-2 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center rounded-xl flex items-center justify-center gap-2"
            >
                <AlertTriangle size={12} /> {error}
            </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5 relative z-10">
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
            className={`w-full py-4 md:py-5 rounded-2xl text-white font-black text-sm tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 uppercase ${themeClasses.button}`}
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <><Lock size={18} /> Authenticate & Access</>}
          </motion.button>
        </form>

        {/* Google Sign-In */}
        <div className="mt-4 md:mt-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-700/50"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Or</span>
            <div className="flex-1 h-px bg-slate-700/50"></div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed. Please try again.")}
              theme={isDarkMode ? "dark" : "light"}
              size="large"
            />
          </motion.div>
        </div>

        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-800/50 text-[10px] font-black text-center uppercase tracking-widest text-slate-500">
          New recruit? <Link to="/register" className="text-cyan-500 hover:underline">Initialize Identity</Link>
        </div>
      </motion.div>
    </div>
  );
}