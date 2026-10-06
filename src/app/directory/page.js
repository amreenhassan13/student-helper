"use client";

import { useState, useEffect } from "react";

export default function DirectoryPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [building, setBuilding] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [category, setCategory] = useState("Academic/Lecture");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchLocations();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/directory");
      if (!response.ok) throw new Error("Failed to fetch directory");
      setLocations(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to add a location.");
    
    const newLocation = { 
      name, building, roomNumber, category, description, 
      addedBy: user.name, userEmail: user.email 
    };

    try {
      const response = await fetch("/api/directory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      });

      if (!response.ok) throw new Error("Failed to post location");

      setName(""); setBuilding(""); setRoomNumber(""); setCategory("Academic/Lecture"); setDescription("");
      fetchLocations(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this location from the directory?")) return;
    try {
      await fetch(`/api/directory?id=${id}`, { method: "DELETE" });
      setLocations((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Search Logic (Scans Name, Building, and Room Number)
  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    loc.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Laboratory": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Faculty Office": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Student Facility": return "bg-green-100 text-green-800 border-green-200";
      case "Admin/Support": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200"; // Academic/Lecture
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Campus Navigation Directory</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Add Location */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Map a New Room</h2>
          
          {!user && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <a href="/login" className="font-bold underline">Log in</a> to help map the campus.
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Name / Title</label>
              <input type="text" required disabled={!user} value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 font-bold" placeholder="e.g., Prof. Davis Office" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                <input type="text" required disabled={!user} value={building} onChange={(e) => setBuilding(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., North Wing" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room #</label>
                <input type="text" required disabled={!user} value={roomNumber} onChange={(e) => setRoomNumber(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="NW-302" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select disabled={!user} value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                <option value="Academic/Lecture">Academic / Lecture Hall</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Faculty Office">Faculty Office</option>
                <option value="Student Facility">Student Facility (Lounge, Cafe)</option>
                <option value="Admin/Support">Admin / IT Support</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Directions / Details</label>
              <textarea required disabled={!user} rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 resize-none text-sm" placeholder="Any tricks to finding it? Which elevator?" />
            </div>
            <button type="submit" disabled={!user} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors">
              Add to Map
            </button>
          </form>
        </div>

        {/* Right Column: Search & Results */}
        <div className="lg:col-span-2">
          
          <div className="mb-6">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by room number (e.g., NW-302), building, or name..." 
              className="w-full border border-gray-300 rounded-lg px-4 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Scanning campus map...</p>
          ) : locations.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">The directory is empty. Start mapping your campus!</p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No rooms match your search. Double-check the room number!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLocations.map((loc) => (
                <div key={loc._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 relative group transition-shadow hover:shadow-md">
                  
                  {user && user.email === loc.userEmail && (
                    <button onClick={() => handleDelete(loc._id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 rounded">✕</button>
                  )}
                  
                  <div className="flex justify-between items-start mb-2 pr-6">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{loc.name}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="bg-slate-800 text-white px-2 py-1 rounded text-sm font-bold tracking-wider">
                      {loc.roomNumber}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">
                      in {loc.building}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getCategoryColor(loc.category)}`}>
                      {loc.category}
                    </span>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 p-3 rounded text-sm text-gray-700 leading-relaxed italic">
                    📍 {loc.description}
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