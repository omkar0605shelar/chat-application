import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests, getMyFriends, generateFriendOtp, addFriendByOtp } from "../controllers/friend.js";
const router = express.Router();
router.post("/request", isAuth, sendFriendRequest);
router.patch("/accept/:requestId", isAuth, acceptFriendRequest);
router.patch("/reject/:requestId", isAuth, rejectFriendRequest);
router.get("/requests", isAuth, getFriendRequests);
router.get("/", isAuth, getMyFriends);
router.post("/generate-otp", isAuth, generateFriendOtp);
router.post("/add-by-otp", isAuth, addFriendByOtp);
export default router;
//# sourceMappingURL=friend.js.map