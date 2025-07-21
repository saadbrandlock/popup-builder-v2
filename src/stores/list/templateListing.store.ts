import { CouponTemplate } from '@/features';
import { TablePaginationConfig } from 'antd';
import { create } from 'zustand';

type TemplateListingState = {
  templates: CouponTemplate[];
  pagination: TablePaginationConfig;
  filters: {
    deviceId?: number;
    status?: string;
    nameSearch?: string;
  };
  sorter: {
    sortColumn?: string;
    sortDirection?: 'ascend' | 'descend';
  };
  error?: string;
};

type TemplateListingActions = {
  actions: {
    setTemplates: (templates: CouponTemplate[]) => void;
    setPagination: (pagination: TablePaginationConfig) => void;
    setFilters: (value: number | string | null, filterType: 'deviceId' | 'status' | 'nameSearch') => void;
    resetFilters: () => void;
    setSorter: (sorter: TemplateListingState['sorter']) => void;
    setError: (error: string) => void;
  };
};

export const useTemplateListingStore = create<
  TemplateListingState & TemplateListingActions
>((set) => ({
  templates: [],
  pagination: {
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
  },
  filters: {
    deviceId: undefined,
    status: undefined,
    nameSearch: undefined,
  },
  sorter: {
    sortColumn: 't.name',
    sortDirection: 'ascend',
  },
  error: undefined,
  actions: {
    setTemplates: (templates: CouponTemplate[]) => set({ templates }),
    setPagination: (pagination: TablePaginationConfig) => set({ pagination }),
    setFilters: (value: number | string | null, filterType: 'deviceId' | 'status' | 'nameSearch') =>
      set((prev) => ({
        filters: {
          ...prev.filters,
          [filterType]: value,
        },
      })),
    resetFilters: () =>
      set(() => ({
        filters: {
          deviceId: undefined,
          status: undefined,
          nameSearch: undefined,
        },
      })),
    setSorter: (sorter: TemplateListingState['sorter']) =>
      set((prev) => ({
        sorter: {
          ...prev.sorter,
          ...sorter,
        },
      })),
    setError: (error: string) => set({ error }),
  },
}));
