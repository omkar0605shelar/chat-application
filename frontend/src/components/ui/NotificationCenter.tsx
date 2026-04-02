import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MessageSquare, UserPlus, PhoneOff, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, removeNotification, markAsRead, clearAll } = useNotificationStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-2xl transition-all ${isOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/40 hover:bg-primary/5 hover:text-primary'}`}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-accent-coral text-white text-[10px] flex items-center justify-center font-bold rounded-full border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
              className="absolute bottom-full mb-4 left-0 z-50 w-80 bg-white rounded-[40px] shadow-2xl border border-primary/10 overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-primary text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Notifications</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                    {unreadCount} Unread
                  </p>
                </div>
                <button 
                  onClick={clearAll}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 custom-scrollbar bg-bg-soft/30">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 rounded-[24px] bg-primary/5 flex items-center justify-center mb-4">
                      <Bell size={24} className="text-primary/20" />
                    </div>
                    <p className="text-sm font-bold text-text-charcoal/40 uppercase tracking-widest">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`
                        p-4 rounded-3xl flex gap-4 transition-all group relative
                        ${n.read ? 'bg-white/50' : 'bg-white shadow-sm border border-primary/5 ring-1 ring-primary/5'}
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
                        ${n.type === 'message' ? 'bg-primary/10 text-primary' : 
                          n.type === 'friend-request' ? 'bg-emerald-500/10 text-emerald-500' : 
                          'bg-accent-coral/10 text-accent-coral'}
                      `}>
                        {n.type === 'message' ? <MessageSquare size={18} /> : 
                         n.type === 'friend-request' ? <UserPlus size={18} /> : 
                         <PhoneOff size={18} />}
                      </div>

                      <div className="flex-1 min-w-0" onClick={() => markAsRead(n.id)}>
                        <h4 className="text-sm font-bold text-text-charcoal truncate">{n.title}</h4>
                        <p className="text-xs text-text-charcoal/60 line-clamp-2 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[9px] font-bold text-primary/30 uppercase tracking-tighter mt-2">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <button 
                        onClick={() => removeNotification(n.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-accent-coral/5 text-accent-coral/40 hover:text-accent-coral transition-all"
                      >
                        <X size={16} />
                      </button>

                      {!n.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white border-t border-primary/5 flex justify-center">
                  <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
                    View All Activity
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
