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

const Summary = () => {
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
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedContractorOrVendorOption, setSelectedContractorOrVendorOption] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('Contractor/Vendor'); // 'Contractor/Vendor' or 'Project'
  const [showContractorVendorModal, setShowContractorVendorModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [totalPendingAdvance, setTotalPendingAdvance] = useState(0);

  const fetchVendors = async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        setVendorOptions(data.map((item) => ({ 
          id: item.id, 
          label: item.vendorName,
          type: 'Vendor'
        })));
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
        setContractorOptions(data.map((item) => ({ 
          id: item.id, 
          label: item.contractorName,
          type: 'Contractor'
        })));
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

  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions]);
  }, [vendorOptions, contractorOptions]);

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

  // Calculate summary data based on view mode - matches AdvanceSummary logic
  useEffect(() => {
    if (!advanceData.length) {
      setSummaryData([]);
      setTotalBillAmount(0);
      setTotalPendingAdvance(0);
      return;
    }

    let totalBillAll = 0;
    let totalPendingAll = 0;
    const grouped = {};

    if (viewMode === 'Contractor/Vendor') {
      // When Contractor/Vendor mode: group by Project (filtered by selected contractor/vendor if selected)
      let filteredData = advanceData;
      
      if (selectedContractorOrVendorOption) {
        filteredData = advanceData.filter(item => {
          if (selectedContractorOrVendorOption.type === "Vendor") {
            return item.vendor_id === selectedContractorOrVendorOption.id;
          }
          if (selectedContractorOrVendorOption.type === "Contractor") {
            return item.contractor_id === selectedContractorOrVendorOption.id;
          }
          return false;
        });
      }

      filteredData.forEach((curr) => {
        const {
          project_id,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0
        } = curr;

        if (project_id) {
          if (!grouped[project_id]) {
            grouped[project_id] = {
              name: getProjectName(project_id) || "-",
              projectId: project_id,
              totalAdvance: 0,
              totalBill: 0,
              totalRefund: 0
            };
          }
          grouped[project_id].totalAdvance += parseFloat(amount) || 0;
          grouped[project_id].totalBill += parseFloat(bill_amount) || 0;
          grouped[project_id].totalRefund += parseFloat(refund_amount) || 0;
        }
      });

      const summaryArray = Object.values(grouped).map((item) => {
        const pending = item.totalAdvance - item.totalBill - item.totalRefund;
        totalPendingAll += pending;
        totalBillAll += item.totalBill;
        return {
          name: item.name,
          billAmount: item.totalBill,
          pendingAdvance: pending,
          projectId: item.projectId
        };
      });

      setSummaryData(summaryArray);
    } else {
      // When Project mode: group by Contractor/Vendor (filtered by selected project if selected)
      let filteredData = advanceData;
      
      if (selectedProject) {
        filteredData = advanceData.filter(item => item.project_id === selectedProject.id);
      }

      filteredData.forEach((item) => {
        const entityId = item.vendor_id || item.contractor_id;
        const entityType = item.vendor_id ? 'Vendor' : 'Contractor';
        const entityName = item.vendor_id 
          ? getVendorName(item.vendor_id) 
          : getContractorName(item.contractor_id);

        if (!entityId || !entityName) return;

        const key = `${entityType}-${entityId}`;
        if (!grouped[key]) {
          grouped[key] = {
            name: entityName,
            entityId,
            entityType,
            totalAdvance: 0,
            totalBill: 0,
            totalRefund: 0,
          };
        }

        grouped[key].totalAdvance += parseFloat(item.amount) || 0;
        grouped[key].totalBill += parseFloat(item.bill_amount) || 0;
        grouped[key].totalRefund += parseFloat(item.refund_amount) || 0;
      });

      const summaryArray = Object.values(grouped).map((item) => {
        const pending = item.totalAdvance - item.totalBill - item.totalRefund;
        totalPendingAll += pending;
        totalBillAll += item.totalBill;
        return {
          name: item.name,
          billAmount: item.totalBill,
          pendingAdvance: pending,
          entityId: item.entityId,
          entityType: item.entityType,
        };
      });

      setSummaryData(summaryArray);
    }

    setTotalBillAmount(totalBillAll);
    setTotalPendingAdvance(totalPendingAll);
  }, [viewMode, selectedContractorOrVendorOption, selectedProject, advanceData, vendorOptions, contractorOptions, siteOptions]);

  return (
    <div
      className="relative w-full bg-white max-w-[360px] mx-auto flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Date and Category Section */}
      <div className="px-4 pt-2 mb-2">
        <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
          <button className="text-[12px] font-semibold text-black leading-normal">#Week</button>
          <button className="text-[12px] font-semibold text-black leading-normal">Type</button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-4 mb-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => {
              setViewMode('Contractor/Vendor');
              setSelectedProject(null);
            }}
            className={`flex-1 py-2 px-3 rounded text-[12px] font-semibold transition-colors ${
              viewMode === 'Contractor/Vendor'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Contractor/Vendor
          </button>
          <button
            onClick={() => {
              setViewMode('Project');
              setSelectedContractorOrVendorOption(null);
            }}
            className={`flex-1 py-2 px-3 rounded text-[12px] font-semibold transition-colors ${
              viewMode === 'Project'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Project
          </button>
        </div>
      </div>

      {/* Contractor/Vendor Selection */}
      {viewMode === 'Contractor/Vendor' && (
        <div className="px-4 mb-3">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[12px] font-semibold text-black leading-normal">
              Contractor/Vendor<span className="text-[#eb2f8e]">*</span>
            </p>
            <span className="text-[12px] font-medium text-[#007233]">
              Bill Amount : {totalBillAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="relative">
            <div
              onClick={() => setShowContractorVendorModal(true)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: selectedContractorOrVendorOption ? '#000' : '#9E9E9E'
              }}
            >
              {selectedContractorOrVendorOption ? selectedContractorOrVendorOption.label : 'Select'}
              {selectedContractorOrVendorOption ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedContractorOrVendorOption(null);
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
      )}

      {/* Project Selection */}
      {viewMode === 'Project' && (
        <div className="px-4 mb-3">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[12px] font-semibold text-black leading-normal">
              Project<span className="text-[#eb2f8e]">*</span>
            </p>
            <span className="text-[12px] font-medium text-[#007233]">
              Bill Amount : {totalBillAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="relative">
            <div
              onClick={() => setShowProjectModal(true)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: selectedProject ? '#000' : '#9E9E9E'
              }}
            >
              {selectedProject ? selectedProject.label : 'Select'}
              {selectedProject ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(null);
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
      )}

      {/* Filter and Pending Advance */}
      <div className="px-4 pt-2 pb-2 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-1 text-[13px] font-semibold text-[#9E9E9E] leading-normal cursor-pointer"
        >
          <img src={Filter} alt="Filter" className="w-[12px] h-[11px]" />
          Filter
        </button>
        <div className="text-[12px] font-semibold text-black">
          Pending Advance : <span className="text-[#E4572E]">{totalPendingAdvance.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Cards List - Scrollable */}
      <div
        className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide px-4 mt-1 flex-1 max-h-[380px]"
      >
        {summaryData.length === 0 ? (
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
              No summary records found
            </p>
          </div>
        ) : (
          summaryData.map((item, index) => {
            const isSettled = item.pendingAdvance <= 0;
            return (
              <div
                key={index}
                className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
              >
                <div className="flex-1 bg-white rounded-[8px] h-full px-3 py-3 transition-all duration-300 ease-out">
                  <div className="flex flex-col gap-0.5">
                    {/* Row 1: Name and Status */}
                    <div className="flex items-center justify-between">
                      <p
                        className="text-[12px] font-medium text-black leading-snug break-words flex-1"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {item.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          isSettled
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : 'bg-[#FFF3E0] text-[#F57C00]'
                        }`}
                      >
                        {isSettled ? 'Settled' : 'Pending'}
                      </span>
                    </div>

                    {/* Row 2: Bill Amount */}
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-medium text-black leading-snug">
                        Bill Amount - {item.billAmount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Row 3: Pending Advance */}
                    <div className="flex items-center justify-between">
                      <span></span>
                      <p className="text-[12px] font-semibold text-black leading-snug">
                        {item.pendingAdvance.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contractor/Vendor Modal */}
      <SelectVendorModal
        isOpen={showContractorVendorModal}
        onClose={() => setShowContractorVendorModal(false)}
        onSelect={(value) => {
          const selected = combinedOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedContractorOrVendorOption(selected);
          }
          setShowContractorVendorModal(false);
        }}
        selectedValue={selectedContractorOrVendorOption ? selectedContractorOrVendorOption.label : ''}
        options={combinedOptions.map(opt => opt.label)}
        fieldName="Contractor/Vendor"
      />

      {/* Project Modal */}
      <SelectVendorModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(value) => {
          const selected = siteOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedProject(selected);
          }
          setShowProjectModal(false);
        }}
        selectedValue={selectedProject ? selectedProject.label : ''}
        options={siteOptions.map(opt => opt.label)}
        fieldName="Project"
      />
    </div>
  );
};

export default Summary;
