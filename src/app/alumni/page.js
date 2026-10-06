"use client";

import { useState, useEffect } from "react";

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear());
  const [major, setMajor] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [offerings, setOfferings] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  useEffect(() => {
    fetchAlumni();
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/alumni");
      if (!response.ok) throw new Error("Failed to fetch directory");
      setAlumni(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Log in to join the alumni network.");
    
    const newProfile = { 
      name: user.name, userEmail: user.email, 
      graduationYear, major, currentCompany, jobTitle, offerings, contactInfo 
    };

    try {
      const response = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile),
      });

      if (!response.ok) throw new Error("Failed to join directory");

      setMajor(""); setCurrentCompany(""); setJobTitle(""); setOfferings(""); setContactInfo("");
      fetchAlumni(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove your profile from the directory?")) return;
    try {
      await fetch(`/api/alumni?id=${id}`, { method: "DELETE" });
      setAlumni((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Search Logic (Filters by Company, Major, or Job Title)
  const filteredAlumni = alumni.filter(a => 
    a.currentCompany.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Alumni Mentorship Network</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Register as Mentor */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Join as a Mentor</h2>
          
          {!user && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <a href="/login" className="font-bold underline">Log in</a> to offer mentorship.
            </div>
          )}

          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Major</label>
                <input type="text" required disabled={!user} value={major} onChange={(e) => setMajor(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Computer Science" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                <input type="number" required disabled={!user} value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
              <input type="text" required disabled={!user} value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 font-bold" placeholder="e.g., Google, Stripe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input type="text" required disabled={!user} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Software Engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I can help with (Comma separated)</label>
              <input type="text" required disabled={!user} value={offerings} onChange={(e) => setOfferings(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Resume Review, Referrals, Chat" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile or Email</label>
              <input type="text" required disabled={!user} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="linkedin.com/in/..." />
            </div>
            
            <button type="submit" disabled={!user} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors mt-2">
              List My Profile
            </button>
          </form>
        </div>

        {/* Right Column: Directory Feed */}
        <div className="lg:col-span-2">
          
          <div className="mb-6">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search by company, major, or job title..." 
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Loading directory...</p>
          ) : alumni.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No alumni listed yet. Be the first to mentor the next generation!</p>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No alumni match your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlumni.map((alum) => (
                <div key={alum._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 relative group flex flex-col hover:shadow-md transition-all">
                  
                  {user && user.email === alum.userEmail && (
                    <button onClick={() => handleDelete(alum._id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded" title="Remove Profile">✕</button>
                  )}
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 pr-4">{alum.name}</h3>
                    <p className="text-sm text-gray-500">{alum.major} • Class of {alum.graduationYear}</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded mb-4">
                    <p className="text-sm font-bold text-slate-800">{alum.jobTitle}</p>
                    <p className="text-sm text-slate-600">at <span className="font-bold text-blue-700">{alum.currentCompany}</span></p>
                  </div>
                  
                  <div className="mb-4 flex-grow">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Can help with:</span>
                    <div className="flex flex-wrap gap-1">
                      {alum.offerings.split(',').map((offering, index) => (
                        <span key={index} className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-xs font-semibold">
                          {offering.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <a 
                      href={alum.contactInfo.includes('http') ? alum.contactInfo : `mailto:${alum.contactInfo}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold py-2 rounded transition-colors"
                    >
                      Connect
                    </a>
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