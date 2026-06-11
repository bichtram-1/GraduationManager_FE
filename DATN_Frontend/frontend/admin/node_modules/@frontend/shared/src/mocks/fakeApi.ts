type BaseListParams = { page?: number; limit?: number };

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export type User = {
  id: number;
  name: string;
  email: string;
};

const MOCK_USERS: User[] = Array.from({ length: 30 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
}));

export const getUsers = async (params: BaseListParams = {}) => {
  await delay(200);
  const page = params.page || 1;
  const limit = params.limit || 10;
  const start = (page - 1) * limit;
  const rows = MOCK_USERS.slice(start, start + limit);
  return { total: MOCK_USERS.length, rows };
};

export default {
  getUsers,
};
