"use client";

import { useState, useEffect } from "react";

export default function TutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [courses, setCourses] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  useEffect(() => {
    fetchTutors();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Auto-fill their name and email
      setName(parsedUser.name);
      setContactInfo(parsedUser.email);
    }
  }, []);
  
  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tutors");
      if (!response.ok) throw new Error("Failed to fetch tutors");
      const data = await response.json();
      setTutors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newTutor = { name, courses, hourlyRate: Number(hourlyRate), availability, contactInfo };

    try {
      const response = await fetch("/api/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTutor),
      });

      if (!response.ok) throw new Error("Failed to post profile");

      // Clear form
      setName("");
      setCourses("");
      setHourlyRate("");
      setAvailability("");
      setContactInfo("");
      fetchTutors(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove your tutor profile?")) return;

    try {
      const response = await fetch(`/api/tutors?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete profile");
      setTutors((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Peer Tutor Directory</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Post Profile */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Become a Tutor</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Courses Taught</label>
              <input type="text" required value={courses} onChange={(e) => setCourses(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="e.g., CS101, MATH200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input type="number" required min="0" step="1" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0 for Volunteer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <input type="text" required value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Weekends, Mon/Wed evenings" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
              <input type="text" required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email or Discord ID" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              List My Services
            </button>
          </form>
        </div>

        {/* Right Column: Tutor Feed */}
        <div className="md:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading directory...</p>
          ) : tutors.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No tutors listed yet. Be the first to offer your expertise!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tutors.map((tutor) => (
                <div key={tutor._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col relative group">
                  <button onClick={() => handleDelete(tutor._id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-full p-1 opacity-0 group-hover:opacity-100" title="Remove Profile">
                    ✕
                  </button>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{tutor.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${tutor.hourlyRate === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {tutor.hourlyRate === 0 ? 'Volunteer (Free)' : `$${tutor.hourlyRate}/hr`}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Expertise</span>
                    <p className="text-indigo-700 font-bold bg-indigo-50 inline-block px-2 py-1 rounded text-sm">{tutor.courses}</p>
                  </div>
                  
                  <div className="mt-auto space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>🕒</span> <strong>Availability:</strong> {tutor.availability}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded">
                      <span>📬</span> <strong>Contact:</strong> {tutor.contactInfo}
                    </div>
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