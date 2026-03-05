import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, Award, Zap, 
  LogOut, Lock, KeyRound, Loader, Crown, Edit2, Camera, Save, X, FileText, Clock, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function Profile({ isDarkMode, setIsAuthenticated }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', organization: '', profile_picture: '', password: '' 
  });

  // --- MODAL STATE ---
  const [activeModal, setActiveModal] = useState(null); 

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('users/me');
      setProfile(res.data);
      
      // Initialize Form Data
      if (res.data.user) {
          setFormData({
            name: res.data.user.name || '',
            email: res.data.user.email || '',
            organization: res.data.user.organization || '',
            profile_picture: res.data.user.profile_picture || '',
            password: ''
          });
      }
    } catch (e) {
      console.error("Profile Load Error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert("Image too large. Please select an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
          setFormData(prev => ({ ...prev, profile_picture: dataUrl }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.password) {
      alert("⚠️ Security Protocol: Please enter your password to confirm changes.");
      return;
    }
    try {
      await api.put('users/update', formData);
      setIsEditing(false);
      fetchProfile();
      alert("✅ Profile Updated Successfully");
    } catch (err) {
      alert("Update Failed: " + (err.response?.data?.detail || "Invalid Credentials"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xl',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    input: isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white focus:border-cyan-500' : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-cyan-500',
    accent: 'text-cyan-500',
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      <Loader className="animate-spin text-cyan-500" size={32} />
    </div>
  );

  if (!profile) return <div className="text-center pt-20">Profile Unavailable.</div>;

  const { user, total_xp, daily_streak, certificates, completed_lessons } = profile;

  // --- MODAL RENDERERS ---
  const renderStreakContent = () => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isStreakDay = i < daily_streak; 
      days.push({ date: d.getDate(), month: d.toLocaleString('default', { month: 'short' }), status: isStreakDay });
    }

    return (
      <div className="w-full max-w-lg">
        <h3 className={`text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2 ${theme.text}`}>
          <Zap className="text-yellow-500" /> Login Consistency Log
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <div key={idx} className={`aspect-square rounded-lg flex flex-col items-center justify-center border ${day.status ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
              <span className={`text-[8px] sm:text-[10px] font-bold ${theme.subText}`}>{day.month}</span>
              <span className={`text-sm sm:text-lg font-black ${theme.text}`}>{day.date}</span>
            </div>
          ))}
        </div>
        <p className={`text-center text-xs mt-4 ${theme.subText}`}>
          Current Active Streak: <span className="text-emerald-500 font-bold">{daily_streak} Days</span>
        </p>
      </div>
    );
  };

  const renderModulesContent = () => (
    <div className="w-full max-w-2xl">
      <h3 className={`text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2 ${theme.text}`}>
        <Shield className="text-cyan-500" /> Completed Missions
      </h3>
      
      {!completed_lessons || completed_lessons.length === 0 ? (
        <div className="text-center py-10 opacity-50 flex flex-col items-center">
             <AlertTriangle size={32} className="mb-2 text-yellow-500"/>
             <span>No missions completed yet. Initialize training in Dashboard.</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {completed_lessons.map((item, idx) => {
            let lessonId = typeof item === 'string' ? item : (item.lesson_id || item.id || "Unknown");
            let timestamp = item.completed_at ? new Date(item.completed_at).toLocaleDateString() : new Date().toLocaleDateString();
            const displayName = lessonId.replace(/_/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

            return (
                <div key={idx} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${theme.card}`}>
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500 shrink-0">
                    <FileText size={20} />
                    </div>
                    <div>
                    <div className={`text-sm font-bold uppercase ${theme.text}`}>
                        {displayName}
                    </div>
                    <div className={`text-xs ${theme.subText} flex items-center gap-2`}>
                        <Clock size={10} /> {timestamp}
                    </div>
                    </div>
                </div>
                <div className="text-emerald-500 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded self-start sm:self-center">
                    PASSED
                </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCertificatesContent = () => (
    <div className="w-full max-w-3xl">
      <h3 className={`text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2 ${theme.text}`}>
        <Award className="text-yellow-500" /> Credentials Vault
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           {(!certificates || certificates.length === 0) ? (
              <div className="col-span-2 text-center py-10 opacity-50">No certificates acquired.</div>
           ) : (
             certificates.map((cert, idx) => (
               <div key={idx} className={`p-6 rounded-xl border ${theme.card}`}>
                 <Award size={32} className="text-yellow-500 mb-4" />
                 <h4 className={`text-lg font-bold ${theme.text}`}>{cert}</h4>
                 <p className={`text-xs mt-2 ${theme.subText}`}>Issued: {new Date().getFullYear()}</p>
               </div>
             ))
           )}
       </div>
    </div>
  );

  const renderBadgesContent = () => (
    <div className="w-full max-w-lg">
      <h3 className={`text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2 ${theme.text}`}>
        <Shield className="text-emerald-500" /> Badge Dossier
      </h3>
      <div className="space-y-4">
         {[
           { name: "Cadet", desc: "Initialized Nexus Protocol.", acquired: true },
           { name: "Sentinel", desc: "Completed 10+ Tactical Modules.", acquired: total_xp >= 1000 },
           { name: "Elite", desc: "Demonstrated advanced threat mitigation.", acquired: total_xp >= 5000 },
           { name: "CyberGuardian", desc: "Top-tier operative clearance.", acquired: total_xp >= 10000 },
         ].map((badge, idx) => (
           <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 ${badge.acquired ? theme.card : 'opacity-40 border-slate-800'}`}>
             <div className={`p-3 rounded-full ${badge.acquired ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
               <Shield size={24} />
             </div>
             <div>
               <h4 className={`text-sm font-bold uppercase tracking-wider ${theme.text}`}>{badge.name}</h4>
               <p className={`text-xs ${theme.subText}`}>{badge.desc}</p>
               {badge.acquired && <p className="text-[10px] text-emerald-500 font-mono mt-1">Status: ACQUIRED</p>}
             </div>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    // FIX: Using min-h-[100dvh] for mobile full height, added overflow-x-hidden
    <div className={`min-h-[100dvh] p-4 md:p-12 transition-colors duration-500 font-sans overflow-x-hidden ${theme.bg}`}>
      
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 rounded-full blur-[120px] opacity-10 ${isDarkMode ? 'bg-cyan-600' : 'bg-cyan-400'}`}></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 relative z-10">
        
        {/* HEADER CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border backdrop-blur-xl ${theme.card}`}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            
            {/* Avatar Section */}
            <div className="relative group">
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center border-4 text-3xl md:text-4xl font-black overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-white text-slate-600 shadow-lg'}`}>
                {(isEditing && formData.profile_picture) || user.profile_picture ? (
                    <img 
                      src={isEditing ? formData.profile_picture : user.profile_picture} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                ) : (
                    user.name?.charAt(0) || <User size={48} />
                )}
              </div>
              
              {/* Camera Icon */}
              {isEditing && (
                <>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-2 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white shadow-lg border-2 border-white transition-all transform hover:scale-110 active:scale-95"
                    title="Change Profile Photo"
                  >
                    <Camera size={14} />
                  </button>
                </>
              )}
            </div>

            {/* User Info / Edit Form */}
            <div className="text-center md:text-left flex-1 w-full">
              {isEditing ? (
                  <div className="space-y-4 max-w-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" className={`px-4 py-2 rounded-xl text-sm border outline-none ${theme.input}`} />
                        <input name="organization" value={formData.organization} onChange={handleInputChange} placeholder="Org" className={`px-4 py-2 rounded-xl text-sm border outline-none ${theme.input}`} />
                    </div>
                    <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className={`w-full px-4 py-2 rounded-xl text-sm border outline-none ${theme.input}`} />
                    
                    <div className="pt-2 border-t border-slate-700/30 mt-2">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Verification Required to Save</p>
                      <input type="password" name="password" placeholder="Enter Current Password" value={formData.password} onChange={handleInputChange} className={`w-full px-4 py-2 rounded-xl text-sm border outline-none ${theme.input}`} />
                    </div>
                    
                    <div className="flex gap-3 pt-2 justify-center md:justify-start">
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-all"><Save size={14} /> Save</button>
                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-all"><X size={14} /> Cancel</button>
                    </div>
                  </div>
              ) : (
                  <>
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                        {/* FIX: clamp() font size for Name */}
                        <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.text}`}>{user.name}</h1>
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-[10px] font-black uppercase tracking-widest">
                        {user.profile_type || "Cadet"}
                        </span>
                        <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-slate-500/10 transition-colors text-slate-400">
                            <Edit2 size={16} />
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-sm font-medium opacity-70">
                        <span className={`flex items-center gap-2 ${theme.subText}`}><Mail size={14} /> {user.email}</span>
                        <span className={`flex items-center gap-2 ${theme.subText}`}><Award size={14} /> {user.organization || "No Org"}</span>
                    </div>
                  </>
              )}
            </div>

            {/* Logout */}
            {!isEditing && (
                <button onClick={handleLogout} className="px-5 py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 self-center md:self-start">
                <LogOut size={16} /> <span className="hidden md:inline">Disconnect</span>
                </button>
            )}
          </div>
        </motion.div>

        {/* FIX: Stacked on mobile (grid-cols-1), Side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* STATS SECTION */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border ${theme.card}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><Crown size={24} /></div>
              <h2 className={`text-xl font-black ${theme.text}`}>Operative Stats</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {/* Clickable Stat Rows */}
               <StatRow icon={Zap} title="Login Streak" value={`${daily_streak} Days`} theme={theme} onClick={() => setActiveModal('streak')} />
               <StatRow icon={Shield} title="Modules Done" value={completed_lessons?.length || 0} theme={theme} onClick={() => setActiveModal('modules')} />
               <StatRow icon={Award} title="Certificates" value={certificates?.length || 0} theme={theme} onClick={() => setActiveModal('certificates')} />
               <StatRow icon={Shield} title="Badges" value="View Dossier" theme={theme} onClick={() => setActiveModal('badges')} />
            </div>
          </motion.div>

          {/* SECURITY SECTION */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border ${theme.card}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500"><Lock size={24} /></div>
              <h2 className={`text-xl font-black ${theme.text}`}>Security Protocol</h2>
            </div>

            <p className={`text-xs font-medium leading-relaxed mb-8 ${theme.subText}`}>
              Manage your access credentials. Changing password requires identity verification.
            </p>

            {/* CHANGE PASSWORD BUTTON */}
            <button
              onClick={() => navigate('/forgot-password')}
              className={`w-full py-4 rounded-xl border border-dashed ${isDarkMode ? 'border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400' : 'border-slate-300 hover:border-cyan-600 text-slate-600 hover:text-cyan-700'} text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group`}
            >
              <KeyRound size={16} className="group-hover:rotate-12 transition-transform" />
              Reset Access Key
            </button>

            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <div className="min-w-[4px] h-4 rounded-full bg-yellow-500 mt-1" />
              <p className="text-[10px] font-bold text-yellow-600/80 leading-tight">
                Warning: Initiating a reset will log you out of all sessions.
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* --- MODAL OVERLAY --- */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            {/* FIX: Modal max-width and max-height for mobile */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()} 
              className={`relative p-6 md:p-8 rounded-[2rem] border shadow-2xl overflow-hidden max-h-[85vh] w-full max-w-lg md:max-w-2xl overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
            >
               <button onClick={closeModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-colors">
                 <X size={20} />
               </button>

               {activeModal === 'streak' && renderStreakContent()}
               {activeModal === 'modules' && renderModulesContent()}
               {activeModal === 'certificates' && renderCertificatesContent()}
               {activeModal === 'badges' && renderBadgesContent()}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Sub-component for Stats
const StatRow = ({ icon: Icon, title, value, theme, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all ${theme.card}`}>
      <div className="flex items-center gap-3">
          <Icon size={18} className="text-slate-500" />
          <span className={`text-xs font-bold uppercase tracking-wide ${theme.subText}`}>{title}</span>
      </div>
      <span className={`text-sm font-black ${theme.text}`}>{value}</span>
  </div>
);