import LeaveRequest from '../models/Leave.js';
import User from '../models/user.js';

const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = await LeaveRequest.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const cancelLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) return res.status(404).json({ message: "Leave not found" });
    if (leave.status !== "pending") return res.status(400).json({ message: "Only pending leaves can be cancelled" });
    if (leave.employee.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    await leave.deleteOne();
    res.json({ message: "Leave cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate("employee", "name email role")
      .populate("approvedBy", "name email");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "approved";
    leave.approvedBy = req.user._id;
    await leave.save();

    res.json({ message: "Leave approved", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const rejectLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "rejected";
    leave.approvedBy = req.user._id;
    await leave.save();

    res.json({ message: "Leave rejected", leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { applyLeave, getMyLeaves, cancelLeave, getAllLeaves, approveLeave, rejectLeave };