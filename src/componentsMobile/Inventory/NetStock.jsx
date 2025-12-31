import React, { useState, useEffect } from 'react';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const NetStock = () => {
  // Helper function for date
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStockingLocation, setSelectedStockingLocation] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStockingLocationModal, setShowStockingLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [stockingLocationOptions, setStockingLocationOptions] = useState([]);
  const [netStockData, setNetStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch category options
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = data.map(item => ({
            value: item.category || item.name || item.label,
            label: item.category || item.name || item.label,
            id: item.id
          })).filter(item => item.value);
          setCategoryOptions(options);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch stocking locations
  useEffect(() => {
    const fetchStockingLocations = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (response.ok) {
          const data = await response.json();
          const locations = data
            .filter(site => site.markedAsStockingLocation === true)
            .map(site => ({
              value: site.siteName,
              label: site.siteName,
              id: site.id
            }));
          setStockingLocationOptions(locations);
        }
      } catch (error) {
        console.error('Error fetching stocking locations:', error);
      }
    };
    fetchStockingLocations();
  }, []);

  // Fetch net stock data
  useEffect(() => {
    const fetchNetStock = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual net stock API endpoint when available
        // For now, using sample data based on the image
        const sampleData = [
          {
            id: 1,
            itemId: '190642466',
            productName: 'Sink Tap - CON-CHR-357KN',
            brand: 'Parryware',
            description: 'Black',
            defaultQty: 50,
            netStock: 3,
            minQty: 10,
            status: 'Place Order',
            isFavorite: false
          },
          {
            id: 2,
            itemId: '190614',
            productName: 'Wall Mixer 2 in 1 CON-CHR-273KNUPR',
            brand: 'Asian',
            description: 'Brown',
            defaultQty: 100,
            netStock: 60,
            minQty: 50,
            status: 'Available',
            isFavorite: true
          },
          {
            id: 3,
            itemId: '19656',
            productName: 'Godrej 6082 Ultra XL+ Lock - Satin Steel',
            brand: 'Godraj',
            description: 'Brown',
            defaultQty: 50,
            netStock: 55,
            minQty: 10,
            status: 'Available',
            isFavorite: false
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setNetStockData(sampleData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching net stock:', error);
        setLoading(false);
      }
    };
    fetchNetStock();
  }, []);

  // Filter data based on category, location, and search
  useEffect(() => {
    let filtered = [...netStockData];

    // Filter by category
    if (selectedCategory) {
      // For now, sample data doesn't have category field, so we'll skip this filter
      // In real implementation, filter by category
    }

    // Filter by stocking location
    if (selectedStockingLocation) {
      // For now, sample data doesn't have location field, so we'll skip this filter
      // In real implementation, filter by location
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemId.toLowerCase().includes(query) ||
        item.productName.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  }, [selectedCategory, selectedStockingLocation, searchQuery, netStockData]);

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Net Stock Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Date: ${selectedDate}`, 14, 25);
    
    // Add filters
    if (selectedCategory) {
      doc.text(`Category: ${selectedCategory}`, 14, 32);
    }
    if (selectedStockingLocation) {
      doc.text(`Stocking Location: ${selectedStockingLocation}`, 14, 39);
    }

    // Prepare table data
    const tableData = filteredData.map(item => [
      item.itemId,
      item.productName,
      `${item.brand}, ${item.description}`,
      item.defaultQty,
      item.netStock,
      item.minQty,
      item.status
    ]);

    // Add table
    doc.autoTable({
      startY: selectedStockingLocation ? 46 : (selectedCategory ? 39 : 32),
      head: [['Item ID', 'Product Name', 'Brand/Description', 'Default Qty', 'Net Stock', 'Min Qty', 'Status']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [191, 152, 83] }
    });

    // Save PDF
    doc.save(`NetStock_${selectedDate.replace(/\//g, '-')}.pdf`);
  };

  const getStatusButtonClass = (status) => {
    if (status === 'Place Order') {
      return 'bg-[#C8E6C9] text-black';
    }
    return 'bg-[#FFF9C4] text-black';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden">
      {/* Date and Export PDF Row */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="text-[12px] font-medium text-[#616161] leading-normal underline-offset-2 hover:underline"
          >
            {selectedDate}
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="text-[13px] font-medium text-black leading-normal hover:bg-gray-100 rounded-[8px] px-2 py-1.5"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 space-y-3">
        {/* Category Filter */}
        <div>
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Category
          </p>
          <div
            onClick={() => setShowCategoryModal(true)}
            className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
            style={{
              color: selectedCategory ? '#000' : '#9E9E9E'
            }}
          >
            <span>{selectedCategory || 'Select Category'}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Stocking Location Filter */}
        <div>
          <p className="text-[12px] font-semibold text-black leading-normal mb-1">
            Stocking Location
          </p>
          <div
            onClick={() => setShowStockingLocationModal(true)}
            className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
            style={{
              color: selectedStockingLocation ? '#000' : '#9E9E9E'
            }}
          >
            <span>{selectedStockingLocation || 'Select Location'}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-10 pr-3 text-[12px] font-medium bg-white"
          />
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        
      </div>

      {/* Modals */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={selectedDate}
      />
      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          setSelectedCategory(value);
          setShowCategoryModal(false);
        }}
        selectedValue={selectedCategory}
        options={categoryOptions.map(cat => cat.value || cat.label)}
        fieldName="Category"
      />
      <SelectVendorModal
        isOpen={showStockingLocationModal}
        onClose={() => setShowStockingLocationModal(false)}
        onSelect={(value) => {
          setSelectedStockingLocation(value);
          setShowStockingLocationModal(false);
        }}
        selectedValue={selectedStockingLocation}
        options={stockingLocationOptions.map(loc => loc.value || loc.label)}
        fieldName="Stocking Location"
      />
    </div>
  );
};

export default NetStock;

