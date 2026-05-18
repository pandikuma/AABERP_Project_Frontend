import React, { useState, useEffect } from 'react'
import BillPayment from './BillPayment';
import BankRegister6View from './BankRegisterPayments';
import BankRegisterHistory from './BankRegisterHistory';
import BankRegisterReconcile from './BankRegisterReconcile';

/**
 * H1 = Orbit top bar (OrbitAppChrome / OrbitERPHeading in App.js)
 * H2 = .tabs-row — Orbit ERP 1.6.html
 * H3 = .shell   — Orbit ERP 1.6.html
 */
const BANK_REGISTER_LAYOUT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@500;600;700&family=Outfit:wght@500;600;700;800&display=swap');

.bank-register-layout-root{
  --gold:#D6AB60; --gold-deep:#B8924B; --ink:#212121; --ink-2:#3a3a3a; --muted:#8a8275;
  --cream:#FBF7F0; --line:#EADFC8;
  font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif;
  color:var(--ink);
  margin-top:0;
  padding-top:0;
}

/* H2 — tabs-row (Orbit ERP 1.6 Bank Register module) */
.bank-register-layout-root .tabs-row{
  background:var(--cream);
  border-bottom:1px solid var(--line);
  display:flex;
  align-items:flex-end;
  justify-content:flex-start;
  flex-wrap:nowrap;
  gap:0;
  padding:0 18px;
  margin-top:0;
  position:sticky;
  top:0;
  z-index:25;
  box-sizing:border-box;
  min-height:48px;
}
.bank-register-layout-root .tabs-row .tab{
  display:inline-block;
  padding:12px 18px;
  font-size:13.5px;
  font-weight:600;
  line-height:21px;
  color:#7a7163;
  border-bottom:2.5px solid transparent;
  cursor:pointer;
  white-space:nowrap;
  background:transparent;
  border-left:none;border-right:none;border-top:none;
  font-family:inherit;
  margin:0;
  box-sizing:border-box;
  -webkit-appearance:none;
  appearance:none;
}
.bank-register-layout-root .tabs-row .tab:hover:not(.active){color:var(--ink-2);}
.bank-register-layout-root .tabs-row .tab.active{color:var(--ink);border-bottom-color:var(--gold);}

/* H3 — shell padding 18px all sides */
.bank-register-layout-root .shell{
  background:var(--cream);
  min-height:calc(100vh - 90px);
  padding:18px;
  box-sizing:border-box;
}
@media(max-width:768px){
  .bank-register-layout-root .shell{padding:10px;}
}

/* Legacy BillPayment wrappers — spacing only, inside H3 */
.bank-register-layout-root .shell > body,
.bank-register-layout-root .shell .bg-\\[\\#FAF6ED\\]{
  display:block;
  margin:0 !important;
  padding:0 !important;
  background:transparent !important;
  min-height:0 !important;
}
.bank-register-layout-root .shell .ml-10.mr-10,
.bank-register-layout-root .shell [class*="ml-10"][class*="mr-10"]{
  margin-left:0 !important;
  margin-right:0 !important;
  background:transparent !important;
  min-height:0 !important;
}
.bank-register-layout-root .shell .min-h-screen{min-height:0 !important;}
.bank-register-layout-root .shell .ml-10.mr-10 > .p-6,
.bank-register-layout-root .shell [class*="min-h-screen"] > .p-6{
  padding:0 !important;
}

/* Bank Payments — one shell height (801); padding on inner .shell only */
.bank-register-layout-root .shell.content:has(> .bank-register-6-scope){
  padding:0 !important;
}
.bank-register-layout-root .shell .bank-register-6-scope .shell{
  padding:18px;
  box-sizing:border-box;
  height:100%;
  min-height:0;
  background:transparent;
}
.bank-register-layout-root .shell .bank-register-6-scope [class*="lg:px-4"]{
  padding-left:0 !important;
  padding-right:0 !important;
}

@media(max-width:768px){
  .bank-register-layout-root .tabs-row{
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
    padding:0 12px;
  }
  .bank-register-layout-root .tabs-row::-webkit-scrollbar{display:none;}
  .bank-register-layout-root .tabs-row .tab{padding:12px 12px;font-size:13px;}
}
`;

const BankRegisterHeading = ({ username, userRoles = [] }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem('activePaintTab') || 'bankregister'
    );

    useEffect(() => {
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

    const tabClass = (tabKey) => `tab${activeTab === tabKey ? ' active' : ''}`;

    return (
        <div className="bank-register-layout-root">
            <style>{BANK_REGISTER_LAYOUT_CSS}</style>

            {/* H2 */}
            <div className="tabs-row" role="navigation" aria-label="Bank register sections">
                <button type="button" className={tabClass('billpayment')} onClick={() => setActiveTab('billpayment')}>
                    Bank Payment
                </button>
                <button type="button" className={tabClass('bankregister6')} onClick={() => setActiveTab('bankregister6')}>
                    Bank Payments
                </button>
                <button type="button" className={tabClass('bankregisterhistory')} onClick={() => setActiveTab('bankregisterhistory')}>
                    History
                </button>
                <button type="button" className={tabClass('bankregisterreconcile')} onClick={() => setActiveTab('bankregisterreconcile')}>
                    Reconcile
                </button>
            </div>

            {/* H3 */}
            <div className="shell content">
                {renderContent()}
            </div>
        </div>
    )
}

export default BankRegisterHeading
