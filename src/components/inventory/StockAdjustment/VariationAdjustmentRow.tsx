import React from 'react';

interface VariationAdjustmentRowProps {
  variation: any;
  value: number;
  type: 'add' | 'count' | 'remove';
  onChange: (val: number) => void;
  disabled?: boolean;
}

const VariationAdjustmentRow: React.FC<VariationAdjustmentRowProps> = ({ variation, value, type, onChange, disabled }) => {
  let label = '';
  let stockAfter = variation.stock;
  if (type === 'add') {
    label = 'Add Stock:';
    stockAfter = (variation.stock ?? 0) + (value ?? 0);
  } else if (type === 'count') {
    label = 'Counted Stock:';
    stockAfter = value;
  } else if (type === 'remove') {
    label = 'Remove Stock:';
    stockAfter = (variation.stock ?? 0) - (value ?? 0);
  }

  return (
    <div style={{ marginBottom: 16, padding: 10, border: '1px solid #eee', borderRadius: 8 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontWeight: 500 }}>{variation.name || variation.id}</span>
      </div>
      <div style={{ marginBottom: 6 }}>
        <label>In Stock: </label>
        <span>{variation.stock ?? 0}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ marginRight: 8 }}>{label}</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value === 0 ? '' : value}
          onChange={e => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) {
              onChange(val === '' ? 0 : Number(val));
            }
          }}
          disabled={!!disabled}
          style={{
            width: 100,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1.5px solid #3bb764',
            background: disabled ? '#f3f3f3' : '#f6fff8',
            fontSize: 16,
            fontWeight: 500,
            outline: 'none',
            boxShadow: '0 1px 4px 0 #3bb76411',
            transition: 'border 0.2s',
          }}
        />
      </div>
      <div>
        <label>Stock After: </label>
        <span>{stockAfter}</span>
      </div>
    </div>
  );
};

export default VariationAdjustmentRow;
