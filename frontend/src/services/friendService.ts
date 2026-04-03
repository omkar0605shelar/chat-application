import { userApi } from "../api/axios";

export const friendService = {
  acceptInvite: async (otp: string) => {
    // This is a stub - real backend needs /friend/accept
    const res = await userApi.post("/friends/accept", { otp });
    return res.data;
  },

  getFriends: async () => {
    try {
      const res = await userApi.get("/friends");
      // Handle different possible response formats
      return (
        res.data.data ||
        res.data.friends ||
        (Array.isArray(res.data) ? res.data : [])
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        try {
          const res = await userApi.get("/friends/my");
          return (
            res.data.data ||
            res.data.friends ||
            (Array.isArray(res.data) ? res.data : [])
          );
        } catch (innerError: any) {
          if (innerError.response?.status === 404) {
            console.warn("Friends endpoint not found, returning empty list");
            return [];
          }
          throw innerError;
        }
      }
      throw error;
    }
  },

  getPendingRequests: async () => {
    // This is a stub - real backend needs /friend/pending
    const res = await userApi.get("/friends/pending");
    return res.data.data;
  },

  generateJoinOtp: async () => {
    // This is a stub - real backend needs /friends/generate-otp
    const res = await userApi.post("/friends/generate-otp");
    return res.data.data.otp;
  },

  joinWithOtp: async (otp: string) => {
    // This is a stub - real backend needs /friends/join-otp
    const res = await userApi.post("/friends/join-otp", { otp });
    return res.data;
  },
};
