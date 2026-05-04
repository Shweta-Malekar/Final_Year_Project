import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const InterestedButton = ({ studentId, onInterestChange }) => {
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkInterestStatus();
  }, [studentId]);

  const checkInterestStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/recruiter/has-interested/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsInterested(res.data.hasInterested);
    } catch (error) {
      console.error("Error checking interest:", error);
    }
  };

  const handleShowInterest = async () => {
    if (isInterested) {
      toast.error("Already shown interest to this student");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/recruiter/interest",
        { studentId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsInterested(true);
      toast.success("Interest shown successfully!");

      if (onInterestChange) {
        onInterestChange(studentId);
      }
    } catch (error) {
      console.error("Error showing interest:", error);
      toast.error(error.response?.data?.message || "Failed to show interest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`btn-interest ${isInterested ? "interested" : "not-interested"} ${loading ? "loading" : ""}`}
      onClick={handleShowInterest}
      disabled={isInterested || loading}
    >
      {loading
        ? "Processing..."
        : isInterested
          ? "✓ Interested"
          : "🤝 Show Interest"}
    </button>
  );
};

export default InterestedButton;
