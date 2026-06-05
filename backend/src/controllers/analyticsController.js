import { Experience, Question } from '../models/index.js';

export const getSystemAnalytics = async (req, res) => {
  try {
    const experiences = await Experience.find({});
    const questions = await Question.find({});

    const totalExperiences = experiences.length;
    const totalQuestions = questions.length;

    // Aggregate Top Companies by experience count
    const companyCounts = {};
    for (const exp of experiences) {
      const name = exp.companyName;
      companyCounts[name] = (companyCounts[name] || 0) + 1;
    }

    const topCompanies = Object.entries(companyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Aggregate Top DSA Topics by question count
    const topicCounts = {};
    for (const q of questions) {
      const topic = q.topic;
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }

    const topTopics = Object.entries(topicCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Trending companies: based on recent upvotes or posts
    const trendingCompanies = topCompanies.map(c => c.name).slice(0, 3);

    res.status(200).json({
      totalExperiences,
      totalQuestions,
      topCompanies,
      topTopics,
      trendingCompanies
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving analytics.' });
  }
};

export const getCompanyInsights = async (req, res) => {
  try {
    const { companyName } = req.params;
    
    // Perform a case-insensitive match
    const regex = new RegExp(`^${companyName}$`, 'i');
    
    const experiences = await Experience.find({ companyName: { $regex: regex } });
    const questions = await Question.find({ companyName: { $regex: regex } });

    const totalExperiences = experiences.length;
    const totalQuestions = questions.length;

    // Difficulty distribution
    const difficultyDistribution = { Easy: 0, Medium: 0, Hard: 0 };
    // Topic distribution
    const topicCounts = {};

    for (const q of questions) {
      if (difficultyDistribution[q.difficulty] !== undefined) {
        difficultyDistribution[q.difficulty]++;
      }
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    }

    const frequentlyAskedTopics = Object.entries(topicCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Selection status ratio
    const statusCounts = { Selected: 0, Rejected: 0, Waiting: 0 };
    for (const exp of experiences) {
      if (statusCounts[exp.status] !== undefined) {
        statusCounts[exp.status]++;
      }
    }

    res.status(200).json({
      companyName,
      totalExperiences,
      totalQuestions,
      difficultyDistribution,
      frequentlyAskedTopics,
      statusCounts,
      questions: questions.slice(0, 10) // return up to 10 sample questions
    });
  } catch (error) {
    console.error('Get company insights error:', error);
    res.status(500).json({ message: 'Server error retrieving company insights.' });
  }
};
