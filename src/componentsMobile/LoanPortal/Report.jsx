import React, { useState, useEffect } from 'react';

const Report = () => {
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLoan, setTotalLoan] = useState(0);
  const [totalRefund, setTotalRefund] = useState(0);
  const [totalTransfer, setTotalTransfer] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
        if (response.ok) {
          const data = await response.json();
          setLoanData(data);
          
          const loan = data.filter(e => e.type === 'Loan').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          const refund = data.filter(e => e.type === 'Refund').reduce((sum, e) => sum + (parseFloat(e.loan_refund_amount) || 0), 0);
          const transfer = data.filter(e => e.type === 'Transfer').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
          
          setTotalLoan(loan);
          setTotalRefund(refund);
          setTotalTransfer(transfer);
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto pb-20 px-4 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="max-w-[360px] mx-auto py-4">
        <h2 className="text-lg font-semibold mb-4">Loan Report</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Loan</p>
            <p className="text-lg font-semibold text-green-600">₹{totalLoan.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Refund</p>
            <p className="text-lg font-semibold text-red-600">₹{totalRefund.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 col-span-2">
            <p className="text-xs text-gray-500 mb-1">Total Transfer</p>
            <p className="text-lg font-semibold text-blue-600">₹{totalTransfer.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Report Data */}
        <div className="space-y-3">
          {loanData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No loan entries found</div>
          ) : (
            loanData.slice(0, 30).map((entry, index) => (
              <div key={entry.loanPortalId || entry.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">Entry #{entry.entry_no || '-'}</p>
                    <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString('en-GB')}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    entry.type === 'Loan' ? 'bg-green-100 text-green-700' :
                    entry.type === 'Refund' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {entry.type || 'Loan'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Amount: ₹{parseFloat(entry.amount || 0).toLocaleString('en-IN')}</p>
                  {entry.loan_payment_mode && (
                    <p className="text-gray-500 mt-1">Mode: {entry.loan_payment_mode}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
