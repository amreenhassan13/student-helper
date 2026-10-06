"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ExtracurricularsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Form State
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [category, setCategory] = useState("Club/Society");
  const [timeframe, setTimeframe] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchLogs(parsedUser.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchLogs = async (email) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/extracurriculars?userEmail=${email}`);
      if (!response.ok) throw new Error("Failed to fetch logs");
      setLogs(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    const newLog = { 
      role, organization, category, timeframe, description, userEmail: user.email 
    };

    try {
      const response = await fetch("/api/extracurriculars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog),
      });

      if (!response.ok) throw new Error("Failed to add entry");

      setRole(""); setOrganization(""); setCategory("Club/Society"); setTimeframe(""); setDescription("");
      fetchLogs(user.email); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this experience from your log?")) return;
    try {
      await fetch(`/api/extracurriculars?id=${id}`, { method: "DELETE" });
      setLogs((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Club/Society": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Hackathon/Competition": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Certification": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Volunteer": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // LOGGED OUT VIEW
  if (!user && !loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-20 text-center font-sans">
        <div className="bg-white p-10 rounded-xl shadow-md border border-gray-200">
          <div className="text-4xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Extracurricular Log</h1>
          <p className="text-gray-600 mb-8">This is your private digital resume. Log in to track your clubs, hackathons, and certifications.</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">Log In to Continue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">{user?.name}'s Experience Log</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Add Experience */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Log an Achievement</h2>
          
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role / Award Name</label>
              <input type="text" required value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 font-bold" placeholder="e.g., Lead Designer, 1st Place" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization / Event</label>
              <input type="text" required value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Game Dev Club, AWS" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                <option value="Club/Society">Club / Society</option>
                <option value="Hackathon/Competition">Hackathon / Competition</option>
                <option value="Certification">Certification</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
              <input type="text" required value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Fall 2025 - Spring 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Bullet points)</label>
              <textarea required rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 resize-none text-sm" placeholder="- Managed budget of $500&#10;- Organized weekly meetings" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Save to Log
            </button>
          </form>
        </div>

        {/* Right Column: Digital Resume Feed */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading your experiences...</p>
          ) : logs.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">Your log is empty. Add your first club or hackathon!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {logs.map((log) => (
                <div key={log._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative group transition-shadow hover:shadow-md">
                  
                  <button onClick={() => handleDelete(log._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 rounded">✕</button>
                  
                  <div className="flex justify-between items-start mb-2 pr-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{log.role}</h3>
                      <p className="text-lg font-medium text-blue-700">{log.organization}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <span className="text-sm text-gray-600 font-semibold bg-gray-100 px-2 py-1 rounded">🗓 {log.timeframe}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getCategoryColor(log.category)}`}>{log.category}</span>
                  </div>

                  <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed pl-4 border-l-2 border-gray-200">
                    {log.description.split('\n').map((line, i) => (
                      <p key={i} className="mb-1">{line}</p>
                    ))}
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