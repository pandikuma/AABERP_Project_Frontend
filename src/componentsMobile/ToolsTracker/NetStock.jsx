import React from 'react';

const NetStock = ({ user }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white p-4">
      <p className="text-[14px] font-semibold text-black">Net Stock</p>
      <p className="text-[12px] text-gray-500 mt-2">Net stock content will be displayed here.</p>
    </div>
  );
};

export default NetStock;
