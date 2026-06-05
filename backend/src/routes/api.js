import express from 'express';
import { 
  register, 
  verifyEmail, 
  login, 
  refresh, 
  logout, 
  forgotPassword, 
  resetPassword, 
  getProfile, 
  updateProfile 
} from '../controllers/authController.js';
import { 
  getExperiences, 
  getExperienceById, 
  createExperience, 
  updateExperience, 
  deleteExperience, 
  voteExperience 
} from '../controllers/experienceController.js';
import { 
  getQuestions, 
  createQuestion, 
  deleteQuestion 
} from '../controllers/questionController.js';
import { 
  getTips, 
  createTip, 
  deleteTip, 
  voteTip 
} from '../controllers/tipController.js';
import { 
  getCommentsByExperience, 
  createComment, 
  deleteComment 
} from '../controllers/commentController.js';
import { 
  getSystemAnalytics, 
  getCompanyInsights 
} from '../controllers/analyticsController.js';
import { 
  getUsers, 
  toggleUserRole, 
  deleteUser 
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// AUTHENTICATION & USER PROFILE
// ==========================================
router.post('/auth/register', register);
router.post('/auth/verify-email', verifyEmail);
router.post('/auth/login', login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

router.get('/users/profile', protect, getProfile);
router.put('/users/profile', protect, updateProfile);

// ==========================================
// INTERVIEW EXPERIENCES
// ==========================================
router.get('/experiences', getExperiences);
router.get('/experiences/:id', getExperienceById);
router.post('/experiences', protect, createExperience);
router.put('/experiences/:id', protect, updateExperience);
router.delete('/experiences/:id', protect, deleteExperience);
router.post('/experiences/:id/vote', protect, voteExperience);

// ==========================================
// COMMENTS & DISCUSSION THREADS
// ==========================================
router.get('/experiences/:experienceId/comments', getCommentsByExperience);
router.post('/experiences/:experienceId/comments', protect, createComment);
router.delete('/comments/:id', protect, deleteComment);

// ==========================================
// GLOBAL QUESTIONS BANK
// ==========================================
router.get('/questions', getQuestions);
router.post('/questions', protect, createQuestion);
router.delete('/questions/:id', protect, deleteQuestion);

// ==========================================
// PREPARATION TIPS & SUGGESTIONS
// ==========================================
router.get('/tips', getTips);
router.post('/tips', protect, createTip);
router.delete('/tips/:id', protect, deleteTip);
router.post('/tips/:id/vote', protect, voteTip);

// ==========================================
// ANALYTICS & COMPANY INSIGHTS
// ==========================================
router.get('/analytics', getSystemAnalytics);
router.get('/companies/:companyName/insights', getCompanyInsights);

// ==========================================
// ADMIN MODERATION PANEL
// ==========================================
router.get('/admin/users', protect, admin, getUsers);
router.put('/admin/users/:id/role', protect, admin, toggleUserRole);
router.delete('/admin/users/:id', protect, admin, deleteUser);

export default router;
