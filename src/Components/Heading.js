import React, { useState, useEffect, useRef } from 'react';
import './Heading.css';
import Form from './ExpensesEntry/Form';
import Tableview from './ExpensesEntry/TableViewExpense';
import Database from './ExpensesEntry/DatabaseExpenses';
import ExpensesAddInput from './ExpensesEntry/ExpensesInputData';
import EntryChecking from './ExpensesEntry/EntryCheck';
const Heading = ({ username, userRoles = [] }) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const tableviewRef = useRef(null);
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
                return <Tableview ref={tableviewRef} username={username} userRoles={userRoles} />;
            case 'database':
                return <Database username={username} userRoles={userRoles} />;
            case 'addInput':
                return <ExpensesAddInput userRoles={userRoles} />;
            case 'entryCheck':
                return <EntryChecking userRoles={userRoles} />;
            default:
                return <Form />;
        }
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            const menuContainer = document.querySelector('.export-menu-container');
            if (showExportMenu && menuContainer && !menuContainer.contains(event.target)) {
                setShowExportMenu(false);
            }
        };
        if (showExportMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showExportMenu]);

    const handleExportPDF = () => {
        if (tableviewRef.current) {
            tableviewRef.current.generateFilteredPDF();
        }
        setShowExportMenu(false);
    };

    const handleExportXL = () => {
        if (tableviewRef.current) {
            tableviewRef.current.exportToCSV();
        }
        setShowExportMenu(false);
    };

    const handlePrint = () => {
        if (tableviewRef.current) {
            tableviewRef.current.print();
        }
        setShowExportMenu(false);
    };

    return (
        <div className="bg-[#FAF6ED] w-full h-auto min-h-screen">
            {/* Top Navigation Tabs */}
            <div className="topbar-title gap-4 w-[350px] sm:w-[580px] lg:w-[850px] overflow-x-auto no-scrollbar px-2 py-3 relative">
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

            </div>
            {/* Mobile Kebab Menu - Only show on tableview tab */}
            <div>
                {activeTab === 'tableview' && (
                    <div className='relative md:hidden export-menu-container ml-auto'>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className='p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#BF9853]'
                            aria-label="Export menu"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-xl z-50 border border-gray-200 py-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportPDF();
                                    }}
                                    className="block w-full text-left px-4 py-2.5 text-sm text-[#E4572E] hover:bg-gray-100 font-semibold transition-colors"
                                >
                                    Export pdf
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportXL();
                                    }}
                                    className="block w-full text-left px-4 py-2.5 text-sm text-[#007233] hover:bg-gray-100 font-semibold transition-colors"
                                >
                                    Export XL
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrint();
                                    }}
                                    className="block w-full text-left px-4 py-2.5 text-sm text-[#BF9853] hover:bg-gray-100 font-semibold transition-colors"
                                >
                                    Print
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Dynamic Content Area */}
            <div className="content px-4">{renderContent()}</div>
        </div>
    );
};
export default Heading;