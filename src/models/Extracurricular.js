import mongoose from 'mongoose';

const ExtracurricularSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true, // e.g., "President", "Participant", "AWS Certified Developer"
  },
  organization: {
    type: String,
    required: true, // e.g., "Robotics Club", "HackTheNorth", "Amazon"
  },
  category: {
    type: String,
    enum: ['Club/Society', 'Hackathon/Competition', 'Certification', 'Volunteer', 'Other'],
    required: true,
  },
  timeframe: {
    type: String,
    required: true, // e.g., "Fall 2025 - Spring 2026" or "May 2026"
  },
  description: {
    type: String,
    required: true, // Bullet points of what they did
  },
  userEmail: {
    type: String,
    required: true, // Private to the user
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Extracurricular || mongoose.model('Extracurricular', ExtracurricularSchema);