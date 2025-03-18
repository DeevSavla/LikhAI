import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { userModel } from '../models/user.model.js';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

config();

const otpStore = {};
const failedLoginAttempts = {};
const failedOtpAttempts = {};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutes

const isRateLimited = (store, email) => {
  const userAttempts = store[email];
  if (userAttempts && userAttempts.count >= MAX_ATTEMPTS) {
    const timePassed = Date.now() - userAttempts.firstAttempt;
    if (timePassed < BLOCK_TIME) {
      return true; // Block user
    } else {
      delete store[email]; // Reset counter after block time expires
    }
  }
  return false;
};

const recordFailedAttempt = (store, email) => {
  if (!store[email]) {
    store[email] = { count: 1, firstAttempt: Date.now() };
  } else {
    store[email].count++;
  }
};

const resetFailedAttempts = (store, email) => {
  if (store[email]) {
    delete store[email];
  }
};

const loginOtpController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    console.log(user)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    console.log("Generated otp:", otp);

    otpStore[email] = otp;

    const mailOptions = {
      from: process.env.GMAIL_USERNAME,
      to: user.email,
      subject: "Your OTP for Login",
      text: `Your OTP for login is ${otp}`,
      html: `<p>Your OTP for login is <strong>${otp}</strong></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to send OTP" });
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(200).json({ success: true, message: "OTP sent to user" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in login", error });
  }
};

const loginPasswordController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "No email or phone number and password provided.",
    });
  }

  if (isRateLimited(failedLoginAttempts, email)) {
    return res.status(429).json({
      message: "Too many failed login attempts. Try again after 15 minutes.",
    });
  }

  try {
    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      recordFailedAttempt(failedLoginAttempts, email);
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    resetFailedAttempts(failedLoginAttempts, email);

    const token = jwt.sign({ userIdentifier: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred.",
      error: err.message,
    });
  }
};

const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "No OTP found for the provided email/phone.",
    });
  }

  if (otp.length !== 6) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP length.",
    });
  }

  if (isRateLimited(failedOtpAttempts, email)) {
    return res.status(429).json({
      success: false,
      message: "Too many failed OTP attempts. Try again after 15 minutes.",
    });
  }

  try {
    const storedOtp = otpStore[email];

    console.log("Stored otp:", storedOtp);

    if (!storedOtp) {
      return res.status(404).json({
        success: false,
        message: "No OTP entered.",
      });
    }

    if (storedOtp !== otp) {
      recordFailedAttempt(failedOtpAttempts, email);
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    resetFailedAttempts(failedOtpAttempts, email);
    delete otpStore[email];

    const user = await userModel.findOne({ email: email });

    const token = jwt.sign({ userIdentifier: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error verifying OTP.",
      error: error.message,
    });
  }
};

export {
  loginOtpController,
  loginPasswordController,
  verifyOtpController,
};
