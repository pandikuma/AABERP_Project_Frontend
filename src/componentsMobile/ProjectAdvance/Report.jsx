import React, { useState, useEffect, useCallback } from 'react';
import Filter from '../Images/Filter.png';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';

const PREDEFINED_SITE_OPTIONS = [
  { value: 'Mason Advance', label: 'Mason Advance', id: 1, sNo: '1' },
  { value: 'Material Advance', label: 'Material Advance', id: 2, sNo: '2' },
  { value: 'Weekly Advance', label: 'Weekly Advance', id: 3, sNo: '3' },
  { value: 'Excess Advance', label: 'Excess Advance', id: 4, sNo: '4' },
  { value: 'Material Rent', label: 'Material Rent', id: 5, sNo: '5' },
  { value: 'Subhash Kumar - Kunnur', label: 'Subhash Kumar - Kunnur', id: 6, sNo: '6' },
  { value: 'Summary Bill', label: 'Summary Bill', id: 7, sNo: '7' },
  { value: 'Daily Wage', label: 'Daily Wage', id: 8, sNo: '8' },
  { value: 'Rent Management Portal', label: 'Rent Management Portal', id: 9, sNo: '9' },
  { value: 'Multi-Project Batch', label: 'Multi-Project Batch', id: 10, sNo: '10' },
  { value: 'Loan Portal', label: 'Loan Portal', id: 11, sNo: '11' },
  { value: 'Bill Payment Tracker', label: 'Bill Payment Tracker', id: 12, sNo: '12' },
];

const Report = () => {
  const resolveActiveBranchId = () => {
    try {
      const selectedBranchId = localStorage.getItem('selectedBranchId');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
      const resolved = Number(selectedBranchId || fallbackBranchId);
      return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
    } catch {
      return null;
    }
  };
  const [activeBranchId] = useState(() => resolveActiveBranchId());
  const withBranchUrl = (baseUrl) => {
    const url = new URL(baseUrl);
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== '') {
      url.searchParams.set('branchId', String(activeBranchId));
    }
    return url.toString();
  };

  const [advanceData, setAdvanceData] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([...PREDEFINED_SITE_OPTIONS]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);

  const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Online', label: 'Online' }
  ];

  const fetchVendors = async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        setVendorOptions(data.map((item) => ({ id: item.id, label: item.vendorName })));
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchContractors = async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        setContractorOptions(data.map((item) => ({ id: item.id, label: item.contractorName })));
      }
    } catch (err) {
      console.error('Error fetching contractors:', err);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((item) => ({
          value: item.siteName,
          label: item.siteName,
          id: item.id,
          sNo: item.siteNo,
        }));
        setSiteOptions([...PREDEFINED_SITE_OPTIONS, ...formatted]);
      }
    } catch (err) {
      console.error('Error fetching sites:', err);
      setSiteOptions([...PREDEFINED_SITE_OPTIONS]);
    }
  };

  const loadAdvanceData = useCallback(async () => {
    try {
      const res = await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/getAll'));
      if (!res.ok) throw new Error('Failed to fetch advance data');
      const data = await res.json();
      setAdvanceData(data);
    } catch (err) {
      console.error('Error loading advance data:', err);
    }
  }, [activeBranchId]);

  useEffect(() => {
    fetchVendors();
    fetchContractors();
    fetchSites();
  }, []);

  useEffect(() => {
    loadAdvanceData();
    const handleAdvanceUpdate = () => loadAdvanceData();
    window.addEventListener('advanceUpdated', handleAdvanceUpdate);
    return () => window.removeEventListener('advanceUpdated', handleAdvanceUpdate);
  }, [loadAdvanceData]);

  const getVendorName = (vendorId) => {
    const v = vendorOptions.find((x) => x.id === vendorId);
    return v?.label || '';
  };
  const getContractorName = (contractorId) => {
    const c = contractorOptions.find((x) => x.id === contractorId);
    return c?.label || '';
  };
  const getProjectName = (projectId) => {
    const s = siteOptions.find((x) => x.id === projectId);
    return s?.label || s?.value || '';
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  const transformEntries = () => {
    return advanceData
      .map((entry) => {
        const vendorName = getVendorName(entry.vendor_id);
        const contractorName = getContractorName(entry.contractor_id);
        const entityName = vendorName || contractorName || entry.contractor_vendor || '';
        const projectName = getProjectName(entry.project_id) || entry.project_name || '';

        let amount = 0;
        const t = entry.type || '';
        if (t === 'Refund') {
          amount = parseFloat(entry.refund_amount) || 0;
        } else if (t === 'Bill Settlement') {
          amount = parseFloat(entry.amount) || 0;
        } else {
          amount = parseFloat(entry.amount) || 0;
        }

        const dateStr = entry.date || entry.timestamp || entry.createdAt || entry.created_at || '';
        const entryNo = entry.entry_no || 0;
        let prefix = 'AD';
        if (t === 'Bill Settlement') {
          prefix = 'BS';
        } else if (t === 'Transfer') {
          prefix = 'TF';
        } else if (t === 'Refund') {
          prefix = 'RF';
        }
        const ref = `#${prefix} - ${entityName}`;

        // Get transfer site name for Transfer type
        const transferSiteName = t === 'Transfer' && entry.transfer_site_id
          ? getProjectName(entry.transfer_site_id) || ''
          : '';

        return {
          id: entry.advancePortalId || entry.id || `${entry.entry_no}-${entry.date}`,
          ref,
          entityName,
          projectName,
          transferSiteName,
          date: dateStr,
          type: t || 'Advance',
          paymentMode: entry.payment_mode || '',
          amount,
          billAmount: parseFloat(entry.bill_amount) || 0,
          entry,
        };
      })
      .filter((item) => {
        if (startDate && endDate) {
          const itemDate = new Date(item.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (itemDate < start || itemDate > end) return false;
        }
        if (paymentModeFilter && item.paymentMode !== paymentModeFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
  };

  const transformed = transformEntries();

  const totalAdvance = transformed
    .filter(item => item.type === 'Advance')
    .reduce((sum, item) => sum + item.amount, 0);

  const getTypeBadgeClass = (type, paymentMode) => {
    if (type === 'Transfer') {
      return 'bg-[#FFF3E0] text-black';
    }
    if (type === 'Advance' || type === 'Refund') {
      return 'bg-[#E8F5E9] text-black';
    }
    return 'bg-[#FFF3E0] text-black';
  };

  return (
    <div
      className="relative w-full h-screen bg-white max-w-[360px] mx-auto flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Date and Category Section */}
      <div className="px-4 pt-2 mb-2">
        <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
          <button className="text-[12px] font-semibold text-black leading-normal">#Week</button>
          <button className="text-[12px] font-semibold text-black leading-normal">Type</button>
        </div>
      </div>

      {/* Date Range and Payment Mode Filters */}
      <div className="px-4 flex gap-2 items-center">
        {/* Date Range */}
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Date Range</p>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-10 text-[12px] font-medium bg-white focus:outline-none"
              style={{ boxSizing: 'border-box' }}
            />
          </div>
        </div>
        {/* Payment Mode */}
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Payment Mode</p>
          <div className="relative">
            <div
              onClick={() => setShowPaymentModeModal(true)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: paymentModeFilter ? '#000' : '#9E9E9E'
              }}
            >
              {paymentModeFilter || 'Select'}
              {paymentModeFilter ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaymentModeFilter('');
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Total Advance */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1 text-[13px] font-semibold text-[#9E9E9E] leading-normal cursor-pointer"
        >
          <img src={Filter} alt="Filter" className="w-[12px] h-[11px]" />
          Filter
        </button>
        <div className="text-[12px] font-semibold text-black">
          Total Advance : <span className="text-[#E4572E]">₹{totalAdvance.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Cards List - Scrollable */}
      <div
        className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide px-4 mt-1 flex-1"
      >
        {transformed.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12H24M8 20H24M8 28H24"
                  stroke="#9E9E9E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center mt-4">
              No advance records found
            </p>
          </div>
        ) : (
          transformed.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
            >
              <div className="flex-1 bg-white rounded-[8px] h-full px-3 py-3 transition-all duration-300 ease-out">
                <div className="flex flex-col gap-0.5">
                  {/* Row 1: ref and payment mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-black leading-snug">
                      {item.ref}
                    </span>
                    {(item.paymentMode || (item.type === 'Transfer' && !item.paymentMode)) && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${getTypeBadgeClass(
                          item.type,
                          item.paymentMode
                        )}`}
                      >
                        {item.type === 'Transfer' && !item.paymentMode ? 'Online' : (item.paymentMode || '')}
                      </span>
                    )}
                  </div>

                  {/* Row 2: projectName and amount */}
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[12px] font-medium text-black leading-snug break-words"
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {item.projectName || 'N/A'}
                    </p>
                    {item.type === 'Bill Settlement' && item.billAmount ? (
                      <p className="text-[12px] font-semibold text-black leading-snug">
                        ₹{item.billAmount.toLocaleString('en-IN')}
                      </p>
                    ) : item.type !== 'Transfer' && (
                      <p className="text-[12px] font-semibold text-black leading-snug">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  {/* Row 3: date and transfer site / amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-black leading-snug">
                      {formatDateOnly(item.date)}
                    </span>
                    {item.type === 'Transfer' && item.transferSiteName ? (
                      <p className="text-[12px] font-medium text-black leading-snug">
                        {item.transferSiteName}
                      </p>
                    ) : item.type === 'Bill Settlement' && item.amount ? (
                      <p className="text-[12px] font-semibold text-black leading-snug">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </p>
                    ) : item.type === 'Transfer' && item.amount ? (
                      <p className="text-[12px] font-semibold text-black leading-snug">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Mode Modal */}
      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentModeFilter(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentModeFilter}
        options={defaultPaymentModeOptions.map(opt => opt.label)}
        fieldName="Payment Mode"
        showStarIcon={false}
      />
    </div>
  );
};

export default Report;
