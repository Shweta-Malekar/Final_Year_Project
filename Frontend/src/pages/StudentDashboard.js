import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import toast from "react-hot-toast";
import "./Dashboard.css";

const StudentDashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolio();
    fetchSuggestions();
    fetchNotifications();

    const newSocket = io("http://localhost:5000");
    newSocket.emit("join", user.id);
    newSocket.on("new-notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success("New interest received!");
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/portfolio/me");
      setPortfolio(res.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/portfolio/suggestions",
      );
      setSuggestions(res.data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification:", error);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Student Dashboard</h1>
        <div>
          <span>Welcome,{user?.name || user?.fullName || "Student"}</span>
          <button
            onClick={() => navigate("/edit-portfolio")}
            className="btn-primary"
          >
            Edit Portfolio
          </button>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="sidebar">
          <div className="suggestions-card">
            <h3>Suggestions for You</h3>
            {suggestions.length > 0 ? (
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={index}>💡 {suggestion}</li>
                ))}
              </ul>
            ) : (
              <p>Great job! Your portfolio is complete!</p>
            )}
          </div>

          <div className="stats-card">
            <h3>Portfolio Stats</h3>
            <p>👁️ Views: {portfolio?.viewCount || 0}</p>
            <p>💼 Interested Recruiters: {notifications.length}</p>
          </div>
        </div>

        <div className="main-content">
          <div className="notifications-card">
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
              <p>No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification ${notification.isRead ? "read" : "unread"}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <p>
                    <strong>{notification.recruiterName}</strong> from{" "}
                    <strong>{notification.recruiterCompany}</strong>
                  </p>
                  <p>{notification.message}</p>
                  <small>Email: {notification.recruiterEmail}</small>
                </div>
              ))
            )}
          </div>

          <div className="portfolio-preview">
            <h3>Your Portfolio Preview</h3>
            {portfolio && (
              <div className="preview-card">
                <h4>{portfolio.personalInfo?.fullName || "Your Name"}</h4>
                <p>{portfolio.personalInfo?.title || "Your Title"}</p>
                <p>
                  {portfolio.personalInfo?.bio || "Your bio will appear here"}
                </p>
                <button
                  onClick={() => {
                    if (portfolio && portfolio._id) {
                      navigate(`/portfolio/${portfolio._id}`);
                    } else {
                      toast.error("Please create your portfolio first!");
                      navigate("/edit-portfolio");
                    }
                  }}
                >
                  View Full Portfolio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
