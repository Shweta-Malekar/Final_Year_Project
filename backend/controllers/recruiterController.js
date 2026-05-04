const Portfolio = require("../models/Portfolio");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Interaction = require("../models/Interaction");

// Get all students with their portfolio information
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    const portfolios = await Portfolio.find();

    const studentData = students.map((student) => {
      const portfolio = portfolios.find(
        (p) => p.userId.toString() === student._id.toString(),
      );
      return {
        id: student._id,
        name: student.name,
        email: student.email,
        skills: portfolio?.skills || [],
        summary: portfolio?.personalInfo?.bio || "",
        portfolio: portfolio,
      };
    });

    res.json(studentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if recruiter has already shown interest to a specific student
exports.hasInterested = async (req, res) => {
  try {
    const { studentId } = req.params;

    const existing = await Interaction.findOne({
      studentId: studentId,
      recruiterId: req.user.id,
      type: "interest",
    });

    res.json({ hasInterested: !!existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Show interest in a student
exports.showInterest = async (req, res) => {
  try {
    const { studentId } = req.body;
    const recruiter = await User.findById(req.user.id);

    // Check if already interested
    const existing = await Interaction.findOne({
      studentId: studentId,
      recruiterId: req.user.id,
      type: "interest",
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Already shown interest to this student" });
    }

    // Create notification
    const notification = await Notification.create({
      studentId: studentId,
      recruiterId: req.user.id,
      recruiterName: recruiter.name,
      recruiterEmail: recruiter.email,
      recruiterCompany: recruiter.company,
      message: `${recruiter.name} from ${recruiter.company} is interested in your profile`,
    });

    // Emit socket event for real-time notification
    const io = req.app.get("io");
    io.to(studentId.toString()).emit("new-notification", notification);

    // Track interaction
    await Interaction.create({
      studentId: studentId,
      recruiterId: req.user.id,
      type: "interest",
    });

    res.json({ message: "Interest shown successfully", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all interactions for a recruiter
exports.getMyInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.find({
      recruiterId: req.user.id,
    }).populate("studentId", "name email");

    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get interested students for a recruiter
exports.getInterestedStudents = async (req, res) => {
  try {
    const interactions = await Interaction.find({
      recruiterId: req.user.id,
      type: "interest",
    }).populate("studentId", "name email skills");

    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
