const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'viewer', phone });
    const token = generateToken(user._id);

    await AuditLog.create({
      user: user._id,
      action: 'REGISTER',
      entity: 'User',
      entityId: user._id,
      details: { email }
    });

    res.status(201).json({
      message: 'Account created successfully',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

exports.adminCreateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role, phone });

    await AuditLog.create({
      user: req.user._id,
      action: 'ADMIN_CREATE_USER',
      entity: 'User',
      entityId: user._id,
      details: { email, role }
    });

    res.status(201).json({
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    await AuditLog.create({
      user: user._id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      details: { email }
    });

    res.json({
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Profile updated', data: user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account with that email exists' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    res.json({
      message: 'Password reset link generated',
      data: {
        resetToken,
        resetUrl,
        note: 'In production, this link would be sent to your email.'
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: user._id,
      details: { email: user.email }
    });

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
