const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ✅ Add password field
    profileImageUrl: { type: String, default: null },
  },
  { timestamps: true } // ✅ Fix typo
);

// ✅ Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log("Hashing password:", this.password);  // Log the password before hashing
  this.password = await bcrypt.hash(this.password, 10);
  console.log("Hashed password:", this.password);  // Log the hashed password
  next();
});


// ✅ Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  console.log("Candidate password:", candidatePassword);  // Log the candidate password
  console.log("Stored hashed password:", this.password);  // Log the stored password

  return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model("User", UserSchema);
