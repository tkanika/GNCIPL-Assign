const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const { registerUser,
loginUser,
getUserInfo,}
 = require("../controllers/authController.js");

 const upload = require("../middleware/uploadMiddleware");
const User = require("../models/User.js");

const router = express.Router();
// Ensure that the functions are passed correctly to the routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return res.status(200).json({ imageUrl });
});

router.put("/update-profile-image", protect, async (req, res) => {
  try {
    const userId = req.user._id;  // now req.user will be defined
    const { profileImageUrl } = req.body;

    if (!profileImageUrl) {
      return res.status(400).json({ message: "Profile image URL is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// export the router
module.exports = router;