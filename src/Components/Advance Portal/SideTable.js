import React, { useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import edit from '../Images/Edit.svg';
import file from '../Images/file.png';
import XL from '../Images/sheets.png';
import Pdf from '../Images/pdf.png';
import {
  EDBC_IDS,
  getEdbcColumnConfig,
  useEdbcExpandedCells,
  EdbcTableHeaderRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EDBC_TABLE_EDGE_TABLE_CLASS,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

const filterEntriesForSideTable = (advanceData, selectedOption, selectedSite) =>
  (advanceData || [])
    .filter((entry) => {
      const isMatchingVendor =
        selectedOption?.type === 'Vendor'
          ? entry.vendor_id === selectedOption.id
          : selectedOption?.type === 'Contractor'
            ? entry.contractor_id === selectedOption.id
            : false;
      const isForCurrentProject = entry.project_id === selectedSite?.id;
      return isMatchingVendor && isForCurrentProject;
    })
    .sort((a, b) => {
      const entryNoA = a.entry_no || 0;
      const entryNoB = b.entry_no || 0;
      return entryNoB - entryNoA;
    });

const getEntryRowDisplay = (entry, siteOptions) => {
  const {
    amount,
    bill_amount,
    discount_amount,
    type,
    transfer_site_id,
    refund_amount,
  } = entry;
  const discountAmt = parseFloat(discount_amount) || 0;
  const advanceAmount = (() => {
    if (type === 'Refund') {
      return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
    }
    return parseFloat(amount || 0).toLocaleString('en-IN');
  })();
  const billAmount =
    type === 'Bill Settlement'
      ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
      : '';
  const discountDisplay =
    type === 'Bill Settlement' && discountAmt > 0
      ? discountAmt.toLocaleString('en-IN')
      : '';
  let transferOrRefund = '';
  if (type === 'Refund') {
    transferOrRefund = 'Refund';
  } else if (type === 'Transfer') {
    const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
    transferOrRefund =
      parseFloat(amount) < 0
        ? `Transfer to ${siteLabel || 'Unknown Site'}`
        : `Transfer from ${siteLabel || 'Unknown Site'}`;
  }
  return { advanceAmount, billAmount, discountDisplay, transferOrRefund, payment_mode: entry.payment_mode || '' };
};

const toExpenseRow = (entry) => ({ ...entry, id: entry.advancePortalId });

const SideTable = ({
  advanceData,
  selectedOption,
  selectedSite,
  siteOptions,
  projectAdvance,
  onEditClick,
}) => {
  const tableEntries = useMemo(
    () => filterEntriesForSideTable(advanceData, selectedOption, selectedSite),
    [advanceData, selectedOption, selectedSite]
  );
  const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc19TdClass = getEdbcColumnConfig(EDBC_IDS.EDBC19)?.tdClass || '';

  const exportPDF = () => {
    const doc = new jsPDF();
    const entityType = selectedOption?.type === 'Contractor' ? 'Contractor' : 'Vendor';
    const entityName = selectedOption?.label || '';
    const projectName = selectedSite?.label || '';
    doc.setFontSize(12);
    doc.text(`${entityType} - ${entityName}`, 14, 20);
    const pageWidth = doc.internal.pageSize.getWidth();
    const projectText = `Project Name: ${projectName}`;
    const textWidth = doc.getTextWidth(projectText);
    doc.text(projectText, pageWidth - textWidth - 14, 20);
    const filteredData = filterEntriesForSideTable(advanceData, selectedOption, selectedSite)
      .sort((a, b) => {
        const typeOrder = ['Advance', 'Bill Settlement', 'Refund', 'Transfer'];
        const typeIndexA = typeOrder.indexOf((a.type || '').trim());
        const typeIndexB = typeOrder.indexOf((b.type || '').trim());
        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
        const modeA = (a.payment_mode || '').trim().toLowerCase();
        const modeB = (b.payment_mode || '').trim().toLowerCase();
        if (!modeA && modeB) return 1;
        if (modeA && !modeB) return -1;
        return modeA.localeCompare(modeB);
      });
    const tableColumn = [
      'S.No',
      'Date',
      'Advance',
      'Bill Amount',
      'Discount',
      'Refund Amount',
      'Transfer',
      'Type',
      'Mode',
      'Description',
    ];
    const tableRows = filteredData.map((entry, index) => {
      const {
        date,
        amount,
        bill_amount,
        discount_amount,
        type,
        transfer_site_id,
        payment_mode,
        refund_amount,
        description,
      } = entry;
      const advanceAmount =
        type === 'Refund' ? '' : parseFloat(amount || 0).toLocaleString('en-IN');
      const billAmount =
        type === 'Bill Settlement'
          ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
          : '';
      const discountDisplay =
        type === 'Bill Settlement' && (parseFloat(discount_amount) || 0) > 0
          ? parseFloat(discount_amount).toLocaleString('en-IN')
          : '';
      const refundAmount =
        type === 'Refund'
          ? parseFloat(refund_amount || 0).toLocaleString('en-IN')
          : '';
      let transferText = '';
      if (type === 'Transfer') {
        const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
        transferText =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }
      return [
        index + 1,
        new Date(date).toLocaleDateString('en-GB'),
        advanceAmount,
        billAmount,
        discountDisplay,
        refundAmount,
        transferText,
        type,
        payment_mode || '',
        description || '',
      ];
    });
    doc.autoTable({
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { halign: 'left' },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.1,
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
    });
    doc.save('Advance_Report.pdf');
  };

  const exportCSV = () => {
    const entityType = selectedOption?.type === 'Contractor' ? 'Contractor' : 'Vendor';
    const entityName = selectedOption?.label || '';
    const projectName = selectedSite?.label || '';
    const filteredData = filterEntriesForSideTable(advanceData, selectedOption, selectedSite);
    const rows = filteredData.map((entry, index) => {
      const { date, amount, bill_amount, discount_amount, type, transfer_site_id, payment_mode, refund_amount } = entry;
      const advanceAmount = (() => {
        if (type === 'Refund') {
          return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
        }
        return parseFloat(amount || 0).toLocaleString('en-IN');
      })();
      const billAmount =
        type === 'Bill Settlement'
          ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
          : '';
      const discountCsv =
        type === 'Bill Settlement' && (parseFloat(discount_amount) || 0) > 0
          ? parseFloat(discount_amount).toLocaleString('en-IN')
          : '';
      let transferOrRefund = '';
      if (type === 'Refund') {
        transferOrRefund = 'Refund';
      } else if (type === 'Transfer') {
        const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
        transferOrRefund =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }
      return {
        'S.No': index + 1,
        Date: new Date(date).toLocaleDateString('en-GB'),
        Advance: advanceAmount,
        Bill: billAmount,
        Discount: discountCsv,
        'Transfer/Refund': transferOrRefund,
        Mode: payment_mode || '',
      };
    });
    let csv = `${entityType}: ${entityName},Project Name: ${projectName}\n\n`;
    csv += `${Object.keys(rows[0] || {}).join(',')}\n`;
    rows.forEach((row) => {
      csv += `${Object.values(row).map((value) => `"${value}"`).join(',')}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Advance_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end mb-4 gap-4">
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={projectAdvance}
            className="border-2 w-[112px] p-2 border-[#E4572E] text-[#E4572E] font-bold border-opacity-10 rounded h-[33px] bg-[#F2F2F2] focus:outline-none text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-[12px]">
          <span onClick={exportPDF} className="text-[#E4572E] font-semibold hover:underline flex cursor-pointer text-sm">PDF<img src={Pdf} alt="Pdf" className="w-4 h-4" /></span>
          <span onClick={exportCSV} className="text-[#007233] font-semibold hover:underline flex cursor-pointer text-sm">XL<img src={XL} alt="XL" className="w-4 h-4" /></span>
        </div>
      </div>
      <div className="border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden w-full">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto thin-scrollbar w-full">
          <table className={`table-fixed w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS}`}>
            <thead className="sticky top-0 z-10 bg-white">
              <EdbcTableHeaderRow>
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC2} label="Date" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Advance" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Bill" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Discount" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC3} label="Transfer/Refund" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC13} label="Mode" />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label="Activity" />
              </EdbcTableHeaderRow>
            </thead>
            <tbody>
              {!selectedOption || !selectedSite ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-sm text-gray-500">
                    Please select a contractor/vendor and project to view advance records.
                  </td>
                </tr>
              ) : tableEntries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-sm text-gray-500">
                    No records found for the selected contractor/vendor and project.
                  </td>
                </tr>
              ) : (
                tableEntries.map((entry, index) => {
                  const row = toExpenseRow(entry);
                  const { advanceAmount, billAmount, discountDisplay, transferOrRefund, payment_mode } =
                    getEntryRowDisplay(entry, siteOptions);
                  const rowKey = entry.advancePortalId ?? index;
                  return (
                    <EdbcTableBodyRow key={rowKey}>
                      <EdbcDateBodyCell
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={(date) => new Date(date).toLocaleDateString('en-GB')}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC8}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={() => advanceAmount}
                      />
                      <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                        <span
                          onClick={() => toggleExpandedCell(`${rowKey}-bill_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${rowKey}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={billAmount}
                        >
                          {billAmount}
                        </span>
                      </td>
                      <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                        <span
                          onClick={() => toggleExpandedCell(`${rowKey}-discount_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${rowKey}-discount_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={discountDisplay}
                        >
                          {discountDisplay}
                        </span>
                      </td>
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC3}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={() => transferOrRefund}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC13}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={() => payment_mode}
                      />
                      <td id={EDBC_IDS.EDBC19} className={edbc19TdClass}>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button type="button" className="rounded-full transition duration-200">
                            <img
                              src={edit}
                              onClick={() => onEditClick(entry)}
                              alt="Edit"
                              className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                            />
                          </button>
                          {entry.file_url ? (
                            <a
                              href={entry.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer"
                              title="View File"
                            >
                              <img
                                src={file}
                                className="w-5 h-4 transform hover:scale-110 transition duration-200"
                                alt="View File"
                                style={{ filter: 'invert(0%) brightness(0%)' }}
                              />
                            </a>
                          ) : (
                            <div className="opacity-30">
                              <img
                                src={file}
                                className="w-5 h-4"
                                alt="No File"
                                title="No file attached"
                                style={{ filter: 'invert(0%) brightness(0%)' }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </EdbcTableBodyRow>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SideTable;
