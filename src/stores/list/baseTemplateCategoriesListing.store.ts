import { TablePaginationConfig } from 'antd';
import { create } from 'zustand';
import { Category } from '@/features/base-template/types';

type BaseTemplateCategoriesListingState = {
  categories: Category[];
  pagination: TablePaginationConfig;
  filters: {
    search?: string;
  };
  sorter: {
    sortColumn?: string;
    sortDirection?: 'ascend' | 'descend';
  };
  error?: string;
};

type BaseTemplateCategoriesListingActions = {
  actions: {
    setCategories: (categories: Category[]) => void;
    setPagination: (pagination: TablePaginationConfig) => void;
    setFilters: (value: string | null, filterType: 'search') => void;
    resetFilters: () => void;
    setSorter: (sorter: BaseTemplateCategoriesListingState['sorter']) => void;
    setError: (error?: string) => void;
  };
};

export const useBaseTemplateCategoriesListingStore = create<
  BaseTemplateCategoriesListingState & BaseTemplateCategoriesListingActions
>((set) => ({
  categories: [],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
  filters: {
    search: undefined,
  },
  sorter: {
    sortColumn: 'display_order',
    sortDirection: 'ascend',
  },
  error: undefined,
  actions: {
    setCategories: (categories) => set({ categories }),
    setPagination: (pagination) => set({ pagination }),
    setFilters: (value, filterType) =>
      set((prev) => ({
        filters: {
          ...prev.filters,
          [filterType]: value || undefined,
        },
      })),
    resetFilters: () =>
      set(() => ({
        filters: {
          search: undefined,
        },
      })),
    setSorter: (sorter) =>
      set((prev) => ({
        sorter: {
          ...prev.sorter,
          ...sorter,
        },
      })),
    setError: (error) => set({ error }),
  },
}));
