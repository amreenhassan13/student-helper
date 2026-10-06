import mongoose from 'mongoose';

const TutorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courses: {
    type: String,
    required: true, // e.g., "MATH201, PHY101"
  },
  hourlyRate: {
    type: Number,
    required: true, // 0 means volunteer/free
  },
  availability: {
    type: String,
    required: true, // e.g., "Weekends only" or "Mon/Wed evenings"
  },
  contactInfo: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Tutor || mongoose.model('Tutor', TutorSchema);