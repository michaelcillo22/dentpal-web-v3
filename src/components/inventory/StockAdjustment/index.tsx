
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useProductSearch from '@/hooks/useProductSearch';
import useProductVariations from '@/hooks/useProductVariations';
import StockAdjustmentModal from './StockAdjustmentModal';
import { batchAdjustVariationStock } from '@/services/stockAdjustment';
import { logStockAdjustment } from '../../../services/logAdjustment';

const StockAdjustment: React.FC = () => {
	const { uid, role } = useAuth();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [reason, setReason] = useState('Receive Items');
  const [notes, setNotes] = useState('');
  const [variationAdjustments, setVariationAdjustments] = useState<{[id: string]: number}>({});
  const [selectedVariations, setSelectedVariations] = useState<{[id: string]: boolean}>({});
  const [modalError, setModalError] = useState('');

  const { results, loading, error, searchProducts } = useProductSearch(uid);
  const { variations, fetchVariations } = useProductVariations();

  const handleSearch = (e: React.FormEvent) => {
	e.preventDefault();
	searchProducts(search);
  };

  const handleAdjustClick = async (row: any) => {
	setSelectedProduct(row);
	setModalOpen(true);
	await fetchVariations(row.id);
	setVariationAdjustments({});
  };

  const handleModalSubmit = () => {
	setModalError('');
	if (!notes.trim()) {
		setModalError('Notes are required.');
		return;
	}
	if (!selectedProduct) {
		setModalError('No product selected.');
		return;
	}
	// Prepare adjustments array for batch update with correct logic
	const adjustments = Object.entries(variationAdjustments)
	  .filter(([_, val]) => typeof val === 'number')
	  .map(([variationId, inputValue]) => {
	    const variation = variations.find(v => v.id === variationId);
	    const currentStock = variation?.stock ?? 0;
	    let newStock = currentStock;
	    if (reason === 'Receive Items') {
	      newStock = currentStock + inputValue;
	    } else if (reason === 'Inventory Count') {
	      newStock = inputValue;
	    } else if (reason === 'Loss/Damage') {
	      newStock = currentStock - inputValue;
	    }
	    return { variationId, newStock };
	  });
	if (adjustments.length === 0) {
	  setModalError('No stock adjustments entered.');
	  return;
	}
	batchAdjustVariationStock(selectedProduct.id, adjustments)
		.then(async () => {
			// Log each adjustment
			for (const adj of adjustments) {
				const variation = variations.find(v => v.id === adj.variationId);
				await logStockAdjustment({
					productId: selectedProduct.id || '',
					productName: selectedProduct.product || selectedProduct.name || '',
					sellerId: selectedProduct.sellerId || '',
					userId: uid || '',
					userName: selectedProduct.userName || selectedProduct.sellerName || '',
					variationId: variation?.id || '',
					variationName: variation?.name || '',
					beforeStock: variation?.stock ?? 0,
					afterStock: adj.newStock,
					action: reason || '',
					reason: notes || '',
					adjustment: adj.newStock - (variation?.stock ?? 0)
				});
			}
			setModalOpen(false);
			setNotes('');
			setVariationAdjustments({});
		})
		.catch(err => {
			setModalError('Failed to update stock: ' + (err?.message || 'Unknown error'));
		});
  };

  return (
	<div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 0' }}>
	  <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
		<input
		  type="text"
		  placeholder="Search product to adjust..."
		  value={search}
		  onChange={e => setSearch(e.target.value)}
		  style={{
			flex: 1,
			padding: '12px 18px',
			borderRadius: 8,
			border: '1.5px solid #3bb764',
			fontSize: 16,
			outline: 'none',
			boxShadow: '0 1px 4px 0 #3bb76411',
			transition: 'border 0.2s',
		  }}
		/>
		<button
		  type="submit"
		  style={{
			background: '#3bb764',
			color: '#fff',
			border: 'none',
			borderRadius: 8,
			padding: '12px 28px',
			fontWeight: 600,
			fontSize: 16,
			cursor: 'pointer',
			boxShadow: '0 2px 8px 0 #3bb76422',
			transition: 'background 0.2s',
		  }}
		  disabled={loading || !search.trim()}
		>
		  {loading ? 'Searching...' : 'Search'}
		</button>
	  </form>
	  {results.length > 0 && (
		<div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 0, overflow: 'hidden' }}>
		  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
			<thead style={{ background: '#f3f4f6' }}>
			  <tr>
				<th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, color: '#222' }}>Adjust No.</th>
				<th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, color: '#222' }}>Product</th>
				<th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, color: '#222' }}>Current Stock</th>
				<th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, color: '#222' }}>Action</th>
			  </tr>
			</thead>
						<tbody>
							{results.map((row, idx) => {
								// Generate sellerShortId and productShortId
								const sellerId = row.sellerId || uid || '';
								const productId = row.id || '';
								const sellerShortId = sellerId.length >= 6 ? sellerId.slice(0,3) + sellerId.slice(-3) : sellerId;
								const productShortId = productId.length >= 6 ? productId.slice(0,3) + productId.slice(-3) : productId;
								const adjustNo = `DNTPL-${sellerShortId}-${productShortId}-ADJ-${row.adjustNo}`;
								return (
									<tr
										key={row.id}
										style={{
											borderBottom: '1px solid #f1f1f1',
											cursor: 'pointer',
											transition: 'background 0.15s',
										}}
										onClick={() => handleAdjustClick(row)}
										onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
										onMouseOut={e => (e.currentTarget.style.background = '')}
									>
										<td style={{ padding: '14px 12px', color: '#3bb764', fontWeight: 600 }}>{adjustNo}</td>
										<td style={{ padding: '14px 12px' }}>
											<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
												{row.imageUrl || row.imageURL ? (
													<img
														src={row.imageUrl || row.imageURL}
														alt={row.product}
														style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: '#f3f4f6' }}
													/>
												) : (
													<div style={{ width: 40, height: 40, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 18 }}>
														<span role="img" aria-label="product">📦</span>
													</div>
												)}
												<span>{row.product}</span>
											</div>
										</td>
										<td style={{ padding: '14px 12px' }}>{row.stock}</td>
										<td style={{ padding: '14px 12px', textAlign: 'center' }}>
											<button
												style={{
													background: '#2563eb',
													color: '#fff',
													border: 'none',
													borderRadius: 6,
													padding: '8px 20px',
													fontWeight: 500,
													cursor: 'pointer',
													fontSize: 15,
													boxShadow: '0 1px 4px #2563eb22',
													transition: 'background 0.2s',
												}}
												onClick={e => {
													e.stopPropagation();
													handleAdjustClick(row);
												}}
											>
												Adjust
											</button>
										</td>
									</tr>
								);
							})}
			</tbody>
		  </table>
		</div>
	  )}
	  <StockAdjustmentModal
		open={modalOpen}
		onClose={() => setModalOpen(false)}
		reason={reason}
		setReason={setReason}
		notes={notes}
		setNotes={setNotes}
		variations={variations}
		variationAdjustments={variationAdjustments}
		setVariationAdjustments={setVariationAdjustments}
		selectedVariations={selectedVariations}
		setSelectedVariations={setSelectedVariations}
		modalError={modalError}
		onSubmit={handleModalSubmit}
	  />
	  {error && (
		<div style={{ textAlign: 'center', color: '#dc2626', marginTop: 40, fontSize: 18, padding: '20px', background: '#fee', borderRadius: 8 }}>
		  {error}
		</div>
	  )}
	</div>
	);
};

export default StockAdjustment;