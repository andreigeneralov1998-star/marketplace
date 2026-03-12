export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  sku: string;
  images: ProductImage[];
  category: Category;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  isSellerApproved: boolean;
}