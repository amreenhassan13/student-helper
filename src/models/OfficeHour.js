import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  timeSlot: { type: String, required: true }, // e.g., "Tuesday 2:30 PM"
  createdAt: { type: Date, default: Date.now },
});

const OfficeHourSchema = new mongoose.Schema({
  professorName: { type: String, required: true },
  courseCode: { type: String, required: true },
  location: { type: String, required: true }, // e.g., "Room 402 or Zoom"
  scheduleImageUrl: { type: String, required: true }, // The photo of the schedule
  postedBy: { type: String, required: true },
  userEmail: { type: String, required: true },
  bookings: [BookingSchema], // The "comments" where students book times
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.OfficeHour || mongoose.model('OfficeHour', OfficeHourSchema);