import { generateToken } from "../config/generateToken.js";
import TryCatch from "../config/TryCatch.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import {User} from '../model/User.js';
import nodemailer from "nodemailer";

// In-memory OTP storage
const otpStore = new Map<string, { otp: string; expiresAt: number }>();
const rateLimitStore = new Map<string, number>();

const sendOtpEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.USER,
    to,
    subject: "Your OTP code",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });
};

export const loginUser = TryCatch(async(req, res) => {
  try {
    const {email} = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Check env vars
    if (!process.env.USER || !process.env.PASSWORD) {
      console.error("Missing EMAIL credentials in env");
      res.status(500).json({ message: "Server email configuration error" });
      return;
    }

    // Rate limiting check
    const now = Date.now();
    const rateLimitKey = `ratelimit:${email}`;
    const lastRequest = rateLimitStore.get(rateLimitKey);

    if (lastRequest && now - lastRequest < 60000) {
      res.status(420).json({
        message: "Too many requests. Please wait before requesting new otp"
      });
      return;
    }

    const otp = Math.floor(Math.random()*900000 + 100000).toString();

    // Store OTP in memory with 5 minute expiry
    otpStore.set(email, { otp, expiresAt: now + 5 * 60 * 1000 });
    rateLimitStore.set(rateLimitKey, now);

    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email"
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message
    });
  }
})

export const verifyUser = TryCatch(async (req, res) => {
  const {email, otp: enteredOtp} = req.body;

  if(!email || !enteredOtp){
    res.status(400).json({
      message: "Email and otp required."
    })
    return;
  }

  const stored = otpStore.get(email);

  if(!stored || stored.otp !== enteredOtp || Date.now() > stored.expiresAt){
    return res.status(400).json({
      message: "Invalid otp or expired otp"
    });
  }

  otpStore.delete(email);

  let user = await User.findOne({email});

  if(!user){
    const name = email.slice(0, 8);
    user = await User.create({
      name,
      email 
    })
  }

  const token = generateToken(user);

  res.status(200).json({
    message: "User verified.",
    user, 
    token
  })
})

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  // Fetch fresh user data from database to get latest avatar and other updates
  const user = await User.findById(req.user?._id);
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
})

export const updateProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id);

  if(!user){
    return res.status(404).json({
      message: "Please login."
    })
  }

  console.log("Update profile - req.body:", req.body);
  console.log("Update profile - req.file:", req.file ? { filename: req.file.originalname, size: req.file.size } : 'No file');

  if (req.body.name) user.name = req.body.name;

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
        } catch {
          // Keep profile update successful even if old image cleanup fails.
        }
      }
    } catch (error: any) {
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
  })
})

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
  const users = await User.find();

  return res.json(users);
})

export const getUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  res.json(user);
})