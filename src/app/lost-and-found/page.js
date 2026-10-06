"use client";

import { useState, useEffect } from "react";

export default function LostAndFoundPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Lost");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lost-and-found");
      if (!response.ok) throw new Error("Failed to fetch bulletin board");
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newItem = { title, type, date, location, description, contactInfo };

    try {
      const response = await fetch("/api/lost-and-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post item");
      }

      // Clear form
      setTitle("");
      setType("Lost");
      setDate("");
      setLocation("");
      setDescription("");
      setContactInfo("");
      fetchItems(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this post? (e.g., Item was returned)")) return;

    try {
      const response = await fetch(`/api/lost-and-found?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Lost and Found Bulletin</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Post a Report */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Report an Item</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                <option value="Lost">I Lost Something</option>
                <option value="Found">I Found Something</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Black Hydroflask" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date {type === 'Lost' ? 'Lost' : 'Found'}</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Cafeteria near window" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Color, brand, unique markers..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
              <input type="text" required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email or Phone" />
            </div>
            <button type="submit" className={`w-full text-white font-bold py-2 px-4 rounded transition-colors ${type === 'Lost' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
              Post to Bulletin
            </button>
          </form>
        </div>

        {/* Right Column: Bulletin Board Feed */}
        <div className="md:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading bulletin board...</p>
          ) : items.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">The board is empty. No lost or found items reported.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col relative group">
                  <button onClick={() => handleDelete(item._id)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 rounded p-1 text-xs opacity-0 group-hover:opacity-100" title="Resolve & Remove">
                    Mark Resolved
                  </button>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${item.type === 'Lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.type}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{item.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <span className="flex items-center gap-2">📍 <strong>Location:</strong> {item.location}</span>
                    <span className="flex items-center gap-2">📅 <strong>Date:</strong> {new Date(item.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                    <span className="flex items-center gap-2 sm:col-span-2 mt-1">📞 <strong>Contact:</strong> {item.contactInfo}</span>
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