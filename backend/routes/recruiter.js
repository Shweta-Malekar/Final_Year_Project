const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const recruiterController = require("../controllers/recruiterController");

router.get("/students", auth, recruiterController.getAllStudents);
router.get(
  "/has-interested/:studentId",
  auth,
  recruiterController.hasInterested,
); // Add this
router.post("/interest", auth, recruiterController.showInterest);

module.exports = router;
