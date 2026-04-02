import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, Bot, MessageSquare } from 'lucide-react';
import store from './app/store';
import LoginPage from './pages/LoginPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import Sidebar from './components/layout/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import Toast from './components/ui/Toast';
import AIPanel from './features/ai/AIPanel';
import CallModal from './features/meeting/CallModal';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { fetchUser } from './features/auth/authSlice';
import { useChatStore } from './store/useChatStore';
import { useFriendStore } from './store/useFriendStore';
import { useSocket } from './hooks/useSocket';
import { friendService } from './services/friendService';
import { chatApi } from './api/axios';
import Logo from './components/ui/Logo';

const ChatLayout: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const { chats, activeChat, setChats, setActiveChat } = useChatStore();
  const { friends, setFriends } = useFriendStore();
  const { id } = useParams();
  const location = useLocation();
  useSocket();
  
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        const [chatsRes, friendsRes] = await Promise.all([
          chatApi.get('/chat/all'),
          friendService.getFriends()
        ]);
        setChats(chatsRes.data.chats);
        setFriends(friendsRes);
      } catch (err) {
        console.error('Failed to load initial data');
      }
    };
    loadData();
  }, [isAuthenticated, setChats, setFriends]);

  // Handle active chat based on route ID
  useEffect(() => {
    if (id && chats.length > 0) {
      const targetChat = chats.find(c => c.user._id === id);
      if (targetChat) {
        setActiveChat(targetChat);
      }
    } else if (!id && location.pathname === '/') {
      setActiveChat(null);
    }
  }, [id, chats, setActiveChat, location.pathname]);

  useEffect(() => {
    const totalUnseen = chats.reduce((acc, curr) => acc + (curr.chat.unseenCount || 0), 0);
    const prefix = totalUnseen > 0 ? `(${totalUnseen}) ` : '';
    
    if (activeChat) {
      document.title = `${prefix}NexTalk | ${activeChat.user.name}`;
    } else if (location.pathname === '/friends') {
      document.title = `${prefix}NexTalk | Friends`;
    } else if (location.pathname === '/ai-assistant') {
      document.title = `${prefix}NexTalk | AI Assistant`;
    } else {
      document.title = `${prefix}NexTalk | Modern Messaging`;
    }
  }, [activeChat, chats, location.pathname]);

  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const isFriendsPage = location.pathname === '/friends';
  const isAIPage = location.pathname === '/ai-assistant';

  return (
    <div className="h-screen w-full flex bg-bg-soft overflow-hidden font-sans relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vh] bg-accent-coral/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <Sidebar />
      
      <main className="flex-1 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isFriendsPage ? (
            <motion.div 
              key="friends-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center justify-center p-12 bg-white/20"
            >
              <div className="max-w-md text-center">
                <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center mx-auto mb-8">
                  <Users size={48} className="text-primary" />
                </div>
                <h2 className="text-3xl font-black text-text-charcoal tracking-tight">Your NexTalk Squad</h2>
                <p className="text-text-charcoal/40 font-medium mt-4">Select a friend from the list to start a vibe or add new friends via code.</p>
              </div>
            </motion.div>
          ) : isAIPage ? (
            <motion.div 
              key="ai-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col items-center justify-center p-12 bg-white/20"
            >
              <div className="max-w-md text-center w-full">
                <h2 className="text-3xl font-black text-text-charcoal tracking-tight">AI Assistant</h2>
                <p className="text-text-charcoal/40 font-medium mt-4 mb-8">Ask me anything. I'm here to help you navigate NexTalk and more.</p>
                <AIPanel inline={true} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat-window"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ChatWindow />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isAIPage && <AIPanel />}
      <CallModal />
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isInitialized, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isInitialized) {
      dispatch(fetchUser());
    }
  }, [dispatch, token, isInitialized]);

  if (!isInitialized && token) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-soft">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <Logo size={80} showText={false} />
          <div className="mt-10 flex items-center gap-4 text-primary font-bold">
            <Loader2 className="animate-spin" size={24} />
            <span className="tracking-[0.2em] uppercase text-xs">Securing Session...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyOtpPage />} />
        <Route path="/" element={<ChatLayout />}>
          <Route path="friends" element={null} />
          <Route path="friend/:id" element={null} />
          <Route path="ai-assistant" element={null} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toast />
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
