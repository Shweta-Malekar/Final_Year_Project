const express = require("express");
const router = express.Router();
const Portfolio = require("../models/Portfolio");
const auth = require("../middleware/auth");

router.get("/me", auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      // Return empty portfolio structure
      return res.json({
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
    }
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/portfolio/user/:userId - Get portfolio by USER ID
router.get("/user/:userId", async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (!portfolio) {
      return res.status(404).json({ msg: "Portfolio not found for this user" });
    }
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/portfolio/suggestions - Get portfolio suggestions
router.get("/suggestions", auth, async (req, res) => {
  try {
    // Your suggestions logic here
    res.json({ suggestions: [] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/portfolio/:id - Get portfolio by PORTFOLIO ID
router.get("/:id", async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ msg: "Portfolio not found" });
    }
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST /api/portfolio - Create or update portfolio
router.post("/", auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });

    if (portfolio) {
      // Update existing portfolio
      portfolio = await Portfolio.findOneAndUpdate(
        { userId: req.user.id },
        { $set: req.body },
        { new: true },
      );
      return res.json(portfolio);
    }

    // Create new portfolio
    const newPortfolio = new Portfolio({
      userId: req.user.id,
      ...req.body,
    });

    await newPortfolio.save();
    res.status(201).json(newPortfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
