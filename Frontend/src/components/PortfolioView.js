// frontend/src/components/PortfolioView.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./PortfolioView.css";

const PortfolioView = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);

      // Try to get by user ID first
      const res = await axios.get(
        `http://localhost:5000/api/portfolio/user/${id}`,
      );
      setPortfolio(res.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      toast.error("Portfolio not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading portfolio...</div>;
  }

  if (!portfolio) {
    return (
      <div className="error-container">
        <h2>Portfolio Not Found</h2>
        <p>This portfolio doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/student-dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="portfolio-view-container">
      <div className="portfolio-header">
        <h1>{portfolio.personalInfo?.fullName || "User Name"}</h1>
        <h2>{portfolio.personalInfo?.title || "Professional Title"}</h2>
        <p>{portfolio.personalInfo?.bio || "No bio available"}</p>
        <p>📧 {portfolio.personalInfo?.email || "No email"}</p>
      </div>

      <div className="portfolio-content">
        <section className="skills-section">
          <h3>Skills</h3>
          <div className="skills-list">
            {portfolio.skills?.map((skill, index) => (
              <span key={index} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="education-section">
          <h3>Education</h3>
          {portfolio.education && portfolio.education.length > 0 ? (
            portfolio.education.map((edu, index) => (
              <div key={index} className="education-item">
                <h4>{edu.degree || "Degree"}</h4>
                <p className="institution">
                  {edu.institution || "Institution"}
                </p>
                {(edu.year || edu.percentage) && (
                  <div className="education-details">
                    {edu.year && <span>📅 Year: {edu.year}</span>}
                    {edu.percentage && <span>📊 {edu.percentage}%</span>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No education details added yet.</p>
          )}
        </section>

        <section className="projects-section">
          <h3>Projects</h3>
          {portfolio.projects?.map((project, index) => (
            <div key={index} className="project-item">
              <h4>{project.title}</h4>
              <p>{project.description}</p>
              {project.link && (
                <a href={project.link} target="_blank">
                  View Project →
                </a>
              )}
            </div>
          ))}
        </section>
      </div>

      <button onClick={() => navigate(-1)} className="back-button">
        ← Go Back
      </button>
    </div>
  );
};

export default PortfolioView;
