import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getMyFriends,
    generateFriendOtp,
    addFriendByOtp
} from "../controllers/friend.js";

const router = express.Router();

router.post("/request", isAuth as any, sendFriendRequest);
router.patch("/accept/:requestId", isAuth as any, acceptFriendRequest);
router.patch("/reject/:requestId", isAuth as any, rejectFriendRequest);
router.get("/requests", isAuth as any, getFriendRequests);
router.get("/", isAuth as any, getMyFriends);

router.post("/generate-otp", isAuth as any, generateFriendOtp);
router.post("/add-by-otp", isAuth as any, addFriendByOtp);

export default router;
