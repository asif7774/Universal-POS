import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  noOptionsMessage?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled = false,
  noOptionsMessage = 'No results found',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.sublabel?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
  }, []);

  const open = () => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      // Position below trigger; flip up if not enough space below
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = Math.min(filtered.length * 42 + 52, 272); // estimate
      const top = spaceBelow >= dropdownHeight
        ? rect.bottom + 2
        : rect.top - dropdownHeight - 2;
      setDropdownStyle({
        position: 'fixed',
        top,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen(true);
    setSearch('');
    setHighlighted(0);
    requestAnimationFrame(() => { searchInputRef.current?.focus(); });
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) close();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen, close]);

  // Close on scroll / resize (dropdown position becomes stale)
  useEffect(() => {
    if (!isOpen) return;
    const handle = () => close();
    window.addEventListener('scroll', handle, { passive: true, capture: true });
    window.addEventListener('resize', handle, { passive: true });
    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [isOpen, close]);

  const pick = (opt: SelectOption) => {
    onChange(opt.value);
    close();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape')     { close(); return; }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); return; }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); return; }
    if (e.key === 'Enter' && filtered[highlighted]) { e.preventDefault(); pick(filtered[highlighted]); }
  };

  const dropdown = isOpen ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-surface-card border-[1.5px] border-[var(--surface-border)] rounded-md shadow-lg overflow-hidden"
    >
      {/* Search row */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--surface-border)]">
        <SvgIcon name="search" width="14" height="14" className="text-text-muted shrink-0" />
        <input
          ref={searchInputRef}
          value={search}
          onChange={e => { setSearch(e.target.value); setHighlighted(0); }}
          onKeyDown={handleSearchKeyDown}
          placeholder={searchPlaceholder}
          className="flex-1 border-none outline-none bg-transparent text-sm text-text-primary font-[inherit]"
        />
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(''); searchInputRef.current?.focus(); }}
            className="bg-transparent border-none cursor-pointer p-0.5 text-text-muted flex"
          >
            <SvgIcon name="close" width="13" height="13" />
          </button>
        )}
      </div>

      {/* Options list */}
      <ul className="max-h-[220px] overflow-y-auto py-1 m-0 list-none">
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-text-muted text-[.85rem] text-center">
            {noOptionsMessage}
          </li>
        ) : filtered.map((opt, i) => {
          const isSel = opt.value === value;
          const isHi  = i === highlighted;
          return (
            <li
              key={opt.value}
              role="option"
              aria-selected={isSel}
              onClick={() => { pick(opt); }}
              onMouseEnter={() => { setHighlighted(i); }}
              className="px-3 py-2 cursor-pointer flex items-center justify-between gap-2"
              style={{
                background: isHi || isSel ? 'var(--surface-hover)' : 'transparent',
              }}
            >
              <div className="min-w-0">
                <div
                  className="text-sm text-text-primary whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ fontWeight: isSel ? 600 : 400 }}
                >
                  {opt.label}
                </div>
                {opt.sublabel && (
                  <div className="text-[.74rem] text-text-muted mt-px">{opt.sublabel}</div>
                )}
              </div>
              {isSel && <SvgIcon name="check-circle" width="14" height="14" className="text-status-success shrink-0" />}
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="input flex items-center justify-between gap-2 select-none text-left"
        onClick={() => { isOpen ? close() : open(); }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <span
          className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
          style={{
            color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: selected ? 500 : 400,
          }}
        >
          {selected?.label ?? placeholder}
        </span>
        <SvgIcon
          name="chevron-collapse"
          width="14" height="14"
          className="shrink-0 text-text-muted transition-transform duration-[150ms]"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {isOpen && createPortal(dropdown, document.body)}
    </>
  );
};
