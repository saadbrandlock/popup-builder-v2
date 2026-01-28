import { create } from 'zustand';
import { Category } from '../types';

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isModalOpen: boolean;
  editingCategory: Category | null;
  actions: {
    setCategories: (categories: Category[]) => void;
    setSelectedCategory: (category: Category | null) => void;
    openModal: (category?: Category) => void;
    closeModal: () => void;
    addCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    removeCategory: (categoryId: number) => void;
  };
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  selectedCategory: null,
  isModalOpen: false,
  editingCategory: null,
  actions: {
    setCategories: (categories) =>
      set({ categories: categories.sort((a, b) => a.display_order - b.display_order) }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    openModal: (category) =>
      set({ isModalOpen: true, editingCategory: category || null }),
    closeModal: () => set({ isModalOpen: false, editingCategory: null }),
    addCategory: (category) =>
      set((state) => ({
        categories: [...state.categories, category].sort(
          (a, b) => a.display_order - b.display_order
        ),
      })),
    updateCategory: (category) =>
      set((state) => ({
        categories: state.categories
          .map((c) => (c.id === category.id ? category : c))
          .sort((a, b) => a.display_order - b.display_order),
      })),
    removeCategory: (categoryId) =>
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== categoryId),
      })),
  },
}));
