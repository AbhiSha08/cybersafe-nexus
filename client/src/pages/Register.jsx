import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader, AlertTriangle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';

const Register = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    user_type: 'university', organization: '', 
    tech_familiarity: 'intermediate', gender: '', age_range: '' 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    return { 
        length: pwd.length >= 8, 
        upper: /[A-Z]/.test(pwd), 
        lower: /[a-z]/.test(pwd), 
        number: /[0-9]/.test(pwd), 
        special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) 
    };
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Object.values(passwordCriteria).every(v => v)) { 
        setError("Insecure Key: Requirements not met."); 
        return; 
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) { 
        const detail = err.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : "Registration failed.");
    } finally { 
        setLoading(false); 
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/google-auth', {
        token: credentialResponse.credential
      });

      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        navigate('/dashboard');
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) { 
      console.error("Google Register Error:", err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') setError(detail);
      else setError("Google authentication failed.");
    } finally { 
        setLoading(false); 
    }
  };

  const inputClass = `w-full p-4 rounded-2xl border transition-all duration-300 outline-none text-sm font-medium ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-600'}`;

  return (
    // FIX: min-h-[100dvh] and responsive padding
    <div className={`min-h-[100dvh] py-10 md:py-20 px-4 transition-colors duration-500 flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-3xl mx-auto p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'}`}>
        
        {/* --- BACK BUTTON --- */}
        <button 
            onClick={() => navigate('/login')} 
            className="absolute top-6 left-6 md:top-8 md:left-8 p-2 rounded-full hover:bg-slate-500/10 text-slate-500 transition-all group"
            title="Back to Login"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="text-center mb-10 md:mb-12 mt-8 md:mt-4">
          <h2 className={`text-3xl md:text-5xl font-black tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create Identity</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-3">Recruit Registration Protocol</p>
        </div>

        {error && (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                <AlertTriangle size={14} /> {error}
            </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2 block">Full Name</label>
            <input type="text" name="name" required className={inputClass} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Abhijeet Sharma" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2 block">Email Node</label>
            <input type="email" name="email" required className={inputClass} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="cadet@nexus.secure" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2 block">Secure Key</label>
            <div className="relative">
                <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    required 
                    className={`${inputClass} pr-12`} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    placeholder="••••••••" 
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-500 transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            
            {/* Password Strength Indicator with Labels */}
            <div className="mt-3 space-y-2">
              <div className="flex gap-1.5">
                {Object.entries(passwordCriteria).map(([k, met]) => <div key={k} className={`h-1 flex-1 rounded-full transition-all duration-700 ${met ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50' : 'bg-slate-800'}`} />)}
              </div>
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 space-y-1">
                <div className={`flex items-center gap-2 ${passwordCriteria.length ? 'text-cyan-400' : 'text-slate-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.length ? 'bg-cyan-400' : 'bg-slate-700'}`}></span>
                  Min 8 characters
                </div>
                <div className={`flex items-center gap-2 ${passwordCriteria.upper ? 'text-cyan-400' : 'text-slate-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.upper ? 'bg-cyan-400' : 'bg-slate-700'}`}></span>
                  Uppercase letter (A-Z)
                </div>
                <div className={`flex items-center gap-2 ${passwordCriteria.lower ? 'text-cyan-400' : 'text-slate-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.lower ? 'bg-cyan-400' : 'bg-slate-700'}`}></span>
                  Lowercase letter (a-z)
                </div>
                <div className={`flex items-center gap-2 ${passwordCriteria.number ? 'text-cyan-400' : 'text-slate-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.number ? 'bg-cyan-400' : 'bg-slate-700'}`}></span>
                  Number (0-9)
                </div>
                <div className={`flex items-center gap-2 ${passwordCriteria.special ? 'text-cyan-400' : 'text-slate-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${passwordCriteria.special ? 'bg-cyan-400' : 'bg-slate-700'}`}></span>
                  Special char (!@#$%^&*)
                </div>
              </div>
            </div>
          </motion.div>

          {/* FIX: Stacked grid for mobile inputs */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/30">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Institution</label>
              <input type="text" name="organization" className={inputClass} onChange={(e) => setFormData({...formData, organization: e.target.value})} placeholder="e.g. Mumbai University" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">User Tier</label>
              <select name="user_type" className={inputClass} onChange={(e) => setFormData({...formData, user_type: e.target.value})} value={formData.user_type}>
                <option value="university">University</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Age Range</label>
              <select name="age_range" className={inputClass} onChange={(e) => setFormData({...formData, age_range: e.target.value})}>
                <option value="">Select</option><option value="18-25">18-25</option><option value="26-35">26-35</option>
              </select>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="md:col-span-2 mt-4 md:mt-6 w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-xs tracking-[0.3em] rounded-2xl shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader className="animate-spin" size={16} /> : 'INITIALIZE NEXUS ACCESS'}
          </motion.button>

          {/* Google Sign-In */}
          <div className="md:col-span-2 mt-6 md:mt-8">
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
                onError={() => setError("Google sign-up failed. Please try again.")}
                theme={isDarkMode ? "dark" : "light"}
                size="large"
                width="100%"
              />
            </motion.div>

            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-center mt-4">
              Already have access? <Link to="/login" className="text-cyan-500 hover:underline">Authenticate</Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;