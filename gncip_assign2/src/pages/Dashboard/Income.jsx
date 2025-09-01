import React, { useContext, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import IncomeOverview from '../../components/Income/IncomeOverview';
import Modal from '../../components/Modal';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import toast from 'react-hot-toast';
import IncomeList from '../../components/Income/IncomeList';
import DeleteAlert from '../../components/DeleteAlert';
import { UserContext } from '../../context/UserContext';

const Income = () => {
   const { income, addIncome, deleteIncome } = useContext(UserContext);
   const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });
   const [OpenAddIncomeModal, setOpenAddIncomeModal] = useState(false);

  // Add income (uses global context)
  const handleAddIncome = (incomeData) => {
    const { source, amount, date, icon } = incomeData;
    if (!source?.trim()) {
      toast.error("Source is required.");
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
    addIncome({ source, amount, date, icon });
    toast.success("Income added successfully");
    setOpenAddIncomeModal(false);
  };

  // Delete income (uses global context)
  const handleDeleteIncome = (id) => {
    deleteIncome(id);
    setOpenDeleteAlert({ show: false, data: null });
    toast.success("Income details deleted successfully");
  };

  // Download (disabled in static demo)
  const handleDownloadIncomeDetails = () => {
    toast.success("Download feature is disabled in static demo.");
  };

  // No API fetch needed


  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="">
          <IncomeOverview
          transactions={income}
          onAddIncome={() => setOpenAddIncomeModal(true)}
          />
        </div>

        <IncomeList
          transactions={income}
          onDelete={(id) => {
            setOpenDeleteAlert({ show: true, data: id});
          }}
          onDownload={handleDownloadIncomeDetails}
          />
      </div>

      <Modal
          isOpen={OpenAddIncomeModal}
          onClose={() => setOpenAddIncomeModal(false)}
          title="Add Income"
          >
          <AddIncomeForm onAddIncome={handleAddIncome} />
          </Modal>

          <Modal
             isOpen={openDeleteAlert.show}
             onClose={() => setOpenDeleteAlert({ show:false, data: null })}
             title="Delete Income"
             >
              <DeleteAlert
              content="Are you sure you want to delete this income detail?"
              onDelete={() => handleDeleteIncome(openDeleteAlert.data)}
              />
             </Modal>

      </div>
    </DashboardLayout>
  );
};

export default Income;