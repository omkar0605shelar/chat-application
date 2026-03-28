import { Socket } from 'socket.io-client';
import Peer from 'simple-peer';

export const callService = {
    /**
     * Initiate a call to another user. Creates an offer and emits call:offer via socket.
     */
    initiateCall: (
        socket: Socket,
        targetUserId: string,
        stream: MediaStream,
        onSignal: (signal: Peer.SignalData) => void,
        onStream: (stream: MediaStream) => void,
        onClose: () => void
    ): Peer.Instance => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (signal) => {
            socket.emit('call:offer', { to: targetUserId, signal });
            onSignal(signal);
        });

        peer.on('stream', onStream);
        peer.on('close', onClose);
        peer.on('error', () => onClose());

        return peer;
    },

    /**
     * Answer an incoming call. Creates an answer and emits call:answer via socket.
     */
    answerCall: (
        socket: Socket,
        callerId: string,
        incomingSignal: Peer.SignalData,
        stream: MediaStream,
        onStream: (stream: MediaStream) => void,
        onClose: () => void
    ): Peer.Instance => {
        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (signal) => {
            socket.emit('call:answer', { to: callerId, signal });
        });

        peer.on('stream', onStream);
        peer.on('close', onClose);
        peer.on('error', () => onClose());

        peer.signal(incomingSignal);

        return peer;
    },

    /**
     * Get user media (camera + mic).
     */
    getUserMedia: async (video = true, audio = true): Promise<MediaStream> => {
        return navigator.mediaDevices.getUserMedia({ video, audio });
    },

    /**
     * Emit call end event.
     */
    endCall: (socket: Socket, peerId: string) => {
        socket.emit('call:end', { to: peerId });
    },
};
