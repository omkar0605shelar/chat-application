import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests
} from "../controllers/friend.js";

const router = express.Router();

router.post("/request", isAuth as any, sendFriendRequest);
router.patch("/accept/:requestId", isAuth as any, acceptFriendRequest);
router.patch("/reject/:requestId", isAuth as any, rejectFriendRequest);
router.get("/requests", isAuth as any, getFriendRequests);

export default router;
