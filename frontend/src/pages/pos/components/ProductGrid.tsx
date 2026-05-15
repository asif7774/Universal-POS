import React, { memo } from 'react';
import { Product } from 'types/pos';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface ProductGridProps {
  products: Product[];
  search: string;
  setSearch: (s: string) => void;
  category: string;
  setCategory: (c: string) => void;
  categories: string[];
  onAddToCart: (product: Product, isRental: boolean) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const ProductGrid = memo(({ 
  products, search, setSearch, category, setCategory, categories, onAddToCart, searchRef 
}: ProductGridProps) => {

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-bg)', overflow: 'hidden', height: '100%' }}>
      {/* Search + category bar */}
      <div className="search-container" style={{ padding: '14px 16px', background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', margin: 0, gap: 12 }}>
        <div className="search-input-wrapper input-with-icon" style={{ flex: 1, minWidth: 0, maxWidth: 'none' }}>
          <span className="input-icon">
            <SvgIcon name="search" width="18" height="18" />
          </span>
          <input
            id="pos-search"
            ref={searchRef}
            className="input"
            placeholder="Search products or scan..."
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            autoFocus
          />
        </div>
        <div className="filter-group" style={{ flexShrink: 0 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); }}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '.75rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SvgIcon name="search" width="40" height="40" style={{ opacity: 0.2 }} />
            </div>
            <p>No products found for "<strong>{search}</strong>"</p>
          </div>
        ) : (
          <div className="pos-product-grid">
            {filtered.map(product => (
              <div
                key={product.id}
                className="pos-product-card"
                onClick={() => { onAddToCart(product, product.type === 'rental'); }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onAddToCart(product, product.type === 'rental')}
              >
                <div style={{ marginBottom: 12, color: 'var(--tux-navy)', opacity: 0.8, display: 'flex', justifyContent: 'center' }}>
                  <SvgIcon 
                    name={
                      product.category === 'Tuxedos' ? 'tuxedo' :
                      product.category === 'Suits' ? 'shirt' :
                      product.category === 'Accessories' ? 'accessory' :
                      product.category === 'Shoes' ? 'shoe' :
                      product.category === 'Shirts' ? 'shirt' : 'scissors'
                    } 
                    width="28" 
                    height="28" 
                  />
                </div>
                <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.2 }}>
                  {product.name}
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>{product.sku}</div>
                {product.type === 'rental' ? (
                  <div>
                    <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{fmt(product.rentalRate ?? 0)}<span style={{ fontWeight: 400, fontSize: '.7rem' }}>/day</span></div>
                    <div className="badge badge-gold" style={{ marginTop: 4 }}>Rental</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--tux-navy)' }}>{fmt(product.price)}</div>
                )}
                <div style={{ fontSize: '.7rem', color: product.stock < 3 ? 'var(--status-error)' : 'var(--text-muted)', marginTop: 4 }}>
                  {product.category === 'Services' ? 'Service' : `${product.stock} in stock`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
