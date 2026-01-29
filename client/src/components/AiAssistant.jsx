import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader, Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../api'; // Ensure this points to your updated api.js

// Helper: Determine context based on the current URL
const getContextFromPath = (path) => {
  if (path.includes('dashboard')) return "User Dashboard & Stats";
  if (path.includes('tools')) return "Cyber Security Tactical Tools";
  if (path.includes('lesson')) return "Educational Curriculum Module";
  if (path === '/') return "Home Page / Command Center";
  return "General Inquiry";
};

export default function AiAssistant({ isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: '🔒 Secure Channel Established. I am your Cybersecurity AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const location = useLocation(); // Tracks where the user is

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 1. Add User Message
    const userMsg = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // 2. Determine Context Safely (No Crash)
      const currentContext = getContextFromPath(location.pathname);
      
      // 3. Send to Backend (FIXED: Added '/api' prefix)
      // Since api.js base URL is now 'localhost:8000', we must include '/api' here.
      const response = await api.post('/api/tools/ai-assistant', {
        message: currentInput,
        context: `Current User Location: ${currentContext}. Please provide helpful cybersecurity insights.`
      });

      // 4. Add AI Response
      setMessages(prev => [...prev, { role: 'model', text: response.data.response }]);

    } catch (error) {
      console.error("AI Error:", error);
      let friendlyMsg = "I'm having trouble connecting to the Nexus mainframe. Please try again.";
      
      if (error.response?.status === 503) {
        friendlyMsg = "⚠️ AI services are currently offline for maintenance.";
      }
      
      setMessages(prev => [...prev, { role: 'model', text: friendlyMsg }]);
    } finally {
      setLoading(false);
    }
  };

  // --- THEME CONFIGURATION ---
  const theme = {
    bg: isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200 shadow-2xl',
    header: isDarkMode ? 'bg-slate-800' : 'bg-cyan-600 text-white',
    input: isDarkMode ? 'bg-slate-950 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-300',
    botMsg: isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-gray-100 text-gray-800',
    userMsg: 'bg-cyan-600 text-white',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`mb-4 w-80 sm:w-96 h-[500px] rounded-2xl border flex flex-col overflow-hidden shadow-2xl ${theme.bg}`}
          >
            {/* Header */}
            <div className={`p-4 flex justify-between items-center ${theme.header}`}>
              <div className="flex items-center gap-2 font-bold">
                <Bot size={20} /> 
                <span>Nexus AI</span>
                <span className="text-[10px] font-normal opacity-75 flex items-center gap-1 ml-2 bg-black/20 px-2 py-0.5 rounded-full">
                  <Eye size={10} /> {location.pathname === '/' ? 'Home' : location.pathname.replace('/', '')}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-75 transition-opacity">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                     {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-cyan-400" />}
                  </div>
                  <div className={`p-3 rounded-lg text-sm max-w-[80%] break-words ${msg.role === 'user' ? theme.userMsg : theme.botMsg}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                 <div className="flex items-center gap-2 text-xs text-slate-500 pl-12">
                    <Loader size={12} className="animate-spin" /> Analyzing Protocol...
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-700/20 bg-opacity-50">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about cybersecurity..."
                  className={`w-full pl-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${theme.input}`}
                />
                <button 
                  type="submit" 
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-2 p-1.5 text-cyan-500 hover:text-cyan-400 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-cyan-500/30 transition-all border-2 border-white/10"
      >
        {isOpen ? <X className="text-white" size={28} /> : <MessageSquare className="text-white" size={28} />}
      </motion.button>
    </div>
  );
}