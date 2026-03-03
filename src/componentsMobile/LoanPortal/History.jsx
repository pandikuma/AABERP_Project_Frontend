import React, { useState, useEffect } from 'react';

const History = () => {
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
        if (response.ok) {
          const data = await response.json();
          setLoanData(data);
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
        <h2 className="text-lg font-semibold mb-4">Loan History</h2>
        {loanData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No loan entries found</div>
        ) : (
          <div className="space-y-3">
            {loanData.slice(0, 50).map((entry, index) => (
              <div key={entry.loanPortalId || entry.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">Entry #{entry.entry_no || '-'}</p>
                    <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
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
                  {entry.description && (
                    <p className="text-gray-500 mt-1">{entry.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
