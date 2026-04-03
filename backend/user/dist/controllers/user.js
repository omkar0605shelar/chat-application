import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { redisClient } from "../index.js";
import { User } from '../model/User.js';
export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp: ratelimit;${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        res.status(420).json({
            message: "Too many requests. Please wait before requesting new otp"
        });
        return;
    }
    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {
        EX: 300,
    });
    await redisClient.set(rateLimitKey, "true", {
        EX: 60
    });
    const message = {
        to: email,
        subject: 'Your Otp code.',
        body: `Your otp is ${otp}. It is valid for 5 minutes.`
    };
    await publishToQueue("send-otp", message);
    res.status(200).json({
        message: "OTP send to your email"
    });
});
export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;
    if (!email || !enteredOtp) {
        res.status(400).json({
            message: "Email and otp required."
        });
        return;
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || String(storedOtp) !== enteredOtp) {
        return res.status(400).json({
            message: "Invalid otp or expired otp"
        });
    }
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    if (!user) {
        const name = email.slice(0, 8);
        user = await User.create({
            name,
            email
        });
    }
    const token = generateToken(user);
    res.status(200).json({
        message: "User verified.",
        user,
        token
    });
});
export const myProfile = TryCatch(async (req, res) => {
    // Fetch fresh user data from database to get latest avatar and other updates
    const user = await User.findById(req.user?._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
});
export const updateProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        return res.status(404).json({
            message: "Please login."
        });
    }
    console.log("Update profile - req.body:", req.body);
    console.log("Update profile - req.file:", req.file ? { filename: req.file.originalname, size: req.file.size } : 'No file');
    if (req.body.name)
        user.name = req.body.name;
    const file = req.file;
    if (file) {
        try {
            const uploaded = await uploadToCloudinary(file.buffer);
            const previousPublicId = user.avatar?.publicId;
            user.avatar = {
                publicId: uploaded.publicId,
                url: uploaded.url,
            };
            console.log("Avatar uploaded:", user.avatar);
            if (previousPublicId) {
                try {
                    await cloudinary.uploader.destroy(previousPublicId);
                }
                catch {
                    // Keep profile update successful even if old image cleanup fails.
                }
            }
        }
        catch (error) {
            const message = String(error?.message || "");
            if (message.toLowerCase().includes("invalid signature")) {
                return res.status(500).json({
                    message: "Cloudinary credentials are invalid. Please verify CLOUDINARY_API_SECRET.",
                });
            }
            return res.status(500).json({
                message: "Failed to upload profile image. Please try again.",
            });
        }
    }
    await user.save();
    const token = generateToken(user);
    // Convert to plain object to ensure all fields are properly serialized
    const userResponse = user.toObject ? user.toObject() : user;
    console.log("Profile update response - user.avatar:", userResponse.avatar);
    res.json({
        message: "Profile updated.",
        user: userResponse,
        token
    });
});
export const getAllUsers = TryCatch(async (req, res) => {
    const users = await User.find();
    return res.json(users);
});
export const getUser = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});
//# sourceMappingURL=user.js.map