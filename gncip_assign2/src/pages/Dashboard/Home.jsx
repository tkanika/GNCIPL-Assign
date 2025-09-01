import React, { useContext, useMemo } from 'react';
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from 'react-router-dom';
import InfoCard from '../../components/cards/InfoCard';
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import { addThousandsSeparator } from '../../utils/helper';
import { IoMdCard } from "react-icons/io";
import ExpenseTransactions from '../../components/Dashboard/ExpenseTransactions';
import Last30DaysExpenses from '../../components/Dashboard/Last30DaysExpenses';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import RecentIncomeWithChart from '../../components/Dashboard/RecentIncomeWithChart';
import RecentIncome from '../../components/Dashboard/RecentIncome';
import { UserContext } from '../../context/UserContext';

const Home = () => {
  const navigate = useNavigate();
  const { expenses, income } = useContext(UserContext);

  // Calculate dashboard data from global context
  const dashboardData = useMemo(() => {
    const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalBalance = totalIncome - totalExpenses;

    // Combine and sort recent transactions (last 5)
    const allTransactions = [
      ...income.map(item => ({ ...item, type: 'income', category: item.source })),
      ...expenses.map(item => ({ ...item, type: 'expense' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    // Get last 30 days expenses
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysExpenses = expenses
      .filter(exp => new Date(exp.date) >= thirtyDaysAgo)
      .map(exp => ({ date: exp.date, amount: Number(exp.amount) }));

    // Recent income (last 5)
    const recentIncome = income
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      recentTransactions: allTransactions,
      last30DaysExpenses,
      recentIncome,
      last60DaysIncome: {
        transactions: income
      }
    };
  }, [expenses, income]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeparator(dashboardData.totalBalance)}
            color="bg-primary"
          />
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(dashboardData.totalIncome)}
            color="bg-orange-500"
          />
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandsSeparator(dashboardData.totalExpenses)}
            color="bg-red-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions transactions={dashboardData.recentTransactions} />
          <FinanceOverview
            totalBalance={dashboardData.totalBalance}
            totalIncome={dashboardData.totalIncome}
            totalExpense={dashboardData.totalExpenses}
          />
          <ExpenseTransactions
            transactions={dashboardData.last30DaysExpenses}
            onSeeMore={() => navigate("/expense")}
          />
          <Last30DaysExpenses data={dashboardData.last30DaysExpenses} />
          <RecentIncomeWithChart
            data={dashboardData.last60DaysIncome.transactions.slice(0, 4)}
            totalIncome={dashboardData.totalIncome}
          />
          <RecentIncome
            transactions={dashboardData.last60DaysIncome.transactions}
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;