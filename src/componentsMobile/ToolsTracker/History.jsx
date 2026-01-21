import React from 'react';

const History = ({ user }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white p-4">
      <p className="text-[14px] font-semibold text-black">History</p>
      <p className="text-[12px] text-gray-500 mt-2">History content will be displayed here.</p>
    </div>
  );
};

export default History;
