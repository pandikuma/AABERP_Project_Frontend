import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../ProjectAdvance/Header';
import Sidebar from '../Bars/Sidebar';
import BottomNav from '../ProjectAdvance/BottomNav';
import editIcon from '../Images/edit.png';
import deleteIcon from '../Images/delete.png';

const masterDataItems = [
  'Project Name',
  'Vendor Name',
  'Contractor Name',
  'Categories',
  'Machine tools',
  'Employee Details',
  'Labour List',
  'Account Details',
  'Bank Name',
  'Bank Account Type',
  'Bank Account Branch Name',
  'Support Contractor/Staff Name'
];

const MasterData = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('master-data');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [listData, setListData] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [swipedProjectId, setSwipedProjectId] = useState(null);

  const getListApiUrl = (item) => {
    switch (item) {
      case 'Vendor Name':
        return 'https://backendaab.in/aabuilderDash/api/vendor_Names/getAll';
      case 'Contractor Name':
        return 'https://backendaab.in/aabuilderDash/api/contractor_Names/getAll';
      case 'Categories':
        return 'https://backendaab.in/aabuilderDash/api/expenses_categories/getAll';
      case 'Machine tools':
        return 'https://backendaab.in/aabuilderDash/api/machine_tools/getAll';
      case 'Employee Details':
        return 'https://backendaab.in/aabuildersDash/api/employee_details/getAll';
      case 'Labour List':
        return 'https://backendaab.in/aabuildersDash/api/labours-details/getAll';
      case 'Account Details':
      case 'Bank Name':
      case 'Bank Account Branch Name':
        return 'https://backendaab.in/aabuildersDash/api/account-details/getAll';
      case 'Bank Account Type':
        return 'https://backendaab.in/aabuildersDash/api/bank_type/getAll';
      case 'Support Contractor/Staff Name':
        return 'https://backendaab.in/aabuildersDash/api/support_staff/getAll';
      default:
        return null;
    }
  };

  const getItemPrimaryText = (item, currentItem) => {
    if (!item) return '';
    if (typeof item === 'string') {
      return item;
    }

    switch (currentItem) {
      case 'Vendor Name':
        return item.vendorName || item.vendor_name || item.name || item.value || '';
      case 'Contractor Name':
        return item.contractorName || item.contractor_name || item.name || item.value || '';
      case 'Categories':
        return item.category || item.categoryName || item.category_name || item.expensesCategory || item.name || item.value || '';
      case 'Machine tools':
        return item.machineTool || item.machine_tool || item.name || item.tool_name || item.value || '';
      case 'Employee Details':
        return item.employeeName || item.employee_name || item.name || item.value || '';
      case 'Labour List':
        return item.labour_name || item.labourName || item.name || item.value || '';
      case 'Account Details':
        return item.account_holder_name || item.accountHolderName || item.account_name || item.accountName || item.name || item.value || '';
      case 'Bank Name':
        return item.bank_name || item.bankName || item.name || item.value || '';
      case 'Bank Account Type':
        return item.accountType || item.bank_account_type || item.account_type || item.bankAccountType || item.type || item.name || item.value || '';
      case 'Bank Account Branch Name':
        return item.branch || item.branch_name || item.bankBranchName || item.name || item.value || '';
      case 'Support Contractor/Staff Name':
        return item.supportStaffName || item.support_staff_name || item.name || item.value || '';
      default:
        return '';
    }
  };

  const getItemSecondaryText = (item, currentItem) => {
    if (!item) return '';
    switch (currentItem) {
      case 'Vendor Name':
        return item.vendorBankName || item.vendor_bank_name || item.vendorAccountNumber || item.vendor_account_number || '';
      case 'Contractor Name':
        return item.contractorBankName || item.contractor_bank_name || item.contractorAccountNumber || item.contractor_account_number || '';
      case 'Employee Details':
        return item.mobileNumber || item.mobile_number || item.contactNumber || item.contact_number || '';
      case 'Labour List':
        return item.labour_salary || item.salary || '';
      case 'Account Details':
        return item.bank_name || item.bankName || item.account_number || item.accountNumber || '';
      case 'Bank Name':
        return item.branch || item.branch_name || '';
      case 'Bank Account Branch Name':
        return item.ifsc_code || item.ifscCode || item.bank_name || item.bankName || '';
      case 'Support Contractor/Staff Name':
        return item.mobileNumber || item.mobile_number || item.contactNumber || item.contact_number || '';
      default:
        return '';
    }
  };

  const getListRowId = (item, index) => {
    return (
      item.id ||
      item._id ||
      item.labour_id ||
      item.employee_id ||
      item.account_number ||
      item.vendorName ||
      item.vendor_name ||
      item.contractorName ||
      item.contractor_name ||
      item.category ||
      item.categoryName ||
      item.category_name ||
      item.accountType ||
      item.bank_account_type ||
      item.account_type ||
      item.machineTool ||
      item.machine_tool ||
      item.supportStaffName ||
      item.support_staff_name ||
      `list-${index}`
    );
  };
  const [touchStartX, setTouchStartX] = useState(null);
  const [mouseStartX, setMouseStartX] = useState(null);
  const [isAddProjectViewOpen, setIsAddProjectViewOpen] = useState(false);
  const [expandedProjectSection, setExpandedProjectSection] = useState('project-details');
  const [isAddOnSheetOpen, setIsAddOnSheetOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return masterDataItems;
    return masterDataItems.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const filteredProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter((project) =>
      (project.projectName || '').toLowerCase().includes(query) ||
      (project.projectAddress || '').toLowerCase().includes(query) ||
      (project.projectId || '').toLowerCase().includes(query)
    );
  }, [projectSearch, projects]);

  const filteredList = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return listData;

    return listData.filter((item) => {
      const primary = getItemPrimaryText(item, selectedItem).toLowerCase();
      const secondary = getItemSecondaryText(item, selectedItem).toLowerCase();
      return primary.includes(query) || secondary.includes(query);
    });
  }, [itemSearch, listData, selectedItem]);

  useEffect(() => {
    if (selectedItem !== 'Project Name') {
      return;
    }

    let isMounted = true;

    const fetchProjects = async () => {
      setIsProjectsLoading(true);

      try {
        const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        if (isMounted) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        if (isMounted) {
          setProjects([]);
        }
      } finally {
        if (isMounted) {
          setIsProjectsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem || selectedItem === 'Project Name') {
      return;
    }

    const apiUrl = getListApiUrl(selectedItem);
    if (!apiUrl) {
      setListData([]);
      return;
    }

    let isMounted = true;

    const fetchListData = async () => {
      setIsListLoading(true);

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${selectedItem}`);
        }

        const data = await response.json();
        if (isMounted) {
          setListData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(`Error fetching ${selectedItem}:`, error);
        if (isMounted) {
          setListData([]);
        }
      } finally {
        if (isMounted) {
          setIsListLoading(false);
        }
      }
    };

    fetchListData();

    return () => {
      isMounted = false;
    };
  }, [selectedItem]);

  useEffect(() => {
    if (currentPage === 'master-data') {
      setSelectedItem(null);
    }
  }, [currentPage]);

  const handleNavigate = (page) => {
    if (page === 'request-for-quotation') {
      setCurrentPage('request-for-quotation');
      navigate('/rfq');
    } else if (page === 'purchase-order') {
      setCurrentPage('purchase-order');
      navigate('/purchaseorder');
    } else if (page === 'billing') {
      setCurrentPage('billing');
      navigate('/tracker/pendingbill');
    } else if (page === 'goods-recieved-notes') {
      setCurrentPage('goods-recieved-notes');
      navigate('/grn/create');
    } else if (page === 'inventory') {
      setCurrentPage('inventory');
      navigate('/inventory');
    } else if (page === 'tools-tracker') {
      setCurrentPage('tools-tracker');
      navigate('/toolsTracker');
    } else if (page === 'project-advance') {
      setCurrentPage('project-advance');
      navigate('/portal');
    } else if (page === 'loan-portal') {
      setCurrentPage('loan-portal');
      navigate('/loan');
    } else if (page === 'master-data') {
      setCurrentPage('master-data');
      navigate('/master-data');
    }
  };

  const handleItemClick = (item) => {
    if (item === 'Project Name') {
      setSelectedItem(item);
      setProjectSearch('');
      setIsAddProjectViewOpen(false);
      return;
    }

    setSelectedItem(item);
    setItemSearch('');
    setListData([]);
  };

  const getProjectRowId = (item, index) => item.id || item.projectId || item.projectName || `project-${index}`;

  const getProjectSerialNumber = (item, index) => {
    const projectIndex = projects.findIndex((project) => project.id === item.id);
    return projectIndex >= 0 ? projectIndex + 1 : index + 1;
  };

  const handleProjectTouchStart = (event) => {
    setTouchStartX(event.changedTouches[0].clientX);
  };

  const handleProjectTouchEnd = (event, rowId) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;

    if (swipeDistance > 40) {
      setSwipedProjectId(rowId);
    } else if (swipeDistance < -40) {
      setSwipedProjectId(null);
    }

    setTouchStartX(null);
  };

  const handleProjectMouseDown = (event) => {
    setMouseStartX(event.clientX);
  };

  const handleProjectMouseUp = (event, rowId) => {
    if (mouseStartX === null) {
      return;
    }

    const swipeDistance = mouseStartX - event.clientX;

    if (swipeDistance > 40) {
      setSwipedProjectId(rowId);
    } else if (swipeDistance < -40) {
      setSwipedProjectId(null);
    }

    setMouseStartX(null);
  };

  const toggleProjectSection = (sectionId) => {
    setExpandedProjectSection((current) => (current === sectionId ? null : sectionId));
  };

  const renderChevron = (isExpanded) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d={isExpanded ? 'M4 10L8 6L12 10' : 'M4 6L8 10L12 6'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const renderInput = ({ label, required, placeholder, value, rightIcon, multiline }) => (
    <div className="w-full">
      <label className="block text-left text-[12px] font-medium text-black">
        {label}
        {required && <span className="text-[#E26D47]">*</span>}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            value={value || ''}
            readOnly
            placeholder={placeholder}
            rows={3}
            className="w-full resize-none rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] py-[10px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0]"
          />
        ) : (
          <input
            value={value || ''}
            readOnly
            placeholder={placeholder}
            className={`h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none placeholder:text-[#B0B0B0] ${
              rightIcon ? 'pr-[30px]' : ''
            }`}
          />
        )}
        {rightIcon && (
          <span className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 text-[#4B4B4B]">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );

  const renderProjectAccordion = (sectionId, title, content) => {
    const isExpanded = expandedProjectSection === sectionId;

    return (
      <div className="overflow-hidden rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => toggleProjectSection(sectionId)}
          className="flex w-full items-center justify-between px-[14px] py-[13px] text-left"
        >
          <span className="text-[14px] font-medium text-black">{title}</span>
          <span className="text-[#2B2B2B]">{renderChevron(isExpanded)}</span>
        </button>
        {isExpanded && <div className="border-t border-[#F2F2F2] px-[14px] py-[12px]">{content}</div>}
      </div>
    );
  };

  const renderAddProjectView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button
            type="button"
            className="pb-[8px] text-[#2B2B2B]"
            aria-label="More options"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px]">
          <div className="flex min-w-0 items-center truncate text-[11px] text-[#A4A4A4]">
            <button
              type="button"
              onClick={() => {
                setIsAddProjectViewOpen(false);
                setSelectedItem(null);
              }}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Master Table
            </button>
            <span className="px-[4px]">&gt;</span>
            <button
              type="button"
              onClick={() => setIsAddProjectViewOpen(false)}
              className="truncate text-[11px] text-[#A4A4A4]"
            >
              Project Name
            </button>
            <span className="px-[4px]">&gt;</span>
            <span className="font-medium text-black">New</span>
          </div>
          <button
            type="button"
            className="shrink-0 text-[12px] font-medium text-black"
          >
            Submit
          </button>
        </div>

        <div className="border-t border-[#EFEFEF] px-[16px] py-[8px] text-right">
          <button type="button" className="text-[12px] font-medium text-black">
            Upload File
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px] pb-[18px]">
        <div className="">
          {renderProjectAccordion(
            'project-details',
            'Project Details',
            <div className="space-y-[10px]">
              {renderInput({
                label: 'Project Name',
                required: true,
                placeholder: 'Enter Name',
                value: '',
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Project ID',
                  required: true,
                  placeholder: 'Enter ID',
                  value: ''
                })}
                {renderInput({
                  label: 'Project Category',
                  required: true,
                  placeholder: 'Select',
                  value: '',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Reference Name',
                  required: true,
                  placeholder: 'Enter Name',
                  value: ''
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: 'Select',
                  value: '',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              {renderInput({
                label: 'Project Address',
                required: true,
                placeholder: 'Enter Address',
                value: '',
                multiline: true
              })}
            </div>
          )}

          {renderProjectAccordion(
            'client-details',
            'Client Details',
            <div className="space-y-[10px]">
              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Client Name',
                  required: true,
                  placeholder: 'Enter Number',
                  value: ''
                })}
                {renderInput({
                  label: 'Father Name',
                  required: true,
                  placeholder: 'Enter Age',
                  value: ''
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Mobile Number',
                  required: true,
                  placeholder: 'Enter Number',
                  value: ''
                })}
                {renderInput({
                  label: 'Age',
                  required: true,
                  placeholder: 'Enter Age',
                  value: ''
                })}
              </div>

              {renderInput({
                label: 'Email ID',
                placeholder: '',
                value: 'Sakthi Electricals@gmail.com'
              })}

              {renderInput({
                label: 'Client Address',
                required: true,
                placeholder: 'Enter Address',
                value: '',
                multiline: true
              })}
            </div>
          )}

          {renderProjectAccordion(
            'account-details',
            'Account Details',
            <div className="space-y-[10px]">
              <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-[12px]">
                {renderInput({
                  label: 'Account Holder Name',
                  required: true,
                  placeholder: '',
                  value: 'Murugan Sridhar'
                })}
                {renderInput({
                  label: 'QR Code',
                  placeholder: '',
                  value: '',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_140px] gap-[12px]">
                {renderInput({
                  label: 'Account Number',
                  required: true,
                  placeholder: '',
                  value: '7479164619462972'
                })}
                {renderInput({
                  label: ' ',
                  placeholder: '',
                  value: 'State Bank of India',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'IFSC Code',
                  required: true,
                  placeholder: '',
                  value: 'SBIN0000921',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
                {renderInput({
                  label: 'Branch',
                  required: true,
                  placeholder: '',
                  value: 'SVPR',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'UPI Phone Number',
                  required: true,
                  placeholder: '',
                  value: '9876543210',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
                {renderInput({
                  label: 'UPI ID',
                  required: true,
                  placeholder: '',
                  value: '9876543210@Axis',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2.25" y="2.25" width="7.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )
                })}
              </div>
            </div>
          )}

          {renderProjectAccordion(
            'project-information',
            'Project Information',
            <div className="space-y-[12px]">
              <div className="relative">
                <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  readOnly
                  placeholder="Search"
                  className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
                />
              </div>

              <div className="rounded-[12px] border border-[#F0F0F0] bg-white p-[12px] shadow-[0px_1px_4px_rgba(0,0,0,0.05)]">
                <div className="grid grid-cols-[minmax(0,1fr)_92px] gap-[10px] text-[12px] text-black">
                  <div className="space-y-[4px] text-left">
                    <div>SL - 01 - 13/41B</div>
                    <div>Home</div>
                    <div>First Floor</div>
                    <div className="text-[#5B5B5B]">07989837327949, 1Phase</div>
                  </div>
                  <div className="space-y-[4px] text-right">
                    <div>1200 Sqft</div>
                    <div>Sh.No 134</div>
                    <div className="whitespace-nowrap text-[#C79B53]">PT 3564743897879</div>
                    <div className="whitespace-nowrap text-[#C79B53]">WT 843646H76346</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOnSheetOpen(true)}
                className="flex h-[34px] w-full items-center justify-center gap-[8px] rounded-[4px] border border-[#BEBEBE] bg-white text-[14px] font-medium text-black"
              >
                <span className="text-[20px] leading-none">+</span>
                <span>Add on</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {isAddOnSheetOpen && (
        <>
          <button
            type="button"
            aria-label="Close overlay"
            onClick={() => setIsAddOnSheetOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/50"
          />

          <div className="fixed inset-x-0 bottom-0 z-[10000] mx-auto w-full rounded-t-[18px] bg-white px-[16px] pb-[16px] pt-[18px] shadow-[0px_-4px_20px_rgba(0,0,0,0.12)]">
            <div className="mb-[10px] flex items-start justify-between">
              <div className="text-[15px] font-medium text-black">Enter Bill Details</div>
              <button
                type="button"
                onClick={() => setIsAddOnSheetOpen(false)}
                className="text-[28px] leading-none text-[#F26B3A]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-[10px]">
              <div className="grid grid-cols-2 gap-[12px]">
                {renderInput({
                  label: 'Project Type',
                  required: true,
                  placeholder: 'Select',
                  value: '',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
                {renderInput({
                  label: 'Floor Name',
                  required: true,
                  placeholder: 'Select',
                  value: '',
                  rightIcon: (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )
                })}
              </div>

              <div className="grid grid-cols-[70px_70px_minmax(0,1fr)] gap-[8px]">
                {renderInput({
                  label: 'Shop No',
                  required: true,
                  placeholder: 'Enter',
                  value: ''
                })}
                {renderInput({
                  label: 'Door No',
                  required: true,
                  placeholder: 'Enter',
                  value: ''
                })}
                {renderInput({
                  label: 'Area',
                  required: true,
                  placeholder: 'Enter Area',
                  value: ''
                })}
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[8px]">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <label className="block text-left text-[12px] font-medium text-black">
                      EB.No
                      <span className="text-[#E26D47]">*</span>
                    </label>
                    <span className="text-[12px] font-medium text-[#4B4B4B]">1Phase</span>
                  </div>
                  <input
                    readOnly
                    placeholder="Enter Number"
                    className=" h-[32px] w-full rounded-[4px] border border-[#D9D9D9] bg-white px-[12px] text-[12px] text-black outline-none"
                    value=""
                  />
                </div>
                {renderInput({
                  label: 'Property Tax No',
                  required: true,
                  placeholder: 'Enter Number',
                  value: ''
                })}
              </div>

              {renderInput({
                label: 'Water Tax No',
                required: true,
                placeholder: 'Enter Number',
                value: '',
                rightIcon: (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              })}
            </div>

            <div className="mt-[16px] mb-[10px] grid grid-cols-2 gap-[14px]">
              <button
                type="button"
                onClick={() => setIsAddOnSheetOpen(false)}
                className="h-[38px] rounded-[8px] border border-[#BEBEBE] bg-white text-[14px] font-medium text-[#3A3A3A]"
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-[38px] rounded-[8px] bg-black text-[14px] font-medium text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderSelectedItemView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button
            type="button"
            className="pb-[8px] text-[#2B2B2B]"
            aria-label="More options"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-[6px]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <button type="button">Download</button>
        </div>
      </div>

      <div className="px-[12px] pt-[8px]">
        <div className="flex items-center gap-[10px]">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={itemSearch}
              onChange={(event) => setItemSearch(event.target.value)}
              placeholder="Search"
              className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
            />
          </div>
          <button
            type="button"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black text-white"
            aria-label="Add"
            onClick={() => {}}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px]">
        <div className="overflow-hidden rounded-[14px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
          <div className="border-b border-[#EFEFEF] bg-[#F8F8F8] px-[14px] py-[10px]">
            <div className="flex items-center">
              <span className="w-[28px]" />
              <span className="text-[14px] font-semibold text-black">{selectedItem}</span>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto scrollbar-none no-scrollbar">
            {isListLoading ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                Loading...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                No data found
              </div>
            ) : (
              filteredList.map((item, index) => {
                const rowId = getListRowId(item, index);
                const isSwiped = swipedProjectId === rowId;

                return (
                  <div
                    key={rowId}
                    className="relative border-b border-[#EFEFEF] bg-white last:border-b-0 overflow-hidden select-none"
                    style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                    onTouchStart={handleProjectTouchStart}
                    onTouchEnd={(event) => handleProjectTouchEnd(event, rowId)}
                    onMouseDown={handleProjectMouseDown}
                    onMouseUp={(event) => handleProjectMouseUp(event, rowId)}
                    onMouseLeave={(event) => handleProjectMouseUp(event, rowId)}
                  >
                    <div className="absolute inset-y-0 right-[6px] flex items-center gap-[4px]">
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#0B7A45] text-white"
                        aria-label="Edit"
                      >
                        <img src={editIcon} alt="Edit" className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#F26B3A] text-white"
                        aria-label="Delete"
                      >
                        <img src={deleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                      </button>
                    </div>

                    <div
                      className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center bg-white px-[14px] py-[10px] transition-transform duration-200 ${
                        isSwiped ? '-translate-x-[70px]' : 'translate-x-0'
                      }`}
                    >
                      <span className="text-[13px] font-medium text-black text-left">
                        {index + 1}
                      </span>
                      <span className="pr-[8px] text-[13px] font-medium text-black text-left">
                        {getItemPrimaryText(item, selectedItem)}
                      </span>
                      <span className="text-[12px] font-medium text-left text-[#7A7A7A]">
                        {getItemSecondaryText(item, selectedItem)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderProjectNameView = () => (
    <>
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="flex items-end justify-between px-[16px] pt-[10px]">
          <div className="relative pb-[8px] text-[14px] font-medium text-black">
            Master Data
            <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
          </div>
          <button
            type="button"
            className="pb-[8px] text-[#2B2B2B]"
            aria-label="More options"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4" r="1.3" fill="currentColor" />
              <circle cx="9" cy="9" r="1.3" fill="currentColor" />
              <circle cx="9" cy="14" r="1.3" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-[#EFEFEF] px-[16px] py-[8px] text-[12px] font-medium text-black">
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-[6px]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 9L2 6L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back</span>
          </button>
          <button type="button">Download</button>
        </div>
      </div>

      <div className="px-[12px] pt-[8px]">
        <div className="flex items-center gap-[10px]">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
              placeholder="Search"
              className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
            />
          </div>

          <button
            type="button"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black text-white"
            aria-label="Add"
            onClick={() => {
              setIsAddProjectViewOpen(true);
              setExpandedProjectSection('project-details');
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-[12px] pt-[12px]">
        <div className="overflow-hidden rounded-[14px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
          <div className="border-b border-[#EFEFEF] bg-[#F8F8F8] px-[14px] py-[10px]">
            <div className="flex items-center">
              <span className="w-[28px]" />
              <span className="text-[14px] font-semibold text-black">Project Name</span>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto scrollbar-none no-scrollbar">
            {isProjectsLoading ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                Loading...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                No projects found
              </div>
            ) : (
              filteredProjects.map((item, index) => {
                const rowId = getProjectRowId(item, index);
                const isSwiped = swipedProjectId === rowId;

                return (
                  <div
                    key={rowId}
                    className="relative border-b border-[#EFEFEF] bg-white last:border-b-0 overflow-hidden select-none"
                    style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                    onTouchStart={handleProjectTouchStart}
                    onTouchEnd={(event) => handleProjectTouchEnd(event, rowId)}
                    onMouseDown={handleProjectMouseDown}
                    onMouseUp={(event) => handleProjectMouseUp(event, rowId)}
                    onMouseLeave={(event) => handleProjectMouseUp(event, rowId)}
                  >
                    <div className="absolute inset-y-0 right-[6px] flex items-center gap-[4px]">
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#0B7A45] text-white"
                        aria-label="Edit"
                      >
                        <img src={editIcon} alt="Edit" className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        className="flex h-[36px] w-[30px] items-center justify-center rounded-[2px] bg-[#F26B3A] text-white"
                        aria-label="Delete"
                      >
                        <img src={deleteIcon} alt="Delete" className="w-[18px] h-[18px]" />
                      </button>
                    </div>

                    <div
                      className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center bg-white px-[14px] py-[10px] transition-transform duration-200 ${
                        isSwiped ? '-translate-x-[70px]' : 'translate-x-0'
                      }`}
                    >
                      <span className="text-[13px] font-medium text-black text-left">
                        {getProjectSerialNumber(item, index)}
                      </span>
                      <span className="pr-[8px] text-[13px] font-medium text-black text-left">
                        {item.projectName || ''}
                      </span>
                      <span
                        className={`text-[12px] font-medium text-left ${
                          item.projectCategory === 'Client Project'
                            ? 'text-[#C79B53]'
                            : item.projectCategory === 'Own Project'
                              ? 'text-[#111111]'
                              : 'text-[#7A7A7A]'
                        }`}
                      >
                        {item.projectCategory === 'Client Project'
                          ? 'Client'
                          : item.projectCategory === 'Own Project'
                            ? 'Own'
                            : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="relative w-full min-h-screen bg-white max-w-[360px] mx-auto overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />

      <Header
        title="Master Data"
        user={user}
        onLogout={onLogout}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div
        className="bg-white"
        style={{
          minHeight: '100vh',
          paddingTop: '56px',
          paddingBottom: 'calc(60px + 18px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {selectedItem ? (
          selectedItem === 'Project Name' ? (
            isAddProjectViewOpen ? renderAddProjectView() : renderProjectNameView()
          ) : (
            renderSelectedItemView()
          )
        ) : (
          <>
            <div className="border-b border-[#E9E9E9] bg-white">
              <div className="flex items-end justify-between px-[16px] pt-[10px]">
                <div className="relative pb-[8px] text-[14px] font-medium text-black">
                  Master Data
                  <div className="absolute left-0 bottom-0 h-[2px] w-[80px] rounded-full bg-[#C79B53]" />
                </div>
                <button
                  type="button"
                  className="pb-[8px] text-[#2B2B2B]"
                  aria-label="More options"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="4" r="1.3" fill="currentColor" />
                    <circle cx="9" cy="9" r="1.3" fill="currentColor" />
                    <circle cx="9" cy="14" r="1.3" fill="currentColor" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-end border-t border-[#EFEFEF] px-[16px] py-[6px] text-[12px] font-medium text-black">
                Table
              </div>
            </div>

            <div className="px-[12px] pt-[8px]">
              <div className="relative">
                <span className="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12.5 12.5L15.75 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="h-[36px] w-full rounded-full border border-[#D2D2D2] bg-white pl-[38px] pr-[14px] text-[14px] text-black outline-none placeholder:text-[#8F8F8F]"
                />
              </div>
            </div>

            <div className="px-[12px] pt-[12px]">
              <div className="rounded-[14px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
                {filteredItems.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="flex w-full items-center justify-between border-b border-[#EFEFEF] bg-white px-[14px] py-[13px] text-left last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-[14px]">
                      <span className="w-[20px] shrink-0 text-[13px] font-medium text-black">
                        {index + 1}
                      </span>
                      <span className="truncate text-[14px] font-medium text-black">
                        {item}
                      </span>
                    </div>
                    <span className="ml-[12px] shrink-0 text-[#2B2B2B]">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                ))}

                {filteredItems.length === 0 && (
                  <div className="px-[16px] py-[24px] text-center text-[13px] text-[#7A7A7A]">
                    No results found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
};

export default MasterData;
