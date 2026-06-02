import React, { useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import '../Heading.css';
import WeeklyPayment from './WeeklyPayment';
import History from './WeeklyPaymentHistory';

const WHeading = () => {
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);
    const handleLinkClick = (path) => {
        setActiveLink(path);
    }
    return (
        <div className="bg-[#FAF6ED]">
            <div className="topbar-title expense-entry-tabs w-full max-w-full overflow-x-auto no-scrollbar">
                <h2>
                    <Link
                        className={`link whitespace-nowrap ${activeLink === '/weekly-payment/WeeklyPayment' ? 'active' : ''}`}
                        to="/weekly-payment/WeeklyPayment"
                        onClick={() => handleLinkClick('/weekly-payment/WeeklyPayment')}
                    >
                        Weekly Payment
                    </Link>
                </h2>
                <h2>
                    <Link
                        className={`link whitespace-nowrap ${activeLink === '/weekly-payment/History' ? 'active' : ''}`}
                        to="/weekly-payment/History"
                        onClick={() => handleLinkClick('/weekly-payment/History')}
                    >
                        History
                    </Link>
                </h2>
            </div>
            <div className="content">
                <Routes>
                    <Route path="weeklypayment" element={<WeeklyPayment />} />
                    <Route path='history' element={<History />} />
                </Routes>
            </div>
        </div>
    )
}

export default WHeading
