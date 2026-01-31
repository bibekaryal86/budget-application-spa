import { type ModalAction } from '@constants'
import type { Transaction } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface TransactionState {
  isTxnModalOpen: boolean
  txnModalAction: ModalAction | null

  txnFilterBeginDate: string | null
  txnFilterEndDate: string | null
  txnFilterMerchant: string | null
  txnFilterAccountId: string | null
  txnFilterCategoryTypeId: string | null
  txnFilterCategoryId: string | null
  txnFilterTags: string[] | null

  selectedTxn: Transaction | null

  setTxnFilterBeginDate: (v: string | null) => void
  setTxnFilterEndDate: (v: string | null) => void
  setTxnFilterMerchant: (v: string | null) => void
  setTxnFilterAccountId: (v: string | null) => void
  setTxnFilterCategoryTypeId: (v: string | null) => void
  setTxnFilterCategoryId: (v: string | null) => void
  setTxnFilterTags: (v: string[]) => void

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
      txnFilterBeginDate: null,
      txnFilterEndDate: null,
      txnFilterMerchant: null,
      txnFilterAccountId: null,
      txnFilterCategoryTypeId: null,
      txnFilterCategoryId: null,
      txnFilterTags: null,
      selectedTxn: null,

      setTxnFilterBeginDate: (v) => set({ txnFilterBeginDate: v }, false, 'txn/setTxnFilterBeginDate'),

      setTxnFilterEndDate: (v) => set({ txnFilterEndDate: v }, false, 'txn/setTxnFilterEndDate'),

      setTxnFilterMerchant: (v) => set({ txnFilterMerchant: v }, false, 'txn/setTxnFilterMerchant'),

      setTxnFilterAccountId: (v) => set({ txnFilterAccountId: v }, false, 'txn/setTxnFilterAccountId'),

      setTxnFilterCategoryTypeId: (v) => set({ txnFilterCategoryTypeId: v }, false, 'txn/setTxnFilterCategoryTypeId'),

      setTxnFilterCategoryId: (v) => set({ txnFilterCategoryId: v }, false, 'txn/setTxnFilterCategoryId'),

      setTxnFilterTags: (v) => set({ txnFilterTags: v }, false, 'txn/setTxnFilterTags'),

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
            txnFilterBeginDate: null,
            txnFilterEndDate: null,
            txnFilterMerchant: null,
            txnFilterAccountId: null,
            txnFilterCategoryTypeId: null,
            txnFilterCategoryId: null,
            txnFilterTags: null,
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
