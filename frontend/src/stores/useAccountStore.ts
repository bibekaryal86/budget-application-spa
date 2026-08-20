import type { ModalAction } from '@constants'
import type { Account } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AccountState {
  isAccountModalOpen: boolean
  accountModalAction: ModalAction | null

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

  openAccountModal: (action: ModalAction, account?: Account | null) => void
  closeAccountModal: () => void

  resetAccountState: () => void
}

export const useAccountStore = create<AccountState>()(
  devtools(
    (set) => ({
      isAccountModalOpen: false,
      accountModalAction: null,
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
          },
          false,
          'account/clearAccountFilters',
        ),

      setSelectedAccount: (t) => set({ selectedAccount: t }, false, 'account/setSelectedAccount'),

      openAccountModal: (action, account = null) =>
        set(
          {
            isAccountModalOpen: true,
            accountModalAction: action,
            selectedAccount: account,
          },
          false,
          'account/openAccountModal',
        ),

      closeAccountModal: () =>
        set(
          {
            isAccountModalOpen: false,
            accountModalAction: null,
            selectedAccount: null,
          },
          false,
          'account/closeAccountModal',
        ),

      resetAccountState: () =>
        set(
          {
            isAccountModalOpen: false,
            accountModalAction: null,
            filterAccountType: null,
            filterAccountStatus: null,
            filterAccountBank: null,
            selectedAccount: null,
          },
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
