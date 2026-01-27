import React from 'react';
import ImageSelect from './ImageSelect';
import VariationAdjustmentRow from './VariationAdjustmentRow';

interface StockAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  reason: string;
  setReason: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  variations: any[];
  variationAdjustments: { [id: string]: number };
  setVariationAdjustments: (cb: (prev: { [id: string]: number }) => { [id: string]: number }) => void;
  selectedVariations?: { [id: string]: boolean };
  setSelectedVariations?: (cb: (prev: { [id: string]: boolean }) => { [id: string]: boolean }) => void;
  modalError: string;
  onSubmit: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  open,
  onClose,
  reason,
  setReason,
  notes,
  setNotes,
  variations,
  variationAdjustments,
  setVariationAdjustments,
  selectedVariations = {},
  setSelectedVariations = () => {},
  modalError,
  onSubmit,
}) => {
  if (!open) return null;

  let type: 'add' | 'count' | 'remove' = 'add';
  if (reason === 'Inventory Count') type = 'count';
  if (reason === 'Loss/Damage') type = 'remove';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, boxShadow: '0 2px 16px #0002', position: 'relative' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Inventory - Stock Adjustment</h2>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Selected Reason</label><br />
          <select value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6 }}>
            <option>Receive Items</option>
            <option>Inventory Count</option>
            <option>Loss/Damage</option>
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600 }}>Notes</label><br />
          <textarea
            value={notes}
            onChange={e => {
              let val = e.target.value;
              if (val.length > 500) val = val.slice(0, 500);
              setNotes(val);
            }}
            style={{ width: '100%', padding: 8, marginTop: 6 }}
            rows={2}
            maxLength={500}
            required
            placeholder="Enter notes"
          />
          <div style={{ fontSize: 13, color: '#888', marginTop: 4, textAlign: 'right' }}>{notes.length}/500</div>
        </div>
        {variations.length > 0 && (
          <>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 600 }}>Select Variation</label><br />
              <ImageSelect
                options={variations.map(v => ({
                  id: v.id,
                  name: v.name || v.id,
                  imageUrl: v.imageURL || v.imageUrl,
                }))}
                value={Object.keys(selectedVariations).find(id => selectedVariations[id]) || ''}
                onChange={selectedId => {
                  setSelectedVariations(() => {
                    const obj: { [id: string]: boolean } = {};
                    variations.forEach(v => { obj[v.id] = v.id === selectedId; });
                    return obj;
                  });
                  // Reset adjustment value for new selection
                  setVariationAdjustments(prev => {
                    const obj: { [id: string]: number } = {};
                    variations.forEach(v => { obj[v.id] = v.id === selectedId ? prev[v.id] || 0 : 0; });
                    return obj;
                  });
                }}
                placeholder="-- Select Variation --"
              />
            </div>
            {variations.map(variation => (
              selectedVariations[variation.id] ? (
                <div key={variation.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {(variation.imageURL || variation.imageUrl) ? (
                    <img
                      src={variation.imageURL || variation.imageUrl}
                      alt={variation.name || variation.id}
                      style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', background: '#f3f4f6', marginTop: 4 }}
                    />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 28, marginTop: 4 }}>
                      <span role="img" aria-label="variation">📦</span>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <VariationAdjustmentRow
                      variation={variation}
                      value={variationAdjustments[variation.id] || 0}
                      type={type}
                      onChange={val => setVariationAdjustments(prev => ({ ...prev, [variation.id]: val }))}
                      disabled={false}
                    />
                  </div>
                </div>
              ) : null
            ))}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 6, background: '#eee', fontWeight: 500 }}>Cancel</button>
          <button
            style={{ padding: '8px 20px', borderRadius: 6, background: '#3bb764', color: '#fff', fontWeight: 500, boxShadow: '0 2px 8px 0 #3bb76422', border: 'none', fontSize: 16, transition: 'background 0.2s' }}
            onClick={e => {
              e.preventDefault();
              onSubmit();
            }}
          >Submit</button>
        </div>
        {modalError && (
          <div style={{ color: '#dc2626', marginTop: 12, fontSize: 15, fontWeight: 500, textAlign: 'center' }}>{modalError}</div>
        )}
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
