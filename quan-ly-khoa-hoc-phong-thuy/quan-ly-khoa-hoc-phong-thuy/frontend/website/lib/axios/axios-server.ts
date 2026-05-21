import { STORAGES } from '@shared/constants/storage';
import axios from 'axios';
import { cookies } from 'next/headers';

/**
 * Axios instance for Server-Side Rendering (SSR)
 * Use this for server components and API calls in getServerSideProps-like patterns
 */
export const createServerAxios = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(STORAGES.ACCESS_TOKEN)?.value;

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return instance;
};

/**
 * Simple fetch wrapper for SSR without authentication
 */
export const fetchServer = async <T>(url: string): Promise<T> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

  const response = await fetch(fullUrl, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
