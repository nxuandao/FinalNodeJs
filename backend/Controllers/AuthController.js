const bcrypt = require('bcrypt');
const UserModel = require('../Models/User');
const jwt = require('jsonwebtoken');

const { sendVerificationEmail, sendResetPasswordEmail, sendEmail } = require('../utils/email'); const crypto = require('crypto');

const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role, status } = req.body;

    // Kiểm tra user tồn tại chưa
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 60 * 60 * 1000;

    const newUser = new UserModel({
      name,
      email,
      phone,
      password: hashedPassword,
      // address,
      // activity_log: [],
      role: role || "user", 
      status: status || "active", 
      verificationToken: token,
      isVerified: false,
      verificationTokenExpiry: new Date(expiry)
    });

    await newUser.save();

    await sendVerificationEmail(email, token);

    res.status(201).json({
      message: "User created successfully",
      success: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user tồn tại chưa
    const existingUser = await UserModel.findOne({ email });
    const errorMessage = "User failed email or password is wrong";
    const userNotFoundMessage = "User not found with this email. Please sign up first.";
    if (!existingUser) {
      return res.status(403).json({
        message: userNotFoundMessage,
        success: false
      });
    }
    if (!existingUser.isVerified) {
      return res.status(403).json({ message: "Please verify your email before login", success: false });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(403).json({
        message: errorMessage,
        success: false
      });
    }
    
    // Tạo JWT
    await existingUser.save();
    const jwtToken = jwt.sign({ id: existingUser._id, role: existingUser.role  },
       process.env.JWT_SECRET, { expiresIn: '1h' });

    // Ghi log đăng nhập
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    const userAgent = req.get("User-Agent");

    const newLog = {
      action: "Login",
      ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "guest",
      userAgent: req.get("User-Agent") || "guest",
      time: new Date()
    };

    await UserModel.findByIdAndUpdate(existingUser._id, {
      $push: {
        activity_log: {
          $each: [newLog],
          $slice: -50
        }
      }
    });

    if (existingUser.status === "inactive") {
  return res.status(403).json({
    message: "Your account is inactive. Please contact admin.",
    success: false
  });
  } 

    res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        address: existingUser.address,
        role: existingUser.role,
        status: existingUser.status,
        activity_log: existingUser.activity_log,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt

      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const html = `
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click the link below to set a new password. This link expires in 15 minutes.</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `;
    await sendEmail(user.email, 'Reset your password', html);

    return res.json({ success: true, message: 'Password reset link sent to email' });
  } catch (err) {
    console.error('forgotPassword error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;
    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    console.log("Updated user:", user)

    res.json({ success: true, message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword
};
