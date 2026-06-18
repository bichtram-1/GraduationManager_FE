import { User } from '../types';

/**
 * Fetch users on server-side (SSR)
 * Use native fetch for server components
 */
export const userServerApi = {
  getUsersServer : async (): Promise<User[]> => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users', {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.slice(0, 10);
  }
}
