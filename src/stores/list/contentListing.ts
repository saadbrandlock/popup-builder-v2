import { CleanTemplateResponse, TCBCannedContentWithShoppers } from '@/types';
import { TablePaginationConfig } from 'antd';
import { create } from 'zustand';

type ContentListingState = {
  contents: TCBCannedContentWithShoppers[];
  content: TCBCannedContentWithShoppers | null;
  pagination: TablePaginationConfig;
  filters: {
    industry?: string;
    field?: string;
    search?: string;
    shopper_ids?: number[];
  };
  sorter: {
    sortColumn?: string;
    sortDirection?: 'ascend' | 'descend';
  };
  industries: string[];
  fields: string[];
  error?: string;
};

type ContentListingActions = {
  actions: {
    setContents: (content: TCBCannedContentWithShoppers[]) => void;
    setContent: (content: TCBCannedContentWithShoppers | null) => void;
    setPagination: (pagination: TablePaginationConfig) => void;
    setFilters: (
      value: number[] | string | null,
      filterType: 'industry' | 'field' | 'search' | 'shopper_ids'
    ) => void;
    resetFilters: () => void;
    setSorter: (sorter: ContentListingState['sorter']) => void;
    setError: (error: string) => void;
    setIndustries: (industries: string[]) => void;
    setFields: (fields: string[]) => void;
  };
};

export const useContentListingStore = create<
  ContentListingState & ContentListingActions
>((set) => ({
  contents: [],
  content: null,
  pagination: {
    current: 1,
    pageSize: 5,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '20', '50'],
  },
  filters: {
    industry: undefined,
    field: undefined,
    search: undefined,
    shopper_ids: undefined,
  },
  sorter: {
    sortColumn: 't.name',
    sortDirection: 'ascend',
  },
  industries: [],
  fields: [],
  error: undefined,
  actions: {
    setContents: (contents: TCBCannedContentWithShoppers[]) =>
      set({ contents }),
    setContent: (content: TCBCannedContentWithShoppers | null) =>
      set({ content }),
    setPagination: (pagination: TablePaginationConfig) => set({ pagination }),
    setFilters: (
      value: number[] | string | null,
      filterType: 'industry' | 'field' | 'search' | 'shopper_ids'
    ) =>
      set((prev) => ({
        filters: {
          ...prev.filters,
          [filterType]: value,
        },
      })),
    resetFilters: () =>
      set(() => ({
        filters: {
          industry: undefined,
          field: undefined,
          search: undefined,
          shopper_ids: undefined,
        },
      })),
    setSorter: (sorter: ContentListingState['sorter']) =>
      set((prev) => ({
        sorter: {
          ...prev.sorter,
          ...sorter,
        },
      })),
    setError: (error: string) => set({ error }),
    setIndustries: (industries: string[]) =>
      set({ industries }),
    setFields: (fields: string[]) => set({ fields }),
  },
}));
