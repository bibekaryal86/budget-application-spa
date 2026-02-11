import type { Account } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CategoryState {
  filterAccountType: string | null
  filterAccountStatus: string | null
  filterAccountBank: string | null

  selectedAccount: Account | null

  setAccountFilters: (filters: {
    filterAccountType: string | null
    filterAccountStatus: string | null
    filterAccountBank: string | null
  }) => void
  clearAccountFilters: () => void

  setSelectedAccount: (v: Account | null) => void

  resetAccountState: () => void
}

export const useAccountStore = create<CategoryState>()(
  devtools(
    (set) => ({
      filterAccountType: null,
      filterAccountStatus: null,
      filterAccountBank: null,
      selectedAccount: null,

      setAccountFilters: (filters) =>
        set(
          (state) => ({
            ...state,
            ...filters,
          }),
          false,
          'account/setAccountFilters',
        ),

      clearAccountFilters: () =>
        set(
          {
            filterAccountType: null,
            filterAccountStatus: null,
            filterAccountBank: null,
            selectedAccount: null,
          },
          false,
          'account/clearAccountFilters',
        ),

      setSelectedAccount: (t) => set({ selectedAccount: t }, false, 'account/setSelectedAccount'),

      resetAccountState: () =>
        set(
          { filterAccountType: null, filterAccountStatus: null, filterAccountBank: null, selectedAccount: null },
          false,
          'account/resetAccountState',
        ),
    }),
    {
      name: 'AccountStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
