import React, { useEffect, useState } from "react";
import axios from "axios";

interface Feedback {
  id: number;
  feedback_type: string;
  message: string;
  rating: number;
  created_at: string;
  visible_to_principal: boolean;
}

const HODFeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all feedbacks
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/hod/feedbacks/");
      setFeedbacks(res.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Allow feedback for principal
  const allowForPrincipal = async (id: number) => {
    if (!window.confirm("Allow this feedback for principal view?")) return;
    try {
      await axios.patch(`http://127.0.0.1:8000/api/hod/feedbacks/${id}/allow/`);
      alert("Feedback shared with principal!");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error updating feedback:", error);
      alert("Failed to update feedback visibility.");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        HOD Feedback Dashboard
      </h1>

      {loading ? (
        <div className="text-center text-gray-600">Loading feedbacks...</div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center text-gray-500">No feedback found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
            >
              <p className="text-sm text-gray-500">
                {fb.feedback_type === "teacher"
                  ? "👩‍🏫 Teacher Feedback"
                  : "🏫 Institute Feedback"}
              </p>

              <p className="mt-2 text-gray-800 font-medium">{fb.message}</p>

              <div className="flex items-center mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= fb.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {new Date(fb.created_at).toLocaleString()}
              </p>

              <div className="mt-4">
                {fb.visible_to_principal ? (
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded-md text-sm cursor-not-allowed"
                    disabled
                  >
                    ✅ Sent to Principal
                  </button>
                ) : (
                  <button
                    onClick={() => allowForPrincipal(fb.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition"
                  >
                    Send to Principal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default HODFeedbackPage;
