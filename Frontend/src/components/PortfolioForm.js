import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./PortfolioForm.css";

const PortfolioForm = () => {
  const [formData, setFormData] = useState({
    template: "modern",
    theme: {
      primaryColor: "#3498db",
      secondaryColor: "#2ecc71",
      fontFamily: "Arial",
    },
    personalInfo: {
      fullName: "",
      title: "",
      bio: "",
      email: "",
      phone: "",
      location: "",
      profileImage: "",
    },
    education: [],
    skills: [],
    projects: [],
    experience: [],
    certifications: [],
    socialLinks: { linkedin: "", github: "", twitter: "" },
  });

  const [isDataReady, setIsDataReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setIsDataReady(true);
        return;
      }

      const res = await axios.get("http://localhost:5000/api/portfolio/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.personalInfo) {
        setFormData(res.data);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsDataReady(true);
    }
  };

  const handleChange = (e, section, field) => {
    if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [field]: e.target.value },
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleArrayAdd = (section, item) => {
    setFormData({
      ...formData,
      [section]: [...formData[section], item],
    });
  };

  const handleArrayRemove = (section, index) => {
    setFormData({
      ...formData,
      [section]: formData[section].filter((_, i) => i !== index),
    });
  };

  const handleSkillsChange = (e) => {
    setFormData({
      ...formData,
      skills: e.target.value.split(",").map((skill) => skill.trim()),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/portfolio", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Portfolio saved successfully!");
      navigate("/student-dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error saving portfolio");
    }
  };

  // ✅ Loading check - prevents errors while data is being fetched
  if (!isDataReady) {
    return <div className="loading">Loading portfolio form...</div>;
  }

  return (
    <div className="portfolio-form-container">
      <h2>Edit Your Portfolio</h2>
      <form onSubmit={handleSubmit}>
        <section>
          <h3>Template & Theme</h3>
          <select
            name="template"
            value={formData.template}
            onChange={(e) => handleChange(e, null, null)}
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
          </select>
          <input
            type="color"
            value={formData.theme.primaryColor}
            onChange={(e) =>
              setFormData({
                ...formData,
                theme: { ...formData.theme, primaryColor: e.target.value },
              })
            }
          />
        </section>

        <section>
          <h3>Personal Information</h3>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.personalInfo.fullName}
            onChange={(e) => handleChange(e, "personalInfo", "fullName")}
          />
          <input
            type="text"
            placeholder="Title"
            value={formData.personalInfo.title}
            onChange={(e) => handleChange(e, "personalInfo", "title")}
          />
          <textarea
            placeholder="Bio"
            value={formData.personalInfo.bio}
            onChange={(e) => handleChange(e, "personalInfo", "bio")}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.personalInfo.email}
            onChange={(e) => handleChange(e, "personalInfo", "email")}
          />
        </section>

        <section>
          <h3>Skills (comma-separated)</h3>
          <input
            type="text"
            placeholder="JavaScript, React, Node.js"
            value={formData.skills.join(", ")}
            onChange={handleSkillsChange}
          />
        </section>

        <section>
          <h3>Education</h3>
          {formData.education.map((edu, index) => (
            <div key={index} className="array-item">
              <span>
                {edu.degree} - {edu.institution}
              </span>
              <button
                type="button"
                onClick={() => handleArrayRemove("education", index)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const degree = prompt(
                "Enter degree (e.g., B.Tech Computer Science):",
              );
              if (!degree) return;

              const institution = prompt(
                "Enter institution (e.g., XYZ University):",
              );
              if (!institution) return;

              const year = prompt("Enter passing year (e.g., 2024):");
              const percentage = prompt(
                "Enter percentage/CGPA (e.g., 85% or 8.5 CGPA):",
              );

              handleArrayAdd("education", {
                degree,
                institution,
                year: year || "",
                percentage: percentage || "",
              });
            }}
          >
            Add Education
          </button>
        </section>

        <section>
          <h3>Projects</h3>
          {formData.projects.map((project, index) => (
            <div key={index} className="array-item">
              <span>{project.title}</span>
              <button
                type="button"
                onClick={() => handleArrayRemove("projects", index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const title = prompt("Enter project title:");
              if (title) {
                handleArrayAdd("projects", {
                  title,
                  description: "",
                  technologies: [],
                  link: "",
                });
              }
            }}
          >
            Add Project
          </button>
        </section>

        <button type="submit" className="btn-primary">
          Save Portfolio
        </button>
      </form>
    </div>
  );
};

export default PortfolioForm;
