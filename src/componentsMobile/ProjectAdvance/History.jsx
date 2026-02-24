import React, { useState, useEffect, useCallback } from 'react';
import Filter from '../Images/Filter.png';

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

const History = () => {
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
  const [searchQuery, setSearchQuery] = useState('');

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;
      if (dateOnly.getTime() === today.getTime()) {
        return `Today • ${timeStr}`;
      } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Yesterday • ${timeStr}`;
      } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} • ${timeStr}`;
      }
    } catch {
      return '';
    }
  };

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
          amount = -(parseFloat(entry.refund_amount) || 0);
        } else if (t === 'Bill Settlement') {
          amount = parseFloat(entry.bill_amount) || 0;
        } else {
          amount = parseFloat(entry.amount) || 0;
        }

        const dateStr = entry.timestamp || entry.createdAt || entry.created_at || '';
        const entryNo = entry.entry_no || 0;
        const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
        let prefix = 'AD';
        if (t === 'Bill Settlement') {
          prefix = 'BS';
        } else if (t === 'Transfer') {
          prefix = 'TF';
        } else if (t === 'Refund') {
          prefix = 'RF';
        }
        const ref = `${prefix} - ${year} - ${entryNo}`;

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
          timestamp: dateStr,
          type: t || 'Advance',
          paymentMode: entry.payment_mode || '',
          amount,
          entry,
        };
      })
      .sort((a, b) => {
        const noA = a.entry.entry_no || 0;
        const noB = b.entry.entry_no || 0;
        return noB - noA;
      });
  };

  const transformed = transformEntries();

  const filtered = searchQuery
    ? transformed.filter(
        (item) =>
          (item.entityName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.ref || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.type || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transformed;

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Advance':
        return 'bg-[#E8F5E9] text-[#2E7D32]';
      case 'Bill Settlement':
        return 'bg-[#E3F2FD] text-[#1976D2]';
      case 'Refund':
        return 'bg-[#FFF3E0] text-[#F57C00]';
      case 'Transfer':
        return 'bg-[#FFF3E0] text-black';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div
      className="relative w-full h-screen bg-white max-w-[360px] mx-auto flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Date and Category Section */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
          <button className="text-[12px] font-semibold text-black leading-normal">#Week</button>
          <button className="text-[12px] font-semibold text-black leading-normal">Type</button>
        </div>
      </div>
      {/* Filter */}
      <div className="flex-shrink-0 px-4 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="flex items-center gap-1 text-[13px] font-semibold text-[#9E9E9E] leading-normal cursor-pointer"
          >
            <img src={Filter} alt="Filter" className="w-[12px] h-[11px]" />
            Filter
          </button>
        </div>
      </div>
      {/* Cards List - Scrollable */}
      <div
        className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide px-4 mt-1 max-h-[calc(100vh-160px-80px)]"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
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
              {searchQuery ? 'No advance records found' : 'No advance records yet'}
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
              style={{ height: '95px' }}
            >
              <div className="flex-1 bg-white rounded-[8px] h-full px-3 py-3 transition-all duration-300 ease-out">
                <div className="flex flex-col gap-0.5">
                  {/* Row 1: ref and payment mode */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-black leading-snug">
                      {item.ref}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${getTypeBadgeClass(
                        item.type
                      )}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.type === 'Advance'
                            ? 'bg-[#2E7D32]'
                            : item.type === 'Bill Settlement'
                              ? 'bg-[#1976D2]'
                              : item.type === 'Refund'
                                ? 'bg-[#F57C00]'
                                : item.type === 'Transfer'
                                  ? ''
                                  : ''
                        }`}
                      />
                      {item.type === 'Transfer' && !item.paymentMode ? 'Online' : (item.paymentMode || '')}
                    </span>
                  </div>
                  {/* Row 2: entityName and empty space */}
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[12px] font-semibold text-black leading-snug break-words"
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {item.entityName || 'N/A'}
                    </p>
                    <span></span>
                  </div>
                  {/* Row 3: projectName and amount */}
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[11px] font-medium text-[#777777] leading-snug break-words"
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {item.projectName || 'N/A'}
                    </p>
                    <p
                      className={`text-[12px] font-semibold block leading-snug ${
                        item.amount < 0
                          ? 'text-[#E4572E]'
                          : item.type === 'Advance'
                            ? 'text-[#E4572E]'
                            : item.type === 'Refund' || item.type === 'Transfer'
                              ? 'text-[#007233]'
                              : 'text-[#007233]'
                      }`}
                    >
                      {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {/* Row 4: date/time and transfer site name */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#777777] leading-snug">
                      {formatDateTime(item.timestamp)}
                    </span>
                    {item.type === 'Transfer' && item.transferSiteName ? (
                      <p className={`text-[10px] font-semibold leading-snug ${item.amount < 0 ? 'text-[#BF9853]' : 'text-[#007233]'}`}>
                        {item.transferSiteName}
                      </p>
                    ) : item.type === 'Bill Settlement' && item.entry.amount ? (
                      <span className="text-[10px] font-medium text-[#777777] leading-snug">
                        ₹{parseFloat(item.entry.amount || 0).toLocaleString('en-IN')}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
