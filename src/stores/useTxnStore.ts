import { type ModalAction } from '@constants'
import type { Transaction } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TransactionState {
  isTxnModalOpen: boolean
  txnModalAction: ModalAction | null

  selectedBeginDate: string | null
  selectedEndDate: string | null
  selectedMerchant: string | null
  selectedAccountId: string | null
  selectedCategoryTypeId: string | null
  selectedCategoryId: string | null
  selectedTags: string[] | null

  selectedTxn: Transaction | null

  setSelectedBeginDate: (v: string | null) => void
  setSelectedEndDate: (v: string | null) => void
  setSelectedMerchant: (v: string | null) => void
  setSelectedAccountId: (v: string | null) => void
  setSelectedCategoryTypeId: (v: string | null) => void
  setSelectedCategoryId: (v: string | null) => void
  setSelectedTags: (v: string[]) => void

  setSelectedTxn: (v: Transaction | null) => void

  openTxnModal: (action: ModalAction, txnWithItems?: Transaction | null) => void
  closeTxnModal: () => void

  resetTxnState: () => void
}

export const useTxnStore = create<TransactionState>()(
  devtools(
    (set) => ({
      isTxnModalOpen: false,
      txnModalAction: null,
      selectedBeginDate: null,
      selectedEndDate: null,
      selectedMerchant: null,
      selectedAccountId: null,
      selectedCategoryTypeId: null,
      selectedCategoryId: null,
      selectedTxn: null,
      selectedTags: null,

      setSelectedBeginDate: (v) => set({ selectedBeginDate: v }, false, 'txn/setSelectedBeginDate'),

      setSelectedEndDate: (v) => set({ selectedEndDate: v }, false, 'txn/setSelectedEndDate'),

      setSelectedMerchant: (v) => set({ selectedMerchant: v }, false, 'txn/setSelectedMerchant'),

      setSelectedAccountId: (v) => set({ selectedAccountId: v }, false, 'txn/setSelectedAccountId'),

      setSelectedCategoryTypeId: (v) => set({ selectedCategoryTypeId: v }, false, 'txn/setSelectedCategoryTypeId'),

      setSelectedCategoryId: (v) => set({ selectedCategoryId: v }, false, 'txn/setSelectedCategoryId'),

      setSelectedTags: (v) => set({ selectedTags: v }, false, 'txn/setSelectedTags'),

      setSelectedTxn: (t) => set({ selectedTxn: t }, false, 'txn/setSelectedTxn'),

      openTxnModal: (action, txn = null) =>
        set(
          {
            isTxnModalOpen: true,
            txnModalAction: action,
            selectedTxn: txn,
          },
          false,
          'txn/openTxnModal',
        ),

      closeTxnModal: () =>
        set(
          {
            isTxnModalOpen: false,
            txnModalAction: null,
            selectedTxn: null,
          },
          false,
          'txn/closeTxnModal',
        ),

      resetTxnState: () =>
        set(
          {
            isTxnModalOpen: false,
            txnModalAction: null,
            selectedBeginDate: null,
            selectedEndDate: null,
            selectedMerchant: null,
            selectedAccountId: null,
            selectedCategoryTypeId: null,
            selectedCategoryId: null,
            selectedTags: null,
            selectedTxn: null,
          },
          false,
          'txn/resetTxnState',
        ),
    }),
    {
      name: 'TxnStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
