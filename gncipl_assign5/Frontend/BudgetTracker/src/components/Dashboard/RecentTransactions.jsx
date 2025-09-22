import React from 'react'
import { LuArrowRight } from "react-icons/lu";
import moment from "moment";
import TransactionInfoCard from '../Cards/TransactionInfoCard';

const RecentTransactions = ({transactions}) => {
  return (
   <div className="card">
    <div className="flex items-center justify-between">
        <h5 className="text-lg">Recent Transaction</h5>
    </div>
    <div className="mt-6 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {transactions?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            title={item.type === 'expense' ? item.category : item.source}
            icon={item.icon}
            date={moment(item.date).format("Do MMM YYYY")}
            amount={item.amount}
            type={item.type}
            hideDeleteBtn
          />
        ))}

    </div>
   </div>
  );
};

export default RecentTransactions