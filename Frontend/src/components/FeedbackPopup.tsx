import React, { useState, useEffect } from "react";
import axios from "axios";

interface Teacher {
  id: number;
  name: string;
  department: string;
}

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<"institute" | "teacher">("institute");
  const [teacher, setTeacher] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch teachers list when popup opens
  useEffect(() => {
    if (isOpen) {
      axios
        .get("http://127.0.0.1:8000/api/teachers/")
        .then((res) => setTeachers(res.data))
        .catch((err) => console.error("Error fetching teachers:", err));
    }
  }, [isOpen]);

  // ✅ Handle feedback submit
  const handleSubmit = async () => {
    if (!message.trim()) {
      alert("Please enter your feedback message.");
      return;
    }

    const payload: any = {
      feedback_type: feedbackType,
      message,
      rating,
    };

    if (feedbackType === "teacher") payload.teacher = teacher;

    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/feedback/", payload);
      alert("✅ Feedback submitted successfully!");
      // Reset form
      setMessage("");
      setRating(0);
      setTeacher(null);
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-center">Give Feedback</h2>

        {/* Feedback Type */}
        <label className="block mb-2 font-medium">Feedback Type</label>
        <select
          className="w-full border rounded-lg p-2 mb-3"
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value as "institute" | "teacher")}
        >
          <option value="institute">Institute Feedback</option>
          <option value="teacher">Teacher Feedback</option>
        </select>

        {/* Teacher Dropdown (if teacher feedback selected) */}
        {feedbackType === "teacher" && (
          <div className="mb-3">
            <label className="block mb-2 font-medium">Select Teacher</label>
            <select
              className="w-full border rounded-lg p-2"
              onChange={(e) => setTeacher(Number(e.target.value))}
              value={teacher ?? ""}
            >
              <option value="">-- Choose Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Feedback Message */}
        <label className="block mb-2 font-medium">Your Feedback</label>
        <textarea
          className="w-full border rounded-lg p-2 mb-3"
          rows={4}
          placeholder="Write your feedback here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Rating Stars */}
        <label className="block mb-2 font-medium">Rating</label>
        <div className="flex mb-4 space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${
                rating >= star ? "text-yellow-500" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;
