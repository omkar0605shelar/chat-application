import Peer from 'simple-peer';
import { Socket } from 'socket.io-client';

export const callService = {
  initiateCall: (socket: Socket, targetUserId: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (data) => {
      socket.emit('call:offer', {
        targetUserId,
        signal: data,
      });
    });

    return peer;
  },

  answerCall: (socket: Socket, targetUserId: string, offerSignal: any, stream: MediaStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (data) => {
      socket.emit('call:answer', {
        targetUserId,
        signal: data,
      });
    });

    peer.signal(offerSignal);

    return peer;
  },
};
