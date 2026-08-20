import type { Category, CategoryType } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CategoryState {
  selectedCategoryTypeId: string | null
  selectedCategoryId: string | null

  selectedCategoryType: CategoryType | null
  selectedCategory: Category | null

  setCategoryFilters: (filters: { selectedCategoryTypeId: string | null }) => void
  clearCategoryFilters: () => void

  setSelectedCategoryType: (v: CategoryType | null) => void
  setSelectedCategory: (v: Category | null) => void

  resetCategoryState: () => void
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set) => ({
      selectedCategoryTypeId: null,
      selectedCategoryId: null,
      selectedCategoryType: null,
      selectedCategory: null,

      setCategoryFilters: (filters) =>
        set(
          (state) => ({
            ...state,
            ...filters,
          }),
          false,
          'category/setCategoryFilters',
        ),

      clearCategoryFilters: () =>
        set(
          {
            selectedCategoryTypeId: null,
          },
          false,
          'category/clearCategoryFilters',
        ),

      setSelectedCategoryType: (t) => set({ selectedCategoryType: t }, false, 'category/setSelectedCategoryType'),
      setSelectedCategory: (t) => set({ selectedCategory: t }, false, 'category/setSelectedCategory'),

      resetCategoryState: () =>
        set(
          {
            selectedCategoryTypeId: null,
            selectedCategoryType: null,
            selectedCategoryId: null,
            selectedCategory: null,
          },
          false,
          'category/resetCategoryState',
        ),
    }),
    {
      name: 'CategoryStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
