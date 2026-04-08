import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../PurchaseOrder/Header';
import Sidebar from '../Bars/Sidebar';
import BottomNav from '../PurchaseOrder/BottomNav';
import Filter from '../Images/Filter.png';
import GoodsRecievedNotesTabs from './GoodsRecievedNotesTabs';

const statusTabs = ['Pending', 'Review', 'Completed'];

const verifyCards = [
  {
    id: 1,
    status: 'Pending',
    poNo: 'PO - 2025 - 134',
    vendorName: 'Sriram Paints',
    siteName: 'Ramar - Krishnankovil',
    time: 'Today - 10:24 AM',
    engineerName: 'Krishnamoorthi K',
    itemsCount: 3
  },
  {
    id: 2,
    status: 'Pending',
    poNo: 'PO - 2025 - 33',
    vendorName: 'Thangapa Nadar Paints',
    siteName: 'Ramar - Krishnankovil',
    time: 'Today - 09:42 AM',
    engineerName: 'Krishnamoorthi K',
    itemsCount: 6
  },
  {
    id: 3,
    status: 'Review',
    poNo: 'PO - 2025 - 134',
    vendorName: 'Sriram Paints',
    siteName: 'Ramar - Krishnankovil',
    time: 'Today - 10:24 AM',
    engineerName: 'Krishnamoorthi K',
    itemsCount: 3
  },
  {
    id: 4,
    status: 'Completed',
    poNo: 'PO - 2025 - 134',
    vendorName: 'Sriram Paints',
    siteName: 'Ramar - Krishnankovil',
    time: 'Today - 10:24 AM',
    engineerName: 'Krishnamoorthi K',
    itemsCount: 3
  }
];

const Verify = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('goods-recieved-notes');
  const [activeStatus, setActiveStatus] = useState('Pending');
  const cards = useMemo(() => verifyCards, []);
  const filteredCards = useMemo(
    () => cards.filter((card) => card.status === activeStatus),
    [cards, activeStatus]
  );

  const getStatusBadgeStyles = (status) => {
    if (status === 'Review') return 'bg-[#FFF4E5] text-[#C98A1C]';
    if (status === 'Completed') return 'bg-[#E8F8EE] text-[#13A14B]';
    return 'bg-[#FFF0EA] text-[#F07A4A]';
  };

  const getStatusDotStyles = (status) => {
    if (status === 'Review') return 'bg-[#C98A1C]';
    if (status === 'Completed') return 'bg-[#13A14B]';
    return 'bg-[#F07A4A]';
  };

  const getStatusLabel = (status) => {
    if (status === 'Review') return 'In Review';
    return status;
  };

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleNavigate = (page) => {
    if (page === 'request-for-quotation') {
      setCurrentPage('request-for-quotation');
      navigate('/rfq');
    } else if (page === 'billing') {
      setCurrentPage('billing');
      navigate('/tracker/pendingbill');
    } else if (page === 'purchase-order') {
      setCurrentPage('purchase-order');
      navigate('/purchaseorder');
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
    }
  };

  return (
    <div className="relative w-full h-[100vh] bg-white max-w-[360px] mx-auto overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        userRoles={user?.userRoles || []}
      />

      <Header
        title="Goods Recieved Note"
        user={user}
        onLogout={onLogout}
        onMenuClick={handleMenuClick}
      >
        <GoodsRecievedNotesTabs
          activeTab="verify"
          onTabChange={(tab) => navigate(tab === 'create' ? '/grn/create' : '/grn/verify')}
          leftLabel="Engineer Name"
          rightLabel="Vendor"
        />
      </Header>

      <div className="mt-[126px] h-[calc(100vh-126px-80px)] overflow-y-auto no-scrollbar bg-white">
        <div className="pb-[16px]">
          <div className="mt-[8px] rounded-[6px] bg-[#F1F4F8] p-[4px] flex items-center gap-[6px]">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveStatus(tab)}
                className={`flex-1 h-[28px] rounded-[4px] text-[12px] font-medium ${
                  activeStatus === tab ? 'bg-white text-[#202020] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]' : 'text-[#7D828B]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center gap-[4px] px-0 mt-[6px] mb-[8px] flex-shrink-0">
            <div className="flex items-center gap-[4px] min-w-0">
              <button type="button" className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0">
                <img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
                <span className="text-[12px] font-medium text-black flex-shrink-0">Filter</span>
              </button>
            </div>
          </div>

          <div className="mt-[6px]">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px] w-full"
                style={{ marginBottom: '0px' }}
              >
                <div className="rounded-[8px] h-full px-3 py-[10px] cursor-pointer transition-all duration-300 ease-out select-none bg-white">
                  <div className="flex items-start justify-between mb-[2px]">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <p className="text-[12px] font-semibold leading-snug truncate text-black">
                        {card.poNo}
                      </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                      <span className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium flex items-center gap-[4px] ${getStatusBadgeStyles(card.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotStyles(card.status)}`} />
                        {getStatusLabel(card.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between mb-[2px]">
                    <p className="text-[11px] leading-snug font-semibold truncate flex-1 min-w-0 text-black text-left">
                      {card.vendorName}
                    </p>
                    <p className="text-[11px] leading-snug flex-shrink-0 ml-2 truncate max-w-[40%] text-black">
                      {card.engineerName}
                    </p>
                  </div>
                  <div className="flex items-start justify-between mb-[2px]">
                    <p className="text-[11px] leading-snug font-semibold truncate flex-1 min-w-0 text-[#777777] text-left">
                      {card.siteName}
                    </p>
                    <p className="text-[11px] font-medium leading-snug text-black flex-shrink-0 ml-2">
                      No. of Items: {card.itemsCount}
                    </p>
                  </div>
                  <div className="flex items-start justify-between">
                    <p className="flex items-center gap-[2px] text-[11px] leading-normal min-w-0 flex-1">
                      <span className="font-bold text-black">{card.time.split(' - ')[0]}</span>
                      <span className="font-semibold text-[#9E9E9E]"> - {card.time.split(' - ')[1]}</span>
                    </p>
                    <p className="text-[12px] font-medium leading-snug flex-shrink-0 ml-2 text-black">
                      &nbsp;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
};

export default Verify;
