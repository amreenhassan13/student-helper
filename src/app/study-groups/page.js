"use client";

import { useState, useEffect } from "react";

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [topic, setTopic] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxMembers, setMaxMembers] = useState(4);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/study-groups");
      if (!response.ok) throw new Error("Failed to fetch study groups");
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newGroup = { title, courseCode, topic, meetingTime, location, maxMembers };

    try {
      const response = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create group");
      }

      // Clear form
      setTitle("");
      setCourseCode("");
      setTopic("");
      setMeetingTime("");
      setLocation("");
      setMaxMembers(4);
      fetchGroups(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch("/api/study-groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join group");
      }

      const updatedGroup = await response.json();

      // Update UI instantly
      setGroups((prev) =>
        prev.map((g) => (g._id === groupId ? updatedGroup : g))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this study group?")) return;

    try {
      const response = await fetch(`/api/study-groups?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to cancel group");
      setGroups((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Study Group Matchmaker</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create a Group Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Form a Study Group</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Midterm Cram Session" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <input type="text" required value={courseCode} onChange={(e) => setCourseCode(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="e.g., BIO101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input type="number" required min="2" max="20" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Topic</label>
              <input type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Chapters 4 & 5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input type="datetime-local" required value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Link</label>
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Library Room 2B or Zoom link" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Create Group
            </button>
          </form>
        </div>

        {/* Right Column: Upcoming Groups Feed */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-500">Finding study partners...</p>
          ) : groups.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No upcoming study groups. Take the lead and create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => {
                const isFull = group.currentMembers >= group.maxMembers;
                const meetingDate = new Date(group.meetingTime);

                return (
                  <div key={group._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col relative group hover:shadow-md transition-shadow">
                    <button onClick={() => handleDelete(group._id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 z-10" title="Cancel Group">
                      ✕
                    </button>
                    
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded text-xs font-extrabold tracking-wider">
                        {group.courseCode}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {group.currentMembers} / {group.maxMembers} Joined
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{group.title}</h3>
                    <p className="text-sm text-gray-600 font-medium mb-4">Focus: {group.topic}</p>
                    
                    <div className="mt-auto space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded mb-4">
                      <p className="flex items-center gap-2">
                        📅 <strong>{meetingDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong> at <strong>{meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                      </p>
                      <p className="flex items-center gap-2 truncate" title={group.location}>
                        📍 {group.location}
                      </p>
                    </div>

                    <button 
                      onClick={() => handleJoinGroup(group._id)} 
                      disabled={isFull}
                      className={`w-full py-2 px-4 rounded font-bold transition-colors ${
                        isFull 
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                          : "bg-gray-800 hover:bg-gray-900 text-white"
                      }`}
                    >
                      {isFull ? "Group Full" : "Join Group"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}