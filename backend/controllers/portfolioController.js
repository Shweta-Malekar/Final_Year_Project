const Portfolio = require("../models/Portfolio");
const Interaction = require("../models/Interaction");

exports.createOrUpdatePortfolio = async (req, res) => {
  try {
    const portfolioData = req.body;
    const portfolio = await Portfolio.findOneAndUpdate(
      { userId: req.user.id },
      { ...portfolioData, lastUpdated: Date.now() },
      { new: true, upsert: true },
    );
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.params.id });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    // Track view
    portfolio.viewCount += 1;
    await portfolio.save();

    // Track interaction if viewer is recruiter
    if (req.user && req.user.role === "recruiter") {
      await Interaction.create({
        studentId: portfolio.userId,
        recruiterId: req.user.id,
        type: "view",
      });
    }

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPortfolios = async (req, res) => {
  try {
    const { skill, experience, search } = req.query;
    let query = {};

    if (skill) {
      query.skills = { $in: [skill] };
    }

    if (search) {
      query["personalInfo.fullName"] = { $regex: search, $options: "i" };
    }

    const portfolios = await Portfolio.find(query).populate(
      "userId",
      "name email",
    );
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    const suggestions = [];

    if (!portfolio.projects || portfolio.projects.length === 0) {
      suggestions.push("Add projects to showcase your work");
    }

    if (!portfolio.experience || portfolio.experience.length === 0) {
      suggestions.push("Add work experience to demonstrate your expertise");
    }

    if (!portfolio.certifications || portfolio.certifications.length === 0) {
      suggestions.push("Add certifications to validate your skills");
    }

    if (portfolio.skills.length < 3) {
      suggestions.push("Add more skills to increase your profile visibility");
    }

    if (!portfolio.personalInfo.profileImage) {
      suggestions.push(
        "Add a profile image to make your portfolio more personal",
      );
    }

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
