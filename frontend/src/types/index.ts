export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  position?: number;
  createdAt?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: Role;
  isSellerApproved: boolean;
}

export type Seller = {
  id: string;
  username?: string;
  email?: string;
  fullName?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  storeDescription?: string | null;
  storeLogo?: string | null;
};

export type ProductListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  sku: string;
  isPublished: boolean;
  sellerId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
  images: ProductImage[];
  category: Category;
  seller?: Seller;
};

export type ProductDetails = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  sku: string;
  isPublished: boolean;
  sellerId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
  specs?: Record<string, unknown> | null;
  images: ProductImage[];
  category: Category;
  seller?: Seller;
};

export type ProductsResponse = {
  items: ProductListItem[];
  total: number;
  page: number;
  pages: number;
};