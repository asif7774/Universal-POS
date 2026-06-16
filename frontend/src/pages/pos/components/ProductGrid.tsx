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
  onSelectProduct: (product: Product) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const ProductGrid = memo(({
  products, search, setSearch, category, setCategory, categories, onSelectProduct, searchRef
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
                className="panel p-4 text-left hover:bg-[var(--bg-panel-hover)] transition-all duration-200 cursor-pointer w-full flex flex-col h-full hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group"
                onClick={() => { onSelectProduct(product); }}
              >
                <div className="mb-4 flex justify-center items-center py-5 bg-[var(--bg-canvas)] rounded-lg w-full group-hover:scale-[1.02] transition-transform duration-300">
                  <ProductImage
                    imageUrl={product.imageUrl}
                    category={product.category}
                    name={product.name}
                    size="sm"
                  />
                </div>
                
                <div className="flex items-center justify-between mb-1 w-full gap-2">
                   <p className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider truncate">{product.category}</p>
                   <div className="text-[0.65rem] font-mono text-[var(--text-muted)] shrink-0">{product.sku}</div>
                </div>

                <p className="text-sm font-bold text-[var(--text-primary)] mb-3 leading-snug line-clamp-2">{product.name}</p>
                
                <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] flex items-end justify-between w-full">
                  <div>
                    {product.type === 'rental' ? (
                      <div className="flex flex-col items-start gap-1">
                        <div className="badge badge-gold text-[0.65rem] px-1.5 py-0.5">Rental</div>
                        <p className="text-base font-black tracking-tight text-[var(--accent-gold-text)] leading-none mt-0.5">
                          {fmt(product.rentalRate ?? 0)}<span className="font-normal text-[var(--text-muted)] text-[0.65rem] ml-0.5">/day</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-base font-black tracking-tight text-[var(--accent-gold-text)] leading-none">{fmt(product.price)}</p>
                    )}
                  </div>
                  
                  <div
                    className="text-[0.7rem] font-medium flex items-center gap-1.5"
                    style={{ color: product.stock === 0 ? 'var(--status-error)' : product.stock < 5 ? 'var(--status-warning)' : 'var(--status-success)' }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: product.stock === 0 ? 'var(--status-error)' : product.stock < 5 ? 'var(--status-warning)' : 'var(--status-success)' }}
                    />
                    {product.category === 'Services' ? 'Service' : `${product.stock} in stock`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
