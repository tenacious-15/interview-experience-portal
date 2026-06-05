import { Question } from '../models/index.js';

export const getQuestions = async (req, res) => {
  try {
    const { company, difficulty, topic, search, page = 1, limit = 15 } = req.query;
    const filter = {};

    if (company) {
      filter.companyName = { $regex: company, $options: 'i' };
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (topic) {
      filter.topic = topic;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    // Direct search on model (handles $or filters natively in mongoose and mockDb helper)
    const questions = await Question.find(filter)
      .populate('user', 'name college branch graduationYear')
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    const total = await Question.countDocuments(filter);

    res.status(200).json({
      questions,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error retrieving questions.' });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, description, link, topic, difficulty, companyName } = req.body;

    if (!title || !topic || !difficulty || !companyName) {
      return res.status(400).json({ message: 'Title, Topic, Difficulty, and Company Name are required.' });
    }

    // Validate coding links (LeetCode, GFG, Codeforces)
    if (link) {
      const isLeetCode = link.toLowerCase().includes('leetcode.com');
      const isGFG = link.toLowerCase().includes('geeksforgeeks.org');
      const isCodeforces = link.toLowerCase().includes('codeforces.com');
      
      if (!isLeetCode && !isGFG && !isCodeforces) {
        return res.status(400).json({ message: 'Coding links must be valid LeetCode, GeeksforGeeks, or Codeforces URLs.' });
      }
    }

    const newQuestion = await Question.create({
      user: req.user.id,
      title,
      description: description || '',
      link: link || '',
      topic,
      difficulty,
      companyName
    });

    res.status(201).json({
      message: 'Question added to the bank successfully!',
      question: newQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error adding question.' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const isOwner = question.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this question.' });
    }

    await Question.findByIdAndDelete(id);
    res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error deleting question.' });
  }
};
