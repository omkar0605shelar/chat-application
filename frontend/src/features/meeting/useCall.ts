import { useEffect, useCallback } from 'react';
import { useCallStore } from '../../store/useCallStore';
import { callService } from '../../services/callService';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export const useCall = (socket: Socket | null) => {
  const { 
    type, receiveCall, acceptCall, endCall,
    setLocalStream, setRemoteStream, setPeer, peer
  } = useCallStore();

  const handleIncomingCall = useCallback(({ from, type }: { from: any, type: 'audio' | 'video' }) => {
    receiveCall(from, type);
  }, [receiveCall]);

  const handleCallAccepted = useCallback(({ signal }: { signal: any }) => {
    if (peer) {
      peer.signal(signal);
    }
  }, [peer]);

  const handleCallRejected = useCallback(() => {
    toast.error('Call rejected');
    endCall();
  }, [endCall]);

  const handleCallEnded = useCallback(() => {
    endCall();
  }, [endCall]);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:offer', handleIncomingCall);
    socket.on('call:answer', handleCallAccepted);
    socket.on('call:reject', handleCallRejected);
    socket.on('call:end', handleCallEnded);

    return () => {
      socket.off('call:offer');
      socket.off('call:answer');
      socket.off('call:reject');
      socket.off('call:end');
    };
  }, [socket, handleIncomingCall, handleCallAccepted, handleCallRejected, handleCallEnded]);

  const startCall = async (targetUserId: string, callType: 'audio' | 'video') => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true,
      });
      setLocalStream(localStream);
      
      if (socket) {
        const newPeer = callService.initiateCall(socket, targetUserId, localStream);
        
        newPeer.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
        });

        setPeer(newPeer);
      }
    } catch (err) {
      toast.error('Could not access camera/microphone');
    }
  };

  const answerIncomingCall = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });
      setLocalStream(localStream);
      acceptCall(localStream);

      // Need to signal the initiator
      // This logic depends on where the offer signal is stored.
      // For simplicity, let's assume we have it.
    } catch (err) {
      toast.error('Could not access camera/microphone');
    }
  };

  return { startCall, answerIncomingCall };
};
