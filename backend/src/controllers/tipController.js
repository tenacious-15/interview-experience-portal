import { Tip } from '../models/index.js';

export const getTips = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }

    const tips = await Tip.find(filter)
      .populate('user', 'name college branch graduationYear currentCompany avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(tips);
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({ message: 'Server error retrieving tips.' });
  }
};

export const createTip = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, Content, and Category are required.' });
    }

    const newTip = await Tip.create({
      user: req.user.id,
      title,
      content,
      category,
      upvotes: []
    });

    const populatedTip = await Tip.findById(newTip._id)
      .populate('user', 'name college branch graduationYear currentCompany avatar');

    res.status(201).json({
      message: 'Preparation tip shared successfully!',
      tip: populatedTip
    });
  } catch (error) {
    console.error('Create tip error:', error);
    res.status(500).json({ message: 'Server error sharing tip.' });
  }
};

export const deleteTip = async (req, res) => {
  try {
    const { id } = req.params;
    const tip = await Tip.findById(id);

    if (!tip) {
      return res.status(404).json({ message: 'Preparation tip not found.' });
    }

    const isOwner = tip.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this tip.' });
    }

    await Tip.findByIdAndDelete(id);
    res.status(200).json({ message: 'Tip deleted successfully.' });
  } catch (error) {
    console.error('Delete tip error:', error);
    res.status(500).json({ message: 'Server error deleting tip.' });
  }
};

export const voteTip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const tip = await Tip.findById(id);
    if (!tip) {
      return res.status(404).json({ message: 'Preparation tip not found.' });
    }

    const upvotes = tip.upvotes || [];
    const isUpvoted = upvotes.includes(userId);

    let updatedTip;
    if (isUpvoted) {
      // Remove upvote
      updatedTip = await Tip.findByIdAndUpdate(
        id,
        { $pull: { upvotes: userId } },
        { new: true }
      ).populate('user', 'name college branch graduationYear currentCompany avatar');
    } else {
      // Add upvote
      updatedTip = await Tip.findByIdAndUpdate(
        id,
        { $push: { upvotes: userId } },
        { new: true }
      ).populate('user', 'name college branch graduationYear currentCompany avatar');
    }

    res.status(200).json({
      message: isUpvoted ? 'Upvote removed.' : 'Tip upvoted!',
      upvotes: updatedTip.upvotes
    });
  } catch (error) {
    console.error('Vote tip error:', error);
    res.status(500).json({ message: 'Server error voting tip.' });
  }
};
