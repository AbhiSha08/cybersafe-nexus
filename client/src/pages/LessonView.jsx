import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Terminal, BookOpen, 
  Clock, ArrowRight, Loader, Brain, Lock
} from 'lucide-react';
import api from '../api';

export default function LessonView({ isDarkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // State for Locked Status
  const [isQuizLocked, setIsQuizLocked] = useState(false);
  const [prereqName, setPrereqName] = useState('');

  // --- SCROLL FIX ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setIsQuizLocked(false); // Reset lock state

        // 1. Fetch Current Lesson
        const res = await api.get(`/api/lessons/${id}`);
        setLesson(res.data);
        
        // 2. Fetch All Lessons (for Order)
        const allRes = await api.get('/api/lessons');
        const sorted = allRes.data.sort((a, b) => {
             const numA = parseInt(a.id.split('_')[1] || 999);
             const numB = parseInt(b.id.split('_')[1] || 999);
             return numA - numB;
        });
        setAllLessons(sorted);

        // 3. CHECK QUIZ LOCK STATUS
        const currentIndex = sorted.findIndex(l => l.id === id);
        
        // If it's not the first lesson, check if PREVIOUS lesson is completed
        if (currentIndex > 0) {
            const prevLesson = sorted[currentIndex - 1];
            const userRes = await api.get('/api/users/me');
            
            // Normalize Data
            const rawCompleted = userRes.data.completed_lessons || [];
            const completedIDs = rawCompleted.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return item.lesson_id || item.id; 
                }
                return item;
            });

            if (!completedIDs.includes(prevLesson.id)) {
                setIsQuizLocked(true);
                setPrereqName(prevLesson.title);
            }
        }

      } catch (error) {
        console.error("Lesson fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getNextLessonId = () => {
    if (!allLessons.length || !lesson) return null;
    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
        return allLessons[currentIndex + 1].id;
    }
    return null;
  };

  const nextId = getNextLessonId();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
       <div className="text-cyan-500 font-bold animate-pulse text-xs tracking-widest flex items-center gap-2">
           <Loader className="animate-spin" size={16} /> DECRYPTING DATA...
       </div>
    </div>
  );

  if (!lesson) return <div className="p-10 text-center">Module Not Found</div>;

  const styles = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    card: isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    sectionTitle: `text-sm font-black uppercase tracking-widest mb-3 text-cyan-500 flex items-center gap-2`,
  };

  return (
    <div className={`min-h-screen ${styles.bg} pb-20`}>
      
      {/* 1. NAV HEADER */}
      <div className={`sticky top-0 z-30 border-b backdrop-blur-md px-6 h-14 flex items-center justify-between ${isDarkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-cyan-500 transition-colors">
            <ArrowLeft size={14} /> Dashboard
        </button>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
            <span className={`text-[9px] font-black uppercase tracking-widest text-cyan-500`}>
                {lesson.category || 'Protocol'}
            </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* 2. HERO */}
        <div className="mb-8">
            <h1 className={`text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-2 ${styles.text}`}>
                {lesson.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1"><Terminal size={12} /> {lesson.tier || 'Standard'}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> 15 Min</span>
            </div>
        </div>

        {/* 3. CONTENT */}
        <div className="space-y-6">
            
            {/* MAIN CONTENT (Restored Image Classes Here) */}
            <section className={`p-6 rounded-2xl border ${styles.card}`}>
                <h2 className={styles.sectionTitle}>
                    <BookOpen size={16} /> Briefing
                </h2>
                <div 
                    className={`prose prose-sm max-w-none 
                    ${isDarkMode ? 'prose-invert text-slate-300' : 'text-slate-700'} 
                    prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide 
                    
                    /* RESTORED IMAGE STYLES */
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:border 
                    prose-img:border-slate-700 prose-img:w-full prose-img:object-cover prose-img:my-6`}
                    
                    dangerouslySetInnerHTML={{ __html: lesson.content }} 
                />
            </section>

            {/* TWO COLUMNS: OUTCOME & ACTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className={`p-6 rounded-2xl border border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-blue-50/50'}`}>
                    <h2 className={styles.sectionTitle}>
                        <CheckCircle size={16} /> Outcome
                    </h2>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Operative will be able to recognize <strong>{lesson.title}</strong> signatures and deploy effective countermeasures.
                    </p>
                </section>

                {/* ACTION CARD */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'border-cyan-500/30 bg-cyan-900/10' : 'border-cyan-200 bg-cyan-50'}`}>
                    <div>
                        <h2 className={`text-sm font-black uppercase tracking-widest mb-2 ${isQuizLocked ? 'text-red-500' : 'text-cyan-500'}`}>
                           {isQuizLocked ? "Simulation Locked" : "Ready for Simulation?"}
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-cyan-200/70' : 'text-cyan-800'}`}>
                           {isQuizLocked 
                             ? `Prerequisite Missing: You must complete the quiz for "${prereqName}" before attempting this simulation.`
                             : "Test your knowledge against the AI Neural Net to earn XP and unlock the next module."
                           }
                        </p>
                    </div>
                    
                    {/* QUIZ BUTTON */}
                    {isQuizLocked ? (
                        <button 
                            disabled
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-700/50 text-slate-500 font-bold py-3 px-4 rounded-xl cursor-not-allowed border border-slate-700"
                        >
                            <Lock size={18} /> Prerequisite Required
                        </button>
                    ) : (
                        <button 
                            onClick={() => navigate(`/lesson/${lesson.id}/quiz`)}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 group"
                        >
                            <Brain size={18} /> Initialize Simulation
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}

                    {/* NEXT BUTTON */}
                    {nextId && (
                        <button 
                            onClick={() => navigate(`/lesson/${nextId}`)}
                            className={`mt-2 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider py-2 ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                        >
                            Read Next Module
                        </button>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}