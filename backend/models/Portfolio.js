const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  template: {
    type: String,
    enum: ["modern", "classic", "minimal"],
    default: "modern",
  },
  theme: {
    primaryColor: { type: String, default: "#3498db" },
    secondaryColor: { type: String, default: "#2ecc71" },
    fontFamily: { type: String, default: "Arial" },
  },
  personalInfo: {
    fullName: String,
    title: String,
    bio: String,
    email: String,
    phone: String,
    location: String,
    profileImage: String,
  },
  education: [
    {
      degree: String,
      institution: String,
      year: String,
      percentage: String,
    },
  ],
  skills: [String],
  projects: [
    {
      title: String,
      description: String,
      technologies: [String],
      link: String,
    },
  ],
  experience: [
    {
      title: String,
      company: String,
      duration: String,
      description: String,
    },
  ],
  certifications: [
    {
      name: String,
      issuer: String,
      year: String,
    },
  ],
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Portfolio", PortfolioSchema);
