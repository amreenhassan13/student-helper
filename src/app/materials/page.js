"use client";

import { useState, useEffect } from "react";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    fetchMaterials();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/materials");
      if (!response.ok) throw new Error("Failed to fetch repository");
      setMaterials(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Log in to upload resources.");
    
    const newMaterial = { 
      title, courseCode, description, fileUrl, 
      uploader: user.name, userEmail: user.email 
    };

    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMaterial),
      });

      if (!response.ok) throw new Error("Failed to post");

      setTitle(""); setCourseCode(""); setDescription(""); setFileUrl("");
      fetchMaterials(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVote = async (id, type) => {
    if (!user) return alert("Please log in to vote.");
    try {
      const response = await fetch("/api/materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      if (!response.ok) throw new Error("Failed to register vote");

      const updatedDoc = await response.json();
      setMaterials(materials.map(m => m._id === id ? updatedDoc : m));
    } catch (err) {
      alert(err.message);
    }
  };

  // NEW: Delete Function
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      const response = await fetch(`/api/materials?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setMaterials((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Instant Search Logic
  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Course Material Repository</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload a Resource</h2>
          
          {!user && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <a href="/login" className="font-bold underline">Log in</a> to contribute materials.
            </div>
          )}

          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" required disabled={!user} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Midterm Study Guide" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input type="text" required disabled={!user} value={courseCode} onChange={(e) => setCourseCode(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., CS101" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required disabled={!user} rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 resize-none text-sm" placeholder="What does this document cover?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
              <input type="url" required disabled={!user} value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Google Drive or Dropbox link" />
            </div>
            <button type="submit" disabled={!user} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors">
              Upload Material
            </button>
          </form>
        </div>

        {/* Right Column: Repository Database */}
        <div className="lg:col-span-2">
          
          {/* Search Bar */}
          <div className="mb-6">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by course code or title..." 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Querying database...</p>
          ) : materials.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">The repository is empty. Be the first to upload a guide!</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No materials match your search query.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMaterials.map((material) => {
                const netScore = material.upvotes - material.downvotes;
                let scoreColor = "text-gray-600";
                if (netScore > 0) scoreColor = "text-green-600";
                if (netScore < 0) scoreColor = "text-red-600";

                return (
                  <div key={material._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex gap-4 relative group transition-shadow hover:shadow-md">
                    
                    {/* Delete Button (Only visible if logged in user owns the post) */}
                    {user && user.email === material.userEmail && (
                      <button onClick={() => handleDelete(material._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white" title="Remove Record">✕</button>
                    )}
                    
                    {/* Voting Sidebar */}
                    <div className="flex flex-col items-center justify-start bg-gray-50 px-3 py-2 rounded border border-gray-100 min-w-[60px]">
                      <button onClick={() => handleVote(material._id, 'upvote')} className="text-xl text-gray-400 hover:text-green-600 transition-colors">▲</button>
                      <span className={`font-bold my-1 ${scoreColor}`}>{netScore}</span>
                      <button onClick={() => handleVote(material._id, 'downvote')} className="text-xl text-gray-400 hover:text-red-600 transition-colors">▼</button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 pr-6">
                      <div className="mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded tracking-wider uppercase mb-1 inline-block">{material.courseCode}</span>
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{material.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Uploaded by <span className="font-semibold text-gray-700">{material.uploader}</span> • {new Date(material.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-4 leading-relaxed">{material.description}</p>
                      
                      <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold py-1.5 px-4 rounded text-sm transition-colors shadow-sm">
                        ↓ Access Resource
                      </a>
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