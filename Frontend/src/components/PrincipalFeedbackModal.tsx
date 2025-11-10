import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

interface Feedback {
  id: number;
  feedback_type: string;
  message: string;
  rating: number;
  teacher_name?: string;
  visible_to_principal: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PrincipalFeedbackModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchFeedbacks();
  }, [isOpen]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/api/principal/feedbacks/");
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="bg-white w-full max-w-4xl rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-700 text-white px-4 py-3">
          <h2 className="text-lg font-semibold">Feedback Report (Allowed by HOD)</h2>
          <button
            onClick={onClose}
            className="hover:text-gray-200 transition text-xl"
          >
            ✖
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading feedbacks...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-center text-gray-500">No feedbacks allowed yet.</p>
          ) : (
            feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="border border-gray-200 rounded-xl p-4 mb-3 shadow-sm bg-gray-50"
              >
                <p className="font-semibold text-gray-800 mb-1">
                  {fb.feedback_type === "teacher"
                    ? `Teacher Feedback`
                    : "Institute Feedback"}
                </p>
                <p className="text-gray-600 mb-2">{fb.message}</p>
                <p className="text-sm text-yellow-600">
                  ⭐ Rating: {fb.rating}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PrincipalFeedbackModal;
