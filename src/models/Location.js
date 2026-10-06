import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // e.g., "Advanced Physics Lab" or "Dr. Smith's Office"
  },
  building: {
    type: String,
    required: true, // e.g., "Science Wing" or "Building 4"
  },
  roomNumber: {
    type: String,
    required: true, // e.g., "SW-402"
  },
  category: {
    type: String,
    enum: ['Academic/Lecture', 'Laboratory', 'Faculty Office', 'Student Facility', 'Admin/Support'],
    required: true,
  },
  description: {
    type: String,
    required: true, // e.g., "Take the North elevator to the 4th floor, end of the hall."
  },
  addedBy: {
    type: String,
    required: true,
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

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);