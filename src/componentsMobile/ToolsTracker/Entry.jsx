import React, { useState, useEffect } from 'react';

const Entry = ({ user }) => {
  const [entryNo, setEntryNo] = useState(0);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  });
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [selectedIncharge, setSelectedIncharge] = useState(null);
  const [items, setItems] = useState([]);
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [inchargeOptions, setInchargeOptions] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showInchargeDropdown, setShowInchargeDropdown] = useState(false);

  // Fetch sites/projects for From and To dropdowns
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("https:///api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          sNo: item.siteNo,
          id: item.id,
        }));
        setFromOptions(formattedData);
        setToOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);

  // Fetch site incharge
  useEffect(() => {
    const fetchSiteIncharge = async () => {
      try {
        const response = await fetch('https:///api/site_incharge/getAll');
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((item) => ({
            value: item.id,
            label: item.siteEngineer,
            mobileNumber: item.mobileNumber,
            id: item.id,
          }));
          setInchargeOptions(formatted);
        } else {
          console.log('Error fetching site incharge.');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchSiteIncharge();
  }, []);

  // Fetch entry number
  useEffect(() => {
    const fetchEntryNo = async () => {
      try {
        const response = await fetch('https:///api/tools_tracker/getNextEntryNo');
        if (response.ok) {
          const data = await response.json();
          setEntryNo(data.entryNo || 0);
        }
      } catch (error) {
        console.error('Error fetching entry number:', error);
      }
    };
    fetchEntryNo();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
        setShowInchargeDropdown(false);
      }
    };

    if (showFromDropdown || showToDropdown || showInchargeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showFromDropdown, showToDropdown, showInchargeDropdown]);

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  };

  const handleAddItem = () => {
    // Handle add item logic here
    console.log('Add item clicked');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-90px-80px)] bg-white">
      {/* Entry Number and Date */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1">
        <p className="text-[12px] font-medium text-black leading-normal">
          #{entryNo} {date}
        </p>
      </div>

      {/* Input Fields */}
      <div className="flex-shrink-0 px-4 pt-4">
        {/* From Field */}
        <div className="mb-4 relative dropdown-container">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            From<span className="text-[#eb2f8e]">*</span>
          </p>
          <div className="relative">
            <div
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
                setShowInchargeDropdown(false);
              }}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: selectedFrom ? '#000' : '#9E9E9E',
                boxSizing: 'border-box'
              }}
            >
              {selectedFrom ? selectedFrom.label : 'Select'}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {showFromDropdown && (
              <div className="absolute z-50 w-[328px] mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] max-h-[200px] overflow-y-auto">
                {fromOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => {
                      setSelectedFrom(option);
                      setShowFromDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* To Field */}
        <div className="mb-4 relative dropdown-container">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            To<span className="text-[#eb2f8e]">*</span>
          </p>
          <div className="relative">
            <div
              onClick={() => {
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
                setShowInchargeDropdown(false);
              }}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: selectedTo ? '#000' : '#9E9E9E',
                boxSizing: 'border-box'
              }}
            >
              {selectedTo ? selectedTo.label : 'Select'}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {showToDropdown && (
              <div className="absolute z-50 w-[328px] mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] max-h-[200px] overflow-y-auto">
                {toOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => {
                      setSelectedTo(option);
                      setShowToDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Incharge Field */}
        <div className="mb-4 relative dropdown-container">
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Project Incharge<span className="text-[#eb2f8e]">*</span>
          </p>
          <div className="relative">
            <div
              onClick={() => {
                setShowInchargeDropdown(!showInchargeDropdown);
                setShowFromDropdown(false);
                setShowToDropdown(false);
              }}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                color: selectedIncharge ? '#000' : '#9E9E9E',
                boxSizing: 'border-box'
              }}
            >
              {selectedIncharge ? selectedIncharge.label : 'Select Incharge'}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {showInchargeDropdown && (
              <div className="absolute z-50 w-[328px] mt-1 bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] max-h-[200px] overflow-y-auto">
                {inchargeOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => {
                      setSelectedIncharge(option);
                      setShowInchargeDropdown(false);
                    }}
                    className="px-3 py-2 text-[12px] font-medium cursor-pointer hover:bg-gray-100"
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Label */}
      <div className="flex-shrink-0 px-4 pt-4">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-semibold text-black leading-normal">Items</p>
          <div className="w-[20px] h-[20px] rounded-full bg-[#E0E0E0] flex items-center justify-center">
            <span className="text-[10px] font-medium text-black">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Light Gray */}
      <div 
        className={`fixed bottom-[110px] right-[24px] lg:right-[calc(50%-164px)] z-30 ${
          (!selectedFrom || !selectedTo || !selectedIncharge) ? 'cursor-not-allowed pointer-events-none opacity-50' : 'cursor-pointer'
        }`} 
        onClick={(!selectedFrom || !selectedTo || !selectedIncharge) ? undefined : handleAddItem}
      >
        <div className="w-[48px] h-[43px] rounded-full flex items-center justify-center bg-[#E0E0E0]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Entry;
