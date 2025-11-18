/* eslint-disable @typescript-eslint/no-explicit-any */
const queryBuilder = (endpoint: string, params: Record<string, any>) => {
  const queryParams = new URLSearchParams(params).toString();
  return `${endpoint}?${queryParams}`;
};

export default queryBuilder;
