import React, { useEffect, useRef } from 'react';
import { useCallStore } from '../store/useCallStore';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCallOverlayProps {
    onAnswer: () => void;
}

const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({ onAnswer }) => {
    const {
        status,
        peerName,
        localStream,
        remoteStream,
        isMuted,
        isVideoOn,
        toggleMute,
        toggleVideo,
        resetCall,
    } = useCallStore();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, status]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, status]);

    if (status === 'idle') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
            >
                {/* Main Content Area */}
                <div className="relative w-full max-w-6xl aspect-video bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    {/* Remote Video (Main) */}
                    {status === 'in-call' ? (
                        remoteStream ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white">
                                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold mb-4">
                                    {peerName?.[0] || 'U'}
                                </div>
                                <p className="text-xl font-medium">Connecting...</p>
                            </div>
                        )
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-5xl font-bold mb-6 animate-pulse shadow-2xl shadow-blue-500/20">
                                {peerName?.[0] || 'U'}
                            </div>
                            <h2 className="text-3xl font-bold mb-2">{peerName}</h2>
                            <p className="text-blue-400 animate-pulse tracking-widest uppercase text-sm font-bold">
                                {status === 'calling' ? 'Calling...' : 'Incomig Call...'}
                            </p>
                        </div>
                    )}

                    {/* Local Video (PIP) */}
                    <div className="absolute top-6 right-6 w-32 md:w-48 aspect-video bg-black/60 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl group">
                        {isVideoOn && localStream ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover -scale-x-100"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
                                <VideoOff className="w-8 h-8 opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold uppercase tracking-wider">You</span>
                        </div>
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-6 px-8 py-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
                        <button
                            onClick={toggleMute}
                            className={`p-4 rounded-full transition-all hover:scale-110 active:scale-95 ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full transition-all hover:scale-110 active:scale-95 ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {!isVideoOn ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </button>

                        {status === 'receiving' ? (
                            <button
                                onClick={onAnswer}
                                className="px-8 py-4 bg-green-500 text-white rounded-full font-bold hover:bg-green-400 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-green-500/30"
                            >
                                Accept Call
                            </button>
                        ) : null}

                        <button
                            onClick={resetCall}
                            className="p-4 bg-red-600 text-white rounded-full hover:bg-red-500 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-600/30"
                        >
                            <PhoneOff className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
                        {status === 'in-call' ? 'End-to-end encrypted' : 'Waiting for connection'}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VideoCallOverlay;
