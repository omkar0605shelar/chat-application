import api from './api';

export const friendService = {
    // Send an invitation via email — backend generates OTP and emails it
    sendInvite: async (email: string) => {
        return api.post('/friend/invite', { email });
    },

    // Accept a friend invite using OTP (the receiver enters the OTP)
    acceptInvite: async (otp: string) => {
        return api.post('/friend/accept', { otp });
    },

    // Get all accepted friends of the current user
    getFriends: async () => {
        return api.get('/friend/all');
    },

    // Get all pending friend requests
    getPendingRequests: async () => {
        return api.get('/friend/pending');
    },

    // Reject a friend request
    rejectRequest: async (requestId: string) => {
        return api.delete(`/friend/reject/${requestId}`);
    },
};
