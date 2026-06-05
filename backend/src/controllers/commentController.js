import { Comment } from '../models/index.js';

export const getCommentsByExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const allComments = await Comment.find({ experience: experienceId })
      .populate('user', 'name college branch graduationYear currentCompany avatar')
      .sort({ createdAt: 1 }); // Chronological order

    // Build hierarchical comment tree
    const rootComments = [];
    const commentMap = {};

    // Initial map setup
    for (const c of allComments) {
      commentMap[c._id] = {
        ...c,
        replies: []
      };
    }

    // Associate children with parents
    for (const c of allComments) {
      const mapped = commentMap[c._id];
      if (c.parentComment) {
        const parent = commentMap[c.parentComment];
        if (parent) {
          parent.replies.push(mapped);
        } else {
          // If parent not found (could be deleted), treat as root
          rootComments.push(mapped);
        }
      } else {
        rootComments.push(mapped);
      }
    }

    res.status(200).json(rootComments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error retrieving comments.' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const { text, parentCommentId } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const newComment = await Comment.create({
      user: req.user.id,
      experience: experienceId,
      text,
      parentComment: parentCommentId || null,
      upvotes: []
    });

    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'name college branch graduationYear currentCompany avatar');

    res.status(201).json({
      message: 'Comment posted successfully!',
      comment: {
        ...populatedComment,
        replies: []
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error posting comment.' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const isOwner = comment.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await Comment.findByIdAndDelete(id);

    // Recursively delete children (replies) if needed, or simply delete direct children
    const childComments = await Comment.find({ parentComment: id });
    for (const child of childComments) {
      await Comment.findByIdAndDelete(child._id);
    }

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment.' });
  }
};
