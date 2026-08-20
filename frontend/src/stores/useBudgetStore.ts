import { type ModalAction } from '@constants'
import type { Budget } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface BudgetState {
  isBudgetModalOpen: boolean
  budgetModalAction: ModalAction | null

  selectedMonth: number | null
  selectedYear: number | null
  selectedCategoryId: string | null

  selectedBudget: Budget | null

  setBudgetFilters: (filters: {
    selectedMonth: number | null
    selectedYear: number | null
    selectedCategoryId: string | null
  }) => void

  clearBudgetFilters: () => void

  setSelectedBudget: (v: Budget | null) => void

  openBudgetModal: (action: ModalAction, budget?: Budget | null) => void
  closeBudgetModal: () => void

  resetBudgetState: () => void
}

export const useBudgetStore = create<BudgetState>()(
  devtools(
    (set) => ({
      isBudgetModalOpen: false,
      budgetModalAction: null,
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      selectedCategoryId: null,
      selectedBudget: null,

      setBudgetFilters: (filters) =>
        set(
          (state) => ({
            ...state,
            ...filters,
          }),
          false,
          'budget/setBudgetFilters',
        ),

      clearBudgetFilters: () =>
        set(
          {
            selectedMonth: new Date().getMonth() + 1,
            selectedYear: new Date().getFullYear(),
            selectedCategoryId: null,
          },
          false,
          'budget/clearBudgetFilters',
        ),

      setSelectedBudget: (t) => set({ selectedBudget: t }, false, 'budget/setSelectedBudget'),

      openBudgetModal: (action, budget = null) =>
        set(
          {
            isBudgetModalOpen: true,
            budgetModalAction: action,
            selectedBudget: budget,
          },
          false,
          'budget/openBudgetModal',
        ),

      closeBudgetModal: () =>
        set(
          {
            isBudgetModalOpen: false,
            budgetModalAction: null,
            selectedBudget: null,
          },
          false,
          'budget/closeBudgetModal',
        ),

      resetBudgetState: () =>
        set(
          {
            isBudgetModalOpen: false,
            budgetModalAction: null,
            selectedMonth: new Date().getMonth() + 1,
            selectedYear: new Date().getFullYear(),
            selectedCategoryId: null,
            selectedBudget: null,
          },
          false,
          'budget/resetBudgetState',
        ),
    }),
    {
      name: 'BudgetStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
