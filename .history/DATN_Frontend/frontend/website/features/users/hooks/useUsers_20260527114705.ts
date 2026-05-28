import { useUsersQuery } from './useUsersQuery';

// Standardized entry point for fetching users. Components can import `useUsers`
// and get a react-query based implementation. This keeps the public hook
// stable while the implementation uses react-query under the hood.
export const useUsers = (params?: { page?: number; limit?: number }) => {
    return useUsersQuery(params || {});
};

export default useUsers;