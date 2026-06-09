export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  type: 'sale' | 'rental';
  category: string;
  stock: number;
  rentalRate?: number;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  days?: number; // for rentals
  isRental: boolean;
  lineTotal: number;
}
