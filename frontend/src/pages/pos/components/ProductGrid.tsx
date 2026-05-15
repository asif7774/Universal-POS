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
    <div className="flex flex-col bg-surface-bg overflow-hidden h-full">
      {/* Search + category bar */}
      <div className="search-container p-[14px_16px] bg-surface-card border-b border-surface-border m-0 gap-3">
        <div className="search-input-wrapper input-with-icon flex-1 min-w-0 max-w-none">
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
        <div className="filter-group shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); }}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'} text-[0.75rem]`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SvgIcon name="search" width="40" height="40" className="opacity-20" />
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
                <div className="mb-3 text-tux-navy opacity-80 flex justify-center">
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
                <div className="text-[0.8rem] font-bold text-text-primary mb-1 leading-tight">
                  {product.name}
                </div>
                <div className="text-[0.7rem] text-text-muted mb-1.5">{product.sku}</div>
                {product.type === 'rental' ? (
                  <div>
                    <div className="text-[0.85rem] font-extrabold text-tux-navy">
                      {fmt(product.rentalRate ?? 0)}<span className="font-normal text-[0.7rem]">/day</span>
                    </div>
                    <div className="badge badge-gold mt-1">Rental</div>
                  </div>
                ) : (
                  <div className="text-[0.9rem] font-extrabold text-tux-navy">{fmt(product.price)}</div>
                )}
                <div 
                  className={`text-[0.72rem] mt-1.5 font-semibold flex items-center justify-center gap-1`}
                  style={{ color: product.stock === 0 ? 'var(--status-error)' : product.stock < 5 ? 'var(--status-warning)' : 'var(--status-success)' }}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: product.stock === 0 ? 'var(--status-error)' : product.stock < 5 ? 'var(--status-warning)' : 'var(--status-success)' }}
                  />
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
