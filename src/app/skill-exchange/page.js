"use client";

import { useState, useEffect } from "react";

export default function SkillExchangePage() {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [offering, setOffering] = useState("");
  const [seeking, setSeeking] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  useEffect(() => {
    fetchExchanges();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setContactInfo(parsedUser.email);
    }
  }, []);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/skill-exchange");
      if (!response.ok) throw new Error("Failed to fetch listings");
      setExchanges(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to post a trade.");
    
    const newExchange = { 
      title, offering, seeking, description, 
      author: user.name, userEmail: user.email, contactInfo 
    };

    try {
      const response = await fetch("/api/skill-exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExchange),
      });

      if (!response.ok) throw new Error("Failed to post trade");

      setTitle(""); setOffering(""); setSeeking(""); setDescription("");
      fetchExchanges(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Found a trade partner? Delete this post?")) return;
    try {
      await fetch(`/api/skill-exchange?id=${id}`, { method: "DELETE" });
      setExchanges((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Skill Exchange Board</h1>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Post a Trade */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Propose a Trade</h2>
          
          {!user && (
            <div className="mb-4 text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              <a href="/login" className="font-bold underline">Log in</a> to propose a skill trade.
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catchy Title</label>
              <input type="text" required disabled={!user} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g., Code for Conversational French" />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1 font-bold">I can teach/help with:</label>
              <input type="text" required disabled={!user} value={offering} onChange={(e) => setOffering(e.target.value)} className="w-full border border-emerald-300 bg-emerald-50 rounded px-3 py-2" placeholder="e.g., Advanced Java, CSS" />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1 font-bold">I need help with:</label>
              <input type="text" required disabled={!user} value={seeking} onChange={(e) => setSeeking(e.target.value)} className="w-full border border-purple-300 bg-purple-50 rounded px-3 py-2" placeholder="e.g., Linear Algebra" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea required disabled={!user} rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 resize-none" placeholder="What exactly do you want to trade? How often?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
              <input type="text" required disabled={!user} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <button type="submit" disabled={!user} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors">
              Post Trade Request
            </button>
          </form>
        </div>

        {/* Right Column: Exchange Feed */}
        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading open trades...</p>
          ) : exchanges.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No trades posted. Be the first to barter your skills!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {exchanges.map((exchange) => (
                <div key={exchange._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative group">
                  
                  {user && user.email === exchange.userEmail && (
                    <button onClick={() => handleDelete(exchange._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white" title="Remove Post">✕</button>
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1 pr-6">{exchange.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">Posted by <strong>{exchange.author}</strong></p>
                  
                  {/* Visual Barter Block */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1 bg-emerald-50 border border-emerald-100 p-3 rounded">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Offering</span>
                      <p className="text-emerald-900 font-medium">{exchange.offering}</p>
                    </div>
                    <div className="flex items-center justify-center text-gray-400 font-bold">
                      <span className="hidden sm:inline">➔</span>
                      <span className="sm:hidden">⬇</span>
                    </div>
                    <div className="flex-1 bg-purple-50 border border-purple-100 p-3 rounded">
                      <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block mb-1">Seeking</span>
                      <p className="text-purple-900 font-medium">{exchange.seeking}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 whitespace-pre-wrap mb-4">{exchange.description}</p>
                  
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Propose Trade:</span>
                    <span className="text-sm font-bold text-gray-800">{exchange.contactInfo}</span>
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