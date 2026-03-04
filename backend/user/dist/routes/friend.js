import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests } from "../controllers/friend.js";
const router = express.Router();
router.post("/request", isAuth, sendFriendRequest);
router.patch("/accept/:requestId", isAuth, acceptFriendRequest);
router.patch("/reject/:requestId", isAuth, rejectFriendRequest);
router.get("/requests", isAuth, getFriendRequests);
export default router;
//# sourceMappingURL=friend.js.map