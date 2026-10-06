"use client";

import { useState, useEffect } from "react";

export default function ThesisRepositoryPage() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [abstract, setAbstract] = useState("");
  const [tags, setTags] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    fetchTheses();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchTheses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/thesis");
      if (!response.ok) throw new Error("Failed to fetch repository");
      setTheses(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Log in to publish.");
    
    const newThesis = { 
      title, author: user.name, userEmail: user.email, 
      department, abstract, tags, pdfUrl 
    };

    try {
      const response = await fetch("/api/thesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThesis),
      });

      if (!response.ok) throw new Error("Failed to publish");

      setTitle(""); setDepartment(""); setAbstract(""); setTags(""); setPdfUrl("");
      fetchTheses(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this publication from the repository?")) return;
    try {
      await fetch(`/api/thesis?id=${id}`, { method: "DELETE" });
      setTheses((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Instant Search Logic
  const filteredTheses = theses.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Research & Thesis Repository</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Publish Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Publish Abstract</h2>
          
          {!user && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <a href="/login" className="font-bold underline">Log in</a> to archive your research.
            </div>
          )}

          <form onSubmit={handlePublishSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thesis Title</label>
              <input type="text" required disabled={!user} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Optimizing Semantic Segmentation" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" required disabled={!user} value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords / Tags</label>
              <input type="text" required disabled={!user} value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., AI, Computer Vision, ResNet" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abstract Summary</label>
              <textarea required disabled={!user} rows="5" value={abstract} onChange={(e) => setAbstract(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 resize-none text-sm" placeholder="Summarize your findings..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Paper URL (Optional)</label>
              <input type="url" disabled={!user} value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Google Drive or ArXiv link" />
            </div>
            <button type="submit" disabled={!user} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors">
              Archive Research
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
              placeholder="🔍 Search by title, tag, or department..." 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Querying database...</p>
          ) : theses.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">The repository is empty. Be the first senior to publish!</p>
            </div>
          ) : filteredTheses.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No research matches your search query.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTheses.map((thesis) => (
                <div key={thesis._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative group transition-shadow hover:shadow-md">
                  
                  {user && user.email === thesis.userEmail && (
                    <button onClick={() => handleDelete(thesis._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white" title="Remove Record">✕</button>
                  )}
                  
                  <div className="mb-3 pr-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">{thesis.department}</span>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{thesis.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">By <span className="font-bold">{thesis.author}</span> • Published {new Date(thesis.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {thesis.tags.split(',').map((tag, index) => (
                      <span key={index} className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-xs font-semibold">
                        # {tag.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-4 rounded text-sm text-gray-800 leading-relaxed mb-4 border border-gray-100">
                    <span className="font-bold text-gray-900 block mb-2">Abstract:</span>
                    {thesis.abstract}
                  </div>
                  
                  {thesis.pdfUrl && (
                    <a href={thesis.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded text-sm transition-colors">
                      📄 View Full Paper
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}