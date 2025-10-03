const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Expense = require("../models/Expense");

// Add expense category
exports.addExpense = async (req, res) => {
  const userId = req.user.id;

  try{
    const { icon, category, amount, date } = req.body;
    
    if(!category || !amount || !date){
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const newExpense = new Expense({
      userId,
      icon,
      category,
      amount,
      date: new Date(date)
    });
    await newExpense.save();
    
    res.status(201).json(newExpense);
  }
  catch(error){
    console.error("Add expense error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}


// Get all expense source
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try{
    const expense = await Expense.find({userId}).sort({ date: -1});
    res.json(expense);
  }
  catch (error){
    console.error("Get all expenses error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// Delete expense source
exports.deleteExpense = async (req, res) => {
  const userId = req.user.id;
  const expenseId = req.params.id;
  
  try{
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }
    
    // First check if the expense exists and belongs to the user
    const expense = await Expense.findOne({ _id: expenseId, userId });
    
    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }
    
    await Expense.findByIdAndDelete(expenseId);
    res.json({ message: "Expense deleted successfully" });
  }
  catch (error){
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//Download excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try{
    const expense = await Expense.find({ userId }).sort({ date: -1});

    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: item.date,
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");
    xlsx.writeFile(wb, 'expense_details.xlsx');
    res.download('expense_details.xlsx');
  } catch (error) {
    console.error("Download excel error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};