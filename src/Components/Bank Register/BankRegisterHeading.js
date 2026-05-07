import React, { useState, useEffect } from 'react'
import BillPayment from './BillPayment';
import BankRegister6View from './BankRegisterPayments';
import BankRegisterHistory from './BankRegisterHistory';
import BankRegisterReconcile from './BankRegisterReconcile';

const BankRegisterHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'bankregister'
    );

    useEffect(() => {
        // Save the active tab to localStorage whenever it changes
        localStorage.setItem('activePaintTab', activeTab);
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'billpayment':
                return <BillPayment username={username} userRoles={userRoles} />;
            case 'bankregister6':
                return <BankRegister6View />;
            case 'bankregisterhistory':
                return <BankRegisterHistory />;
            case 'bankregisterreconcile':
                return <BankRegisterReconcile />;
            default:
                return <BillPayment />;
        }
    };
    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            <div className="topbar-title">
                <h2
                    className={`link ${activeTab === 'billpayment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billpayment')}
                >
                    Bank Payment
                </h2>
                <h2
                    className={`link ${activeTab === 'bankregister6' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bankregister6')}
                >
                    Bank Payments
                </h2>
                <h2
                    className={`link ${activeTab === 'bankregisterhistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bankregisterhistory')}
                >
                    History
                </h2>
                <h2
                    className={`link ${activeTab === 'bankregisterreconcile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bankregisterreconcile')}
                >
                    Reconcile
                </h2>
            </div>
            <div className="content">
                {renderContent()}
            </div>
        </div>
    )
}

export default BankRegisterHeading
