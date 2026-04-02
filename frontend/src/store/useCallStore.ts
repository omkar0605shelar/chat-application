import { create } from 'zustand';
import type { User, CallState } from '../types';

interface CallStore extends CallState {
  initiateCall: (user: User, type: 'audio' | 'video') => void;
  receiveCall: (user: User, type: 'audio' | 'video') => void;
  acceptCall: (stream: MediaStream) => void;
  rejectCall: () => void;
  endCall: () => void;
  setLocalStream: (stream: MediaStream) => void;
  setRemoteStream: (stream: MediaStream) => void;
  setPeer: (peer: any) => void;
}

export const useCallStore = create<CallStore>((set) => ({
  status: 'idle',
  type: 'video',
  targetUser: undefined,
  isInitiator: false,
  stream: undefined,
  remoteStream: undefined,
  peer: undefined,

  initiateCall: (user, type) => set({ 
    status: 'calling', 
    targetUser: user, 
    type, 
    isInitiator: true 
  }),
  receiveCall: (user, type) => set({ 
    status: 'ringing', 
    targetUser: user, 
    type, 
    isInitiator: false 
  }),
  acceptCall: (stream) => set({ 
    status: 'in-call', 
    stream 
  }),
  rejectCall: () => set({ 
    status: 'idle', 
    targetUser: undefined, 
    stream: undefined, 
    remoteStream: undefined, 
    peer: undefined 
  }),
  endCall: () => set({ 
    status: 'idle', 
    targetUser: undefined, 
    stream: undefined, 
    remoteStream: undefined, 
    peer: undefined 
  }),
  setLocalStream: (stream) => set({ stream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  setPeer: (peer) => set({ peer }),
}));
