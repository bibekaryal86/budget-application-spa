import { type ModalAction } from '@constants'
import type { Transaction } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TransactionState {
  isTxnModalOpen: boolean
  txnModalAction: ModalAction | null

  selectedBeginDate: Date | null
  selectedEndDate: Date | null
  selectedMerchant: string | null
  selectedAccountId: string | null
  selectedCategoryTypeId: string | null
  selectedCategoryId: string | null

  selectedTxn: Transaction | null

  setSelectedBeginDate: (v: Date | null) => void
  setSelectedEndDate: (v: Date | null) => void
  setSelectedMerchant: (v: string | null) => void
  setSelectedAccountId: (v: string | null) => void
  setSelectedCategoryTypeId: (v: string | null) => void
  setSelectedCategoryId: (v: string | null) => void

  setSelectedTxn: (v: Transaction | null) => void

  openTxnModal: (action: ModalAction, txnWithItems?: Transaction | null) => void
  closeTxnModal: () => void

  resetProfileState: () => void
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

      setSelectedBeginDate: (v) => set({ selectedBeginDate: v }, false, 'txn/setSelectedBeginDate'),

      setSelectedEndDate: (v) => set({ selectedEndDate: v }, false, 'txn/setSelectedEndDate'),

      setSelectedMerchant: (v) => set({ selectedMerchant: v }, false, 'txn/setSelectedMerchant'),

      setSelectedAccountId: (v) => set({ selectedAccountId: v }, false, 'txn/setSelectedAccountId'),

      setSelectedCategoryTypeId: (v) => set({ selectedCategoryTypeId: v }, false, 'txn/setSelectedCategoryTypeId'),

      setSelectedCategoryId: (v) => set({ selectedCategoryId: v }, false, 'txn/setSelectedCategoryId'),

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

      resetProfileState: () =>
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
