import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "manager", "admin"], default: "employee" },
  leaveBalance: { type: Number, default: 20 } // e.g., 20 days per year
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;