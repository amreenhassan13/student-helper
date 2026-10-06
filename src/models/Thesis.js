import mongoose from 'mongoose';

const ThesisSchema = new mongoose.Schema({
  title: {
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
  department: {
    type: String,
    required: true, // e.g., "Computer Science", "Biology"
  },
  abstract: {
    type: String,
    required: true,
  },
  tags: {
    type: String,
    required: true, // e.g., "Machine Learning, Computer Vision"
  },
  pdfUrl: {
    type: String,
    default: "", // Optional link to the full paper
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Thesis || mongoose.model('Thesis', ThesisSchema);