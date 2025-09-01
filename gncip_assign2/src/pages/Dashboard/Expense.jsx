
import React, { useContext, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import Modal from '../../components/Modal';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/DeleteAlert';
import { UserContext } from '../../context/UserContext';

const Expense = () => {
  const { expenses, addExpense, deleteExpense } = useContext(UserContext);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });
  const [OpenAddExpenseModal, setOpenAddExpenseModal] = useState(false);

  // Add expense (uses global context)
  const handleAddExpense = (expense) => {
    const { category, amount, date, icon } = expense;
    if (!category?.trim()) {
      toast.error("Category is required.");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount should be a valid number greater than 0.");
      return;
    }
    if (!date) {
      toast.error("Date is required.");
      return;
    }
    addExpense({ category, amount, date, icon });
    toast.success("Expense added successfully");
    setOpenAddExpenseModal(false);
  };

  // Delete expense (uses global context)
  const handleDeleteExpense = (id) => {
    deleteExpense(id);
    setOpenDeleteAlert({ show: false, data: null });
    toast.success("Expense details deleted successfully");
  };

  // Download (disabled in static demo)
  const handleDownloadExpenseDetails = () => {
    toast.success("Download feature is disabled in static demo.");
  };

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <ExpenseOverview
              transactions={expenses}
              onExpenseIncome={() => setOpenAddExpenseModal(true)}
            />
          </div>
          <ExpenseList
             transactions={expenses}
             onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
             onDownload={handleDownloadExpenseDetails}
            />
        </div>

        <Modal
          isOpen={OpenAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this Expense detail?"
            onDelete={() => handleDeleteExpense(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Expense;