import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import InterestedButton from "../components/InterestedButton";
import "./Dashboard.css";

const RecruiterDashboard = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [allSkills, setAllSkills] = useState([]);
  const [interestedStudents, setInterestedStudents] = useState(new Set());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedSkill, students]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/recruiter/students",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStudents(res.data);
      setFilteredStudents(res.data);

      // Extract all unique skills
      const skills = new Set();
      res.data.forEach((student) => {
        student.skills.forEach((skill) => skills.add(skill));
      });
      setAllSkills(Array.from(skills));

      // Check which students recruiter already showed interest to
      await checkInterestedStatus(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  const checkInterestedStatus = async (studentsList) => {
    try {
      const token = localStorage.getItem("token");
      const interestedSet = new Set();

      for (const student of studentsList) {
        const res = await axios.get(
          `http://localhost:5000/api/recruiter/has-interested/${student.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data.hasInterested) {
          interestedSet.add(student.id);
        }
      }

      setInterestedStudents(interestedSet);
    } catch (error) {
      console.error("Error checking interest status:", error);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedSkill) {
      filtered = filtered.filter((student) =>
        student.skills.includes(selectedSkill),
      );
    }

    setFilteredStudents(filtered);
  };

  const handleInterestChange = (studentId) => {
    setInterestedStudents((prev) => new Set([...prev, studentId]));
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Recruiter Dashboard</h1>
        <div>
          <span>Welcome, {user?.name || user?.fullName || "Recruiter"}!</span>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
        >
          <option value="">All Skills</option>
          {allSkills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      </div>

      <div className="students-grid">
        {filteredStudents.map((student) => (
          <div key={student.id} className="student-card">
            <h3>{student.name}</h3>
            <p className="summary">{student.summary?.substring(0, 100)}...</p>
            <div className="skills">
              {student.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
            <div className="card-actions">
              <button
                className="btn-primary"
                onClick={() => navigate(`/portfolio/${student.id}`)}
              >
                View Portfolio
              </button>
              <InterestedButton
                studentId={student.id}
                onInterestChange={handleInterestChange}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
