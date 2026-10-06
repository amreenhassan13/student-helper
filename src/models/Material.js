import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseCode: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String, required: true }, // e.g., Google Drive link
  uploader: { type: String, required: true },
  userEmail: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Material || mongoose.model('Material', MaterialSchema);