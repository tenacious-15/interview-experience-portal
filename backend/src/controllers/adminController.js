import { User, Experience, Question, Tip, Comment } from '../models/index.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 });

    // Clean sensitive fields
    const cleanedUsers = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      college: u.college,
      branch: u.branch,
      graduationYear: u.graduationYear,
      currentCompany: u.currentCompany,
      isVerified: u.isVerified,
      createdAt: u.createdAt
    }));

    res.status(200).json(cleanedUsers);
  } catch (error) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({ message: 'Server error retrieving users.' });
  }
};

export const toggleUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const newRole = user.role === 'admin' ? 'student' : 'admin';
    user.role = newRole;
    await user.save();

    res.status(200).json({ 
      message: `User role successfully updated to ${newRole}.`,
      userId: user._id,
      role: newRole
    });
  } catch (error) {
    console.error('Admin toggle role error:', error);
    res.status(500).json({ message: 'Server error changing user role.' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    // Cascade delete: delete experiences, tips, comments, and questions authored by this user
    await Experience.find({ user: id }).then(async (exps) => {
      for (const exp of exps) {
        await Question.find({ experience: exp._id }).then(async (qs) => {
          for (const q of qs) await Question.findByIdAndDelete(q._id);
        });
        await Experience.findByIdAndDelete(exp._id);
      }
    });

    // Delete comments by user
    await Comment.find({ user: id }).then(async (coms) => {
      for (const c of coms) await Comment.findByIdAndDelete(c._id);
    });

    // Delete tips by user
    await Tip.find({ user: id }).then(async (tips) => {
      for (const t of tips) await Tip.findByIdAndDelete(t._id);
    });

    res.status(200).json({ message: 'User and all associated content deleted successfully.' });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
};
