import React, { useState, useEffect } from 'react';
import './Heading.css';
import Form from './ExpensesEntry/Form';
import Tableview from './ExpensesEntry/TableViewExpense';
import Database from './ExpensesEntry/DatabaseExpenses';
import ExpensesAddInput from './ExpensesEntry/ExpensesInputData';
import EntryChecking from './ExpensesEntry/EntryCheck';
import WeeklyPaymentHistory from './Cash Register/WeeklyPaymentHistory';
import DailyHistory from './Cash Register/DailyHistory';
const Heading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(() => {
        // Check if there's prefill data to navigate to expense-entry
        const prefillData = localStorage.getItem('expenseEntryPrefill');
        if (prefillData) {
            return 'expense-entry';
        }
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab === 'database' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            return 'expense-entry';
        }
        return savedTab || 'expense-entry';
    });
    useEffect(() => {
        if (activeTab === 'database' && (username !== 'Mahalingam M' && username !== 'Admin')) {
            setActiveTab('expense-entry');
        } else {
            localStorage.setItem('activeTab', activeTab);
        }
    }, [activeTab, username]);
    const renderContent = () => {
        switch (activeTab) {
            case 'expense-entry':
                return <Form username={username} userRoles={userRoles} />;
            case 'tableview':
                return <Tableview username={username} userRoles={userRoles} />;
            case 'database':
                return <Database username={username} userRoles={userRoles} />;
            case 'addInput':
                return <ExpensesAddInput userRoles={userRoles} />;
            case 'entryCheck':
                return <EntryChecking userRoles={userRoles} />;
            case 'weeklyUploadHistory':
                return <WeeklyPaymentHistory username={username} userRoles={userRoles} viewMode="expenses-entry-upload" />;
            case 'dailyUpload':
                return <DailyHistory username={username} userRoles={userRoles} />;
            default:
                return <Form />;
        }
    };
    return (
        <div className="bg-[#FAF6ED]">
            {/* Top Navigation Tabs */}
            <div className="topbar-title gap-[] w-[400px] sm:w-[580px] lg:w-[1050px] overflow-x-auto no-scrollbar py-3">
                <h2 className={`link whitespace-nowrap ${activeTab === 'expense-entry' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expense-entry')}>
                    Form
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'tableview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tableview')}>
                    Table View
                </h2>
                {(username === 'Mahalingam M' || username === 'Admin') && (
                    <>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'database' ? 'active' : ''}`}
                            onClick={() => setActiveTab('database')}>
                            Database
                        </h2>
                        <h2 className={`link whitespace-nowrap ${activeTab === 'addInput' ? 'active' : ''}`}
                            onClick={() => setActiveTab('addInput')}>
                            Add Input
                        </h2>
                    </>
                )}
                <h2 className={`link whitespace-nowrap ${activeTab === 'entryCheck' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entryCheck')}>
                    Entry Check
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'weeklyUploadHistory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('weeklyUploadHistory')}>
                    Weekly Uploads
                </h2>
                <h2 className={`link whitespace-nowrap ${activeTab === 'dailyUpload' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dailyUpload')}>
                    Daily Upload
                </h2>
            </div>
            {/* Dynamic Content Area */}
            <div className="content px-4">{renderContent()}</div>
        </div>
    );
};
export default Heading;
