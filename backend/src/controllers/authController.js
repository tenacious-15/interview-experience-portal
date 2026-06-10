import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../config/mailer.js';
import { uploadImage } from '../config/cloudinary.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_123';

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { name, email, password, college, branch, graduationYear, currentCompany } = req.body;

    if (!name || !email || !password || !college || !branch || !graduationYear) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      college,
      branch,
      graduationYear: parseInt(graduationYear),
      currentCompany: currentCompany || '',
      isVerified: true, // Auto verified
      verificationToken: null
    });

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
      email: newUser.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required.' });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Auto verify legacy unverified accounts upon successful login
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Set Refresh Token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        currentCompany: user.currentCompany,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found.' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token.' });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(403).json({ message: 'User not found.' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      // Reset Refresh Token in cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh.' });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout.' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await sendResetPasswordEmail(user.email, resetToken, user.name);
    } catch (mailError) {
      console.error('Failed to send reset email:', mailError.message);
    }

    const responsePayload = {
      message: 'Password reset link sent to your email.'
    };

    if (process.env.NODE_ENV !== 'production') {
      responsePayload.devResetToken = resetToken;
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during forgot password.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Validate token expiry (mongoose checks Date object, mockDb does it too or we can just double check here)
    if (user.resetPasswordExpire && new Date(user.resetPasswordExpire).getTime() < Date.now()) {
      return res.status(400).json({ message: 'Password reset token has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      branch: user.branch,
      graduationYear: user.graduationYear,
      currentCompany: user.currentCompany,
      avatar: user.avatar || '',
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, college, branch, graduationYear, currentCompany, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (college) user.college = college;
    if (branch) user.branch = branch;
    if (graduationYear) user.graduationYear = parseInt(graduationYear);
    if (currentCompany !== undefined) user.currentCompany = currentCompany;

    if (avatar) {
      const avatarUrl = await uploadImage(avatar);
      user.avatar = avatarUrl;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        currentCompany: user.currentCompany,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    // Verify Google Token via Google tokeninfo API (native fetch)
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!googleRes.ok) {
      return res.status(400).json({ message: 'Invalid Google credential.' });
    }

    const payload = await googleRes.json();
    const { email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Google email is not verified.' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Create user if not exists
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'student',
        college: 'Not Specified',
        branch: 'Not Specified',
        graduationYear: new Date().getFullYear(),
        currentCompany: '',
        isVerified: true,
        avatar: picture || ''
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Set Refresh Token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful via Google!',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        currentCompany: user.currentCompany,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during Google login.' });
  }
};

