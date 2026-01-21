import React from 'react';

const ServiceHistory = ({ user }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white p-4">
      <p className="text-[14px] font-semibold text-black">Service History</p>
      <p className="text-[12px] text-gray-500 mt-2">Service history content will be displayed here.</p>
    </div>
  );
};

export default ServiceHistory;
