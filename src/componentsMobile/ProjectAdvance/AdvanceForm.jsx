import React, { useState, useEffect, useRef } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';

const AdvanceForm = ({ username = '', userRoles = [], paymentModeOptions = [] }) => {
  const resolveActiveBranchId = () => {
    try {
      const selectedBranchId = localStorage.getItem("selectedBranchId");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
      const resolved = Number(selectedBranchId || fallbackBranchId);
      return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
    } catch {
      return null;
    }
  };
  const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
  const withBranchUrl = (baseUrl) => {
    const url = new URL(baseUrl);
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
      url.searchParams.set("branchId", String(activeBranchId));
    }
    return url.toString();
  };
  useEffect(() => {
    const syncBranch = () => {
      const nextBranchId = resolveActiveBranchId();
      setActiveBranchId((prevBranchId) => (prevBranchId === nextBranchId ? prevBranchId : nextBranchId));
    };
    syncBranch();
    window.addEventListener("branchSelectionChanged", syncBranch);
    return () => window.removeEventListener("branchSelectionChanged", syncBranch);
  }, []);

  // Use paymentModeOptions from props, fallback to default if not provided
  const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' }
  ];
  const finalPaymentModeOptions = paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;

  const [selectedType, setSelectedType] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [projectAdvance, setProjectAdvance] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [description, setDescription] = useState('');
  const [transferSiteId, setTransferSiteId] = useState('');
  const [entryNo, setEntryNo] = useState(1);
  const [advanceData, setAdvanceData] = useState([]);
  const [overallAdvance, setOverallAdvance] = useState(0);
  const [selectedAdvanceFile, setSelectedAdvanceFile] = useState(null);
  const fileInputRef = useRef(null);
  const [billAmount, setBillAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eno, setEno] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [showContractorVendorModal, setShowContractorVendorModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransferSiteModal, setShowTransferSiteModal] = useState(false);

  // Format date helper
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  // Session storage management
  useEffect(() => {
    const savedselectedType = sessionStorage.getItem('selectedType');
    const savedContractorVendor = sessionStorage.getItem('selectedOption');
    const savedProjectName = sessionStorage.getItem('selectedSite');
    const savedoverallAdvance = sessionStorage.getItem('overallAdvance');
    const savedbillAmount = sessionStorage.getItem('billAmount');
    const savedadvanceAmount = sessionStorage.getItem('advanceAmount');
    const savedtransferSiteId = sessionStorage.getItem('transferSiteId');
    const savedpaymentMode = sessionStorage.getItem('paymentMode');
    const saveddescription = sessionStorage.getItem('description');
    try {
      if (savedselectedType) setSelectedType(JSON.parse(savedselectedType));
      if (savedContractorVendor) setSelectedOption(JSON.parse(savedContractorVendor));
      if (savedProjectName) setSelectedSite(JSON.parse(savedProjectName));
      if (savedoverallAdvance) setOverallAdvance(JSON.parse(savedoverallAdvance));
      if (savedbillAmount) setBillAmount(JSON.parse(savedbillAmount));
      if (savedadvanceAmount) setAdvanceAmount(JSON.parse(savedadvanceAmount));
      if (savedtransferSiteId) setTransferSiteId(JSON.parse(savedtransferSiteId));
      if (savedpaymentMode) setPaymentMode(JSON.parse(savedpaymentMode));
      if (saveddescription) setDescription(JSON.parse(saveddescription));
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = () => {
    sessionStorage.removeItem('selectedType');
    sessionStorage.removeItem('selectedOption');
    sessionStorage.removeItem('selectedSite');
    sessionStorage.removeItem('overallAdvance');
    sessionStorage.removeItem('billAmount');
    sessionStorage.removeItem('advanceAmount');
    sessionStorage.removeItem('transferSiteId');
    sessionStorage.removeItem('paymentMode');
    sessionStorage.removeItem('description');
  };

  useEffect(() => {
    if (selectedType) sessionStorage.setItem('selectedType', JSON.stringify(selectedType));
    if (selectedOption) sessionStorage.setItem('selectedOption', JSON.stringify(selectedOption));
    if (selectedSite) sessionStorage.setItem('selectedSite', JSON.stringify(selectedSite));
    if (overallAdvance) sessionStorage.setItem('overallAdvance', JSON.stringify(overallAdvance));
    if (billAmount) sessionStorage.setItem('billAmount', JSON.stringify(billAmount));
    if (advanceAmount) sessionStorage.setItem('advanceAmount', JSON.stringify(advanceAmount));
    if (transferSiteId) sessionStorage.setItem('transferSiteId', JSON.stringify(transferSiteId));
    if (paymentMode) sessionStorage.setItem('paymentMode', JSON.stringify(paymentMode));
    if (description) sessionStorage.setItem('description', JSON.stringify(description));
  }, [selectedType, selectedOption, selectedSite, overallAdvance, billAmount, advanceAmount, transferSiteId, paymentMode, description]);

  // Fetch vendors
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
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
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
          type: "Vendor",
        }));
        setVendorOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchVendorNames();
  }, []);

  // Fetch contractors
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
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
          value: item.contractorName,
          label: item.contractorName,
          id: item.id,
          type: "Contractor",
        }));
        setContractorOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchContractorNames();
  }, []);

  // Fetch sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
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
          id: item.id,
          sNo: item.siteNo
        }));
        const predefinedSiteOptions = [
          { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1" },
          { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2" },
          { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3" },
          { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4" },
          { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5" },
          { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6" },
          { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7" },
          { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8" },
          { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9" },
          { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
          { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
          { value: "Bill Payment Tracker", label: "Bill Payment Tracker", id: 12, sNo: "12" },
        ];
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
      } catch (error) {
        console.error("Fetch error: ", error);
        const predefinedSiteOptions = [
          { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1" },
          { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2" },
          { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3" },
          { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4" },
          { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5" },
          { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6" },
          { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7" },
          { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8" },
          { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9" },
          { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
          { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
          { value: "Bill Payment Tracker", label: "Bill Payment Tracker", id: 12, sNo: "12" },
        ];
        setSiteOptions(predefinedSiteOptions);
      }
    };
    fetchSites();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/expenses_categories/getAll", {
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
          id: item.id,
          value: item.category,
          label: item.category,
        }));
        setCategoryOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch latest ENo
  const fetchLatestEno = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form');
      if (!response.ok) {
        throw new Error('Failed to fetch ENo');
      }
      const data = await response.json();
      if (data.length > 0) {
        const sortedData = data.sort((a, b) => b.eno - a.eno);
        const lastEno = sortedData[0].eno;
        setEno(lastEno + 1);
      } else {
        setEno(54173);
      }
    } catch (error) {
      console.error('Error fetching latest ENo:', error);
    }
  };
  useEffect(() => {
    fetchLatestEno();
  }, []);

  // Fetch advance data
  const fetchAdvanceData = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setAdvanceData(data);
      const maxEntryNo = data.length > 0 ? Math.max(...data.map(item => item.entry_no || 0)) : 0;
      setEntryNo(maxEntryNo + 1);
    } catch (error) {
      console.error('Error fetching advance portal data:', error);
    }
  };

  useEffect(() => {
    fetchAdvanceData();
  }, []);

  // Combine vendor and contractor options
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions]);
  }, [vendorOptions, contractorOptions]);

  // Handle contractor/vendor change
  const handleChange = async (selected) => {
    setSelectedOption(selected);
    if (selected) {
      localStorage.setItem("advanceContractorVendor", JSON.stringify(selected));
    } else {
      localStorage.removeItem("advanceContractorVendor");
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const total = data
        .filter(item => {
          return selected.type === 'Vendor'
            ? item.vendor_id === selected.id
            : selected.type === 'Contractor'
              ? item.contractor_id === selected.id
              : false;
        })
        .reduce((sum, curr) => {
          const amount = parseFloat(curr.amount) || 0;
          const billAmount = parseFloat(curr.bill_amount) || 0;
          const refundAmount = parseFloat(curr.refund_amount) || 0;
          return sum + amount - billAmount - refundAmount;
        }, 0);
      setOverallAdvance(total);
    } catch (error) {
      console.error('Error fetching or processing advance data:', error);
      setOverallAdvance(0);
    }
  };

  // Calculate project advance
  const calculateProjectAdvance = async (vendorOrContractor, project) => {
    if (!vendorOrContractor || !project) {
      setProjectAdvance('');
      return;
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!response.ok) throw new Error('Failed to fetch advance portal data');
      const data = await response.json();
      const isVendor = vendorOrContractor.type === 'Vendor';
      const idField = isVendor ? 'vendor_id' : 'contractor_id';
      const relevantData = data.filter(
        item => item[idField] === vendorOrContractor.id && item.project_id === project.id
      );
      const total = relevantData.reduce((sum, entry) => {
        const amount = parseFloat(entry.amount) || 0;
        const billAmount = parseFloat(entry.bill_amount) || 0;
        const refundAmount = parseFloat(entry.refund_amount) || 0;
        return sum + amount - billAmount - refundAmount;
      }, 0);
      setProjectAdvance(total.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
    } catch (error) {
      console.error('Error calculating project advance:', error);
      setProjectAdvance('');
    }
  };

  useEffect(() => {
    if (selectedOption && selectedSite) {
      calculateProjectAdvance(selectedOption, selectedSite);
    } else {
      setProjectAdvance('');
    }
  }, [selectedOption, selectedSite]);

  // Format with commas
  const formatWithCommas = (value) => {
    if (value === '' || value === null || value === undefined) return "";
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numericValue)) {
      return value.toString();
    }
    return numericValue.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setAdvanceAmount(rawValue);
    }
  };

  // Get week number
  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek) + 1;
  };

  // Validate form fields
  const validateFormFields = () => {
    if (selectedType === 'Advance' || selectedType === 'Refund') {
      if (!selectedOption || !selectedSite || !advanceAmount || !paymentMode) {
        alert("Please fill Necessary details");
        return false;
      }
    } else if (selectedType === 'Bill Settlement') {
      if (!selectedOption || !selectedSite || !billAmount || !selectedCategory) {
        alert("Please fill Necessary details");
        return false;
      }
      if (!selectedAdvanceFile) {
        alert("Please attach the bill file for Bill Settlement");
        return false;
      }
      const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
      if (rawAmount && !paymentMode) {
        alert("Please select Payment Mode if you enter Amount Given");
        return false;
      }
    } else if (selectedType === 'Transfer') {
      if (!selectedOption || !selectedSite || !advanceAmount || !transferSiteId) {
        alert("Please fill Necessary details");
        return false;
      }
    } else {
      alert("Please select a valid type");
      return false;
    }
    const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
    if ((selectedType === 'Advance' || selectedType === 'Refund' || selectedType === 'Transfer') && !rawAmount) {
      alert("Please fill the Amount Given");
      return false;
    }
    if (selectedType === 'Bill Settlement') {
      const rawBillAmount = billAmount.toString().trim();
      if (!rawBillAmount) {
        alert("Please fill the Bill Amount");
        return false;
      }
    }
    return true;
  };

  // Submit advance data
  const submitAdvanceData = async () => {
    setIsSubmitting(true);
    try {
      let fileUrl = '';
      if (selectedAdvanceFile && selectedType === 'Bill Settlement') {
        try {
          const formData = new FormData();
          const formatDateOnly = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          };
          const finalName = `${formatDateOnly(dateValue)} ${selectedSite.sNo} ${selectedOption.label}`;
          formData.append('file', selectedAdvanceFile);
          formData.append('file_name', finalName);
          const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
            method: "POST",
            body: formData,
          });
          if (!uploadResponse.ok) {
            throw new Error('File upload failed');
          }
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.url;
        } catch (error) {
          console.error('Error during file upload:', error);
          alert('Error during file upload. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      const res = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!res.ok) throw new Error('Failed to fetch entry numbers');
      const allData = await res.json();
      const maxEntryNo = allData.length > 0 ? Math.max(...allData.map(item => item.entry_no || 0)) : 0;
      const nextEntryNo = maxEntryNo + 1;
      const createPayload = (overrides = {}) => ({
        type: selectedType,
        date: dateValue,
        vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : 0,
        contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : 0,
        project_id: selectedSite?.id || 0,
        transfer_site_id: selectedType === 'Transfer' ? parseInt(transferSiteId) : 0,
        payment_mode: selectedType !== 'Transfer' ? paymentMode : '',
        amount:
          selectedType === 'Advance' || selectedType === 'Transfer' || selectedType === 'Bill Settlement'
            ? parseFloat(advanceAmount) || 0
            : 0,
        bill_amount: selectedType === 'Bill Settlement' ? parseFloat(billAmount) || 0 : 0,
        refund_amount: selectedType === 'Refund' ? parseFloat(advanceAmount) || 0 : 0,
        entry_no: nextEntryNo,
        week_no: getWeekNumber(),
        description: description,
        file_url: fileUrl,
        branch_id: activeBranchId,
        ...overrides
      });
      if (selectedType === 'Transfer') {
        const amountValue = parseFloat(advanceAmount) || 0;
        const transferSiteIdInt = parseInt(transferSiteId);
        if (transferSiteIdInt === 11) {
          const loanPayload = {
            type: "Transfer",
            date: dateValue,
            amount: Math.abs(amountValue),
            loan_payment_mode: "",
            loan_refund_amount: 0,
            from_purpose_id: 1,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
            contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
            employee_id: 0,
            labour_id: 0,
            project_id: 0,
            description: "Transfer from Advance Portal",
            file_url: "",
            branch_id: activeBranchId
          };
          const loanResponse = await fetch(withBranchUrl("https://backendaab.in/aabuildersDash/api/loans/save"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loanPayload)
          });
          if (!loanResponse.ok) {
            throw new Error('Failed to save loan portal data');
          }
          const loanResult = await loanResponse.json();
          const loanPortalId = loanResult.id || loanResult.loanPortalId;
          const advancePayload = createPayload({
            amount: -Math.abs(amountValue),
            loan_portal_id: loanPortalId
          });
          await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advancePayload)
          });
        } else if (transferSiteIdInt === 12 && selectedOption?.type === 'Vendor') {
          const vendorCarryForwardPayload = {
            type: "Transfer",
            date: dateValue,
            vendor_id: selectedOption.id,
            payment_mode: paymentMode || "",
            amount: Math.abs(amountValue),
            bill_amount: 0,
            refund_amount: 0
          };
          const vendorCarryForwardResponse = await fetch("https://backendaab.in/aabuildersDash/api/vendor_carry_forward/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vendorCarryForwardPayload)
          });
          if (!vendorCarryForwardResponse.ok) {
            throw new Error('Failed to save vendor carry forward amount management data');
          }
          const vendorCarryForwardResult = await vendorCarryForwardResponse.json();
          const vendorCarryForwardId = vendorCarryForwardResult.id || vendorCarryForwardResult.vendorCarryForwardId;
          const advancePayload = createPayload({
            amount: -Math.abs(amountValue),
            vendor_carry_forward_id: vendorCarryForwardId
          });
          await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advancePayload)
          });
        } else {
          const firstPayload = createPayload({ amount: -Math.abs(amountValue) });
          const secondPayload = createPayload({
            project_id: transferSiteIdInt,
            transfer_site_id: selectedSite?.id || 0,
            amount: Math.abs(amountValue)
          });
          await Promise.all([
            fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(firstPayload)
            }),
            fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(secondPayload)
            })
          ]);
        }
      } else {
        const payload = createPayload();
        await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (selectedType === 'Bill Settlement') {
          let vendor = '';
          let contractor = '';
          if (selectedOption?.type === 'Vendor') {
            vendor = selectedOption.label;
          } else if (selectedOption?.type === 'Contractor') {
            contractor = selectedOption.label;
          }
          const expensesPayload = {
            accountType: 'Bill Payments',
            eno: eno,
            date: dateValue,
            siteName: selectedSite ? selectedSite.label : '',
            projectId: selectedSite ? selectedSite.id : null,
            vendor: vendor,
            vendorId: selectedOption?.type === 'Vendor' ? selectedOption.id : null,
            contractor: contractor,
            contractorId: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
            quantity: '',
            amount: parseInt(billAmount) || 0,
            category: selectedCategory ? selectedCategory.label : '',
            comments: description,
            machineTools: '',
            billCopyUrl: fileUrl || '',
            source: "Advance Portal",
            branchId: activeBranchId,
          };
          const expensesResponse = await fetch(withBranchUrl("https://backendaab.in/aabuilderDash/expenses_form/save"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(expensesPayload),
          });
          if (!expensesResponse.ok) {
            const errorText = await expensesResponse.text();
            throw new Error(`Expenses form submission failed: ${errorText}`);
          }
          setEno(eno + 1);
        }
      }
      alert('Advance saved successfully!');
      window.dispatchEvent(new CustomEvent('advanceUpdated'));
      setAdvanceAmount('');
      setDescription('');
      setPaymentMode('');
      setBillAmount('');
      setSelectedAdvanceFile(null);
      setSelectedCategory(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEntryNo(nextEntryNo);
      fetchAdvanceData();
      if (selectedOption) handleChange(selectedOption);
      if (selectedOption && selectedSite) calculateProjectAdvance(selectedOption, selectedSite);
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to save data!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle pay advance
  const handlePayAdvance = () => {
    if (!validateFormFields()) {
      return;
    }
    submitAdvanceData();
  };

  // Handle file attach (same as AdvancePortal handleFileChange)
  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAdvanceFile(file);
    }
    e.target.value = ''; // Allow re-selecting the same file
  };

  // Get button label
  const getButtonLabel = () => {
    switch (selectedType) {
      case 'Advance':
        return 'Pay Advance';
      case 'Transfer':
        return 'Transfer';
      case 'Bill Settlement':
        return 'Settle Bill';
      case 'Refund':
        return 'Refund';
      default:
        return 'Submit';
    }
  };

  // Format date for display
  const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString('en-GB') : getTodayDate();

  return (
    <div className="px-4 overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Advance Number and Date */}
      <div className="mb-2 items-center border-b border-gray-200 pb-1 mt-1.5 flex justify-between">
        <div className="flex items-center gap-2 mt-0.5">
          <button
            type="button"
            className="text-[12px] font-semibold text-black leading-normal underline-offset-2 hover:underline"
          >
            #NO {entryNo || '09/08/2025'}
          </button>
          <button
            type="button"
            className="text-[12px] font-semibold text-black leading-normal underline-offset-2 hover:underline"
          >
            {'09/08/2025'}
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowTypeModal(true)}
            className="text-[12px] font-semibold text-black leading-normal underline-offset-2 hover:underline"
          >
            {selectedType || 'Select Type'}
          </button>
        </div>
      </div>
      <div className="space-y-[6px]">
        {/* Contractor/Vendor Field */}
        <div className="">
          <p className="flex justify-between items-center text-[12px] font-semibold text-black leading-normal mb-0.5">
            <span>Contractor/Vendor<span className="text-[#eb2f8e]">*</span></span>
            <span className="text-[12px] font-medium text-[#9E9E9E]">{formatWithCommas(overallAdvance)}</span>
          </p>
          <div className="relative">
            <div
              onClick={() => setShowContractorVendorModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: selectedOption ? '#000' : '#9E9E9E'
              }}
            >
              {selectedOption ? selectedOption.label : 'Select'}
              {selectedOption ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOption(null);
                    setOverallAdvance(0);
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
        {/* Project Name Field */}
        <div className="">
          <p className="text-[12px] flex justify-between items-center font-semibold text-black leading-normal mb-0.5">
            <span>{selectedType === 'Transfer' ? 'From Project' : 'Project Name'}<span className="text-[#eb2f8e]">*</span></span>
            <span className="text-[12px] font-medium text-[#9E9E9E]">{projectAdvance || '0.00'}</span>
          </p>
          <div className="relative">
            <div
              onClick={() => setShowProjectModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: selectedSite ? '#000' : '#9E9E9E'
              }}
            >
              {selectedSite ? selectedSite.label : 'Select'}
              {selectedSite ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSite(null);
                    setProjectAdvance('');
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
        {/* Bill Amount Field - Only for Bill Settlement */}
        {selectedType === 'Bill Settlement' && (
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Bill Amount<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <input
                type="text"
                value={formatWithCommas(billAmount)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, "");
                  if (!isNaN(rawValue)) {
                    setBillAmount(rawValue);
                  }
                }}
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-3 text-[12px] font-medium bg-white focus:outline-none"
                style={{
                  boxSizing: 'border-box',
                  color: billAmount ? '#000' : '#9E9E9E'
                }}
                placeholder="Enter bill amount"
              />
            </div>
          </div>
        )}
        {/* Category Field - Only for Bill Settlement */}
        {selectedType === 'Bill Settlement' && (
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Category<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={() => setShowCategoryModal(true)}
                className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  boxSizing: 'border-box',
                  color: selectedCategory ? '#000' : '#9E9E9E'
                }}
              >
                {selectedCategory ? selectedCategory.label : 'Select'}
                {selectedCategory ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(null);
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
        {/* Amount Given Field */}
        {selectedType === 'Transfer' ? (
          <>
            {/* To Project Field - Full Width */}
            <div className="">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                To Project<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowTransferSiteModal(true)}
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    color: transferSiteId ? '#000' : '#9E9E9E'
                  }}
                >
                  {transferSiteId ? (siteOptions.find(opt => opt.id === parseInt(transferSiteId))?.label || 'Select') : 'Select'}
                  {transferSiteId ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTransferSiteId('');
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
            {/* Transfer Amount Field - Full Width */}
            <div className="">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Transfer Amount<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={formatWithCommas(advanceAmount)}
                  onChange={handleAmountChange}
                  className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-3 text-[12px] font-medium bg-white focus:outline-none"
                  style={{
                    boxSizing: 'border-box',
                    color: advanceAmount ? '#000' : '#9E9E9E'
                  }}
                  placeholder="Enter amount"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center w-[328px]">
            <div className="">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                {selectedType === 'Refund' ? 'Refund Amount' : 'Amount Given'}<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={formatWithCommas(advanceAmount)}
                  onChange={handleAmountChange}
                  className="w-[160px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-3 text-[12px] font-medium bg-white focus:outline-none"
                  style={{
                    boxSizing: 'border-box',
                    color: advanceAmount ? '#000' : '#9E9E9E'
                  }}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            {/* Payment Mode Field */}
            <div className="">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Payment Mode<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowPaymentModeModal(true)}
                  className="w-[160px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-8 text-[12px] font-medium bg-white flex items-center cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    color: paymentMode ? '#000' : '#9E9E9E'
                  }}
                >
                  {paymentMode || 'Select'}
                  {paymentMode ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMode('');
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
        )}
        {/* Description Field */}
        <div className="">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
            Description
          </p>
          <textarea
            className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-3 pr-3 pt-1 items-center text-[12px] font-medium bg-white focus:outline-none"
            placeholder="Type Here"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              boxSizing: 'border-box',
              color: description ? '#000' : '#9E9E9E'
            }}
          />
        </div>
      </div>
      {/* Attach File - same pattern as AdvancePortal: label wraps clickable area */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full max-w-[328px]">
        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileAttach}
          accept="image/*,.pdf,.doc,.docx"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer flex items-center gap-2 text-orange-600 hover:text-orange-700 active:opacity-80 flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V10M5 5L8 2L11 5M3 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[12px] font-medium underline">Attach File</span>
        </label>
        {selectedAdvanceFile && (
          <span className="text-[11px] font-medium text-[#666] break-words min-w-0 flex-1">
            {selectedAdvanceFile.name}
          </span>
        )}
      </div>
      {/* Pay Advance Button */}
      <button
        onClick={handlePayAdvance}
        disabled={isSubmitting}
        className="w-[328px] h-[40px] bg-[#D9D9D9] text-black font-semibold rounded text-[14px] leading-normal"
      >
        {isSubmitting ? 'Submitting...' : getButtonLabel()}
      </button>

      {/* Advance Records - Card View (same data as AdvancePortal table) */}
      <div className="mt-6 w-full max-w-[328px]">
        <p className="text-[14px] font-semibold text-black mb-3">Advance Records</p>
        {!selectedOption || !selectedSite ? (
          <div className="bg-white border border-[#E0E0E0] rounded-[8px] px-4 py-6 text-center">
            <p className="text-[12px] font-medium text-[#9E9E9E]">
              Please select a contractor/vendor and project to view advance records.
            </p>
          </div>
        ) : (() => {
          const filteredEntries = advanceData
            .filter(entry => {
              const isMatchingVendor =
                selectedOption?.type === 'Vendor'
                  ? entry.vendor_id === selectedOption.id
                  : selectedOption?.type === 'Contractor'
                    ? entry.contractor_id === selectedOption.id
                    : false;
              const isForCurrentProject = entry.project_id === selectedSite.id;
              return isMatchingVendor && isForCurrentProject;
            })
            .sort((a, b) => {
              const entryNoA = a.entry_no || 0;
              const entryNoB = b.entry_no || 0;
              return entryNoB - entryNoA;
            });
          if (filteredEntries.length === 0) {
            return (
              <div className="bg-white border border-[#E0E0E0] rounded-[8px] px-4 py-6 text-center">
                <p className="text-[12px] font-medium text-[#9E9E9E]">
                  No records found for the selected contractor/vendor and project.
                </p>
              </div>
            );
          }
          return (
            <div className=" max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {filteredEntries.map((entry, index) => {
                const {
                  date,
                  amount,
                  bill_amount,
                  type,
                  transfer_site_id,
                  payment_mode,
                  refund_amount,
                  file_url,
                  description
                } = entry;
                const advanceAmount = (() => {
                  if (type === 'Refund') {
                    return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
                  }
                  return parseFloat(amount || 0).toLocaleString('en-IN');
                })();
                const billAmount =
                  type === 'Bill Settlement'
                    ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
                    : '';
                let transferOrRefund = '';
                if (type === 'Refund') {
                  transferOrRefund = 'Refund';
                } else if (type === 'Transfer') {
                  const siteLabel = siteOptions.find(site => site.id === parseInt(transfer_site_id))?.label;
                  transferOrRefund =
                    parseFloat(amount) < 0
                      ? `Transfer to ${siteLabel || 'Unknown'}`
                      : `Transfer from ${siteLabel || 'Unknown'}`;
                }
                return (
                  <div
                    key={entry.advancePortalId || index}
                    className="bg-white border border-[#E0E0E0] rounded-[8px] px-3 py-3 flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-black">
                          {new Date(date).toLocaleDateString('en-GB')}
                        </p>
                        <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          type === 'Advance' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                          type === 'Bill Settlement' ? 'bg-[#E3F2FD] text-[#1976D2]' :
                          type === 'Refund' ? 'bg-[#FFF3E0] text-[#F57C00]' :
                          type === 'Transfer' ? 'bg-[#F3E5F5] text-[#7B1FA2]' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {file_url ? (
                          <a
                            href={file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-[6px] bg-[#F5F5F5] hover:bg-[#EEEEEE]"
                            title="View File"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                      {type !== 'Transfer' && type !== 'Refund' && advanceAmount ? (
                        <div className="flex justify-between">
                          <span className="text-[#9E9E9E]">Advance</span>
                          <span className="font-semibold text-black">{advanceAmount}</span>
                        </div>
                      ) : null}
                      {billAmount ? (
                        <div className="flex justify-between">
                          <span className="text-[#9E9E9E]">Bill</span>
                          <span className="font-semibold text-black">{billAmount}</span>
                        </div>
                      ) : null}
                      {(transferOrRefund || type === 'Refund') ? (
                        <div className="flex justify-between col-span-2">
                          <span className="text-[#9E9E9E]">{type === 'Refund' ? 'Refund' : 'Transfer/Refund'}</span>
                          <span className="font-semibold text-black">
                            {type === 'Refund' ? `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}` : transferOrRefund}
                          </span>
                        </div>
                      ) : null}
                      {payment_mode ? (
                        <div className="flex justify-between col-span-2">
                          <span className="text-[#9E9E9E]">Mode</span>
                          <span className="font-medium text-black">{payment_mode}</span>
                        </div>
                      ) : null}
                    </div>
                    {description ? (
                      <p className="text-[11px] text-[#9E9E9E] truncate" title={description}>{description}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Select Type Modal */}
      {showTypeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowTypeModal(false);
            setTypeSearchQuery('');
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-5">
              <p className="text-[16px] font-semibold text-black">Select Type</p>
              <button
                onClick={() => {
                  setShowTypeModal(false);
                  setTypeSearchQuery('');
                }}
                className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L10 10M10 1L1 10" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 pt-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  value={typeSearchQuery}
                  onChange={(e) => setTypeSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[32px] pl-10 pr-4 border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                    <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Options List */}
            <div className="flex-1 overflow-y-auto mb-4 px-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="shadow-md rounded-lg overflow-hidden">
                {(['Advance', 'Bill Settlement', 'Transfer', 'Refund']
                  .filter(type => type.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                  .map((type, index) => {
                    const isSelected = selectedType === type;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedType(type);
                          setShowTypeModal(false);
                          setTypeSearchQuery('');
                        }}
                        className={`w-full h-[40px] px-6 flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                          }`}
                      >
                        {/* Left: Option Text */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-black text-left truncate">{type}</p>
                        </div>

                        {/* Right: Radio Button */}
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                          {isSelected ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                              <circle cx="10" cy="10" r="4" fill="#e4572e" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  }))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contractor/Vendor Modal */}
      <SelectVendorModal
        isOpen={showContractorVendorModal}
        onClose={() => setShowContractorVendorModal(false)}
        onSelect={(value) => {
          const selected = combinedOptions.find(opt => opt.label === value);
          if (selected) {
            handleChange(selected);
          }
          setShowContractorVendorModal(false);
        }}
        selectedValue={selectedOption ? selectedOption.label : ''}
        options={combinedOptions.map(opt => opt.label)}
        fieldName="Contractor/Vendor"
      />

      {/* Project Name Modal */}
      <SelectVendorModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(value) => {
          const selected = siteOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedSite(selected);
            if (selectedOption) {
              calculateProjectAdvance(selectedOption, selected);
            }
          }
          setShowProjectModal(false);
        }}
        selectedValue={selectedSite ? selectedSite.label : ''}
        options={siteOptions.map(opt => opt.label)}
        fieldName="Project Name"
      />

      {/* Payment Mode Modal */}
      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentMode(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentMode}
        options={finalPaymentModeOptions.map(opt => opt.label)}
        fieldName="Payment Mode"
        showStarIcon={false}
      />

      {/* Category Modal */}
      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          const selected = categoryOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedCategory(selected);
          }
          setShowCategoryModal(false);
        }}
        selectedValue={selectedCategory ? selectedCategory.label : ''}
        options={categoryOptions.map(opt => opt.label)}
        fieldName="Category"
        showStarIcon={false}
      />

      {/* Transfer Site Modal (To Project) */}
      <SelectVendorModal
        isOpen={showTransferSiteModal}
        onClose={() => setShowTransferSiteModal(false)}
        onSelect={(value) => {
          const selected = siteOptions.find(opt => opt.label === value);
          if (selected) {
            setTransferSiteId(selected.id.toString());
          }
          setShowTransferSiteModal(false);
        }}
        selectedValue={transferSiteId ? (siteOptions.find(opt => opt.id === parseInt(transferSiteId))?.label || '') : ''}
        options={siteOptions.map(opt => opt.label)}
        fieldName="To Project"
        showStarIcon={false}
      />
    </div>
  );
};

export default AdvanceForm;
