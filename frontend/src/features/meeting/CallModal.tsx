import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, Video, Mic, 
  PhoneOff, Maximize2 
} from 'lucide-react';
import { useCallStore } from '../../store/useCallStore';
import Avatar from '../../components/ui/Avatar';

const CallModal: React.FC = () => {
  const { 
    status, type, targetUser, stream, remoteStream, 
    rejectCall, endCall 
  } = useCallStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-charcoal/90 backdrop-blur-xl">
      <AnimatePresence>
        {status === 'ringing' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white rounded-[40px] p-10 flex flex-col items-center text-center shadow-2xl"
          >
            <div className="relative mb-8">
              <Avatar name={targetUser?.name} src={targetUser?.avatar?.url} size="xl" />
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20" />
            </div>
            
            <h3 className="text-2xl font-black text-text-charcoal mb-2">{targetUser?.name}</h3>
            <p className="text-primary font-bold uppercase tracking-widest text-xs mb-10">
              Incoming {type === 'video' ? 'Video' : 'Audio'} Call...
            </p>

            <div className="flex gap-6">
              <button 
                onClick={rejectCall}
                className="w-16 h-16 rounded-full bg-accent-coral text-white flex items-center justify-center shadow-xl shadow-accent-coral/20 hover:scale-110 transition-transform"
              >
                <PhoneOff size={24} />
              </button>
              <button 
                className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/25 hover:scale-110 transition-transform hover:bg-primary-soft"
              >
                <Phone size={24} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full max-w-6xl max-h-[800px] bg-black rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Remote Video (Full Size) */}
            <div className="flex-1 relative bg-text-charcoal/20">
              {type === 'video' ? (
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                  <Avatar name={targetUser?.name} src={targetUser?.avatar?.url} size="xl" />
                  <h3 className="text-2xl font-bold text-white">{targetUser?.name}</h3>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              {/* Local Video (Floating) */}
              {type === 'video' && (
                <div className="absolute top-8 right-8 w-48 h-32 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="p-8 flex items-center justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
              <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                <Mic size={24} />
              </button>
              {type === 'video' && (
                <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                  <Video size={24} />
                </button>
              )}
              <button 
                onClick={endCall}
                className="w-16 h-16 rounded-3xl bg-accent-coral text-white flex items-center justify-center shadow-xl shadow-accent-coral/20 hover:scale-105 active:scale-95 transition-all"
              >
                <PhoneOff size={28} />
              </button>
              <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">
                <Maximize2 size={24} />
              </button>
            </div>

            {/* User Overlay (Top Left) */}
            <div className="absolute top-8 left-8 flex items-center gap-4 p-3 pr-6 glass rounded-2xl border border-white/20">
              <Avatar name={targetUser?.name} src={targetUser?.avatar?.url} size="sm" />
              <div>
                <h4 className="text-sm font-bold text-white">{targetUser?.name}</h4>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                  {status === 'calling' ? 'Calling...' : 'In Call'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CallModal;
