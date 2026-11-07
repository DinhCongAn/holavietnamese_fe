import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function AdminFilterSelect({
  value,
  options = [],
  onChange,
  ariaLabel,
  minWidth = '190px',
  align = 'left',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div
      ref={containerRef}
      className={`admin-filter-select-wrapper ${className}`.trim()}
      style={{ position: 'relative', display: 'inline-block', zIndex: open ? 50 : 1 }}
    >
      <button
        type="button"
        className={`admin-select-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        {selectedOption?.icon ? (
          <selectedOption.icon size={15} style={{ color: selectedOption.iconColor || '#64748B', flexShrink: 0 }} />
        ) : selectedOption?.dotColor ? (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: selectedOption.dotColor,
              flexShrink: 0,
            }}
          />
        ) : null}

        <span style={{ whiteSpace: 'nowrap', color: '#1E293B', fontWeight: 600 }}>
          {selectedOption?.label}
        </span>

        <ChevronDown
          size={14}
          style={{
            color: open ? 'var(--primary-orange, #F97316)' : '#94A3B8',
            flexShrink: 0,
            marginLeft: '4px',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            minWidth: minWidth,
            maxHeight: '280px',
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
            zIndex: 100,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#C2410C' : '#334155',
                  background: isSelected ? '#FFF7ED' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  {opt.icon ? (
                    <opt.icon
                      size={15}
                      style={{ color: opt.iconColor || (isSelected ? '#EA580C' : '#64748B'), flexShrink: 0 }}
                    />
                  ) : opt.dotColor ? (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: opt.dotColor,
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <Check size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminFilterSelect;
