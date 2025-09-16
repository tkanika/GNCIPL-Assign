import jwt from "jsonwebtoken";
import User from "../models/user.js";
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized" });
    }
  }
  if (!token) return res.status(401).json({ message: "No token provided" });
};

const admin = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "manager") next();
  else res.status(403).json({ message: "Access denied" });
};
export { protect, admin };