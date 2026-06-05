import 'dotenv/config';
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  console.warn('Failed to set custom DNS servers:', e.message);
}
import mongoose from 'mongoose';
import { mockDbInstance } from '../utils/mockDb.js';

const isMongoConfigured = !!process.env.MONGO_URI;
let useMockDb = !isMongoConfigured;

// Define Schemas for Mongoose (used if MongoDB is configured)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  college: { type: String, required: true },
  branch: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  currentCompany: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
}, { timestamps: true });

const experienceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true, index: true },
  role: { type: String, required: true },
  interviewDate: { type: Date, required: true },
  status: { type: String, enum: ['Selected', 'Rejected', 'Waiting'], required: true },
  oaExperience: { type: String, default: '' },
  technicalRoundExperience: { type: String, default: '' },
  hrRoundExperience: { type: String, default: '' },
  overallExperience: { type: String, required: true },
  preparationTips: { type: String, default: '' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
  experience: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  companyName: { type: String, required: true, index: true }
}, { timestamps: true });

const tipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  experience: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
  text: { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

let MongooseUser, MongooseExperience, MongooseQuestion, MongooseTip, MongooseComment;

if (isMongoConfigured) {
  try {
    console.log('MongoDB URI provided. Attempting to connect...');
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000 // Timeout quickly if not reachable
    });
    console.log('Successfully connected to MongoDB.');
    
    MongooseUser = mongoose.model('User', userSchema);
    MongooseExperience = mongoose.model('Experience', experienceSchema);
    MongooseQuestion = mongoose.model('Question', questionSchema);
    MongooseTip = mongoose.model('Tip', tipSchema);
    MongooseComment = mongoose.model('Comment', commentSchema);
  } catch (error) {
    console.error('Failed to connect to MongoDB, falling back to JSON mock database:', error.message);
    useMockDb = true;
  }
} else {
  console.log('No MONGO_URI environment variable detected. Running in Resilient JSON Mock Database mode.');
}

// Export wrappers that switch implementation depending on connection status
export const User = {
  find: (f) => useMockDb ? mockDbInstance.collection('users').find(f) : MongooseUser.find(f),
  findOne: (f) => useMockDb ? mockDbInstance.collection('users').findOne(f) : MongooseUser.findOne(f),
  findById: (id) => useMockDb ? mockDbInstance.collection('users').findById(id) : MongooseUser.findById(id),
  create: (d) => useMockDb ? mockDbInstance.collection('users').create(d) : MongooseUser.create(d),
  findByIdAndUpdate: (id, u, o) => useMockDb ? mockDbInstance.collection('users').findByIdAndUpdate(id, u, o) : MongooseUser.findByIdAndUpdate(id, u, o),
  findByIdAndDelete: (id) => useMockDb ? mockDbInstance.collection('users').findByIdAndDelete(id) : MongooseUser.findByIdAndDelete(id),
  countDocuments: (f) => useMockDb ? mockDbInstance.collection('users').countDocuments(f) : MongooseUser.countDocuments(f)
};

export const Experience = {
  find: (f) => useMockDb ? mockDbInstance.collection('experiences').find(f) : MongooseExperience.find(f),
  findOne: (f) => useMockDb ? mockDbInstance.collection('experiences').findOne(f) : MongooseExperience.findOne(f),
  findById: (id) => useMockDb ? mockDbInstance.collection('experiences').findById(id) : MongooseExperience.findById(id),
  create: (d) => useMockDb ? mockDbInstance.collection('experiences').create(d) : MongooseExperience.create(d),
  findByIdAndUpdate: (id, u, o) => useMockDb ? mockDbInstance.collection('experiences').findByIdAndUpdate(id, u, o) : MongooseExperience.findByIdAndUpdate(id, u, o),
  findByIdAndDelete: (id) => useMockDb ? mockDbInstance.collection('experiences').findByIdAndDelete(id) : MongooseExperience.findByIdAndDelete(id),
  countDocuments: (f) => useMockDb ? mockDbInstance.collection('experiences').countDocuments(f) : MongooseExperience.countDocuments(f)
};

export const Question = {
  find: (f) => useMockDb ? mockDbInstance.collection('questions').find(f) : MongooseQuestion.find(f),
  findOne: (f) => useMockDb ? mockDbInstance.collection('questions').findOne(f) : MongooseQuestion.findOne(f),
  findById: (id) => useMockDb ? mockDbInstance.collection('questions').findById(id) : MongooseQuestion.findById(id),
  create: (d) => useMockDb ? mockDbInstance.collection('questions').create(d) : MongooseQuestion.create(d),
  findByIdAndUpdate: (id, u, o) => useMockDb ? mockDbInstance.collection('questions').findByIdAndUpdate(id, u, o) : MongooseQuestion.findByIdAndUpdate(id, u, o),
  findByIdAndDelete: (id) => useMockDb ? mockDbInstance.collection('questions').findByIdAndDelete(id) : MongooseQuestion.findByIdAndDelete(id),
  countDocuments: (f) => useMockDb ? mockDbInstance.collection('questions').countDocuments(f) : MongooseQuestion.countDocuments(f)
};

export const Tip = {
  find: (f) => useMockDb ? mockDbInstance.collection('tips').find(f) : MongooseTip.find(f),
  findOne: (f) => useMockDb ? mockDbInstance.collection('tips').findOne(f) : MongooseTip.findOne(f),
  findById: (id) => useMockDb ? mockDbInstance.collection('tips').findById(id) : MongooseTip.findById(id),
  create: (d) => useMockDb ? mockDbInstance.collection('tips').create(d) : MongooseTip.create(d),
  findByIdAndUpdate: (id, u, o) => useMockDb ? mockDbInstance.collection('tips').findByIdAndUpdate(id, u, o) : MongooseTip.findByIdAndUpdate(id, u, o),
  findByIdAndDelete: (id) => useMockDb ? mockDbInstance.collection('tips').findByIdAndDelete(id) : MongooseTip.findByIdAndDelete(id),
  countDocuments: (f) => useMockDb ? mockDbInstance.collection('tips').countDocuments(f) : MongooseTip.countDocuments(f)
};

export const Comment = {
  find: (f) => useMockDb ? mockDbInstance.collection('comments').find(f) : MongooseComment.find(f),
  findOne: (f) => useMockDb ? mockDbInstance.collection('comments').findOne(f) : MongooseComment.findOne(f),
  findById: (id) => useMockDb ? mockDbInstance.collection('comments').findById(id) : MongooseComment.findById(id),
  create: (d) => useMockDb ? mockDbInstance.collection('comments').create(d) : MongooseComment.create(d),
  findByIdAndUpdate: (id, u, o) => useMockDb ? mockDbInstance.collection('comments').findByIdAndUpdate(id, u, o) : MongooseComment.findByIdAndUpdate(id, u, o),
  findByIdAndDelete: (id) => useMockDb ? mockDbInstance.collection('comments').findByIdAndDelete(id) : MongooseComment.findByIdAndDelete(id),
  countDocuments: (f) => useMockDb ? mockDbInstance.collection('comments').countDocuments(f) : MongooseComment.countDocuments(f)
};

export const isUsingMockDb = () => useMockDb;
