"use client";

import { useState, useEffect } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [courseCode, setCourseCode] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  // Filter State
  const [filterCode, setFilterCode] = useState("");

  const fetchReviews = async (code = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = code ? `/api/reviews?courseCode=${code}` : "/api/reviews";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews on initial load
  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReviews(filterCode);
  };

  const handleClearFilter = () => {
    setFilterCode("");
    fetchReviews("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError(null);

    const newReview = { courseCode, rating: Number(rating), text };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      // Clear form and refresh the list
      setCourseCode("");
      setRating(5);
      setText("");
      fetchReviews(filterCode); // Refresh with current filter applied
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper to visually render stars
  const renderStars = (ratingValue) => {
    return "★".repeat(ratingValue) + "☆".repeat(5 - ratingValue);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Interactive Course Reviews</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Submit Form */}
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Write a Review</h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ENG101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Text</label>
              <textarea
                required
                rows="4"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="What did you think of the workload, professor, and exams?"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Submit Review
            </button>
          </form>
        </div>

        {/* Right Column: Reviews List & Filter */}
        <div className="md:col-span-2">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6 flex items-end gap-4">
            <form onSubmit={handleFilterSubmit} className="flex-1 flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search by Course Code</label>
                <input
                  type="text"
                  value={filterCode}
                  onChange={(e) => setFilterCode(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., BIO200"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
              >
                Filter
              </button>
            </form>
            <button
              onClick={handleClearFilter}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Clear
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded border border-dashed border-gray-300">
              <p className="text-gray-500">No reviews found. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                        {rev.courseCode}
                      </span>
                    </div>
                    <div className="text-yellow-500 text-lg tracking-widest" aria-label={`Rating: ${rev.rating} out of 5`}>
                      {renderStars(rev.rating)}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap">{rev.text}</p>
                  <p className="text-gray-400 text-xs mt-2 border-t pt-2">
                    Posted on {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}