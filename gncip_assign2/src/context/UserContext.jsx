import React, { createContext, useState } from "react";

export const UserContext = createContext();

const staticUser = {
  id: 1,
  name: "Demo User",
  email: "demo@example.com",
};

const initialExpenses = [
  { id: 1, category: 'Food', amount: 100, date: '2025-08-01', icon: '🍔' },
  { id: 2, category: 'Transport', amount: 50, date: '2025-08-02', icon: '🚌' },
];

const initialIncome = [
  { id: 1, source: 'Salary', amount: 2000, date: '2025-08-01', icon: '💰' },
  { id: 2, source: 'Freelance', amount: 500, date: '2025-08-10', icon: '🧑‍💻' },
];

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(staticUser);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [income, setIncome] = useState(initialIncome);

  // User functions
  const updateUser = (userData) => setUser(userData);
  const clearUser = () => setUser(null);

  // Expense functions
  const addExpense = (expense) => {
    setExpenses(prev => [...prev, { ...expense, id: Date.now() }]);
  };
  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  // Income functions
  const addIncome = (incomeItem) => {
    setIncome(prev => [...prev, { ...incomeItem, id: Date.now() }]);
  };
  const deleteIncome = (id) => {
    setIncome(prev => prev.filter(inc => inc.id !== id));
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      clearUser,
      expenses,
      income,
      addExpense,
      deleteExpense,
      addIncome,
      deleteIncome
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;