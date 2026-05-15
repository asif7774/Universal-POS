export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  type: 'rental' | 'sale';
  sizes: Record<string, { total: number; available: number; out: number; cleaning: number }>;
  rentalRate?: number;
  salePrice?: number;
  lowStockThreshold: number;
  location: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}
