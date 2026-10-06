"use client";

import { useState, useEffect } from "react";

export default function OfficeHoursPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Form State for Posting Schedule
  const [professorName, setProfessorName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [location, setLocation] = useState("");
  const [scheduleImageUrl, setScheduleImageUrl] = useState("");

  // Form State for Booking (Mapped by schedule ID)
  const [bookingInputs, setBookingInputs] = useState({});

  useEffect(() => {
    fetchSchedules();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/office-hours");
      if (!response.ok) throw new Error("Failed to fetch schedules");
      setSchedules(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Log in to post a schedule.");
    
    const newSchedule = { 
      professorName, courseCode, location, scheduleImageUrl, 
      postedBy: user.name, userEmail: user.email 
    };

    try {
      const response = await fetch("/api/office-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });

      if (!response.ok) throw new Error("Failed to post");

      setProfessorName(""); setCourseCode(""); setLocation(""); setScheduleImageUrl("");
      fetchSchedules(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBookingSubmit = async (e, scheduleId) => {
    e.preventDefault();
    if (!user) return alert("Log in to book a slot.");
    
    const timeSlot = bookingInputs[scheduleId];
    if (!timeSlot || timeSlot.trim() === "") return;

    try {
      const response = await fetch("/api/office-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scheduleId, studentName: user.name, studentEmail: user.email, timeSlot 
        }),
      });

      if (!response.ok) throw new Error("Failed to book slot");

      setBookingInputs((prev) => ({ ...prev, [scheduleId]: "" }));
      fetchSchedules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await fetch(`/api/office-hours?id=${id}`, { method: "DELETE" });
      setSchedules((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Faculty Office Hours</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Post a Schedule Photo */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Post a Schedule Photo</h2>
          
          {!user && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <a href="/login" className="font-bold underline">Log in</a> to help your peers.
            </div>
          )}

          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professor Name</label>
              <input type="text" required disabled={!user} value={professorName} onChange={(e) => setProfessorName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Dr. Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input type="text" required disabled={!user} value={courseCode} onChange={(e) => setCourseCode(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="CS101" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" required disabled={!user} value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Room 402" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Imgur, Discord, etc.)</label>
              <input type="url" required disabled={!user} value={scheduleImageUrl} onChange={(e) => setScheduleImageUrl(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="https://i.imgur.com/..." />
            </div>
            <button type="submit" disabled={!user} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors">
              Upload Schedule
            </button>
          </form>
        </div>

        {/* Right Column: Schedule Feed & Bookings */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No schedules posted. Snap a photo of a professor's door and link it here!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {schedules.map((schedule) => (
                <div key={schedule._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative group">
                  
                  {user && user.email === schedule.userEmail && (
                    <button onClick={() => handleDelete(schedule._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded">Delete</button>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{schedule.professorName}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">{schedule.courseCode}</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">📍 {schedule.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* The Schedule Image */}
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-6 flex items-center justify-center">
                    <img 
                      src={schedule.scheduleImageUrl} 
                      alt={`Schedule for ${schedule.professorName}`}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Invalid+Image+URL' }}
                    />
                  </div>
                  
                  {/* Booking / Comments Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Booked Slots</h4>
                    
                    {schedule.bookings.length === 0 ? (
                      <p className="text-sm text-gray-500 mb-4 italic">No slots claimed yet.</p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {schedule.bookings.map((booking, index) => (
                          <div key={index} className="bg-white p-3 rounded shadow-sm border border-gray-200 flex justify-between items-center text-sm">
                            <span className="font-bold text-blue-700">{booking.timeSlot}</span>
                            <span className="text-gray-600">Claimed by {booking.studentName}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Form to claim a slot */}
                    <form onSubmit={(e) => handleBookingSubmit(e, schedule._id)} className="flex gap-2 mt-2">
                      <input 
                        type="text" 
                        value={bookingInputs[schedule._id] || ""} 
                        onChange={(e) => setBookingInputs(prev => ({ ...prev, [schedule._id]: e.target.value }))} 
                        placeholder="e.g., 'Tuesday 2:00 PM' to claim" 
                        disabled={!user}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100" 
                      />
                      <button type="submit" disabled={!user} className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-sm transition-colors">
                        Book Slot
                      </button>
                    </form>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}