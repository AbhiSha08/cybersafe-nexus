import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle, XCircle, Loader, ArrowRight, RefreshCw, AlertTriangle, X, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../api';
import confetti from 'canvas-confetti';

// --- HELPER: Fixes "SHOUTING" Text ---
const formatText = (text) => {
  if (!text) return "";
  const upperCaseCount = text.replace(/[^A-Z]/g, "").length;
  const totalLength = text.length;
  if (upperCaseCount > totalLength / 2) {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  return text;
};

export default function QuizView({ isDarkMode }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null); 
  const [error, setError] = useState(null);
  const [nextModuleId, setNextModuleId] = useState(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initSimulation = async () => {
      try {
        setLoading(true);
        // 1. Fetch Next Module ID
        const allRes = await api.get('/lessons');
        const sorted = allRes.data.sort((a, b) => {
             const numA = parseInt(a.id.split('_')[1] || 999);
             const numB = parseInt(b.id.split('_')[1] || 999);
             return numA - numB;
        });
        const currentIndex = sorted.findIndex(l => l.id === lessonId);
        if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
            setNextModuleId(sorted[currentIndex + 1].id);
        }

        // 2. Generate Quiz
        const res = await api.post(`/lessons/${lessonId}/generate-quiz`);
        
        if (res.data && res.data.length > 0) {
            setQuestions(res.data);
        } else {
            throw new Error("AI returned empty quiz");
        }
      } catch (err) {
        console.error("AI Quiz Failed:", err);
        setError("Simulation Initialization Failed. Neural Link Unstable.");
      } finally {
        setLoading(false);
      }
    };
    initSimulation();
  }, [lessonId]);

  const handleOptionClick = (optionIndex) => {
    if (answerState) return; 
    
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === questions[currentQIndex].correct_answer;
    
    if (isCorrect) {
        setAnswerState('correct');
        setScore(prev => prev + 1);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#10b981', '#34d399'] });
    } else {
        setAnswerState('wrong');
    }

    setTimeout(() => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setAnswerState(null);
            setSelectedOption(null);
        } else {
            setShowResult(true);
            submitResults(score + (isCorrect ? 1 : 0));
        }
    }, 1500);
  };

  const submitResults = async (finalScore) => {
    try {
        await api.post('/lessons/submit-quiz', {
            quiz_id: lessonId,
            answers: [] 
        });
        if (finalScore >= questions.length * 0.7) {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        }
    } catch (e) {
        console.error("Failed to save progress", e);
    }
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-2xl',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    sub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
  };

  if (loading) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme.bg}`}>
        <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
            <Loader className="relative animate-spin text-cyan-500 mb-6" size={48} />
        </div>
        <p className="text-cyan-500 font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Initializing Tactical Scenario...</p>
    </div>
  );

  if (error) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme.bg} text-center p-6`}>
        <div className="p-6 rounded-full bg-red-500/10 mb-6 border border-red-500/20">
            <AlertTriangle className="text-red-500" size={48} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${theme.text}`}>Simulation Error</h2>
        <p className="text-slate-500 mb-8 max-w-md">{error}</p>
        <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20">
                Retry Initialization
            </button>
            <button onClick={() => navigate(`/lesson/${lessonId}`)} className="px-6 py-3 border border-slate-700 text-slate-500 rounded-xl font-bold hover:text-slate-300 hover:border-slate-500 transition-colors">
                Abort to Briefing
            </button>
        </div>
    </div>
  );

  // --- RESULT SCREEN ---
  if (showResult) {
    const passed = score >= questions.length * 0.6; 
    return (
        // FIX: Responsive flex container for result screen
        <div className={`min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden ${theme.bg}`}>
            <div className={`relative max-w-md w-full p-8 md:p-10 rounded-[2.5rem] border z-10 backdrop-blur-xl ${passed ? 'border-emerald-500/30 bg-emerald-950/30' : 'border-red-500/30 bg-red-950/30' } text-center shadow-2xl`}>
                <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-8 ${passed ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {passed ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
                </div>
                
                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 ${theme.text}`}>
                    {passed ? "Mission Accomplished" : "Mission Failed"}
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Accuracy</p>
                        <p className={`text-2xl font-black ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{Math.round((score/questions.length)*100)}%</p>
                    </div>
                    <div className="text-center border-l border-slate-800">
                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">XP Gained</p>
                        <p className="text-2xl font-black text-yellow-400">+{passed ? 100 : 10}</p>
                    </div>
                </div>

                {/* FIX: Vertical stack buttons on mobile */}
                <div className="space-y-3">
                    {passed && nextModuleId ? (
                        <button onClick={() => navigate(`/lesson/${nextModuleId}`)} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                            Deploy to Next Module <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-900 font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all">
                            Return to Command
                        </button>
                    )}
                    
                    {!passed && (
                        <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 border border-slate-700 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all hover:bg-slate-800">
                            <RefreshCw size={16} /> Retry Simulation
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
  }

  // --- QUESTION SCREEN ---
  const currentQ = questions[currentQIndex];
  const progress = ((currentQIndex) / questions.length) * 100;

  return (
    // FIX: min-h-[100dvh] for mobile full height
    <div className={`min-h-[100dvh] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden ${theme.bg}`}>
        
        {/* Abort Button */}
        <button 
            onClick={() => navigate(`/lesson/${lessonId}`)}
            className="absolute top-4 left-4 md:top-6 md:left-6 p-3 rounded-full bg-slate-800/50 text-slate-400 hover:bg-red-500 hover:text-white transition-all z-50 group border border-slate-700 hover:border-red-500"
            title="Abort Simulation"
        >
            <X size={20} />
        </button>

        <div className="w-full max-w-3xl relative z-10">
            {/* Header Info */}
            <div className="flex justify-between items-end mb-4 px-1">
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-1">
                        Query 0{currentQIndex + 1} / 0{questions.length}
                    </h2>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <BrainCircuit size={14} className="text-cyan-500" />
                    <span>Neural Link Active</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                />
            </div>

            {/* Main Card */}
            <motion.div 
                key={currentQIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 md:p-10 rounded-[2rem] border backdrop-blur-xl shadow-2xl ${theme.card}`}
            >
                {/* Clean, Readable Question Text */}
                <h3 className={`text-lg md:text-2xl font-medium mb-8 md:mb-10 leading-relaxed text-slate-100 normal-case`}>
                    {formatText(currentQ.question)}
                </h3>

                <div className="grid gap-3 md:gap-4">
                    {currentQ.options.map((opt, i) => {
                        let borderClass = isDarkMode ? "border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50" : "border-slate-200 hover:border-cyan-500";
                        let textClass = theme.sub;
                        let icon = null;

                        if (answerState) {
                            if (i === currentQ.correct_answer) {
                                borderClass = "border-emerald-500 bg-emerald-500/10";
                                textClass = "text-emerald-500";
                                icon = <CheckCircle size={20} className="text-emerald-500" />;
                            } else if (i === selectedOption) {
                                borderClass = "border-red-500 bg-red-500/10";
                                textClass = "text-red-500";
                                icon = <XCircle size={20} className="text-red-500" />;
                            } else {
                                borderClass = "opacity-40 border-transparent";
                            }
                        } else if (i === selectedOption) {
                            borderClass = "border-cyan-500 bg-cyan-500/10";
                            textClass = "text-cyan-400";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => handleOptionClick(i)}
                                disabled={answerState !== null}
                                className={`group relative w-full p-4 rounded-xl text-left border transition-all duration-200 flex items-center gap-4 ${borderClass}`}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors
                                    ${answerState === null 
                                        ? `bg-slate-800 border-slate-700 text-slate-500 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500`
                                        : i === currentQ.correct_answer 
                                            ? 'bg-emerald-500 border-emerald-500 text-black'
                                            : 'bg-slate-800 border-slate-700 opacity-50'
                                    }
                                `}>
                                    {["A", "B", "C", "D"][i]}
                                </div>
                                
                                <span className={`flex-grow text-sm font-medium normal-case ${textClass}`}>
                                    {formatText(opt)}
                                </span>
                                
                                {icon && <div className="animate-in zoom-in spin-in-180 duration-300">{icon}</div>}
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    </div>
  );
}