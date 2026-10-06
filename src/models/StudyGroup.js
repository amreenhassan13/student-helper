import mongoose from 'mongoose';

const StudyGroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  meetingTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true, // E.g., "Library Room 3A" or a Zoom link
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 2,
  },
  currentMembers: {
    type: Number,
    default: 1,
  },
  creator: {
    type: String,
    default: 'Anonymous Student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.StudyGroup || mongoose.model('StudyGroup', StudyGroupSchema);