import mongoose from 'mongoose';

const AlumnusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  graduationYear: {
    type: Number,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  currentCompany: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  offerings: {
    type: String,
    required: true, // e.g., "Resume Review, Mock Interviews, General Chat"
  },
  contactInfo: {
    type: String,
    required: true, // LinkedIn URL or Email
  },
  userEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Alumnus || mongoose.model('Alumnus', AlumnusSchema);