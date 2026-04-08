const User = require('../models/User');

// GET /api/users  (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) { next(err); }
};

// PUT /api/users/:id  (admin)
const updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id  (admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, updateUser, deleteUser };
