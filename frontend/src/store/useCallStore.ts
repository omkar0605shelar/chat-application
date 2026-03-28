import { create } from 'zustand';
import type { CallState } from '../types';

interface CallStore extends CallState {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    peer: unknown | null;

    setCallState: (state: Partial<CallState>) => void;
    setLocalStream: (stream: MediaStream | null) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    setPeer: (peer: unknown | null) => void;
    resetCall: () => void;
    toggleMute: () => void;
    toggleVideo: () => void;
}

const initialCallState: CallState = {
    status: 'idle',
    peerId: undefined,
    peerName: undefined,
    isVideoOn: true,
    isMuted: false,
    signal: undefined,
};

export const useCallStore = create<CallStore>((set) => ({
    ...initialCallState,
    localStream: null,
    remoteStream: null,
    peer: null,

    setCallState: (state) => set((prev) => ({ ...prev, ...state })),
    setLocalStream: (localStream) => set({ localStream }),
    setRemoteStream: (remoteStream) => set({ remoteStream }),
    setPeer: (peer) => set({ peer }),

    resetCall: () =>
        set((state) => {
            if (state.localStream) {
                state.localStream.getTracks().forEach((t) => t.stop());
            }
            return {
                ...initialCallState,
                localStream: null,
                remoteStream: null,
                peer: null,
            };
        }),

    toggleMute: () =>
        set((state) => {
            if (state.localStream) {
                state.localStream.getAudioTracks().forEach((t) => {
                    t.enabled = state.isMuted;
                });
            }
            return { isMuted: !state.isMuted };
        }),

    toggleVideo: () =>
        set((state) => {
            if (state.localStream) {
                state.localStream.getVideoTracks().forEach((t) => {
                    t.enabled = !state.isVideoOn;
                });
            }
            return { isVideoOn: !state.isVideoOn };
        }),
}));
