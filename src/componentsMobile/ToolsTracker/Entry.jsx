import React, { useState, useEffect } from 'react';
import SearchableDropdown from '../PurchaseOrder/SearchableDropdown';

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
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [itemNameOptions, setItemNameOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [itemIdOptions, setItemIdOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [addItemFormData, setAddItemFormData] = useState({
    itemName: '',
    brand: '',
    itemId: '',
    quantity: ''
  });

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

  // Check if all three fields are filled
  const areFieldsFilled = selectedFrom && selectedTo && selectedIncharge;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https:///api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data.map(item => ({
            value: item.category,
            label: item.category,
            id: item.id,
          }));
          setCategoryOptions(options);
          // Set default to "Electricals" if available
          const electricals = options.find(opt => opt.value === 'Electricals' || opt.value === 'Electrical');
          if (electricals) {
            setSelectedCategory(electricals);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch item names
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await fetch('https:///api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          const filteredItems = selectedCategory
            ? data.filter(item => item.category?.toLowerCase() === selectedCategory.value?.toLowerCase())
            : data;
          const itemNameOpts = filteredItems.map(item => ({
            value: item.itemName,
            label: item.itemName,
            id: item.id,
            category: item.category,
          }));
          setItemNameOptions(itemNameOpts.map(item => item.value));
        }
      } catch (error) {
        console.error('Error fetching item names:', error);
      }
    };
    if (selectedCategory) {
      fetchItemNames();
    }
  }, [selectedCategory]);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('https:///api/po_brand/getAll');
        if (response.ok) {
          const data = await response.json();
          const filteredBrands = selectedCategory
            ? data.filter(b => !b.category || b.category?.toLowerCase() === selectedCategory.value?.toLowerCase())
            : data;
          const brandOpts = filteredBrands
            .map(b => ({
              value: b.brand?.trim(),
              label: b.brand?.trim(),
              id: b.id
            }))
            .filter(b => b.value);
          setBrandOptions(brandOpts.map(b => b.value));
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    if (selectedCategory) {
      fetchBrands();
    }
  }, [selectedCategory]);

  // Fetch item IDs when item name or brand is selected
  useEffect(() => {
    if (addItemFormData.itemName || addItemFormData.brand) {
      // TODO: Replace with actual API endpoint for tools tracker item IDs
      // For now, generate sample item IDs
      const sampleItemIds = [
        'AA DM 01',
        'AA DM 02',
        'AA DM 03',
      ];
      setItemIdOptions(sampleItemIds);
    } else {
      setItemIdOptions([]);
    }
  }, [addItemFormData.itemName, addItemFormData.brand]);

  const handleAddItem = () => {
    if (areFieldsFilled) {
      setShowAddItemsModal(true);
    }
  };

  const handleCloseAddItemsModal = () => {
    setShowAddItemsModal(false);
    setAddItemFormData({
      itemName: '',
      brand: '',
      itemId: '',
      quantity: ''
    });
  };

  const handleAddItemSubmit = () => {
    if (addItemFormData.itemName && addItemFormData.brand && addItemFormData.itemId && addItemFormData.quantity) {
      const newItem = {
        id: Date.now(),
        ...addItemFormData
      };
      setItems([...items, newItem]);
      handleCloseAddItemsModal();
    }
  };

  const handleFieldChange = (field, value) => {
    setAddItemFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[12px] font-semibold text-black leading-normal">Items</p>
            <div className="w-[20px] h-[20px] rounded-full bg-[#E0E0E0] flex items-center justify-center">
              <span className="text-[10px] font-medium text-black">{items.length}</span>
            </div>
          </div>
          {areFieldsFilled && (
            <div className="cursor-pointer" onClick={() => {/* Handle search */}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5.5" stroke="#000" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - Changes to black when fields are filled */}
      <div 
        className={`fixed bottom-[110px] right-[24px] lg:right-[calc(50%-164px)] z-30 ${
          areFieldsFilled ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none opacity-50'
        }`} 
        onClick={areFieldsFilled ? handleAddItem : undefined}
      >
        <div className={`w-[48px] h-[43px] rounded-full flex items-center justify-center ${
          areFieldsFilled ? 'bg-black' : 'bg-[#E0E0E0]'
        }`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke={areFieldsFilled ? "#fff" : "#000"} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Add Items Bottom Sheet Modal */}
      {showAddItemsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center"
          style={{ fontFamily: "'Manrope', sans-serif" }}
          onClick={handleCloseAddItemsModal}
        >
          <div className="bg-white w-full max-w-[360px] h-[422px] rounded-tl-[16px] rounded-tr-[16px] relative z-50" onClick={(e) => e.stopPropagation()}>
            {/* Header with Title and Category */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <p className="text-[16px] font-medium text-black leading-normal">
                Add Items
              </p>
              <div className="flex items-center gap-2">
                {addItemFormData.quantity && (
                  <span className="text-[16px] font-semibold text-[#e06256]">{addItemFormData.quantity}</span>
                )}
                <button
                  onClick={() => {/* Handle category selection */}}
                  className="text-[16px] font-semibold text-black underline decoration-solid"
                  style={{ textUnderlinePosition: 'from-font' }}
                >
                  {selectedCategory ? selectedCategory.value : 'Electricals'}
                </button>
                <button
                  onClick={handleCloseAddItemsModal}
                  className="text-[#e06256] text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            {/* Form fields */}
            <div className="px-6 pb-32">
              {/* Item Name */}
              <div className="mb-[10px] relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Item Name<span className="text-[#eb2f8e]">*</span>
                </p>
                <SearchableDropdown
                  value={addItemFormData.itemName}
                  onChange={(value) => handleFieldChange('itemName', value)}
                  options={itemNameOptions}
                  placeholder="Drilling Machine"
                  fieldName="Item Name"
                  showAllOptions={true}
                />
              </div>
              {/* Quantity */}
              <div className="mb-[10px] relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Quantity<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={addItemFormData.quantity}
                    onChange={(e) => handleFieldChange('quantity', e.target.value)}
                    className="w-full h-[32px] border border-[#d6d6d6] rounded-[8px] px-3 text-[12px] font-medium bg-white focus:outline-none text-black"
                    placeholder="Enter"
                  />
                </div>
              </div>
              {/* Brand */}
              <div className="mb-[10px] relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Brand<span className="text-[#eb2f8e]">*</span>
                </p>
                <SearchableDropdown
                  value={addItemFormData.brand}
                  onChange={(value) => handleFieldChange('brand', value)}
                  options={brandOptions}
                  placeholder="Stanley"
                  fieldName="Brand"
                  showAllOptions={true}
                />
              </div>
              {/* Item ID */}
              <div className="mb-10 relative">
                <p className="text-[13px] font-medium text-black mb-1 leading-normal">
                  Item ID<span className="text-[#eb2f8e]">*</span>
                </p>
                <SearchableDropdown
                  value={addItemFormData.itemId}
                  onChange={(value) => handleFieldChange('itemId', value)}
                  options={itemIdOptions}
                  placeholder="AA DM 01"
                  fieldName="Item ID"
                  showAllOptions={true}
                />
                {addItemFormData.itemId && (
                  <p className="text-[12px] text-[#e06256] mt-1">4534666666100</p>
                )}
              </div>
              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCloseAddItemsModal}
                  className="w-[175px] h-[40px] border border-[#949494] rounded-[8px] text-[14px] font-bold text-[#363636] bg-white leading-normal"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItemSubmit}
                  disabled={!addItemFormData.itemName || !addItemFormData.brand || !addItemFormData.itemId || !addItemFormData.quantity}
                  className={`w-[175px] h-[40px] border border-[#f4ede2] rounded-[8px] text-[14px] font-bold leading-normal ${
                    addItemFormData.itemName && addItemFormData.brand && addItemFormData.itemId && addItemFormData.quantity
                      ? 'bg-black text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entry;
