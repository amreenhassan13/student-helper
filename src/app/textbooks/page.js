"use client";

import { useState, useEffect } from "react";

export default function TextbooksPage() {
  const [textbooks, setTextbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("Good");
  const [contactInfo, setContactInfo] = useState("");

  const fetchTextbooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/textbooks");
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      setTextbooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newListing = { title, author, courseCode, price: Number(price), condition, contactInfo };

    try {
      const response = await fetch("/api/textbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newListing),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post listing");
      }

      // Clear form
      setTitle("");
      setAuthor("");
      setCourseCode("");
      setPrice("");
      setCondition("Good");
      setContactInfo("");
      fetchTextbooks(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this listing? (e.g., Book was sold)")) return;

    try {
      const response = await fetch(`/api/textbooks?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete listing");
      setTextbooks((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper for condition badges
  const getConditionColor = (cond) => {
    switch (cond) {
      case "New": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Like New": return "bg-green-100 text-green-800 border-green-200";
      case "Good": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Fair": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Poor": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Used Textbook Marketplace</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Post a Listing Form */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Sell a Book</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Intro to Algorithms" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input type="text" required value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Cormen et al." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <input type="text" required value={courseCode} onChange={(e) => setCourseCode(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="CS301" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="45.00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
              <input type="text" required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email or Phone Number" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
              Post Listing
            </button>
          </form>
        </div>

        {/* Right Column: Listings Feed */}
        <div className="md:col-span-2">
          {loading ? (
            <p className="text-gray-500">Loading marketplace...</p>
          ) : textbooks.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No books listed right now. Be the first to sell!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {textbooks.map((book) => (
                <div key={book._id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col relative group">
                  <button onClick={() => handleDelete(book._id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-full p-1 opacity-0 group-hover:opacity-100" title="Remove Listing">
                    ✕
                  </button>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold tracking-wider">
                      {book.courseCode}
                    </span>
                    <span className="text-lg font-extrabold text-green-700">
                      ${book.price.toFixed(2)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 pr-6">{book.title}</h3>
                  <p className="text-sm text-gray-600 italic mb-3">by {book.author}</p>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Condition:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getConditionColor(book.condition)}`}>
                        {book.condition}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-sm break-all">
                      <span className="font-semibold text-gray-700">Contact: </span>
                      <span className="text-gray-600">{book.contactInfo}</span>
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