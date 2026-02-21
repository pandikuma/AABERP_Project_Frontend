import React, { useState } from 'react';

const AdvanceForm = () => {
  const [formData, setFormData] = useState({
    advanceNumber: '',
    date: '',
    type: '',
    contractorVendor: '',
    projectName: '',
    amountGiven: '',
    paymentMode: '',
    description: '',
    attachedFile: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        attachedFile: file
      }));
    }
  };

  const handlePayAdvance = () => {
    // Handle pay advance logic here
    console.log('Pay Advance clicked', formData);
  };

  return (
    <div className="px-4 overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Advance Number and Date */}
      <div className="mb-2 items-center border-b border-gray-200 pb-1 mt-1.5 flex justify-between">
        <div>
          <button
            type="button"
            className="text-[12px] font-medium text-black leading-normal underline-offset-2 hover:underline"
          >
            #NO {formData.advanceNumber || '09/08/2025'}
          </button>
        </div>
        <div>
          <button
            type="button"
            className="text-[12px] font-medium text-black leading-normal underline-offset-2 hover:underline"
          >
            Select Type
          </button>
        </div>
      </div>
      <div className="space-y-[6px]">
        {/* Contractor/Vendor Field */}
        <div className="">
          <p className="flex justify-between items-center text-[12px] font-semibold text-black leading-normal mb-0.5">
            <span>Contractor/Vendor<span className="text-[#eb2f8e]">*</span></span>
            <span className="text-[12px] font-medium text-[#9E9E9E]">0.00</span>
          </p>
          <div className="relative">
            <div
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: formData.contractorVendor ? '#000' : '#9E9E9E'
              }}
            >
              {formData.contractorVendor || 'Select'}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

        </div>
        {/* Project Name Field */}
        <div className="">
          <p className="text-[12px] flex justify-between items-center font-semibold text-black leading-normal mb-0.5">
            <span>Project Name<span className="text-[#eb2f8e]">*</span></span>
            <span className="text-[12px] font-medium text-[#9E9E9E]">0.00</span>
          </p>
          <div className="relative">
            <div
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: formData.projectName ? '#000' : '#9E9E9E'
              }}
            >
              {formData.projectName || 'Select'}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Amount Given Field */}
        <div className="flex justify-between items-center w-[328px]">
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Amount Given<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                className="w-[160px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  boxSizing: 'border-box',
                  color: formData.amountGiven ? '#000' : '#9E9E9E'
                }}
              >
                {formData.amountGiven || 'Select'}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Payment Mode Field */}
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Payment Mode<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                className="w-[160px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  boxSizing: 'border-box',
                  color: formData.paymentMode ? '#000' : '#9E9E9E'
                }}
              >
                {formData.paymentMode || 'Select'}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Description Field */}
        <div className="">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
            Description
          </p>
          <textarea
            className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-3 pt-1 items-center text-[12px] font-medium bg-white"
            placeholder="Type Here"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            style={{
              boxSizing: 'border-box',
              color: formData.description ? '#000' : '#9E9E9E'
            }}
          />
        </div>
      </div>
      {/* Attach File */}
      <div className="">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V10M5 5L8 2L11 5M3 12H13" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[12px] font-medium text-[#9E9E9E]">Attach File</span>
        </div>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileAttach}
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          {formData.attachedFile && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F5] rounded-full text-[12px] font-medium text-[#9E9E9E]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 1L2 5H5V9H7V5H10L6 1Z" fill="#9E9E9E" />
              </svg>
              <span>Image X</span>
            </div>
          )}
        </label>
      </div>
      {/* Pay Advance Button */}
      <button
        onClick={handlePayAdvance}
        className="w-[328px] h-[40px] bg-[#D9D9D9] text-black font-semibold rounded text-[14px] leading-normal"
      >
        Pay Advance
      </button>
    </div>
  );
};

export default AdvanceForm;
