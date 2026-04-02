import { create } from "zustand";
import type { User, FriendRequest } from "../types";

interface FriendState {
  friends: User[];
  pendingRequests: FriendRequest[];
  loading: boolean;

  setFriends: (friends: User[]) => void;
  setPendingRequests: (requests: FriendRequest[]) => void;
  addFriend: (friend: User) => void;
  removeFriend: (friendId: string) => void;
  addPendingRequest: (request: FriendRequest) => void;
  removePendingRequest: (requestId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  pendingRequests: [],
  loading: false,

  setFriends: (friends) => set({ friends }),
  setPendingRequests: (pendingRequests) => set({ pendingRequests }),
  addFriend: (friend) =>
    set((state) => ({ friends: [...state.friends, friend] })),
  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter((f) => f._id !== friendId),
    })),
  addPendingRequest: (request) =>
    set((state) => ({
      pendingRequests: [...state.pendingRequests, request],
    })),
  removePendingRequest: (requestId) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
    })),
  setLoading: (loading) => set({ loading }),
}));
