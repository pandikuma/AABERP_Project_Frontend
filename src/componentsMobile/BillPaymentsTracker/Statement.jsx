import React, { useEffect, useMemo, useState } from 'react';
import Filter from '../Images/Filter.png';
import Download from '../Images/Download.svg';

const ModeTag = ({ label }) => (
	<div className="px-[10px] h-[22px] rounded-full text-[11px] font-semibold flex items-center" style={{ background: '#F5E8FB', color: '#7C3AED' }}>
		{label}
	</div>
);

const StatementRow = ({
	title,
	vendor,
	mode,
	paidAmount,
	overallAmount,
	onOpenPaidBill,
	onOpenOverallPdf,
	dateLineNode,
	vDate,
	eDate,
	pDate
}) => (
	<div className="w-full bg-white rounded-[12px] shadow-lg border border-[#E5E7EB] overflow-hidden px-[12px] py-[10px] box-border">
		{/* Row 1: Bills (left) + Mode (right) */}
		<div className="flex items-start justify-between gap-[12px]">
			<p className="flex-1 min-w-0 text-left text-[12px] font-bold text-[#6B7280] leading-[18px] truncate">
				{title}
			</p>
			<div className="flex-shrink-0">
				<ModeTag label={mode} />
			</div>
		</div>

		{/* Row 2: Vendor (left) + Paid amount (right) */}
		<div className="flex items-start justify-between gap-[12px] mt-[2px]">
			<p className="flex-1 min-w-0 text-left text-[12px] font-semibold text-[#111827] leading-[18px] truncate">
				{vendor}
			</p>
			<button
				type="button"
				onClick={onOpenPaidBill}
				disabled={!onOpenPaidBill}
				className="flex-shrink-0 text-[14px] font-bold text-[#0F766E] leading-[20px] disabled:opacity-60"
				style={{ textDecoration: 'underline' }}
			>
				₹{paidAmount}
			</button>
		</div>

		{/* Row 3: Date/time (left) + Bill amount (right) */}
		<div className="flex items-start justify-between gap-[12px] mt-[6px]">
			<p className="flex-1 min-w-0 text-left text-[11px] font-medium text-[#6B7280] leading-[16px] break-words">
				{dateLineNode || '-'}
			</p>
			<button
				type="button"
				onClick={onOpenOverallPdf}
				disabled={!onOpenOverallPdf}
				className="flex-shrink-0 text-[12px] font-bold text-[#111827] leading-[18px] disabled:opacity-60"
				style={{ textDecoration: 'underline' }}
			>
				₹{overallAmount}
			</button>
		</div>

		{/* Row 4: V/E/P */}
		<p className="text-left text-[11px] font-semibold text-[#6B7280] leading-[16px] mt-[6px]">
			V - {vDate} &nbsp;&nbsp; E - {eDate} &nbsp;&nbsp; P - {pDate}
		</p>
	</div>
);

const StatementMobile = () => {
	// Note: legacy backend uses different base paths for names vs tracker modules.
	const API_BASE = 'https://backendaab.in/aabuildersDash/api';
	const NAMES_BASE = 'https://backendaab.in/aabuilderDash/api';

	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [trackers, setTrackers] = useState([]);
	const [vendorMap, setVendorMap] = useState({});
	const [allBillEntries, setAllBillEntries] = useState([]);
	const [paymentInfo, setPaymentInfo] = useState({}); // { [trackerId]: [{ date, rawDate, mode, amount, billUrl }] }

	const parseDateAny = (input) => {
		if (input == null || input === '') return null;
		if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
		if (Array.isArray(input)) {
			const y = input[0];
			const mo = input[1];
			const d = input[2];
			const h = input[3] ?? 0;
			const mi = input[4] ?? 0;
			const s = input[5] ?? 0;
			if (y == null || mo == null || d == null) return null;
			const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
			return isNaN(dt.getTime()) ? null : dt;
		}
		if (typeof input === 'string') {
			const trimmed = input.trim();
			if (!trimmed) return null;
			const slash = trimmed.match(
				/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*,\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
			);
			if (slash) {
				const [, dd, mm, yyyy, HH, MM, SS] = slash;
				const dt = new Date(
					Number(yyyy),
					Number(mm) - 1,
					Number(dd),
					Number(HH ?? 0),
					Number(MM ?? 0),
					Number(SS ?? 0)
				);
				return isNaN(dt.getTime()) ? null : dt;
			}
			const dt = new Date(trimmed);
			return isNaN(dt.getTime()) ? null : dt;
		}
		if (typeof input === 'number' && Number.isFinite(input)) {
			const dt = new Date(input);
			return isNaN(dt.getTime()) ? null : dt;
		}
		return null;
	};

	const formatDdMmYyyy = (d) => {
		if (!d || isNaN(d.getTime())) return '-';
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		return `${dd}/${mm}/${yyyy}`;
	};

	const formatTime12h = (d) => {
		if (!d || isNaN(d.getTime())) return '-';
		let hours = d.getHours();
		const minutes = String(d.getMinutes()).padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? String(hours).padStart(2, '0') : '12';
		return `${hours}:${minutes} ${ampm}`;
	};

	const relativeOrDate = (d) => {
		if (!d || isNaN(d.getTime())) return '-';
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		if (dateOnly.getTime() === today.getTime()) return 'Today';
		if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
		return formatDdMmYyyy(d);
	};

	const formatInr = (amount) => {
		const n = Number(amount);
		if (!Number.isFinite(n)) return '-';
		return parseInt(Math.abs(n), 10).toLocaleString('en-IN');
	};

	const getVendorNameById = (vendorId) => {
		if (vendorId == null) return 'Unknown Vendor';
		return vendorMap[vendorId] || vendorMap[String(vendorId)] || 'Unknown Vendor';
	};

	const getBillVerificationDate = (item) => {
		const verifications = item?.billVerifications || item?.bill_verifications || [];
		if (!Array.isArray(verifications) || verifications.length === 0) return '-';
		const verifiedBills = verifications.filter(v => v?.is_verified === true || v?.status === 'VERIFIED');
		if (verifiedBills.length === 0) return '-';
		const dates = verifiedBills
			.map(v => v?.verified_date || v?.verification_date || v?.created_at || v?.updated_at || v?.timestamp || v?.date)
			.map(parseDateAny)
			.filter(Boolean)
			.sort((a, b) => a - b);
		if (dates.length === 0) return '-';
		return formatDdMmYyyy(dates[dates.length - 1]); // latest
	};

	const getEntryDate = (trackerId) => {
		const entries = (Array.isArray(allBillEntries) ? allBillEntries : []).filter((e) => {
			const id = e?.vendor_payments_tracker_id ?? e?.vendorPaymentsTrackerId;
			return String(id ?? '') === String(trackerId ?? '');
		});
		if (entries.length === 0) return '-';
		const dates = entries
			.map(e => e?.entered_date ?? e?.enteredDate)
			.map(parseDateAny)
			.filter(Boolean)
			.sort((a, b) => a - b);
		if (dates.length === 0) return '-';
		return formatDdMmYyyy(dates[dates.length - 1]); // latest
	};

	const openUrl = (url) => {
		if (!url) return;
		const s = String(url || '').trim();
		if (!/^(https?:\/\/)/i.test(s)) return;
		window.open(s, '_blank', 'noopener,noreferrer');
	};

	const getPaymentInfo = async (trackerId) => {
		try {
			const res = await fetch(`${API_BASE}/vendor-bill-tracker/get/${trackerId}`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!res.ok) return [];
			const paymentDetails = await res.json().catch(() => []);
			if (!paymentDetails || paymentDetails.length === 0) return [];
			return paymentDetails.map((payment) => {
				const rawUrl = payment?.bill_url || payment?.file_url || payment?.document_url || payment?.bill_document_url || payment?.url;
				const isHttpUrl = typeof rawUrl === 'string' && /^(http|https):\/\//i.test(rawUrl);
				const rawDate = payment?.date;
				const amount = parseFloat(payment?.amount) || 0;
				const carryForwardAmount = parseFloat(payment?.carry_forward_amount) || 0;
				const totalAmount = amount + carryForwardAmount;
				return {
					date: rawDate ? formatDdMmYyyy(parseDateAny(rawDate)) : '-',
					rawDate: rawDate || null,
					mode: payment?.vendor_bill_payment_mode || '-',
					amount: totalAmount > 0 ? totalAmount : (payment?.amount || payment?.payment_amount || '-'),
					billUrl: isHttpUrl ? rawUrl : null
				};
			});
		} catch {
			return [];
		}
	};

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const [vendorsRes, trackersRes, entriesRes] = await Promise.all([
					// Desktop BillStatement.js uses /aabuilderDash for vendor names.
					fetch(`${NAMES_BASE}/vendor_Names/getAll`, { method: 'GET', credentials: 'include' }),
					fetch(`${API_BASE}/vendor-payments/trackers`, { method: 'GET', credentials: 'include' }),
					fetch(`${API_BASE}/bill-entry/getAll`, { method: 'GET', credentials: 'include' })
				]);

				const vendors = vendorsRes.ok ? await vendorsRes.json().catch(() => []) : [];
				const trackerList = trackersRes.ok ? await trackersRes.json().catch(() => []) : [];
				const entries = entriesRes.ok ? await entriesRes.json().catch(() => []) : [];
				if (!mounted) return;

				const vMap = {};
				(Array.isArray(vendors) ? vendors : []).forEach((v) => {
					const id = v?.id;
					const name = v?.vendorName ?? v?.name ?? v?.label;
					if (id != null && name) {
						vMap[id] = name;
						vMap[String(id)] = name;
					}
				});
				setVendorMap(vMap);
				setTrackers(Array.isArray(trackerList) ? trackerList : []);
				setAllBillEntries(Array.isArray(entries) ? entries : []);

				// Load payment info per tracker (same as desktop statement)
				const paymentData = {};
				for (const t of (Array.isArray(trackerList) ? trackerList : [])) {
					const id = t?.id;
					if (id == null) continue;
					// eslint-disable-next-line no-await-in-loop
					paymentData[id] = await getPaymentInfo(id);
				}
				if (!mounted) return;
				setPaymentInfo(paymentData);
			} catch (e) {
				if (!mounted) return;
				setError(e?.message || 'Failed to load statement');
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, []);

	const statementRows = useMemo(() => {
		const list = Array.isArray(trackers) ? trackers : [];
		const rows = [];
		list.forEach((t) => {
			const id = t?.id;
			const vendorId = t?.vendor_id ?? t?.vendorId;
			const vendorName = getVendorNameById(vendorId);
			const noOfBills = t?.no_of_bills ?? t?.noOfBills ?? '-';
			const totalAmount = t?.total_amount ?? t?.totalAmount ?? '-';
			const overallPdfUrl = t?.over_all_payment_pdf_url || t?.overAllPaymentPdfUrl || null;

			const yearCandidate =
				parseDateAny(t?.timestamp ?? t?.created_at ?? t?.createdAt ?? t?.bill_arrival_date ?? t?.billArrivalDate);
			const year = yearCandidate ? yearCandidate.getFullYear() : '';
			const title = `${id ?? ''}${year ? ` - ${year}` : ''} - Bills ${noOfBills}`;

			const vDate = getBillVerificationDate(t);
			const eDate = getEntryDate(id);

			const payments = paymentInfo?.[id] || [];
			if (!Array.isArray(payments) || payments.length === 0) {
				rows.push({
					key: `t-${id}`,
					title,
					vendorName,
					mode: '-',
					paidAmount: '-',
					overallAmount: totalAmount !== '-' ? formatInr(totalAmount) : '-',
					dateLineParts: null,
					vDate,
					eDate,
					pDate: '-',
					billUrl: null,
					overallPdfUrl: overallPdfUrl
				});
				return;
			}
			payments.forEach((pay, idx) => {
				const arrivalDate = parseDateAny(t?.bill_arrival_date ?? t?.billArrivalDate);
				const payDateObj = parseDateAny(pay?.rawDate);
				const seg1 = arrivalDate ? relativeOrDate(arrivalDate) : (payDateObj ? relativeOrDate(payDateObj) : '-');
				const seg2 = payDateObj ? formatDdMmYyyy(payDateObj) : '-';
				const seg3 = payDateObj ? formatTime12h(payDateObj) : '-';

				const dateLineNode = (
					<>
						<span className="font-bold text-[#111827]">{seg1}</span>
						<span className="font-medium text-[#777777]"> • </span>
						<span className="font-medium text-[#777777]">{seg2}</span>
						<span className="font-medium text-[#777777]"> • </span>
						<span className="font-medium text-[#777777]">{seg3}</span>
					</>
				);

				const isLastPayment = idx === payments.length - 1;
				rows.push({
					key: `t-${id}-p-${idx}`,
					title,
					vendorName,
					mode: pay?.mode || '-',
					paidAmount: pay?.amount !== '-' ? formatInr(pay.amount) : '-',
					overallAmount: totalAmount !== '-' ? formatInr(totalAmount) : '-',
					dateLineNode,
					vDate,
					eDate,
					pDate: pay?.date || '-',
					billUrl: pay?.billUrl || null,
					overallPdfUrl: isLastPayment ? overallPdfUrl : null
				});
			});
		});
		// Basic vendor search (mobile)
		if (!query) return rows;
		const q = query.toLowerCase();
		return rows.filter((r) => (r.vendorName || '').toLowerCase().includes(q));
	}, [trackers, vendorMap, allBillEntries, paymentInfo, query]);

	return (
		<div className="w-full h-[calc(100vh-96px-80px)] overflow-hidden flex flex-col">
			<div className="flex-shrink-0">
				<div className="flex items-center justify-between border-b border-[#E0E0E0] pt-[8px] pb-[8px]">
					<p className="text-[12px] font-semibold text-[#111827]">Vendor</p>
					<p className="text-[12px] font-semibold text-[#111827]">Mode</p>
				</div>
				<div className="mt-[8px]">
					<div className="w-full h-[36px] rounded-[24px] bg-white border border-[#E5E7EB] flex items-center px-[12px]">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="1.5" />
							<path d="M20 20L17 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
						</svg>
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search"
							className="ml-[8px] flex-1 outline-none text-[12px] font-semibold text-[#111827] placeholder-[#9CA3AF]"
							style={{ background: 'transparent' }}
						/>
					</div>
				</div>
				<div className="flex justify-between items-center gap-[4px] px-0 flex-shrink-0">
					<div className="flex items-center gap-[4px] min-w-0">
						<button type="button" className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0">
							<img src={Filter} alt="Filter" className="w-[13px] h-[11px]" />
							<span className="text-[12px] font-medium text-black flex-shrink-0">Filter</span>
						</button>
					</div>
					<button type="button" className="w-[34px] h-[34px] bg-white flex items-center justify-center">
						<img src={Download} alt="Download" className="w-4 h-4" />
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none pb-[10px]">
				<div className="flex flex-col">
					{!loading && statementRows.length === 0 && !error && (
						<p className="text-[12px] text-center text-[#6B7280] mt-[6px]">No data</p>
					)}
					{statementRows.map((r) => (
						<StatementRow
							key={r.key}
							title={r.title}
							vendor={r.vendorName}
							mode={r.mode}
							paidAmount={r.paidAmount}
							overallAmount={r.overallAmount}
							dateLineNode={r.dateLineNode}
							vDate={r.vDate}
							eDate={r.eDate}
							pDate={r.pDate}
							onOpenPaidBill={r.billUrl ? () => openUrl(r.billUrl) : null}
							onOpenOverallPdf={r.overallPdfUrl ? () => openUrl(r.overallPdfUrl) : null}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default StatementMobile;

