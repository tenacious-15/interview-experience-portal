import { Experience, Question, User } from '../models/index.js';

export const getExperiences = async (req, res) => {
  try {
    const { company, role, status, year, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    // Apply filters
    if (company) {
      filter.companyName = { $regex: company, $options: 'i' };
    }
    if (role) {
      filter.role = { $regex: role, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch experiences, populate user details
    let query = Experience.find(filter)
      .populate('user', 'name college branch graduationYear currentCompany avatar')
      .sort({ createdAt: -1 });

    let experiences = await query;

    // Filter by year (graduationYear of user)
    if (year) {
      experiences = experiences.filter(exp => {
        const u = exp.user;
        return u && u.graduationYear === parseInt(year);
      });
    }

    // Filter by search term (searches companyName, role, or candidate name)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      experiences = experiences.filter(exp => {
        const candidateName = exp.user ? exp.user.name : '';
        return (
          searchRegex.test(exp.companyName) ||
          searchRegex.test(exp.role) ||
          searchRegex.test(candidateName)
        );
      });
    }

    // Apply pagination manually on filtered results
    const total = experiences.length;
    const paginatedExperiences = experiences.slice(skipNum, skipNum + limitNum);

    res.status(200).json({
      experiences: paginatedExperiences,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ message: 'Server error retrieving experiences.' });
  }
};

export const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id).populate('user', 'name college branch graduationYear currentCompany avatar');
    
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found.' });
    }

    // Find questions asked in this experience
    const questions = await Question.find({ experience: id });

    res.status(200).json({
      experience,
      questions
    });
  } catch (error) {
    console.error('Get experience by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving experience details.' });
  }
};

export const createExperience = async (req, res) => {
  try {
    const {
      companyName,
      role,
      interviewDate,
      status,
      oaExperience,
      technicalRoundExperience,
      hrRoundExperience,
      overallExperience,
      preparationTips,
      questions
    } = req.body;

    if (!companyName || !role || !interviewDate || !status || !overallExperience) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Create the experience
    const newExperience = await Experience.create({
      user: req.user.id,
      companyName,
      role,
      interviewDate: new Date(interviewDate),
      status,
      oaExperience: oaExperience || '',
      technicalRoundExperience: technicalRoundExperience || '',
      hrRoundExperience: hrRoundExperience || '',
      overallExperience,
      preparationTips: preparationTips || '',
      upvotes: []
    });

    // Create asked questions linked to this experience if provided
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        if (q.title && q.topic && q.difficulty) {
          await Question.create({
            experience: newExperience._id,
            user: req.user.id,
            title: q.title,
            description: q.description || '',
            link: q.link || '',
            topic: q.topic,
            difficulty: q.difficulty,
            companyName: companyName
          });
        }
      }
    }

    const populatedExperience = await Experience.findById(newExperience._id)
      .populate('user', 'name college branch graduationYear currentCompany avatar');

    res.status(201).json({
      message: 'Interview experience created successfully!',
      experience: populatedExperience
    });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ message: 'Server error creating experience.' });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyName,
      role,
      interviewDate,
      status,
      oaExperience,
      technicalRoundExperience,
      hrRoundExperience,
      overallExperience,
      preparationTips
    } = req.body;

    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found.' });
    }

    // Check ownership or admin role
    const isOwner = experience.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this experience.' });
    }

    const updates = {};
    if (companyName) updates.companyName = companyName;
    if (role) updates.role = role;
    if (interviewDate) updates.interviewDate = new Date(interviewDate);
    if (status) updates.status = status;
    if (oaExperience !== undefined) updates.oaExperience = oaExperience;
    if (technicalRoundExperience !== undefined) updates.technicalRoundExperience = technicalRoundExperience;
    if (hrRoundExperience !== undefined) updates.hrRoundExperience = hrRoundExperience;
    if (overallExperience) updates.overallExperience = overallExperience;
    if (preparationTips !== undefined) updates.preparationTips = preparationTips;

    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('user', 'name college branch graduationYear currentCompany avatar');

    res.status(200).json({
      message: 'Experience updated successfully!',
      experience: updatedExperience
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ message: 'Server error updating experience.' });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found.' });
    }

    // Check ownership or admin role
    const isOwner = experience.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this experience.' });
    }

    // Delete experience
    await Experience.findByIdAndDelete(id);
    
    // Also delete any linked questions
    const deletedQuestions = await Question.find({ experience: id });
    for (const q of deletedQuestions) {
      await Question.findByIdAndDelete(q._id);
    }

    res.status(200).json({ message: 'Experience and associated questions deleted successfully.' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ message: 'Server error deleting experience.' });
  }
};

export const voteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found.' });
    }

    const upvotes = experience.upvotes || [];
    const isUpvoted = upvotes.includes(userId);

    let updatedExperience;
    if (isUpvoted) {
      // Remove upvote
      updatedExperience = await Experience.findByIdAndUpdate(
        id,
        { $pull: { upvotes: userId } },
        { new: true }
      ).populate('user', 'name college branch graduationYear currentCompany avatar');
    } else {
      // Add upvote
      updatedExperience = await Experience.findByIdAndUpdate(
        id,
        { $push: { upvotes: userId } },
        { new: true }
      ).populate('user', 'name college branch graduationYear currentCompany avatar');
    }

    res.status(200).json({
      message: isUpvoted ? 'Upvote removed.' : 'Experience upvoted!',
      upvotes: updatedExperience.upvotes
    });
  } catch (error) {
    console.error('Vote experience error:', error);
    res.status(500).json({ message: 'Server error during voting.' });
  }
};
