import React, { useState, useEffect } from 'react';

const History = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch inventory history data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Fetch both outgoing and incoming data
        const [outgoingRes, incomingRes] = await Promise.all([
          fetch('https://backendaab.in/aabuildersDash/api/inventory-outgoing/getAll').catch(() => null),
          fetch('https://backendaab.in/aabuildersDash/api/inventory-incoming/getAll').catch(() => null)
        ]);

        let allHistory = [];

        if (outgoingRes && outgoingRes.ok) {
          const outgoingData = await outgoingRes.json();
          const formattedOutgoing = outgoingData.map(item => ({
            id: item.id,
            transactionId: item.outgoing_number || `SR - ${new Date(item.date || item.created_at).getFullYear()} - ${item.id}`,
            customerName: item.project_name || item.projectName || '',
            location: item.stocking_location || item.stockingLocation || '',
            date: item.date || item.created_at,
            time: item.time || (item.created_at ? new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''),
            numberOfItems: item.items ? item.items.length : (item.number_of_items || 0),
            quantity: item.total_quantity || item.quantity || 0,
            price: item.total_price || item.price || 0,
            type: 'SR'
          }));
          allHistory = [...allHistory, ...formattedOutgoing];
        }

        if (incomingRes && incomingRes.ok) {
          const incomingData = await incomingRes.json();
          const formattedIncoming = incomingData.map(item => ({
            id: item.id,
            transactionId: item.incoming_number || `DP - ${new Date(item.date || item.created_at).getFullYear()} - ${item.id}`,
            customerName: item.vendor_name || item.vendorName || '',
            location: item.stocking_location || item.stockingLocation || '',
            date: item.date || item.created_at,
            time: item.time || (item.created_at ? new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''),
            numberOfItems: item.items ? item.items.length : (item.number_of_items || 0),
            quantity: item.total_quantity || item.quantity || 0,
            price: item.total_price || item.price || 0,
            type: 'DP'
          }));
          allHistory = [...allHistory, ...formattedIncoming];
        }

        // Sort by date (newest first)
        allHistory.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });

        setHistoryData(allHistory);
        setFilteredData(allHistory);
      } catch (error) {
        console.error('Error fetching inventory history:', error);
        // Use mock data for development if API fails
        const mockData = [
          {
            id: 1,
            transactionId: 'SR - 2025 - 134',
            customerName: 'Ramar',
            location: 'Krishnankovil',
            date: new Date().toISOString(),
            time: '10:24 AM',
            numberOfItems: 4,
            quantity: 20,
            price: 10000,
            type: 'SR'
          },
          {
            id: 2,
            transactionId: 'SR - 2025 - 145',
            customerName: 'Ramar',
            location: 'Krishnankovil',
            date: new Date().toISOString(),
            time: '12:40 PM',
            numberOfItems: 8,
            quantity: 34,
            price: 20000,
            type: 'SR'
          },
          {
            id: 3,
            transactionId: 'SR - 2025 - 54',
            customerName: 'Baalu',
            location: 'Thiruvannamalai',
            date: new Date().toISOString(),
            time: '11:23 AM',
            numberOfItems: 2,
            quantity: 4,
            price: 15000,
            type: 'SR'
          },
          {
            id: 4,
            transactionId: 'SR - 2025 - 15',
            customerName: 'Arumuga',
            location: 'Indira Nagar',
            date: new Date('2025-11-10').toISOString(),
            time: '11:32 AM',
            numberOfItems: 8,
            quantity: 47,
            price: 5000,
            type: 'SR'
          },
          {
            id: 5,
            transactionId: 'DP - 2025 - 155',
            customerName: 'Sakthi',
            location: 'Major Nagar',
            date: new Date('2025-11-09').toISOString(),
            time: '03:23 PM',
            numberOfItems: 2,
            quantity: 4,
            price: 25000,
            type: 'DP'
          },
          {
            id: 6,
            transactionId: 'DP - 2025 - 144',
            customerName: 'Ramar',
            location: 'Krishnankovil',
            date: new Date('2025-11-08').toISOString(),
            time: '02:15 PM',
            numberOfItems: 2,
            quantity: 4,
            price: 12000,
            type: 'DP'
          }
        ];
        setHistoryData(mockData);
        setFilteredData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(historyData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = historyData.filter(item => {
      const customerLocation = `${item.customerName} - ${item.location}`.toLowerCase();
      const transactionId = item.transactionId.toLowerCase();
      return customerLocation.includes(query) || transactionId.includes(query);
    });
    setFilteredData(filtered);
  }, [searchQuery, historyData]);

  // Format date to show "Today" or actual date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Today';
    } else {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  // Format time
  const formatTime = (dateString, timeString) => {
    if (timeString) return timeString;
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Search Bar */}
      <div className="px-4 pt-4 pb-3">
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
            className="w-full h-[36px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black bg-white focus:outline-none focus:border-[#BF9853]"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H14M4 8H12M6 12H10" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[12px] font-medium text-black">Filter</span>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">Loading...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[12px] text-gray-500">No history found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((item) => {
              const displayDate = formatDate(item.date);
              const displayTime = formatTime(item.date, item.time);
              const customerLocation = `${item.customerName} - ${item.location}`;
              
              return (
                <div
                  key={item.id}
                  className="bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {/* Transaction ID */}
                  <div className="mb-2">
                    <p className="text-[14px] font-semibold text-black leading-normal">
                      {item.transactionId}
                    </p>
                  </div>

                  {/* Customer/Location Name */}
                  <div className="mb-2">
                    <p className="text-[12px] font-medium text-black leading-normal">
                      {customerLocation}
                    </p>
                  </div>

                  {/* Date and Time */}
                  <div className="mb-2">
                    <p className="text-[12px] font-medium text-[#616161] leading-normal">
                      {displayDate} • {displayTime}
                    </p>
                  </div>

                  {/* Number of Items, Quantity, and Price */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[11px] font-medium text-[#616161] leading-normal mb-1">
                        No. of Items - {item.numberOfItems}
                      </p>
                      <p className="text-[12px] font-semibold text-[#FF6B35] leading-normal">
                        Quantity - {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-semibold text-black leading-normal">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

