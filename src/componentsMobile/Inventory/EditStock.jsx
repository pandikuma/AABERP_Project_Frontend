import React, { useState, useEffect, useCallback } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import SearchItemsModal from '../PurchaseOrder/SearchItemsModal';
import Edit from '../Images/edit.png'

const EditStock = () => {
  const [activeSubTab, setActiveSubTab] = useState('transfer'); // 'transfer', 'update', 'history'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [fromLocation, setFromLocation] = useState('Stock Room A');
  const [showFromModal, setShowFromModal] = useState(false);
  const [toLocation, setToLocation] = useState('Stock Room B');
  const [showToModal, setShowToModal] = useState(false);
  const [itemsCount, setItemsCount] = useState(0);
  const [items, setItems] = useState([]);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showSearchItemsModal, setShowSearchItemsModal] = useState(false);
  const [poItemName, setPoItemName] = useState([]);
  const [poBrand, setPoBrand] = useState([]);
  const [poModel, setPoModel] = useState([]);
  const [poType, setPoType] = useState([]);
  const [poCategoryOptions, setPoCategoryOptions] = useState([]);
  const [stockRoomOptions, setStockRoomOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
const [swipeStates, setSwipeStates] = useState({});
  // Swipe handlers for desktop
  const handleMouseDown = (index, e) => {
    e.preventDefault();
    setSwipeStates(prev => ({
      ...prev,
      [index]: { startX: e.clientX, isSwiping: false }
    }));
    document.addEventListener('mousemove', (e) => handleMouseMove(index, e));
    document.addEventListener('mouseup', () => handleMouseUp(index));
  };

  const handleMouseMove = useCallback((index, e) => {
    if (!swipeStates[index]) return;
    const deltaX = e.clientX - swipeStates[index].startX;
    if (Math.abs(deltaX) > 10) {
      setSwipeStates(prev => ({
        ...prev,
        [index]: { ...prev[index], isSwiping: true, translateX: deltaX }
      }));
    }
  }, [swipeStates]);

  const handleMouseUp = useCallback((index) => {
    if (!swipeStates[index]) return;
    const { translateX } = swipeStates[index];
    if (translateX && translateX < -100) {
      // Swipe left to delete
      setItems(prev => prev.filter((_, i) => i !== index));
      setItemsCount(prev => prev - 1);
    }
    setSwipeStates(prev => ({
      ...prev,
      [index]: { ...prev[index], isSwiping: false, translateX: 0 }
    }));
    document.removeEventListener('mousemove', (e) => handleMouseMove(index, e));
    document.removeEventListener('mouseup', () => handleMouseUp(index));
  }, [swipeStates]);
  const [updateSelectedLocation, setUpdateSelectedLocation] = useState('');
  const [showUpdateLocationModal, setShowUpdateLocationModal] = useState(false);
  const [updateSearchQuery, setUpdateSearchQuery] = useState('');
  const [updateStockData, setUpdateStockData] = useState([]);
  const [filteredUpdateData, setFilteredUpdateData] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState([]);
  const [itemNamesData, setItemNamesData] = useState([]);
  const [locationNamesMap, setLocationNamesMap] = useState({});
  
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [showMoveStockModal, setShowMoveStockModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [currentStock, setCurrentStock] = useState('');
  const [newCount, setNewCount] = useState('');
  const cardRefs = React.useRef({});
  const expandedItemIdRef = React.useRef(null);

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

  // Fetch stock room locations from project names (marked as stocking locations)
  useEffect(() => {
    const fetchStockRooms = async () => {
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
          // Filter for locations marked as stocking locations, or include all as fallback
          const stockRooms = data
            .filter(item => item.markedAsStockingLocation === true)
            .map(item => ({
              value: item.siteName || item.site_name || '',
              label: item.siteName || item.site_name || '',
              id: item.id
            }))
            .filter(item => item.value);

          // If no marked locations, use all project names as fallback
          const allLocations = data.map(item => ({
            value: item.siteName || item.site_name || '',
            label: item.siteName || item.site_name || '',
            id: item.id
          })).filter(item => item.value);

          setStockRoomOptions(stockRooms.length > 0 ? stockRooms : allLocations);
        }
      } catch (error) {
        console.error("Error fetching stock rooms:", error);
        // Set default options
        setStockRoomOptions([
          { value: 'Stock Room A', label: 'Stock Room A', id: null },
          { value: 'Stock Room B', label: 'Stock Room B', id: null }
        ]);
      }
    };
    fetchStockRooms();
  }, []);

  // Fetch PO item names, brands, models, types, and categories
  useEffect(() => {
    const fetchPOData = async () => {
      try {
        const [itemNamesRes, brandsRes, modelsRes, typesRes, categoriesRes] = await Promise.all([
          fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_brand/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_model/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_type/getAll'),
          fetch('https://backendaab.in/aabuildersDash/api/po_category/getAll')
        ]);

        if (itemNamesRes.ok) {
          const data = await itemNamesRes.json();
          setPoItemName(data);
        }
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setPoBrand(data);
        }
        if (modelsRes.ok) {
          const data = await modelsRes.json();
          setPoModel(data);
        }
        if (typesRes.ok) {
          const data = await typesRes.json();
          setPoType(data);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          const options = (data || []).map(item => ({
            value: item.category || item.categoryName || item.name || '',
            label: item.category || item.categoryName || item.name || '',
            id: item.id || item._id || null,
          }));
          setPoCategoryOptions(options);
        }
      } catch (error) {
        console.error('Error fetching PO data:', error);
      }
    };
    fetchPOData();
  }, []);

  // Get available items function - returns the actual API data structure
  const getAvailableItems = useCallback(() => {
    // Return the actual API data structure with nested otherPOEntityList
    // This contains the real relationships between itemName, brand, model, and type
    if (poItemName && poItemName.length > 0) {
      return {
        items: poItemName, // Array of items with otherPOEntityList
        useNestedStructure: true
      };
    }
    // Fallback to old format if API data not available
    return {
      items: [],
      useNestedStructure: false
    };
  }, [poItemName]);

  // Fetch function for refreshing data
  const fetchPoItemName = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
      if (response.ok) {
        const data = await response.json();
        setPoItemName(data);
      }
    } catch (error) {
      console.error('Error fetching PO item names:', error);
    }
  }, []);

  // Fetch location names mapping for Update tab
  useEffect(() => {
    const fetchLocationNames = async () => {
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
          const nameMap = {};
          data.forEach(site => {
            if (site.id) {
              nameMap[String(site.id)] = site.siteName || '';
            }
          });
          setLocationNamesMap(nameMap);
        }
      } catch (error) {
        console.error('Error fetching location names:', error);
      }
    };
    fetchLocationNames();
  }, []);

  // Fetch item names from API for Update tab
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/po_itemNames/getAll');
        if (response.ok) {
          const data = await response.json();
          setItemNamesData(data);
        }
      } catch (error) {
        console.error('Error fetching item names:', error);
      }
    };
    fetchItemNames();
  }, []);

  // Calculate net stock from inventory data based on selected location (similar to NetStock)
  const calculateNetStock = useCallback((inventoryRecords, selectedLocationId) => {
    const activeRecords = inventoryRecords.filter(record => {
      const recordDeleteStatus = record.delete_status !== undefined ? record.delete_status : record.deleteStatus;
      return !recordDeleteStatus;
    });

    let filteredRecords = activeRecords;
    if (selectedLocationId) {
      filteredRecords = activeRecords.filter(record => {
        const recordLocationId = record.stocking_location_id || record.stockingLocationId;
        return String(recordLocationId) === String(selectedLocationId);
      });
    }

    const stockMap = {};
    filteredRecords.forEach(record => {
      const inventoryItems = record.inventoryItems || record.inventory_items || [];
      if (Array.isArray(inventoryItems)) {
        inventoryItems.forEach(invItem => {
          const itemId = invItem.item_id || invItem.itemId || null;
          const categoryId = invItem.category_id || invItem.categoryId || null;
          const modelId = invItem.model_id || invItem.modelId || null;
          const brandId = invItem.brand_id || invItem.brandId || null;
          const typeId = invItem.type_id || invItem.typeId || null;

          if (itemId !== null && itemId !== undefined) {
            const compositeKey = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;

            if (!stockMap[compositeKey]) {
              stockMap[compositeKey] = {
                itemId: itemId,
                categoryId: categoryId,
                modelId: modelId,
                brandId: brandId,
                typeId: typeId,
                quantity: 0
              };
            }

            const quantity = Number(invItem.quantity) || 0;
            stockMap[compositeKey].quantity += quantity;
          }
        });
      }
    });

    return Object.values(stockMap).map(item => ({
      ...item,
      netStock: Math.max(0, item.quantity)
    }));
  }, []);

  // Fetch inventory data for Update tab
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setUpdateLoading(true);
        const response = await fetch('https://backendaab.in/aabuildersDash/api/inventory/getAll');
        if (!response.ok) {
          console.error('Failed to fetch inventory data');
          setUpdateLoading(false);
          return;
        }
        const inventoryRecords = await response.json();
        setInventoryData(inventoryRecords);
        setUpdateLoading(false);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setUpdateLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Process inventory items for Update tab (similar to NetStock)
  useEffect(() => {
    if (inventoryData.length === 0 || itemNamesData.length === 0 || poBrand.length === 0 || poModel.length === 0 || poType.length === 0) {
      if (inventoryData.length === 0 && !updateLoading) {
        setUpdateStockData([]);
      }
      return;
    }

    const selectedLocationOption = stockRoomOptions.find(loc =>
      (loc.value || loc) === updateSelectedLocation || (loc.label || loc) === updateSelectedLocation
    );
    const selectedLocationId = selectedLocationOption?.id || null;

    const stockQuantities = calculateNetStock(inventoryData, selectedLocationId);
    setUpdateLoading(true);

    const processedData = [];
    const itemNameMap = {};
    const entityMap = {};

    itemNamesData.forEach(item => {
      const itemId = item.id || item._id || null;
      if (itemId) {
        itemNameMap[String(itemId)] = item;
        const otherPOEntityList = item.otherPOEntityList || [];
        otherPOEntityList.forEach(entity => {
          const entityItemId = entity.itemId || itemId;
          const brandId = entity.brandId || entity.brand_id || null;
          const modelId = entity.modelId || entity.model_id || null;
          const typeId = entity.typeId || entity.type_id || null;
          const categoryId = item.categoryId || item.category_id || null;
          const entityKey = `${entityItemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
          entityMap[entityKey] = {
            ...entity,
            itemName: item.itemName || item.poItemName || item.name || '',
            categoryId: categoryId,
            itemId: entityItemId
          };
        });
      }
    });

    stockQuantities.forEach(invItem => {
      const itemId = invItem.itemId;
      const categoryId = invItem.categoryId;
      const modelId = invItem.modelId;
      const brandId = invItem.brandId;
      const typeId = invItem.typeId;
      const netStock = invItem.netStock;
      const compositeKey = `${itemId || 'null'}-${categoryId || 'null'}-${modelId || 'null'}-${brandId || 'null'}-${typeId || 'null'}`;
      const matchedEntity = entityMap[compositeKey];

      if (matchedEntity) {
        const itemName = matchedEntity.itemName || '';
        const brand = matchedEntity.brandName || '';
        const model = matchedEntity.modelName || '';
        const type = matchedEntity.typeColor || '';
        const categoryIdFromEntity = matchedEntity.categoryId || categoryId;

        let categoryName = '';
        if (categoryIdFromEntity) {
          const categoryOption = poCategoryOptions.find(cat =>
            String(cat.id) === String(categoryIdFromEntity)
          );
          categoryName = categoryOption?.label || categoryOption?.value || '';
        }

        const locationId = selectedLocationId;
        const locationName = locationId ? (locationNamesMap[String(locationId)] || updateSelectedLocation || '') : '';

        processedData.push({
          id: compositeKey,
          itemId: itemId,
          itemName: itemName,
          model: model,
          brand: brand,
          type: type,
          category: categoryName,
          netStock: netStock,
          location: locationName,
          brandId: brandId,
          modelId: modelId,
          typeId: typeId,
          categoryId: categoryIdFromEntity,
          locationId: locationId
        });
      } else {
        const itemData = itemNameMap[String(itemId)];
        if (itemData) {
          const itemName = itemData.itemName || itemData.poItemName || itemData.name || '';
          const categoryIdFromItem = itemData.categoryId || itemData.category_id || categoryId;

          let categoryName = '';
          if (categoryIdFromItem) {
            const categoryOption = poCategoryOptions.find(cat =>
              String(cat.id) === String(categoryIdFromItem)
            );
            categoryName = categoryOption?.label || categoryOption?.value || '';
          }

          const findNameById = (array, id, fieldName) => {
            if (!id || !array || array.length === 0) return '';
            const item = array.find(i => String(i.id || i._id) === String(id));
            return item ? (item[fieldName] || item.name || '') : '';
          };

          const brandName = brandId ? findNameById(poBrand, brandId, 'brand') : '';
          const modelName = modelId ? findNameById(poModel, modelId, 'model') : '';
          const typeName = typeId ? findNameById(poType, typeId, 'typeColor') || findNameById(poType, typeId, 'type') : '';

          const locationId = selectedLocationId;
          const locationName = locationId ? (locationNamesMap[String(locationId)] || updateSelectedLocation || '') : '';

          processedData.push({
            id: compositeKey,
            itemId: itemId,
            itemName: itemName,
            model: modelName,
            brand: brandName,
            type: typeName,
            category: categoryName,
            netStock: netStock,
            location: locationName,
            brandId: brandId,
            modelId: modelId,
            typeId: typeId,
            categoryId: categoryIdFromItem,
            locationId: locationId
          });
        }
      }
    });

    setUpdateStockData(processedData);
    setUpdateLoading(false);
  }, [inventoryData, itemNamesData, poBrand, poModel, poType, poCategoryOptions, updateSelectedLocation, stockRoomOptions, locationNamesMap, calculateNetStock, updateLoading]);

  // Filter update data based on category and search
  useEffect(() => {
    let filtered = [...updateStockData];

    if (selectedCategory) {
      filtered = filtered.filter(item => {
        const itemCategory = item.category || '';
        const categoryOption = categoryOptions.find(cat =>
          (cat.value || cat) === selectedCategory || (cat.label || cat) === selectedCategory
        );
        const selectedCategoryValue = categoryOption?.value || categoryOption?.label || selectedCategory;
        const selectedCategoryId = categoryOption?.id || null;
        return itemCategory === selectedCategory ||
          itemCategory === selectedCategoryValue ||
          itemCategory.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCategoryId && String(item.categoryId) === String(selectedCategoryId));
      });
    }

    if (updateSearchQuery.trim()) {
      const query = updateSearchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        String(item.itemId || '').toLowerCase().includes(query) ||
        (item.itemName || '').toLowerCase().includes(query) ||
        (item.model || '').toLowerCase().includes(query) ||
        (item.brand || '').toLowerCase().includes(query) ||
        (item.type || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query)
      );
    }

    setFilteredUpdateData(filtered);
  }, [selectedCategory, updateSearchQuery, updateStockData, categoryOptions]);

  // Recalculate when location changes
  useEffect(() => {
    if (inventoryData.length === 0) return;
    const selectedLocationOption = stockRoomOptions.find(loc =>
      (loc.value || loc) === updateSelectedLocation || (loc.label || loc) === updateSelectedLocation
    );
    const selectedLocationId = selectedLocationOption?.id || null;
    const stockQuantities = calculateNetStock(inventoryData, selectedLocationId);
    // Trigger re-processing by setting updateLoading
    setUpdateLoading(true);
    setTimeout(() => setUpdateLoading(false), 100);
  }, [updateSelectedLocation, inventoryData, stockRoomOptions, calculateNetStock]);

  // Update ref when expandedItemId changes
  useEffect(() => {
    expandedItemIdRef.current = expandedItemId;
  }, [expandedItemId]);

  // Swipe handlers for Update tab
  const minSwipeDistance = 50;

  const handleTouchStart = (e, itemId) => {
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    setSwipeStates(prev => ({
      ...prev,
      [itemId]: {
        startX: touch.clientX,
        currentX: touch.clientX,
        isSwiping: false
      }
    }));
  };

  const handleTouchMove = (e, itemId) => {
    const touch = e.touches ? e.touches[0] : { clientX: e.clientX };
    const state = swipeStates[itemId];
    if (!state) return;
    const deltaX = touch.clientX - state.startX;
    const isExpanded = expandedItemIdRef.current === itemId;
    if (deltaX < 0 || (isExpanded && deltaX > 0)) {
      setSwipeStates(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          currentX: touch.clientX,
          isSwiping: true
        }
      }));
    }
  };

  const handleTouchEnd = (itemId) => {
    const state = swipeStates[itemId];
    if (!state) return;
    const deltaX = state.currentX - state.startX;
    const absDeltaX = Math.abs(deltaX);
    if (absDeltaX >= minSwipeDistance) {
      if (deltaX < 0) {
        setExpandedItemId(itemId);
      } else {
        setExpandedItemId(null);
      }
    }
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  // Set up non-passive touch event listeners
  useEffect(() => {
    const cleanupFunctions = [];
    Object.keys(cardRefs.current).forEach(itemId => {
      const cardElement = cardRefs.current[itemId];
      if (!cardElement) return;
      const touchMoveHandler = (e) => {
        const state = swipeStates[itemId];
        if (!state) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - state.startX;
        const isExpanded = expandedItemIdRef.current === itemId;
        if (deltaX < 0 || (isExpanded && deltaX > 0)) {
          e.preventDefault();
        }
      };
      cardElement.addEventListener('touchmove', touchMoveHandler, { passive: false });
      cleanupFunctions.push(() => {
        cardElement.removeEventListener('touchmove', touchMoveHandler);
      });
    });
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [swipeStates]);

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Category color helper
  const getCategoryColor = (category) => {
    if (!category) return 'bg-[#E3F2FD] text-[#1976D2]';

    // Define a palette of color combinations
    const colorPalette = [
      'bg-[#E3F2FD] text-[#1976D2]', // Light blue
      'bg-[#E8F5E9] text-[#2E7D32]', // Light green
      'bg-[#FFF3E0] text-[#F57C00]', // Light orange
      'bg-[#F3E5F5] text-[#7B1FA2]', // Light purple
      'bg-[#FCE4EC] text-[#C2185B]', // Light pink
      'bg-[#E0F2F1] text-[#00695C]', // Light teal
      'bg-[#FFF9C4] text-[#F57F17]', // Light yellow
      'bg-[#E1BEE7] text-[#6A1B9A]', // Light lavender
      'bg-[#FFE0B2] text-[#E65100]', // Light deep orange
      'bg-[#BBDEFB] text-[#0D47A1]', // Light indigo
      'bg-[#C8E6C9] text-[#1B5E20]', // Light dark green
      'bg-[#FFCCBC] text-[#BF360C]', // Light deep orange red
    ];

    // Hash the category name to get a consistent index
    const hash = hashString(category.toLowerCase());
    const colorIndex = hash % colorPalette.length;

    return colorPalette[colorIndex];
  };

  // Handle edit button click
  const handleEditClick = (item) => {
    setSelectedItemForEdit(item);
    setCurrentStock(String(item.netStock || 0));
    setNewCount(String(item.netStock || 0));
    setShowMoveStockModal(true);
    setExpandedItemId(null);
  };

  // Handle move stock submit
  const handleMoveStockSubmit = () => {
    // TODO: Implement API call to update stock
    console.log('Moving stock:', selectedItemForEdit, 'New count:', newCount);
    setShowMoveStockModal(false);
    setSelectedItemForEdit(null);
    setCurrentStock('');
    setNewCount('');
  };

  // Get stocking location options for Update tab
  const updateStockingLocationOptions = stockRoomOptions.length > 0 ? stockRoomOptions : [
    { value: 'Stock Room A', label: 'Stock Room A', id: null },
    { value: 'Stock Room B', label: 'Stock Room B', id: null }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-90px-80px)] overflow-hidden bg-white">
      {/* Category Text */}
      {activeSubTab === 'update' && (
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <p className="text-[12px] font-medium text-black leading-normal">
            {selectedCategory
              ? `#${categoryOptions.find(cat => (cat.value || cat.label) === selectedCategory)?.id || 12} Category`
              : '#12 Category'}
          </p>
        </div>
      )}
      {activeSubTab === 'transfer' && (
        <div className="flex-shrink-0 px-4 pt-4 pb-2 flex items-center justify-between">
          <p className="text-[12px] font-medium text-black leading-normal">
            #312 Category
          </p>
          {/* Action Buttons */}
          {items.length > 0 && (
            <div className="flex items-center">
              <button
                type="button"
                className="text-black px-4 py-2 rounded-full text-[12px] font-medium"
              >
                Move Stock
              </button>
              <button
                type="button"
                className=" rounded-full flex items-center justify-center"
              >
                <img src={Edit} alt="Edit" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-navigation Tabs: Transfer, Update, History */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="flex bg-gray-100 items-center h-9 shadow-sm flex-1">
          <button
            type="button"
            onClick={() => setActiveSubTab('transfer')}
            className={`flex-1 h-[32px] rounded-md text-[12px] font-medium leading-normal transition-colors ${activeSubTab === 'transfer'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('update')}
            className={`flex-1 h-[32px] rounded-md text-[12px] font-medium leading-normal transition-colors ${activeSubTab === 'update'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`flex-1 h-[32px] rounded-md text-[12px] font-medium leading-normal transition-colors ${activeSubTab === 'history'
              ? 'bg-white text-black'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Transfer Form Fields (shown when Transfer tab is active) */}
      {activeSubTab === 'transfer' && (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* From Field */}
          <div>
            <p className="text-[12px] font-semibold text-black leading-normal mb-1">
              From
            </p>
            <div className="relative">
              <div
                onClick={() => setShowFromModal(true)}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                style={{
                  color: fromLocation ? '#000' : '#9E9E9E'
                }}
              >
                <span>{fromLocation || 'Select Location'}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3"
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* To Field */}
          <div>
            <p className="text-[12px] font-semibold text-black leading-normal mb-1">
              To
            </p>
            <div className="relative">
              <div
                onClick={() => setShowToModal(true)}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-10 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                style={{
                  color: toLocation ? '#000' : '#9E9E9E'
                }}
              >
                <span>{toLocation || 'Select Location'}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3"
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Items Field - Show only after selecting both From and To */}
          {fromLocation && toLocation && fromLocation !== 'Stock Room A' && toLocation !== 'Stock Room B' && (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-semibold text-black leading-normal">
                    Items
                  </p>
                  <div className="w-5 h-5 rounded-full bg-[#9E9E9E] flex items-center justify-center">
                    <span className="text-[10px] font-medium text-white">{itemsCount}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearchItemsModal(true)}
                  className="cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
                    <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Added Items List */}
          {items.length > 0 && (
            <div className="">
              <div className="">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer select-none"
                    style={{
                      transform: swipeStates[index]?.isSwiping ? `translateX(${swipeStates[index].translateX}px)` : 'translateX(0)',
                      transition: swipeStates[index]?.isSwiping ? 'none' : 'transform 0.3s ease'
                    }}
                    onMouseDown={(e) => handleMouseDown(index, e)}
                  >
                    <div className=" ">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-semibold text-black">{item.itemName}</p>
                        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${item.category}`}>
                          {(item.category || 'Electricals').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between ">
                        <p className="text-[12px] font-medium text-gray-600">
                          {item.model ? `${item.model}` : ''}
                        </p>
                        <p className={`text-[12px] font-medium text-gray-400`}>
                          Current Count:
                        </p>
                      </div>
                      <div className="flex items-center justify-between">

                        <p className="text-[12px] font-medium text-gray-600">
                          {item.brand ? `${item.brand}` : ''} {item.type ? `${item.type}` : ''}
                        </p>
                        <p className="text-[12px] font-medium text-[#007323]">
                          Transfer Count:
                        </p>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty content area below */}
          <div className="flex-1"></div>
        </div>
      )}

      {/* Update Tab Content */}
      {activeSubTab === 'update' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Category Text and Filters */}
          <div className="flex-shrink-0 px-4 pt-4">
            {/* Stocking Location Filter */}
            <div className="mb-2">
              <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                Stocking Location
              </p>
              <div className="relative">
                <div
                  onClick={() => setShowUpdateLocationModal(true)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-4 text-[12px] font-medium bg-white flex items-center cursor-pointer justify-between"
                  style={{
                    paddingRight: updateSelectedLocation ? '40px' : '12px',
                    boxSizing: 'border-box',
                    color: updateSelectedLocation ? '#000' : '#9E9E9E'
                  }}
                >
                  <span>{updateSelectedLocation || 'Select Project'}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {updateSelectedLocation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUpdateSelectedLocation('');
                      setUpdateSearchQuery('');
                    }}
                    className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    style={{ right: '24px' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Search Bar - Only show after Stocking Location is selected */}
            {updateSelectedLocation && updateSelectedLocation !== 'Select Project' && (
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
                  value={updateSearchQuery}
                  onChange={(e) => setUpdateSearchQuery(e.target.value)}
                  className="w-full h-[40px] border border-[rgba(0,0,0,0.16)] rounded-full pl-10 pr-3 text-[12px] font-medium bg-white"
                />
              </div>
            )}
          </div>

          {/* Stock Items List - Only show after Stocking Location is selected */}
          {updateSelectedLocation && updateSelectedLocation !== 'Select Project' ? (
            <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide no-scrollbar">
              {updateLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-[14px] text-gray-500">Loading...</p>
                </div>
              ) : filteredUpdateData.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-[14px] text-gray-500">No items found</p>
                </div>
              ) : (
                <div className="shadow-md mt-2">
                  {filteredUpdateData.map((item, index) => {
                    const itemId = `${item.itemId}-${item.categoryId}-${item.modelId}-${item.brandId}-${item.typeId}-${index}`;
                    const isExpanded = expandedItemId === itemId;
                    const swipeState = swipeStates[itemId];
                    const buttonWidth = 56; // Width of edit button (matching image - ONLY EDIT, NO DELETE)
                    const swipeOffset =
                      swipeState && swipeState.isSwiping
                        ? Math.max(-buttonWidth, Math.min(0, swipeState.currentX - swipeState.startX))
                        : isExpanded
                          ? -buttonWidth
                          : 0;

                    return (
                      <div key={itemId} className="relative overflow-hidden">
                        {/* Card */}
                        <div
                          ref={(el) => {
                            if (el) cardRefs.current[itemId] = el;
                          }}
                          className="bg-white border border-[rgba(0,0,0,0.16)] rounded-[8px] p-3 cursor-pointer transition-transform duration-300 ease-out select-none"
                          style={{
                            transform: `translateX(${swipeOffset}px)`,
                            touchAction: 'pan-y',
                            userSelect: 'none',
                            WebkitUserSelect: 'none'
                          }}
                          onTouchStart={(e) => handleTouchStart(e, itemId)}
                          onTouchMove={(e) => handleTouchMove(e, itemId)}
                          onTouchEnd={() => handleTouchEnd(itemId)}
                          onMouseDown={(e) => {
                            if (e.button !== 0) return;
                            const syntheticEvent = {
                              touches: [{ clientX: e.clientX }],
                              preventDefault: () => e.preventDefault()
                            };
                            handleTouchStart(syntheticEvent, itemId);
                          }}
                          onClick={(e) => {
                            if (e.target.closest('.action-button')) {
                              return;
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            {/* Left Side - Item Details */}
                            <div className="flex-1 pr-2">
                              <div className="flex items-center justify-between">
                                {/* Item Name */}
                                <p className="text-[14px] font-semibold text-black leading-tight mb-1">
                                  {item.itemName || 'N/A'}
                                </p>
                                {/* Category Tag */}
                                {item.category && (
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${getCategoryColor(item.category)} mb-2`}>
                                    {item.category.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                              {/* Item ID */}
                              <p className="text-[12px] font-medium text-gray-600 mb-1">
                                {item.itemId || 'N/A'}
                              </p>
                              </div>
                              <div className="flex items-center justify-between">
                              {/* Brand and Type */}
                              <p className="text-[12px] font-medium text-gray-600 mb-1">
                                {item.brand && item.type ? `${item.brand}, ${item.type}` : item.brand || item.type || ''}
                              </p>
                              </div>
                              {/* Right Side - Category Tag and Current Count */}
                              <div className="flex items-center justify-between">
                                {/* Location */}
                                <p className="text-[12px] font-medium text-gray-600">
                                  {item.location || 'N/A'}
                                </p>
                                {/* Current Count */}
                                <p className="text-[12px] font-medium text-black">
                                  Current Count : {item.netStock || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Edit Button - Behind the card on the right, revealed on swipe (ONLY EDIT, NO DELETE) */}
                        <div
                          className="absolute right-0 top-0 bottom-0 flex items-center z-0"
                          style={{
                            opacity: isExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20) ? 1 : 0,
                            transition: 'opacity 0.2s ease-out',
                            pointerEvents: isExpanded ? 'auto' : 'none',
                            width: `${buttonWidth}px`
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(item);
                            }}
                            className="action-button w-full h-full bg-[#007233] flex items-center justify-center hover:bg-[#005a26] transition-colors"
                          >
                            <img src={Edit} alt="Edit" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center">
              <p className="text-[14px] text-gray-500">Please select a Stocking Location</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab Content */}
      {activeSubTab === 'history' && (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center justify-center h-full">
            <p className="text-[14px] text-gray-500">History content coming soon</p>
          </div>
        </div>
      )}

      {/* Modals */}
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
        isOpen={showFromModal}
        onClose={() => setShowFromModal(false)}
        onSelect={(value) => {
          setFromLocation(value);
          setShowFromModal(false);
        }}
        selectedValue={fromLocation}
        options={stockRoomOptions.length > 0 ? stockRoomOptions.map(loc => loc.value || loc.label || loc) : ['Stock Room A', 'Stock Room B']}
        fieldName="From"
      />
      <SelectVendorModal
        isOpen={showToModal}
        onClose={() => setShowToModal(false)}
        onSelect={(value) => {
          setToLocation(value);
          setShowToModal(false);
        }}
        selectedValue={toLocation}
        options={stockRoomOptions.length > 0 ? stockRoomOptions.map(loc => loc.value || loc.label || loc) : ['Stock Room A', 'Stock Room B']}
        fieldName="To"
      />
      <SelectVendorModal
        isOpen={showItemsModal}
        onClose={() => setShowItemsModal(false)}
        onSelect={(value) => {
          // Handle item selection
          setShowItemsModal(false);
        }}
        selectedValue=""
        options={[]}
        fieldName="Items"
      />
      <SearchItemsModal
        isOpen={showSearchItemsModal}
        onClose={() => setShowSearchItemsModal(false)}
        onAdd={(item, quantity) => {
          // Handle adding item
          setItems(prev => [...prev, { ...item, quantity }]);
          setItemsCount(prev => prev + 1);
          setShowSearchItemsModal(false);
        }}
        getAvailableItems={getAvailableItems}
        existingItems={[]}
        onRefreshData={fetchPoItemName}
        stockingLocationId={null}
        useInventoryData={true}
      />

      {/* Move Stock Bottom Sheet */}
      {showMoveStockModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => {
              setShowMoveStockModal(false);
              setSelectedItemForEdit(null);
              setCurrentStock('');
              setNewCount('');
            }}
          />
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[360px] bg-white rounded-t-[20px] z-50 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
              <h2 className="text-[16px] font-semibold text-black">Move Stock</h2>
              <button
                type="button"
                onClick={() => {
                  setShowMoveStockModal(false);
                  setSelectedItemForEdit(null);
                  setCurrentStock('');
                  setNewCount('');
                }}
                className="text-red-500 hover:text-red-700"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4 space-y-4">
              {/* Current Stock */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                  Current Stock
                </p>
                <input
                  type="text"
                  value={currentStock}
                  readOnly
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* New Count */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-1">
                  New Count
                </p>
                <input
                  type="number"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded-[8px] pl-3 pr-3 text-[12px] font-medium bg-white text-black"
                  placeholder="Enter new count"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 pb-4 pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowMoveStockModal(false);
                  setSelectedItemForEdit(null);
                  setCurrentStock('');
                  setNewCount('');
                }}
                className="flex-1 h-[40px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[14px] font-medium text-black bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMoveStockSubmit}
                className="flex-1 h-[40px] bg-black rounded-[8px] text-[14px] font-medium text-white hover:bg-gray-800"
              >
                Edit
              </button>
            </div>
          </div>
        </>
      )}

      {/* Update Location Modal */}
      <SelectVendorModal
        isOpen={showUpdateLocationModal}
        onClose={() => setShowUpdateLocationModal(false)}
        onSelect={(value) => {
          setUpdateSelectedLocation(value);
          setShowUpdateLocationModal(false);
        }}
        selectedValue={updateSelectedLocation}
        options={updateStockingLocationOptions.map(loc => (loc.value || loc.label || loc))}
        fieldName="Stocking Location"
      />
    </div>
  );
};

export default EditStock;

