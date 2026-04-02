import express from 'express';
import { getAllUsers, getUser, loginUser, myProfile, verifyUser, updateProfile } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';
const router = express.Router();
router.post("/login", loginUser);
router.post("/verify", verifyUser);
import { uploadFile } from '../middleware/multer.js';
router.get("/me", isAuth, myProfile);
router.get("/user/all", isAuth, getAllUsers);
router.get("/user/:id", getUser);
router.post("/update/profile", isAuth, uploadFile, updateProfile);
export default router;
//# sourceMappingURL=user.js.map