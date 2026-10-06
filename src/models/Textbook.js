import mongoose from 'mongoose';

const TextbookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    required: true,
  },
  contactInfo: {
    type: String,
    required: true, // e.g., "Email me at student@uni.edu" or a phone number
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Textbook || mongoose.model('Textbook', TextbookSchema);