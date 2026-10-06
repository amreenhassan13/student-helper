import mongoose from 'mongoose';

const SkillExchangeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  offering: {
    type: String,
    required: true, // e.g., "Python, Calculus 1"
  },
  seeking: {
    type: String,
    required: true, // e.g., "French conversation, Figma"
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
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

export default mongoose.models.SkillExchange || mongoose.model('SkillExchange', SkillExchangeSchema);