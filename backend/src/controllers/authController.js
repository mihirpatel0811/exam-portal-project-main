const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required', status: 400 });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered', status: 400 });

    // Only allow student or teacher role for public registration (not admin)
    const safeRole = (role === 'teacher') ? 'teacher' : 'student';
    const user = await User.create({ name, email, password, role: safeRole });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required', status: 400 });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials', status: 401 });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated', status: 403 });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
