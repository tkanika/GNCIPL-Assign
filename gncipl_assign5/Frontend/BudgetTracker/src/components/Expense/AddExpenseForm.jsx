import React, { useState } from 'react';
import Input from "../Inputs/Input";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddExpenseForm = ({ onAddExpense }) => {
  const [income, setIncome] = useState({
    category: "",
    amount: "", // string initially
    date: "",
    icon: "",
  });

  const handleChanges = (key, value) => {
    setIncome(prev => ({
      ...prev,
      [key]: key === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    console.log("Submitting Expense:", income); // DEBUG
    onAddExpense(income);
  };

  return (
    <div>
      <EmojiPickerPopup
        icon={income.icon}
        onSelect={(selectedIcon) => handleChanges("icon", selectedIcon)}
      />

      <Input
        value={income.category}
        onChange={({ target }) => handleChanges("category", target.value)}
        label="Category"
        placeholder="Rent, Groceries, etc"
        type="text"
      />

      <Input
        value={income.amount}
        onChange={({ target }) => handleChanges("amount", target.value)}
        label="Amount"
        placeholder="Enter amount"
        type="number"
      />

      <Input
        value={income.date}
        onChange={({ target }) => handleChanges("date", target.value)}
        label="Date"
        type="date"
      />

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={handleSubmit}
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;