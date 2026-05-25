import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';
import DateRangePicker from './DateRangePicker';
import CustomDateField from './CustomDateField';
import Reload from '../Images/Clear.svg'
import Filter from '../Images/TableFilter.svg'
import Pdf from '../Images/pdf.png'
import CalendarIcon from "../Images/Calendoricon.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
Modal.setAppElement('#root');
const EntryChecking = () => {
    const [filteredCount, setFilteredCount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [projectNameOptions, setProjectNameOptions] = useState([]);
    const [selectedSiteName, setSelectedSiteName] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedContractor, setSelectedContractor] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedEno, setSelectedEno] = useState('');
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [selectedMachineTools, setSelectedMachineTools] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    const [selectedAccountType, setSelectedAccountType] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const handleMouseDown = (e) => {
        isDragging.current = true;
        start.current = { x: e.clientX, y: e.clientY };
        scroll.current = {
            left: scrollRef.current.scrollLeft,
            top: scrollRef.current.scrollTop,
        };
        lastMove.current = {
            time: Date.now(),
            x: e.clientX,
            y: e.clientY,
        };
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
        cancelMomentum();
    };
    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        const now = Date.now();
        const dt = now - lastMove.current.time || 16;
        velocity.current = {
            x: (e.clientX - lastMove.current.x) / dt,
            y: (e.clientY - lastMove.current.y) / dt,
        };
        scrollRef.current.scrollLeft = scroll.current.left - dx;
        scrollRef.current.scrollTop = scroll.current.top - dy;
        lastMove.current = {
            time: now,
            x: e.clientX,
            y: e.clientY,
        };
    };
    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = '';
        scrollRef.current.style.userSelect = '';
        applyMomentum();
    };
    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };
    const applyMomentum = () => {
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
            if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
                scrollRef.current.scrollLeft -= x * 20;
                scrollRef.current.scrollTop -= y * 20;
                velocity.current.x *= friction;
                velocity.current.y *= friction;
                animationFrame.current = requestAnimationFrame(step);
            } else {
                cancelMomentum();
            }
        };
        animationFrame.current = requestAnimationFrame(step);
    };
    useEffect(() => {
        return () => cancelMomentum();
    }, []);
    useEffect(() => {
        axios
            .get('https://backendaab.in/demoAabuilderDash/expenses_form/get_form')
            .then((response) => {
                const sortedExpenses = response.data.sort((a, b) => {
                    const enoA = parseInt(a.eno, 10);
                    const enoB = parseInt(b.eno, 10);
                    return enoB - enoA; // descending order
                });
                setExpenses(sortedExpenses);
                // Extract unique values for the dropdowns
                const uniqueAccountTypes = [...new Set(response.data.map(expense => expense.accountType))];
                const uniqueVendorOptions = [...new Set(response.data.map(expense => expense.vendor))];
                const vendorOptions = uniqueVendorOptions.map(name => ({ value: name, label: name }));
                const uniqueContractorOptions = [...new Set(response.data.map(expense => expense.contractor))];
                const contractorOption = uniqueContractorOptions.map(name => ({ value: name, label: name }));
                const uniqueProjectNames = [...new Set(response.data.map(expense => expense.siteName).filter(Boolean))];
                const projectNameOption = uniqueProjectNames.map(name => ({ value: name, label: name }));
                // Set the unique dropdown options in state
                setAccountTypeOptions(uniqueAccountTypes);
                setVendorOptions(vendorOptions);
                setContractorOptions(contractorOption);
                setProjectNameOptions(projectNameOption);
            })
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, []);
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/branch/getAll', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error('Failed to fetch branches');
                const data = await response.json();
                setBranchOptions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching branches:', error);
                setBranchOptions([]);
            }
        };
        fetchBranches();
    }, []);
    useEffect(() => {
        const filtered = expenses.filter(expense => {
            const expenseDate = new Date(expense.date).toISOString().slice(0, 10);
            return (
                (selectedSiteName ? expense.siteName === selectedSiteName : true) &&
                (selectedVendor ? expense.vendor === selectedVendor : true) &&
                (selectedContractor ? expense.contractor === selectedContractor : true) &&
                (selectedCategory ? expense.category === selectedCategory : true) &&
                (selectedMachineTools ? expense.machineTools === selectedMachineTools : true) &&
                (selectedAccountType ? expense.accountType === selectedAccountType : true) &&
                (selectedDate ? expense.timestamp.split('T')[0] === selectedDate : true) &&
                (selectedStartDate ? expenseDate >= selectedStartDate : true) &&
                (selectedEndDate ? expenseDate <= selectedEndDate : true) &&
                (selectedEno ? String(expense.eno) === String(selectedEno) : true)
            );
        });
        setFilteredExpenses(filtered);
        setFilteredCount(filtered.length);
        const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setTotalAmount(total);
    }, [selectedSiteName, selectedVendor, selectedContractor, selectedCategory, selectedMachineTools, selectedEno, selectedAccountType, selectedDate, selectedStartDate, selectedEndDate, expenses]);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const formatChipDateDMY = (dateString) => {
        if (!dateString) return '';
        const parts = String(dateString).split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            const [y, m, d] = parts;
            return `${d}-${m}-${y}`;
        }
        return String(dateString);
    };
    const getBranchName = (id) =>
        branchOptions.find(b => String(b.id) === String(id))?.branch || "";
    const clearFilters = () => {
        setSelectedSiteName('');
        setSelectedVendor('');
        setSelectedContractor('');
        setSelectedCategory('');
        setSelectedMachineTools('');
        setSelectedAccountType('');
        setSelectedDate('');
        setSelectedStartDate('');
        setSelectedEndDate('');
        setSelectedEno('');
        setFilteredExpenses(expenses);
    };
    const generateFilteredPDF = () => {
        if (filteredExpenses.length === 0) {
            alert("No filtered data to export. Please apply some filters first.");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Filtered Expenses Report", 14, 15);
        doc.setFontSize(10);
        let yPosition = 25;        
        if (selectedStartDate || selectedEndDate) {
            const formatDateForPDF = (dateString) => {
                if (!dateString) return '';
                const [year, month, day] = dateString.split('-');
                return `${day}/${month}/${year}`;
            };            
            const dateRange = selectedStartDate && selectedEndDate 
                ? `${formatDateForPDF(selectedStartDate)} to ${formatDateForPDF(selectedEndDate)}`
                : selectedStartDate 
                    ? `From ${formatDateForPDF(selectedStartDate)}`
                    : `Until ${formatDateForPDF(selectedEndDate)}`;
            doc.text(`Date Range: ${dateRange}`, 14, yPosition);
            yPosition += 8;
        }        
        if (selectedVendor) {
            doc.text(`Vendor: ${selectedVendor}`, 14, yPosition);
            yPosition += 8;
        }        
        if (selectedContractor) {
            doc.text(`Contractor: ${selectedContractor}`, 14, yPosition);
            yPosition += 8;
        }        
        if (selectedAccountType) {
            doc.text(`Account Type: ${selectedAccountType}`, 14, yPosition);
            yPosition += 8;
        }        
        doc.text(`Total Entries: ${filteredCount}`, 14, yPosition);
        yPosition += 8;
        doc.text(`Total Amount: ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, yPosition);        
        autoTable(doc, {
            startY: yPosition + 10,
            head: [['Time Stamp', 'Date', 'E.No', 'Project Name', 'Vendor', 'Contractor',
                   'A/C Type', 'Branch', 'Quantity', 'Amount', 'Comments', 'Category']],
            body: filteredExpenses.map(exp => [
                formatDate(exp.timestamp),
                formatDateOnly(exp.date),
                exp.eno,
                exp.siteName,
                exp.vendor,
                exp.contractor,
                exp.accountType,
                getBranchName(exp.branch_id ?? exp.branchId ?? '') || '',
                exp.quantity,
                Number(exp.amount).toLocaleString('en-IN'),
                exp.comments,
                exp.category
            ]),
            styles: {
                fontSize: 7,
            },
            headStyles: {
                fillColor: [191, 152, 83],
            },
        });
        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`Filtered_Expenses_Report_${dateStr}.pdf`);
    };
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'transparent',
            border: '2px solid rgba(191, 152, 83, 0.2)',
            borderRadius: '8px',
            minHeight: '40px',
            height: '40px',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.4)' },
        }),
        placeholder: (provided) => ({ ...provided, color: '#999', textAlign: 'left' }),
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
        option: (provided, state) => ({
            ...provided,
            textAlign: 'left',
            fontWeight: 'normal',
            fontSize: '15px',
            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
            color: 'black',
        }),
        singleValue: (provided) => ({ ...provided, textAlign: 'left', color: 'black' }),
        indicatorSeparator: () => ({ display: 'none' }),
    };
    const nameSelectClassNames = {
        menuList: () => 'no-scrollbar scrollbar-none',
    };
    const isAnyFilterSelected = selectedDate || selectedStartDate || selectedEndDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools;
    return (
        <body className=' bg-[#FAF6ED]'>
            <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
                <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
                <div className="w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px] shrink-0">
                    <div className="flex flex-wrap lg:flex-nowrap gap-3 items-end mb-2">
                        <div className="flex flex-col">
                            <label className="font-bold text-left text-sm">Entry Date</label>
                            <div className="mt-2 w-full max-w-[155px]">
                                <CustomDateField
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    placeholder="Date Of Entry"
                                    alwaysOpenBelow
                                    className={` [&>div:first-child]:!h-[40px] [&>div:first-child]:!border-2 [&>div:first-child]:!border-[rgba(191,152,83,0.2)] [&>div:first-child]:!rounded-lg [&>div:first-child]:!shadow-none [&>div:first-child]:hover:!border-[rgba(191,152,83,0.4)]`}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-bold text-left text-sm">Date Range</label>
                            <div className="relative mt-2 [&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]">
                                <button
                                    type="button"
                                    onClick={() => setShowDateRangePicker(true)}
                                    className="w-[158px] box-border h-[40px] pl-[12px] pr-[3px] py-0 text-sm font-normal bg-white text-left flex items-center justify-between"
                                >
                                    <span className={`text-[14px] font-medium truncate flex-1 text-left ${selectedStartDate && selectedEndDate ? 'text-black font-normal' : 'text-[#A6A5A6] font-normal'}`}>
                                        {selectedStartDate ? (selectedEndDate ? `${selectedStartDate} – ${selectedEndDate}` : `From ${selectedStartDate}`) : 'From Date - To Date'}
                                    </span>
                                    <img src={CalendarIcon} alt="Calendar" className="w-[16px] h-[16px] text-gray-400 flex-shrink-0 mr-[6px] ml-[3px]" />
                                </button>
                                <DateRangePicker
                                    isOpen={showDateRangePicker}
                                    onClose={() => setShowDateRangePicker(false)}
                                    startDate={selectedStartDate}
                                    endDate={selectedEndDate}
                                    variant="dropdown"
                                    onApply={(from, to) => {
                                        setSelectedStartDate(from);
                                        setSelectedEndDate(to);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-[140px]">
                            <label className="font-bold text-left text-sm">Project Name</label>
                            <Select
                                className="mt-2"
                                classNames={nameSelectClassNames}
                                options={projectNameOptions}
                                value={selectedSiteName ? { value: selectedSiteName, label: selectedSiteName } : null}
                                onChange={(selectedOption) => setSelectedSiteName(selectedOption ? selectedOption.value : '')}
                                placeholder="Project Name"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        <div className="flex flex-col flex-1 min-w-[140px]">
                            <label className="font-bold text-left text-sm">Vendor Name</label>
                            <Select
                                className="mt-2"
                                classNames={nameSelectClassNames}
                                options={vendorOptions}
                                value={selectedVendor ? { value: selectedVendor, label: selectedVendor } : null}
                                onChange={(selectedOption) => setSelectedVendor(selectedOption ? selectedOption.value : '')}
                                placeholder="Vendor Name"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        <div className="flex flex-col flex-1 min-w-[140px]">
                            <label className="font-bold text-left text-sm">Contractor Name</label>
                            <Select
                                className="mt-2"
                                classNames={nameSelectClassNames}
                                options={contractorOptions}
                                value={selectedContractor ? { value: selectedContractor, label: selectedContractor } : null}
                                onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                placeholder="Contractor Name"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>
                        <div className="flex flex-col flex-1 max-w-[200px]">
                            <label className="font-bold text-left text-sm">A/C Type</label>
                            <Select
                                className="mt-2"
                                classNames={nameSelectClassNames}
                                options={accountTypeOptions.map(type => ({ value: type, label: type }))}
                                value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                placeholder="A/C Type"
                                isClearable
                                styles={customSelectStyles}
                            />
                        </div>                        
                        <div className="flex flex-col">
                            <label className="font-bold text-left text-sm">No Of Bills</label>
                            <div className="w-full h-[40px] p-2 mt-2 rounded-lg border-2 border-[rgba(191,152,83,0.2)] hover:border-[rgba(191,152,83,0.4)] text-left">
                                {isAnyFilterSelected ? filteredCount : ''}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label className="font-bold text-left text-sm">Amount</label>
                            <div className="w-full max-w-[130px] h-[40px] p-2 mt-2 rounded-lg border-2 border-[rgba(191,152,83,0.2)] hover:border-[rgba(191,152,83,0.4)] text-left">
                                {isAnyFilterSelected
                                    ? `₹${Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}`
                                    : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div
                            className={`text-left flex ${selectedDate || selectedStartDate || selectedEndDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools
                                ? 'flex-col sm:flex-row sm:justify-between'
                                : 'flex-row justify-between items-center'
                                } mb-3 gap-2`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                                <button
                                    className=''
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <img
                                        src={Filter}
                                        alt="Toggle Filter"
                                        className=" border rounded-md"
                                    />
                                </button>
                                {(selectedDate || selectedStartDate || selectedEndDate || selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools) && (
                                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                        {selectedDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                <span className="font-medium">Date: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{formatChipDateDMY(selectedDate)}</span>
                                                <button onClick={() => setSelectedDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedStartDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] font-medium w-fit">
                                                <span className="font-medium">Date Range: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{formatChipDateDMY(selectedStartDate)}{selectedEndDate ? ` – ${formatChipDateDMY(selectedEndDate)}` : ' onwards'}</span>
                                                <button onClick={() => { setSelectedStartDate(''); setSelectedEndDate(''); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedEndDate && !selectedStartDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                <span className="font-medium">Date Range until: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{formatChipDateDMY(selectedEndDate)}</span>
                                                <button onClick={() => setSelectedEndDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedVendor && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Vendor Name: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedVendor}</span>
                                                <button onClick={() => setSelectedVendor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedContractor && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Contractor Name: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedContractor}</span>
                                                <button onClick={() => setSelectedContractor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedSiteName && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Project Name: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedSiteName}</span>
                                                <button onClick={() => setSelectedSiteName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedCategory && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Category: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedCategory}</span>
                                                <button onClick={() => setSelectedCategory('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedAccountType && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">A/C Type: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedAccountType}</span>
                                                <button onClick={() => setSelectedAccountType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedMachineTools && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Tools: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedMachineTools}</span>
                                                <button onClick={() => setSelectedMachineTools('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='flex items-end gap-[6px]'>
                                <button onClick={clearFilters} className='flex h-[30px] w-[30px] shrink-0 items-center justify-center'>
                                    <img className='w-full h-full' src={Reload} alt="Reload" />
                                </button>
                                <span className='text-[#E4572E] flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={generateFilteredPDF}>PDF<img src={Pdf} alt="Pdf" className='w-4 h-4' /></span>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto no-scrollbar scrollbar-none select-none"
                            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                        >
                            <table className="table-fixed w-full min-w-[2060px] border-collapse">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr className="bg-[#FAF6ED] h-[40px] text-[16px] font-bold text-center">
                                        <th className="pl-[12px] w-[168px] font-bold text-left">Time stamp</th>
                                        <th className="w-[120px] pr-[1px] font-bold text-left">Date</th>
                                        <th className="pl-[1px] pr-[1px] w-[298px] font-bold text-left">Project Name</th>
                                        <th className="pl-[1px] pr-[1px] w-[218px] font-bold text-left">Vendor Name</th>
                                        <th className="pl-[1px] pr-[1px] w-[218px] font-bold text-left">Contractor Name</th>
                                        <th className="pl-[1px] pr-[1px] w-[78px] font-bold text-left">Quantity</th>
                                        <th className="pl-[1px] pr-[1px] w-[120px] font-bold text-right">Amount</th>
                                        <th className="pl-[9px] pr-[1px] w-[198px] font-bold text-left">Description</th>
                                        <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left">Category</th>
                                        <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left">A/C Type</th>
                                        <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left">Branch</th>
                                        <th className="pl-[1px] pr-[1px] w-[120px] font-bold text-right">E.No</th>
                                        <th className="pl-[6px] pr-[12px] w-[70px] font-bold text-center">File</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(isAnyFilterSelected ? filteredExpenses : []).map((expense, index) => (
                                        <tr key={index} className="odd:bg-white even:bg-[#FAF6ED] text-[14px] font-semibold h-[40px]">
                                            <td className="pl-[12px] w-[168px] text-left font-semibold">{formatDate(expense.timestamp)}</td>
                                            <td className="w-[120px] pr-[1px] text-left font-semibold">{formatDateOnly(expense.date)}</td>
                                            <td className="pl-[1px] pr-[1px] w-[298px] text-left font-semibold">{expense.siteName}</td>
                                            <td className="pl-[1px] pr-[1px] w-[218px] text-left font-semibold">{expense.vendor}</td>
                                            <td className="pl-[1px] pr-[1px] w-[218px] text-left font-semibold">{expense.contractor}</td>
                                            <td className="pl-[1px] pr-[1px] w-[78px] text-left font-semibold">{expense.quantity}</td>
                                            <td className="pl-[1px] pr-[1px] w-[98px] text-right font-semibold">
                                                ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="text-left pl-[9px] pr-[1px] w-[198px] font-semibold">{expense.comments}</td>
                                            <td className="pl-[1px] pr-[1px] w-[158px] text-left font-semibold">{expense.category}</td>
                                            <td className="pl-[1px] pr-[1px] w-[158px] text-left font-semibold">{expense.accountType}</td>
                                            <td className="pl-[1px] pr-[1px] w-[158px] text-left font-semibold">{getBranchName(expense.branch_id ?? expense.branchId ?? '') || ''}</td>
                                            <td className="pl-[1px] pr-[1px] w-[120px] text-right font-semibold">{expense.eno}</td>
                                            <td className="pl-[6px] pr-[12px] w-[70px] text-center">
                                                {expense.billCopy ? (
                                                    <a href={expense.billCopy} className="text-red-500 underline font-semibold"
                                                        target="_blank" rel="noopener noreferrer"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    <span></span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    );
};
export default EntryChecking;
const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes());
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};