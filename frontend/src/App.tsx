import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './app/store';
import LoginPage from './pages/LoginPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import Sidebar from './components/layout/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import { useAppSelector } from './app/hooks';

const ChatLayout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" />;

  return (
    <div className="h-screen w-full flex bg-bg-soft overflow-hidden font-sans relative">
      {/* Background blobs for depth */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vh] bg-accent-coral/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <Sidebar />
      <ChatWindow />
      
      {/* Search/Info Column (Optional/Hidden for now as per spec) */}
      <div className="hidden lg:flex w-[240px] h-full bg-white/20 border-l border-primary/5 backdrop-blur-3xl p-6 flex-col items-center">
        <h4 className="text-sm font-bold text-primary/40 uppercase tracking-widest mb-8">Quick Facts</h4>
        <div className="w-full space-y-6">
          <div className="p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
            <p className="text-[10px] font-bold text-primary/30 uppercase mb-2">Total Chats</p>
            <p className="text-2xl font-bold text-text-charcoal">42</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
            <p className="text-[10px] font-bold text-primary/30 uppercase mb-2">Online Friends</p>
            <p className="text-2xl font-bold text-emerald-400">12</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(120px)',
            border: '1px solid rgba(124, 92, 191, 0.1)',
            borderRadius: '24px',
            color: '#2D2640',
            fontWeight: '600',
            fontSize: '14px',
            padding: '16px 24px',
            boxShadow: '0 8px 32px 0 rgba(124, 92, 191, 0.08)',
          },
          success: {
            iconTheme: {
              primary: '#34D399',
              secondary: 'white',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyOtpPage />} />
        <Route path="/" element={<ChatLayout />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
};

export default App;
