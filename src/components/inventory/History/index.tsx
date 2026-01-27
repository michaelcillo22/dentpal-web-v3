import React, { useState } from 'react';
import { useAllLogsHistory } from './useAllLogsHistory';

type DateRange = { start: Date | null; end: Date | null };
import DateRangePicker from '@/components/ui/DateRangePicker';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';

const History: React.FC = () => {
	const { logs, loading } = useAllLogsHistory();
	const [search, setSearch] = useState('');
	const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
	const [selectedLog, setSelectedLog] = useState<any | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	// Filter logs by search, date, and adjustment !== 0
		const filteredLogs = logs.filter(row => {
			if (row.adjustment === 0) return false;
			const matchesSearch =
				!search ||
				row.productName?.toLowerCase().includes(search.toLowerCase()) ||
				row.variationName?.toLowerCase().includes(search.toLowerCase()) ||
				row.reason?.toLowerCase().includes(search.toLowerCase()) ||
				row.modifiedByName?.toLowerCase().includes(search.toLowerCase());
			// Use timestampRaw for reliable date filtering
			let logDate: Date | null = null;
			if (row.timestampRaw) {
				if (typeof row.timestampRaw === 'number') {
					logDate = new Date(row.timestampRaw);
				} else if (typeof row.timestampRaw === 'string') {
					logDate = new Date(row.timestampRaw);
				}
			}
			const inDateRange =
				(!dateRange.start && !dateRange.end) ||
				(logDate && dateRange.start && dateRange.end &&
					logDate >= dateRange.start && logDate <= dateRange.end);
			return matchesSearch && inDateRange;
		});

	// Helper to format timestamp without milliseconds
	function formatTimestamp(ts: string): string {
		if (!ts) return '';
		const d = new Date(ts);
		if (isNaN(d.getTime())) return String(ts);
		return d.toLocaleString(undefined, {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
		});
	}

	return (
		<div className="max-w-7xl mx-auto py-8 px-4">
			<div className="flex gap-4 mb-6 items-center">
				<input
					type="text"
					placeholder="Search..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
				/>
				
				<DateRangePicker value={dateRange} onChange={setDateRange} label="Select date range" />
			</div>
			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<table className="w-full text-base">
					<thead className="bg-gray-50 border-b border-gray-200">
						<tr>
							<th className="px-5 py-3 text-left font-bold text-gray-700">Date</th>
							<th className="px-5 py-3 text-left font-bold text-gray-700">Restock</th>
							<th className="px-5 py-3 text-left font-bold text-gray-700">Adjustment By</th>
							<th className="px-5 py-3 text-left font-bold text-gray-700">Items</th>
							<th className="px-5 py-3 text-left font-bold text-gray-700">Action</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
						) : filteredLogs.length === 0 ? (
							<tr><td colSpan={5} className="text-center py-8">No history found.</td></tr>
						) : (
							filteredLogs.map((row, idx) => (
								<tr
									key={idx}
									className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
									onClick={() => { setSelectedLog(row); setSheetOpen(true); }}
								>
									<td className="px-5 py-3">{formatTimestamp(row.timestampRaw)}</td>
									<td className="px-5 py-3">{row.adjustment > 0 ? `+${row.adjustment}` : row.adjustment}</td>
									<td className="px-5 py-3">{row.modifiedByName}</td>
									<td className="px-5 py-3">{row.productName}{row.variationName ? ` (${row.variationName})` : ''}</td>
									<td className="px-5 py-3">{row.action}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Side panel for log details */}
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent side="right" style={{ minWidth: 400, maxWidth: 480, padding: 0, background: '#f9fafb' }}>
					<SheetHeader style={{ padding: '32px 32px 0 32px', borderBottom: '1px solid #e5e7eb', background: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
						<SheetTitle style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', letterSpacing: 0.5 }}>Inventory Log Details</SheetTitle>
					</SheetHeader>
					{selectedLog && (
						<div style={{ padding: 32, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Timestamp:</span>
								<span style={{ fontSize: 16, color: '#111827' }}>{formatTimestamp(selectedLog.timestampRaw)}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Action:</span>
								<span style={{ fontSize: 16, color: '#2563eb', fontWeight: 600 }}>{selectedLog.action}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Product Name:</span>
								<span style={{ fontSize: 16, color: '#111827' }}>{selectedLog.productName}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Modified by:</span>
								<span style={{ fontSize: 16, color: '#111827' }}>{selectedLog.modifiedByName}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Variant:</span>
								<span style={{ fontSize: 16, color: '#111827' }}>{selectedLog.variationName}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Reason:</span>
								<span style={{ fontSize: 16, color: '#111827' }}>{selectedLog.reason}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Adjustment:</span>
								<span style={{ fontSize: 16, fontWeight: 600, color: selectedLog.adjustment > 0 ? '#16a34a' : '#dc2626' }}>{selectedLog.adjustment > 0 ? `+${selectedLog.adjustment}` : selectedLog.adjustment}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Stock Before:</span>
								<span style={{ fontSize: 16, color: '#111827' }}>{selectedLog.beforeStock}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120 }}>Stock After:</span>
								<span style={{ fontSize: 16, color: '#111827' }}>{selectedLog.afterStock}</span>
							</div>
							<div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
								<span style={{ fontWeight: 600, color: '#6b7280', minWidth: 120, marginTop: 2 }}>Detail:</span>
								<span style={{ fontSize: 15, color: '#374151', whiteSpace: 'pre-line' }}>{selectedLog.detail}</span>
							</div>
						</div>
					)}
					<SheetClose asChild>
						<button style={{ margin: 0, marginTop: 12, marginBottom: 24, padding: '12px 0', borderRadius: 8, background: '#16a34a', color: '#fff', fontWeight: 600, width: 'calc(100% - 64px)', marginLeft: 32, marginRight: 32, fontSize: 16, boxShadow: '0 2px 8px #2563eb22', border: 'none', transition: 'background 0.2s' }}>Close</button>
					</SheetClose>
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default History;