import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider, useUIContext } from './contexts/UIContext';

// Components
import Navbar from './components/Navbar';
import SecurityTicker from './components/SecurityTicker';
import Footer from './components/Footer';
import AiAssistant from './components/AiAssistant';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LessonView from './pages/LessonView';
import QuizView from './pages/QuizView'; 
import CyberTools from './pages/CyberTools'; 
import News from './pages/News';
import Updates from './pages/Updates';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile'; 

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = token && token !== 'undefined' && token !== 'null';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const isAdmin = token && user.role === 'admin';
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

const PageTracker = ({ children }) => {
  const location = useLocation();
  const { setCurrentPage } = useUIContext();
  
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setCurrentPage('dashboard');
    else if (path === '/admin') setCurrentPage('admin');
    else if (path === '/tools') setCurrentPage('simulation'); 
    else if (path.startsWith('/lesson/') && path.includes('quiz')) setCurrentPage('quiz'); 
    else if (path.startsWith('/lesson/')) setCurrentPage('quiz');
    else if (path === '/news') setCurrentPage('news');
    else if (path === '/') setCurrentPage('home');
    else setCurrentPage(null);
  }, [location.pathname, setCurrentPage]);
  
  return <>{children}</>;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? false : true;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    document.body.className = isDarkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900';
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <PageTracker>
            
            {/* --- GLOBAL BACKGROUND LAYER --- */}
            {/* Updated to min-h-[100dvh] for full mobile coverage */}
            <div className={`fixed inset-0 z-[-1] transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
              <div className={`absolute inset-0 cyber-grid ${!isDarkMode ? 'light-mode' : ''}`}>
                 {/* MULTIPLE LIGHTS */}
                 <div className="grid-light light-1"></div>
                 <div className="grid-light light-2"></div>
                 <div className="grid-light light-3"></div>
                 <div className="grid-light light-4"></div>
              </div>
              <div className={`absolute inset-0 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.05)_0%,transparent_70%)]'}`}></div>
            </div>

            {/* MAIN LAYOUT CONTAINER */}
            {/* Updated min-h-screen to min-h-[100dvh] to fix mobile browser bar clipping */}
            <div className="relative z-10 flex flex-col min-h-[100dvh]">
              <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              <SecurityTicker isDarkMode={isDarkMode} />
              
              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home isDarkMode={isDarkMode} />} />
                  <Route path="/news" element={<News isDarkMode={isDarkMode} />} />
                  <Route path="/updates" element={<Updates isDarkMode={isDarkMode} />} />
                  <Route path="/login" element={<Login isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                  <Route path="/register" element={<Register isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                  <Route path="/forgot-password" element={<ForgotPassword isDarkMode={isDarkMode} />} />
                  <Route path="/reset-password" element={<ResetPassword isDarkMode={isDarkMode} />} />
                  
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard isDarkMode={isDarkMode} />
                    </PrivateRoute>
                  } />

                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile isDarkMode={isDarkMode} />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/tools" element={
                    <PrivateRoute>
                      <CyberTools isDarkMode={isDarkMode} />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/lesson/:id" element={
                    <PrivateRoute>
                      <LessonView isDarkMode={isDarkMode} />
                    </PrivateRoute>
                  } />

                  <Route path="/lesson/:lessonId/quiz" element={
                    <PrivateRoute>
                      <QuizView isDarkMode={isDarkMode} />
                    </PrivateRoute>
                  } />

                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminPanel isDarkMode={isDarkMode} />
                    </AdminRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>

              <Footer isDarkMode={isDarkMode} />
              <AiAssistant isDarkMode={isDarkMode} />
            </div>
            
          </PageTracker>
        </Router>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;