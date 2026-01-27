import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  name: string;
  imageUrl?: string;
}

interface ImageSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

const ImageSelect: React.FC<ImageSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(opt => opt.id === value);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1.5px solid #3bb764',
          borderRadius: 8,
          padding: '8px 12px',
          background: '#fff',
          cursor: 'pointer',
          minHeight: 44,
        }}
        onClick={() => setOpen(o => !o)}
      >
        {selected && (selected.imageUrl ? (
          <img src={selected.imageUrl} alt={selected.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', marginRight: 10 }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 18, marginRight: 10 }}>
            <span role="img" aria-label="variation">📦</span>
          </div>
        ))}
        <span style={{ flex: 1, color: selected ? '#222' : '#888' }}>{selected ? selected.name : (placeholder || 'Select...')}</span>
        <span style={{ marginLeft: 8, color: '#888' }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          width: '100%',
          background: '#fff',
          border: '1.5px solid #3bb764',
          borderRadius: 8,
          boxShadow: '0 2px 12px #0001',
          zIndex: 10,
          maxHeight: 220,
          overflowY: 'auto',
        }}>
          {options.map(opt => (
            <div
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                background: value === opt.id ? '#f3f4f6' : '#fff',
                borderBottom: '1px solid #f1f1f1',
              }}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
            >
              {opt.imageUrl ? (
                <img src={opt.imageUrl} alt={opt.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', marginRight: 10 }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 18, marginRight: 10 }}>
                  <span role="img" aria-label="variation">📦</span>
                </div>
              )}
              <span>{opt.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSelect;
