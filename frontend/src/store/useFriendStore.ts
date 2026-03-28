import { create } from 'zustand';
import type { Friend, FriendRequest } from '../types';

interface FriendStore {
    friends: Friend[];
    pendingRequests: FriendRequest[];
    isLoading: boolean;

    setFriends: (friends: Friend[]) => void;
    addFriend: (friend: Friend) => void;
    setPendingRequests: (requests: FriendRequest[]) => void;
    removePendingRequest: (id: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useFriendStore = create<FriendStore>((set) => ({
    friends: [],
    pendingRequests: [],
    isLoading: false,

    setFriends: (friends) => set({ friends }),
    addFriend: (friend) =>
        set((state) => ({ friends: [...state.friends, friend] })),
    setPendingRequests: (pendingRequests) => set({ pendingRequests }),
    removePendingRequest: (id) =>
        set((state) => ({
            pendingRequests: state.pendingRequests.filter((r) => r._id !== id),
        })),
    setLoading: (isLoading) => set({ isLoading }),
}));
