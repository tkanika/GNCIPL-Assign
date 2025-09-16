import express from "express"
import { 
    applyLeave, getMyLeaves, approveLeave, rejectLeave,getAllLeaves, cancelLeave
} from '../controller/leaveController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router=express.Router();

router.post("/apply", protect, applyLeave);
router.get("/my", protect, getMyLeaves);
router.delete("/:id", protect, cancelLeave);

// Manager/Admin routes
router.get("/all", protect, admin, getAllLeaves);
router.put("/:id/approve", protect, admin, approveLeave);
router.put("/:id/reject", protect, admin, rejectLeave);
export default router;
