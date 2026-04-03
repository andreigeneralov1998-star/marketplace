import axios from 'axios';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
export async function getMySellerApplication() {
  const res = await api.get('/users/seller/application');
  return res.data;
}

export async function applyForSeller(formData: FormData) {
  const res = await api.post('/users/seller/application', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

export async function forgotPassword(payload: {
  username: string;
  email: string;
  phone: string;
  newPassword: string;
}) {
  const { data } = await api.post('/auth/forgot-password', payload);
  return data;
}
export type HomepageBanner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  openInNewTab: boolean;
};

export async function getHomepageBanners(): Promise<HomepageBanner[]> {
  const res = await api.get('/homepage-banners');
  return res.data;
}

export { baseURL };