import React, { useState, useEffect } from 'react';
import PendingBill from './PendingBill';
import BillDatabase from './BillDatabase';
import BillStatement from './BillStatement';
import MobileBillPaymentsTracker from '../../componentsMobile/BillPaymentsTracker/BillPaymentsTracker';

const BillPaymentsTrackerHeading = ({ username, userRoles = [] }) => {
    const [isMobile, setIsMobile] = useState(() => {
        return window.innerWidth <= 768;
    });
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activePaintTab');
        if (savedTab === 'billdatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return 'pendingbill';
        }
        return savedTab || 'pendingbill';
    });
    useEffect(() => {
        if (activeTab === 'billdatabase' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('pendingbill');
        } else {
            localStorage.setItem('activePaintTab', activeTab);
        }
    }, [activeTab, username]);
    const renderContent = () => {
        switch (activeTab) {
            case 'pendingbill':
                return <PendingBill username={username} userRoles={userRoles} />;
            case 'billdatabase':
                return <BillDatabase username={username} userRoles={userRoles} />;
            case 'billstatement':
                return <BillStatement username={username} userRoles={userRoles} />;
            default:
                return <PendingBill username={username} userRoles={userRoles}/>;
        }
    };
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : { username, userRoles };
    return (
        <>
            {isMobile ? (
                <div style={{ textAlign: 'left' }}>
                    <MobileBillPaymentsTracker user={user} />
                </div>
            ) : (
                <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
                    <div className="topbar-title">
                        <h2
                            className={`link ${activeTab === 'pendingbill' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pendingbill')}
                        >
                            Pending Bill
                        </h2>
                        {(username === 'Mahalingam M' || username === 'Admin') && (
                            <h2
                                className={`link ${activeTab === 'billdatabase' ? 'active' : ''}`}
                                onClick={() => setActiveTab('billdatabase')}
                            >
                                Database
                            </h2>
                        )}
                        <h2
                            className={`link ${activeTab === 'billstatement' ? 'active' : ''}`}
                            onClick={() => setActiveTab('billstatement')}
                        >
                            Statement
                        </h2>
                    </div>
                    <div className="content">
                        {renderContent()}
                    </div>
                </div>
            )}
        </>
    )
}
export default BillPaymentsTrackerHeading