export interface FetchParams {
  page?: number;
  limit?: number;
  deviceId?: number;
  status?: string;
  nameSearch?: string;
  sortColumn?: string;
  sortDirection?: 'ascend' | 'descend';
}
