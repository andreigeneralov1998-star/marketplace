import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export type SellerProfile = {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  city: string;
  warehouseAddress: string;
  storeName: string;
  storeDescription?: string | null;
  storeLogo?: string | null;
  storeSlug?: string | null;
  isProfileComplete?: boolean;
};

export async function getSellerProfile() {
  const { data } = await api.get<SellerProfile>('/users/seller/profile');
  return data;
}

export async function updateSellerProfile(formData: FormData) {
  const { data } = await api.patch<SellerProfile>(
    '/users/seller/profile',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return data;
}