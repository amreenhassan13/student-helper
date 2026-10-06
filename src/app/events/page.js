"use client";

import { useState, useEffect } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [organizer, setOrganizer] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newEvent = { title, date, location, description, organizer };

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add event");
      }

      // Clear form
      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");
      setOrganizer("");
      fetchEvents(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this event?")) return;

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");
      setEvents((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Campus Event Calendar</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Add Form */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Host an Event</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Hackathon Kickoff" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Library Room 204" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organizer (Optional)</label>
              <input type="text" value={organizer} onChange={(e) => setOrganizer(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Computer Science Club" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="What's happening?" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Publish Event
            </button>
          </form>
        </div>

        {/* Right Column: Event List */}
        <div className="md:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading upcoming events...</p>
          ) : events.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No upcoming events. Why not host one?</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((evt) => {
                const eventDate = new Date(evt.date);
                return (
                  <div key={evt._id} className="bg-white p-0 rounded-lg shadow-sm border border-gray-200 flex overflow-hidden group">
                    {/* Date Block */}
                    <div className="bg-blue-600 text-white p-4 flex flex-col items-center justify-center min-w-[100px] text-center">
                      <span className="text-sm font-bold uppercase tracking-wider">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-3xl font-extrabold">{eventDate.getDate()}</span>
                    </div>
                    {/* Event Details */}
                    <div className="p-5 flex-1 relative">
                      <button onClick={() => handleDelete(evt._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors" title="Cancel Event">
                        ✕
                      </button>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 pr-6">{evt.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">⏰ {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1">📍 {evt.location}</span>
                        <span className="flex items-center gap-1">👤 {evt.organizer}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">{evt.description}</p>
                    </div>
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