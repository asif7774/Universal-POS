import React, { memo } from 'react';
import { Product } from 'types/pos';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { ProductImage } from 'components/atoms/ProductImage';

interface ProductGridProps {
  products: Product[];
  search: string;
  setSearch: (s: string) => void;
  category: string;
  setCategory: (c: string) => void;
  categories: string[];
  onAddToCart: (product: Product, isRental: boolean) => void;
  onSelectProduct: (product: Product) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const ProductGrid = memo(({
  products, search, setSearch, category, setCategory, categories, onAddToCart, onSelectProduct, searchRef
}: ProductGridProps) => {

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col bg-[var(--bg-canvas)] overflow-hidden h-full">
      {/* Search + category bar */}
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] flex gap-3 flex-wrap items-center">
        <div className="input-with-icon flex-1 min-w-0">
          <span className="input-icon">
            <SvgIcon name="search" width="18" height="18" />
          </span>
          <input
            id="pos-search"
            ref={searchRef}
            className="input flex-1"
            placeholder="Search products, SKU, category..."
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            autoFocus
          />
        </div>
        <div className="flex gap-1.5 flex-wrap shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); }}
              className={`btn btn-sm text-[0.75rem] ${category === cat ? 'bg-[var(--accent-gold)] text-[var(--text-inverse)]' : 'bg-[var(--bg-panel-hover)] text-[var(--text-secondary)]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SvgIcon name="search" width="40" height="40" className="opacity-20" />
            </div>
            <p>No products found for "<strong>{search}</strong>"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
            {filtered.map(product => (
              <button
                key={product.id}
                className="panel p-4 text-left hover:bg-[var(--bg-panel-hover)] transition-colors cursor-pointer w-full focus-visible:outline-[3px] focus-visible:outline-[var(--focus-ring)]"
                onClick={() => { onSelectProduct(product); }}
              >
                <div className="mb-2 flex justify-center">
                  <ProductImage
                    imageUrl={product.imageUrl}
                    category={product.category}
                    name={product.name}
                    size="sm"
                  />
                </div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">{product.category}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2 leading-snug">{product.name}</p>
                <div className="text-[0.7rem] text-[var(--text-muted)] mb-1.5">{product.sku}</div>
                {product.type === 'rental' ? (
                  <div>
                    <p className="text-lg font-black tracking-tight text-[var(--accent-gold-text)]">
                      {fmt(product.rentalRate ?? 0)}<span className="font-normal text-[0.7rem]">/day</span>
                    </p>
                    <div className="badge badge-gold mt-1">Rental</div>
                  </div>
                ) : (
                  <p className="text-lg font-black tracking-tight text-[var(--accent-gold-text)]">{fmt(product.price)}</p>
                )}
                <div
                  className="text-[0.72rem] mt-1.5 font-semibold flex items-center gap-1"
                  style={{ color: product.stock === 0 ? 'var(--status-error)' : product.stock < 5 ? 'var(--status-warning)' : 'var(--status-success)' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: product.stock === 0 ? 'var(--status-error)' : product.stock < 5 ? 'var(--status-warning)' : 'var(--status-success)' }}
                  />
                  {product.category === 'Services' ? 'Service' : `${product.stock} in stock`}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
