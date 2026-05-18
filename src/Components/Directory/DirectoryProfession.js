import React, { useEffect, useMemo, useRef, useState } from 'react';
import edit from '../Images/Edit.svg';
import deleteIcon from '../Images/Delete.svg';
import search from '../Images/search.png';
import imports from '../Images/Import.svg';
import filterIcon from '../Images/filter (3).png';
import cross from '../Images/cross.png';

const PROJECTS_API = 'https://backendaab.in/aabuilderDash/api/projects/getAll';
const PROPERTY_TYPES_API = 'https://backendaab.in/aabuildersDash/api/property_types/getAll';

const EMPTY_OWNER = {
  clientName: '',
  fatherName: '',
  mobile: '',
  age: '',
  clientAddress: '',
};

const EMPTY_PROPERTY_DETAIL = {
  projectType: '',
  floorName: '',
  shopNo: '',
  doorNo: '',
  area: '',
  professionTaxNo: '',
};

const safeTrim = (value) => String(value ?? '').trim();

const INITIAL_PROFESSION_PROJECT = {
  projectName: '',
  projectAddress: '',
  projectId: '',
  projectCategory: '',
  projectReferenceName: '',
  branch: '',
  ownerDetailsList: [{ ...EMPTY_OWNER }],
  propertyDetailsList: [{ ...EMPTY_PROPERTY_DETAIL }],
  siteEngineerId: '',
};

const fieldLg =
  'border-2 border-[#BF9853] border-opacity-30 p-2 rounded-lg h-14 focus:outline-none';

const fieldRO = `${fieldLg} bg-[#F5F5F5] cursor-default pointer-events-none select-none caret-transparent`;

const roInputProps = {
  readOnly: true,
  tabIndex: -1,
  onFocus: (e) => e.target.blur(),
  onMouseDown: (e) => e.preventDefault(),
};

const DirectoryProfession = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? 'https://backendaab.in/aabuildersDash';
  const [isFilterRowVisible, setIsFilterRowVisible] = useState(false);
  const [isProfessionInputsOpen, setIsProfessionInputsOpen] = useState(false);
  const [isProfessionCreateOpen, setIsProfessionCreateOpen] = useState(false);
  const [professionItems, setProfessionItems] = useState([]);
  const [professionSearch, setProfessionSearch] = useState('');
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [isProfessionProjectFormOpen, setIsProfessionProjectFormOpen] = useState(false);
  const [addPopupValue, setAddPopupValue] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [professionProjectForm, setProfessionProjectForm] = useState(INITIAL_PROFESSION_PROJECT);
  const [professionProjectSaving, setProfessionProjectSaving] = useState(false);
  const [editingProjectDbId, setEditingProjectDbId] = useState(null);
  const selectedProjectSnapshotRef = useRef(null);
  const fileInputRef = useRef(null);
  const [professionFilters, setProfessionFilters] = useState({
    year: '',
    vendor: '',
    service: '',
    doorNo: '',
    shop: '',
    project: '',
    tenant: '',
  });
  const [tableFilters, setTableFilters] = useState({
    project: '',
    type: '',
    number: '',
    paymentDate: '',
  });
  const [professionRows] = useState([]);

  const handleFilterChange = (key, value) => {
    setProfessionFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTableFilterChange = (key, value) => {
    setTableFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setProfessionFilters({
      year: '',
      vendor: '',
      service: '',
      doorNo: '',
      shop: '',
      project: '',
      tenant: '',
    });
    setTableFilters({
      project: '',
      type: '',
      number: '',
      paymentDate: '',
    });
  };

  const hasActiveFilters =
    professionFilters.year ||
    professionFilters.vendor ||
    professionFilters.service ||
    professionFilters.doorNo ||
    professionFilters.shop ||
    professionFilters.project ||
    professionFilters.tenant ||
    tableFilters.project ||
    tableFilters.type ||
    tableFilters.number ||
    tableFilters.paymentDate;

  const selectClass =
    'h-11 w-full md:w-48 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 text-sm bg-white focus:outline-none appearance-none';

  const inputClass =
    'w-full h-10 border border-[#BF9853]/40 rounded-md px-2 text-sm focus:outline-none';

  const professionListConfig = {
    endpoints: {
      list: '/api/profession/all',
      create: '/api/profession/save',
      update: (id) => `/api/profession/update/${id}`,
      delete: (id) => `/api/profession/delete/${id}`,
    },
    requestKey: 'profession',
    responseKeys: ['profession', 'profession_name'],
  };

  const filteredProfessionItems = useMemo(() => {
    const term = professionSearch.trim().toLowerCase();
    if (!term) return professionItems;
    return professionItems.filter((item) => item.name.toLowerCase().includes(term));
  }, [professionItems, professionSearch]);

  const resolveProfessionName = (item) => {
    for (const key of professionListConfig.responseKeys) {
      if (item?.[key] !== undefined && item?.[key] !== null) {
        return item[key];
      }
    }
    return item?.name ?? '';
  };

  const fetchProfessionList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${professionListConfig.endpoints.list}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profession list');
      }
      const result = await response.json();
      if (!Array.isArray(result)) {
        throw new Error('Unexpected profession list response');
      }
      setProfessionItems(
        result.map((item, index) => ({
          id: item.id ?? index + 1,
          name: resolveProfessionName(item),
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfessionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isProfessionInputsOpen) return;
    fetchProfessionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfessionInputsOpen]);

  const siteEngineerSelectOptions = useMemo(() => {
    const list = Array.isArray(employeeList) ? employeeList : [];
    return list
      .map((emp) => {
        const rowId = emp.id ?? emp.employee_id ?? emp.employeeId;
        const label = emp.employee_name ?? emp.employeeName ?? emp.name ?? '';
        if (rowId == null || rowId === '') return null;
        return {
          value: String(rowId),
          label: String(label || `Employee #${rowId}`),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [employeeList]);

  const projectNameOptions = useMemo(() => {
    const names = new Set();
    projectsList.forEach((p) => {
      const name = p.projectName ?? p.siteName ?? '';
      if (name) names.add(name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [projectsList]);

  const siteEngineerDisplayName = useMemo(() => {
    const match = siteEngineerSelectOptions.find(
      (o) => o.value === professionProjectForm.siteEngineerId
    );
    return match?.label ?? '';
  }, [siteEngineerSelectOptions, professionProjectForm.siteEngineerId]);

  const mapOwnerFromApi = (owner) => ({
    clientName: owner?.clientName ?? '',
    fatherName: owner?.fatherName ?? '',
    mobile: owner?.mobile ?? '',
    age: owner?.age ?? '',
    clientAddress: owner?.clientAddress ?? '',
  });

  const mapPropertyFromApi = (detail) => ({
    id: detail?.id,
    projectType: detail?.projectType ?? '',
    floorName: detail?.floorName ?? '',
    shopNo: detail?.shopNo ?? '',
    doorNo: detail?.doorNo ?? '',
    area: detail?.area ?? '',
    ebNo: detail?.ebNo ?? '',
    ebNoPhase: detail?.ebNoPhase ?? '',
    ebNoFrequency: detail?.ebNoFrequency ?? '',
    propertyTaxNo: detail?.propertyTaxNo ?? '',
    propertyTaxFrequency: detail?.propertyTaxFrequency ?? '',
    waterTaxNo: detail?.waterTaxNo ?? '',
    waterTaxFrequency: detail?.waterTaxFrequency ?? '',
    professionTaxNo:
      detail?.professionalTaxNo ?? detail?.professionTaxNo ?? detail?.waterTaxNo ?? '',
  });

  const fetchProjectsForForm = async () => {
    try {
      const response = await fetch(PROJECTS_API);
      if (response.ok) {
        const data = await response.json();
        setProjectsList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPropertyTypesForForm = async () => {
    try {
      const response = await fetch(PROPERTY_TYPES_API);
      if (response.ok) {
        const data = await response.json();
        setPropertyTypes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEmployeesForForm = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee_details/basic/getAll`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetProfessionProjectForm = () => {
    setEditingProjectDbId(null);
    selectedProjectSnapshotRef.current = null;
    setProfessionProjectForm({
      ...INITIAL_PROFESSION_PROJECT,
      ownerDetailsList: [{ ...EMPTY_OWNER }],
      propertyDetailsList: [{ ...EMPTY_PROPERTY_DETAIL }],
    });
  };

  const handleOpenAddPopup = () => {
    resetProfessionProjectForm();
    setIsProfessionProjectFormOpen(true);
  };

  const handleCloseProfessionProjectForm = () => {
    setIsProfessionProjectFormOpen(false);
    resetProfessionProjectForm();
  };

  const handleProjectNameChange = (projectName) => {
    const found = projectsList.find((p) => (p.projectName ?? p.siteName ?? '') === projectName);
    if (!found) {
      setEditingProjectDbId(null);
      selectedProjectSnapshotRef.current = null;
      setProfessionProjectForm((prev) => ({ ...prev, projectName }));
      return;
    }
    setEditingProjectDbId(found.id ?? null);
    selectedProjectSnapshotRef.current = found;
    const owners = found.ownerDetails ?? found.ownerDetailsList;
    const properties = found.propertyDetails ?? found.propertyDetailsList;
    const rawSeId =
      found.siteEngineerId ?? found.siteEngineer?.id ?? found.site_engineer_id ?? '';
    setProfessionProjectForm({
      projectName: found.projectName ?? projectName,
      projectAddress: found.projectAddress ?? '',
      projectId: found.projectId ?? found.siteNo ?? '',
      projectCategory: found.projectCategory ?? '',
      projectReferenceName: found.projectReferenceName ?? '',
      branch: found.branch ?? '',
      siteEngineerId: rawSeId === '' || rawSeId == null ? '' : String(rawSeId),
      ownerDetailsList:
        Array.isArray(owners) && owners.length
          ? owners.map(mapOwnerFromApi)
          : [{ ...EMPTY_OWNER }],
      propertyDetailsList:
        Array.isArray(properties) && properties.length
          ? properties.map(mapPropertyFromApi)
          : [{ ...EMPTY_PROPERTY_DETAIL }],
    });
  };

  const handleNewOwnerChange = (index, field, value) => {
    setProfessionProjectForm((prev) => {
      const updated = [...prev.ownerDetailsList];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ownerDetailsList: updated };
    });
  };

  const addNewOwner = () => {
    setProfessionProjectForm((prev) => ({
      ...prev,
      ownerDetailsList: [...prev.ownerDetailsList, { ...EMPTY_OWNER }],
    }));
  };

  const handleNewDetailChange = (index, field, value) => {
    setProfessionProjectForm((prev) => {
      const updated = [...prev.propertyDetailsList];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, propertyDetailsList: updated };
    });
  };

  const addNewPropertyDetail = () => {
    setProfessionProjectForm((prev) => ({
      ...prev,
      propertyDetailsList: [...prev.propertyDetailsList, { ...EMPTY_PROPERTY_DETAIL }],
    }));
  };

  const handleSubmitProfessionProject = async (e) => {
    e.preventDefault();
    if (!safeTrim(professionProjectForm.projectName)) return;
    if (!editingProjectDbId) {
      window.alert('Please select a project to update.');
      return;
    }
    const snapshot = selectedProjectSnapshotRef.current;
    if (!snapshot) {
      window.alert('Project data is not loaded. Please select the project again.');
      return;
    }

    setProfessionProjectSaving(true);
    const originalProperties = Array.isArray(snapshot.propertyDetails)
      ? snapshot.propertyDetails
      : [];

    const propertyDetails = professionProjectForm.propertyDetailsList.map((detail, index) => {
      const original = originalProperties[index] ?? {};
      return {
        ...original,
        projectType: original.projectType ?? detail.projectType ?? '',
        floorName: original.floorName ?? detail.floorName ?? '',
        shopNo: original.shopNo ?? detail.shopNo ?? '',
        doorNo: original.doorNo ?? detail.doorNo ?? '',
        area: original.area ?? detail.area ?? '',
        ebNo: original.ebNo ?? '',
        ebNoPhase: original.ebNoPhase ?? '',
        ebNoFrequency: original.ebNoFrequency ?? '',
        propertyTaxNo: original.propertyTaxNo ?? '',
        propertyTaxFrequency: original.propertyTaxFrequency ?? '',
        waterTaxNo: original.waterTaxNo ?? '',
        waterTaxFrequency: original.waterTaxFrequency ?? '',
        professionalTaxNo: safeTrim(detail.professionTaxNo),
      };
    });

    const payload = {
      projectName: snapshot.projectName ?? professionProjectForm.projectName,
      projectAddress: snapshot.projectAddress ?? professionProjectForm.projectAddress ?? '',
      projectId: snapshot.projectId ?? professionProjectForm.projectId ?? '',
      projectCategory: snapshot.projectCategory ?? professionProjectForm.projectCategory ?? '',
      projectReferenceName:
        snapshot.projectReferenceName ?? professionProjectForm.projectReferenceName ?? '',
      branch: snapshot.branch ?? professionProjectForm.branch ?? '',
      location: snapshot.location ?? '',
      siteEngineerId:
        snapshot.siteEngineerId ??
        (professionProjectForm.siteEngineerId === ''
          ? null
          : String(professionProjectForm.siteEngineerId)),
      ownerDetails: snapshot.ownerDetails ?? professionProjectForm.ownerDetailsList,
      accountDetails: snapshot.accountDetails ?? [],
      propertyDetails,
    };

    try {
      const response = await fetch(
        `https://backendaab.in/aabuilderDash/api/projects/edit/${editingProjectDbId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update professional tax numbers');
      }
      await fetchProjectsForForm();
      handleCloseProfessionProjectForm();
    } catch (error) {
      console.error(error);
      window.alert(error?.message || 'Failed to update professional tax numbers.');
    } finally {
      setProfessionProjectSaving(false);
    }
  };

  useEffect(() => {
    if (!isProfessionProjectFormOpen) return;
    fetchProjectsForForm();
    fetchPropertyTypesForForm();
    fetchEmployeesForForm();
    fetchProfessionList();
  }, [isProfessionProjectFormOpen]);

  const handleCloseAddPopup = () => {
    setIsAddPopupOpen(false);
    setAddPopupValue('');
    setEditingItem(null);
  };

  const handleSubmitAddPopup = () => {
    const trimmedValue = addPopupValue.trim();
    if (!trimmedValue) return;
    const payload = { [professionListConfig.requestKey]: trimmedValue };
    const isEditing = Boolean(editingItem?.id);
    const saveItem = async () => {
      const optimisticId = isEditing ? editingItem.id : Date.now();
      if (!isEditing) {
        setProfessionItems((prev) => [...prev, { id: optimisticId, name: trimmedValue }]);
      } else {
        setProfessionItems((prev) =>
          prev.map((item) => (item.id === optimisticId ? { ...item, name: trimmedValue } : item))
        );
      }
      try {
        const url = isEditing
          ? `${API_BASE_URL}${professionListConfig.endpoints.update(editingItem.id)}`
          : `${API_BASE_URL}${professionListConfig.endpoints.create}`;
        const response = await fetch(url, {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error(`Failed to ${isEditing ? 'update' : 'save'} profession item`);
        }
        const savedItem = await response.json();
        const resolvedName =
          professionListConfig.responseKeys
            .map((key) => savedItem?.[key])
            .find((value) => value !== undefined && value !== null) ?? trimmedValue;
        setProfessionItems((prev) =>
          prev.map((item) =>
            item.id === optimisticId ? { id: savedItem.id ?? optimisticId, name: resolvedName } : item
          )
        );
        await fetchProfessionList();
      } catch (error) {
        console.error(error);
        if (isEditing) {
          setProfessionItems((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? { id: editingItem.id, name: editingItem.name } : item
            )
          );
        } else {
          setProfessionItems((prev) => prev.filter((item) => item.id !== optimisticId));
        }
      } finally {
        handleCloseAddPopup();
      }
    };
    saveItem();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length) return;
      const uploadItems = async () => {
        const existingNames = new Set(professionItems.map((item) => item.name.toLowerCase()));
        const uniqueValues = lines.filter((line) => !existingNames.has(line.toLowerCase()));
        if (!uniqueValues.length) return;
        for (const value of uniqueValues) {
          const payload = { [professionListConfig.requestKey]: value };
          try {
            const response = await fetch(`${API_BASE_URL}${professionListConfig.endpoints.create}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!response.ok) {
              throw new Error(`Failed to import profession item: ${value}`);
            }
          } catch (error) {
            console.error(error);
          }
        }
        await fetchProfessionList();
      };
      uploadItems();
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleEditItem = (item) => {
    setIsAddPopupOpen(true);
    setAddPopupValue(item.name ?? '');
    setEditingItem(item);
  };

  const handleDeleteItem = async (item) => {
    const confirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE_URL}${professionListConfig.endpoints.delete(item.id)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete profession item');
      }
      await fetchProfessionList();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="bg-white lg:flex gap-3 p-4 ml-5 mr-5 rounded-md lg:h-[128px] text-left">
        <div>
          <label className="block font-semibold mb-1">Year</label>
          <select value={professionFilters.year} onChange={(e) => handleFilterChange('year', e.target.value)} className={selectClass}>
            <option value="">Select Year</option>
            <option>2024</option>
            <option>2025</option>
            <option>2026</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Vendor</label>
          <select value={professionFilters.vendor} onChange={(e) => handleFilterChange('vendor', e.target.value)} className={selectClass}>
            <option value="">Select Vendor</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Service</label>
          <select value={professionFilters.service} onChange={(e) => handleFilterChange('service', e.target.value)} className={selectClass}>
            <option value="">Select Service</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Door No</label>
          <select value={professionFilters.doorNo} onChange={(e) => handleFilterChange('doorNo', e.target.value)} className={selectClass}>
            <option value="">Select Door No</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Shop</label>
          <select value={professionFilters.shop} onChange={(e) => handleFilterChange('shop', e.target.value)} className={selectClass}>
            <option value="">Select Shop</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Project Name</label>
          <select value={professionFilters.project} onChange={(e) => handleFilterChange('project', e.target.value)} className={selectClass}>
            <option value="">Select Project</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Tenant</label>
          <select value={professionFilters.tenant} onChange={(e) => handleFilterChange('tenant', e.target.value)} className={selectClass}>
            <option value="">Select Tenant</option>
          </select>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto bg-white p-4 ml-5 mr-5 rounded-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-5 mb-3">
          <div className="inline-flex rounded-md p-1 w-fit gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md px-3 py-1 shadow-lg"
              onClick={() => setIsFilterRowVisible((prev) => !prev)}
            >
              <img src={filterIcon} alt="filter" className="w-4 h-5" />
            </button>
            <button type="button" className="px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50">
              Clients Projects
            </button>
            <button type="button" className="px-6 py-2 rounded font-semibold transition-colors border border-gray-300 hover:bg-gray-50">
              Own Projects
            </button>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <button type="button" className="h-10 text-[#E4572E] hover:underline">Export PDF</button>
            <button type="button" className="h-10 text-[#007233] hover:underline">Export XL</button>
            <button type="button" className="h-10 text-[#BF9853] hover:underline">Print</button>
            <button type="button" className="h-10 px-4 bg-[#BF9853] text-white rounded-md" onClick={() => setIsProfessionInputsOpen(true)}>Add New</button>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center mb-3 px-2">
            {professionFilters.year && (
              <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium">
                <span className="font-normal">Year:</span>
                <span className="font-bold">{professionFilters.year}</span>
                <button type="button" onClick={() => handleFilterChange('year', '')} className="text-[#BF9853] ml-1 text-lg leading-none">×</button>
              </span>
            )}
            <button type="button" onClick={clearAllFilters} className="text-[#BF9853] border border-[#BF9853] rounded px-3 py-1 text-sm font-medium hover:bg-[#BF9853] hover:text-white transition-colors">
              Clear All
            </button>
          </div>
        )}
        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
          <table className="w-full table-auto mb-4 border-collapse">
            <thead>
              <tr className="bg-[#FAF6ED] text-left">
                <th className="p-2 pl-3">Sl.No</th>
                <th className="p-2">Projects</th>
                <th className="p-2">Type</th>
                <th className="p-2">Number</th>
                <th className="p-2">Payment Date</th>
                <th className="p-2">Validity</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Exp Date</th>
                <th className="p-2">Remain Days</th>
                <th className="p-2">Next Service</th>
                <th className="p-2">Exp Ago</th>
                <th className="p-2">Registered</th>
                <th className="p-2">Activity</th>
              </tr>
              {isFilterRowVisible && (
                <tr className="bg-white border-b border-gray-200 text-sm">
                  <th className="p-2 pl-3" />
                  <th className="p-2">
                    <input value={tableFilters.project} onChange={(e) => handleTableFilterChange('project', e.target.value)} placeholder="Project..." className={inputClass} />
                  </th>
                  <th className="p-2">
                    <input value={tableFilters.type} onChange={(e) => handleTableFilterChange('type', e.target.value)} placeholder="Type..." className={inputClass} />
                  </th>
                  <th className="p-2">
                    <input value={tableFilters.number} onChange={(e) => handleTableFilterChange('number', e.target.value)} placeholder="Number..." className={inputClass} />
                  </th>
                  <th className="p-2">
                    <input type="date" value={tableFilters.paymentDate} onChange={(e) => handleTableFilterChange('paymentDate', e.target.value)} className={inputClass} />
                  </th>
                  <th className="p-2" colSpan={8} />
                </tr>
              )}
            </thead>
            <tbody>
              {professionRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-6 text-center text-gray-500 text-sm">
                    No profession records yet.
                  </td>
                </tr>
              ) : (
                professionRows.map((row, index) => (
                  <tr key={row.id ?? index} className="border-b border-gray-100">
                    <td className="p-2 pl-3">{index + 1}</td>
                    <td className="p-2">{row.project ?? '-'}</td>
                    <td className="p-2">{row.type ?? '-'}</td>
                    <td className="p-2">{row.number ?? '-'}</td>
                    <td className="p-2">{row.paymentDate ?? '-'}</td>
                    <td className="p-2">{row.validity ?? '-'}</td>
                    <td className="p-2">{row.amount ?? '-'}</td>
                    <td className="p-2">{row.expDate ?? '-'}</td>
                    <td className="p-2">{row.remainDays ?? '-'}</td>
                    <td className="p-2">{row.nextService ?? '-'}</td>
                    <td className="p-2">{row.expAgo ?? '-'}</td>
                    <td className="p-2">{row.registered ?? '-'}</td>
                    <td className="p-2">{row.activity ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isProfessionInputsOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsProfessionInputsOpen(false)} role="presentation" />
          <div className="relative z-40 bg-white rounded-lg shadow-xl p-5 w-[400px] max-w-[90vw] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Profession Inputs</h3>
              <button type="button" className="text-red-600 text-2xl leading-none" onClick={() => setIsProfessionInputsOpen(false)}>×</button>
            </div>
            <div className="px-2 pb-4">
              <div className=" flex w-full flex-col">
                <div className="mb-2 flex w-full shrink-0 items-center">
                  <input
                    type="text"
                    placeholder="Search profession..."
                    value={professionSearch}
                    onChange={(e) => setProfessionSearch(e.target.value)}
                    className="border-2 rounded-lg border-[#BF9853] w-full h-[45px] border-opacity-[0.17] pl-3 pr-10 placeholder:text-sm placeholder:text-gray-500 placeholder:font-semibold"
                  />
                  <button type="button" className="-ml-8 mt-5 transform -translate-y-1/2 text-gray-500">
                    <img src={search} alt="search" className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-2 flex w-full shrink-0 items-center justify-between">
                  <button type="button" className="text-[#E4572E] font-semibold text-sm flex shrink-0 items-center" onClick={handleImportClick}>
                    <img src={imports} alt="import" className="w-6 h-5 bg-transparent pr-2 mt-1" />
                    <span className="mt-1.5">Import file</span>
                  </button>
                  <button
                    type="button"
                    className="shrink-0 whitespace-nowrap rounded border-b-2 border-dashed border-[#BF9853] px-1 font-bold text-black"
                    onClick={handleOpenAddPopup}
                  >
                    + Add
                  </button>
                </div>
                <div className="w-full shrink-0 rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853]">
                  <div className="bg-[#FAF6ED]">
                    <table className="table-auto w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left w-16 text-base font-bold">S.No</th>
                          <th className="p-2 text-left text-base font-bold">Profession</th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="table-auto w-full">
                      <tbody>
                        {filteredProfessionItems.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="p-4 text-center text-sm text-gray-500">
                              No profession entries yet.
                            </td>
                          </tr>
                        ) : (
                          filteredProfessionItems.map((item, index) => (
                            <tr key={`${item.id}-${item.name}`} className="border-b last:border-b-0 group">
                              <td className="p-2 w-16 font-semibold">{index + 1}</td>
                              <td className="p-2 flex justify-between items-center">
                                <span>{item.name}</span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button type="button" onClick={() => handleEditItem(item)} className="p-1 rounded hover:bg-gray-100">
                                    <img src={edit} alt="edit" className="w-4 h-4" />
                                  </button>
                                  <button type="button" onClick={() => handleDeleteItem(item)} className="p-1 rounded hover:bg-gray-100">
                                    <img src={deleteIcon} alt="delete" className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mr-4 mb-2 mt-2">
              <button type="button" className="px-6 py-2 bg-[#BF9853] text-white rounded-md" onClick={() => setIsProfessionInputsOpen(false)}>
                Save
              </button>
              <button type="button" className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={() => setIsProfessionInputsOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isProfessionProjectFormOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4 overflow-y-auto bg-black/50">
          <div className="bg-white rounded-md w-full max-w-[95rem] max-h-[90vh] text-left overflow-y-auto pl-4 sm:pl-20">
            <div className="flex justify-end mt-4 mr-8">
              <button type="button" onClick={handleCloseProfessionProjectForm}>
                <img src={cross} alt="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitProfessionProject}>
              <div className="h-[500px] overflow-auto pb-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Name</label>
                    <select
                      className={`w-[35rem] max-w-full bg-white ${fieldLg}`}
                      value={professionProjectForm.projectName}
                      onChange={(e) => handleProjectNameChange(e.target.value)}
                      required
                    >
                      <option value="">Select Project Name</option>
                      {projectNameOptions.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project ID</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-[25rem] max-w-full ${fieldRO}`}
                      value={professionProjectForm.projectId}
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Branch</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-[15rem] max-w-full ${fieldRO}`}
                      value={professionProjectForm.branch}
                    />
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap items-end">
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Reference Name</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-[35rem] max-w-full ${fieldRO}`}
                      value={professionProjectForm.projectReferenceName}
                    />
                  </div>
                  <div className="mb-4 pl-5">
                    <label className="block text-lg font-medium mb-2">Project Category</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-[25rem] max-w-full ${fieldRO}`}
                      value={professionProjectForm.projectCategory}
                    />
                  </div>
                  <div className="mb-4 pl-5 min-w-[16rem] w-[20rem]">
                    <label className="block text-lg font-medium mb-2">Site Engineer</label>
                    <input
                      type="text"
                      {...roInputProps}
                      className={`w-full ${fieldRO}`}
                      value={siteEngineerDisplayName}
                    />
                  </div>
                </div>
                <div className="mb-4 pl-5">
                  <label className="block text-lg font-medium mb-2">Project Address</label>
                  <input
                    type="text"
                    {...roInputProps}
                    className={`w-[62rem] max-w-full ${fieldRO}`}
                    value={professionProjectForm.projectAddress}
                  />
                </div>
                {professionProjectForm.ownerDetailsList.map((owner, index) => (
                  <div key={`owner-${index}`} className="mb-2">
                    <div className="flex mb-2">
                      <div className="mt-12 mr-4">{index + 1}.</div>
                      <div className="flex mb-2 gap-5 flex-wrap">
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Client Name</label>
                          <input
                            type="text"
                            {...roInputProps}
                            value={owner.clientName}
                            className={`w-80 ${fieldRO}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Father Name</label>
                          <input
                            type="text"
                            {...roInputProps}
                            value={owner.fatherName}
                            className={`w-72 ${fieldRO}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Mobile</label>
                          <input
                            type="text"
                            {...roInputProps}
                            value={owner.mobile}
                            className={`w-60 ${fieldRO}`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-lg font-medium">Age</label>
                          <input
                            type="text"
                            {...roInputProps}
                            value={owner.age}
                            className={`w-20 ${fieldRO}`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative pl-4">
                      <label className="block text-lg font-medium">Client Address</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={owner.clientAddress}
                        className={`w-[62rem] max-w-full ${fieldRO}`}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-[#E4572E] font-bold ml-4 px-1 border-dashed border-b-2 border-[#BF9853]"
                  onClick={addNewOwner}
                >
                  + Add Another Owner
                </button>
                {professionProjectForm.propertyDetailsList.map((detail, index) => (
                  <div key={`property-${index}`} className="flex mb-2 gap-5 flex-wrap">
                    <div className="mt-12">{index + 1}.</div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Project Type</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.projectType}
                        className={`w-40 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Floor Name</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.floorName}
                        className={`w-36 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Shop No</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.shopNo}
                        className={`w-28 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Door No</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.doorNo}
                        className={`w-28 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Area</label>
                      <input
                        type="text"
                        {...roInputProps}
                        value={detail.area}
                        className={`w-28 ${fieldRO}`}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-lg font-medium">Professional Tax</label>
                      <input
                        type="text"
                        value={detail.professionTaxNo}
                        onChange={(e) => handleNewDetailChange(index, 'professionTaxNo', e.target.value)}
                        placeholder="Professional Tax"
                        className={`w-40 ${fieldLg}`}
                      />
                    </div>
                    <div className="flex items-end mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = [...professionProjectForm.propertyDetailsList];
                          updatedList.splice(index, 1);
                          setProfessionProjectForm((prev) => ({
                            ...prev,
                            propertyDetailsList: updatedList.length
                              ? updatedList
                              : [{ ...EMPTY_PROPERTY_DETAIL }],
                          }));
                        }}
                        className="text-red-500 font-bold text-xl hover:text-red-700"
                        title="Remove this row"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-[#E4572E] font-bold px-1 ml-3 border-dashed border-b-2 border-[#BF9853]"
                  onClick={addNewPropertyDetail}
                >
                  + Add on
                </button>
              </div>
              <div className="flex justify-end mr-5 space-x-2 mt-8 mb-4">
                <button
                  type="submit"
                  className="bg-[#BF9853] text-white px-8 py-2 rounded-lg hover:bg-yellow-800 font-semibold disabled:opacity-60"
                  disabled={professionProjectSaving}
                >
                  {professionProjectSaving ? 'Saving...' : 'Update'}
                </button>
                <button
                  type="button"
                  className="px-8 py-2 border rounded-lg text-[#BF9853] border-[#BF9853]"
                  onClick={handleCloseProfessionProjectForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isAddPopupOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseAddPopup} role="presentation" />
          <div className="relative z-50 bg-white rounded-lg shadow-xl w-[400px] max-w-[90vw] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Profession</h3>
              <button type="button" className="text-red-600 text-2xl leading-none" onClick={handleCloseAddPopup}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-left mb-1">Profession</label>
                <input
                  value={addPopupValue}
                  onChange={(e) => setAddPopupValue(e.target.value)}
                  placeholder="Enter profession"
                  className="w-full h-11 border-2 border-[#BF9853] border-opacity-30 rounded-lg px-3 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="px-6 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={handleCloseAddPopup}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-[#BF9853] text-white rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleSubmitAddPopup}
                  disabled={!addPopupValue.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <input
        type="file"
        accept=".txt,.csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileImport}
      />
      {isProfessionCreateOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsProfessionCreateOpen(false)} role="presentation" />
          <div className="relative z-40 bg-white rounded-lg shadow-xl p-6 w-[860px] max-w-[92vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Profession Details</h3>
              <button type="button" className="text-red-600 text-2xl leading-none" onClick={() => setIsProfessionCreateOpen(false)}>×</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Create a new profession record.</p>
            <div className="flex gap-4">
              <button type="button" className="px-10 py-2 bg-[#BF9853] text-white rounded-md" onClick={() => setIsProfessionCreateOpen(false)}>Submit</button>
              <button type="button" className="px-10 py-2 border border-[#BF9853] text-[#BF9853] rounded-md" onClick={() => setIsProfessionCreateOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectoryProfession;
