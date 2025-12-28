import type { ModalAction } from '@constants'
import { Container, Typography } from '@mui/material'
import { useReadTransactions } from '@queries'
import { useAuthStore, useTxnStore } from '@stores'
import type { TransactionWithItems } from '@types'
import React, { useMemo } from 'react'

export const Transactions: React.FC = () => {
  const { isSuperUser } = useAuthStore()
  const {
    selectedBeginDate,
    setSelectedBeginDate,
    selectedEndDate,
    setSelectedEndDate,
    selectedMerchant,
    setSelectedMerchant,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedCategoryTypeId,
    setSelectedCategoryTypeId,
    openTxnModal,
    closeTxnModal,
    resetProfileState,
  } = useTxnStore()

  const { data, isLoading, error } = useReadTransactions()
  const transactions = useMemo(() => data?.transactions ?? [], [data?.transactions])

  const hasActiveFilters =
    selectedBeginDate != null ||
    selectedEndDate != null ||
    selectedMerchant != null ||
    selectedCategoryTypeId != null ||
    selectedCategoryId != null

  const filteredTxns = useMemo(() => {
    return transactions.filter((txn) => {
      // Date filtering
      if (selectedBeginDate && txn.transaction.txnDate) {
        const txnDate = new Date(txn.transaction.txnDate)
        if (txnDate < selectedBeginDate) return false
      }
      if (selectedEndDate && txn.transaction.txnDate) {
        const txnDate = new Date(txn.transaction.txnDate)
        if (txnDate > selectedEndDate) return false
      }

      // Merchant filtering
      if (selectedMerchant && txn.transaction.merchant !== selectedMerchant) {
        return false
      }

      // Category type filtering
      if (selectedCategoryTypeId && txn.category?.categoryTypeId !== selectedCategoryTypeId) {
        return false
      }

      // Category filtering
      if (selectedCategoryId && txn.category?.id !== selectedCategoryId) {
        return false
      }

      return true
    })
  }, [transactions, selectedBeginDate, selectedEndDate, selectedMerchant, selectedCategoryTypeId, selectedCategoryId])

  const handleModalOpen = (txn: TransactionWithItems | null, action: ModalAction) => {
    openTxnModal(action, txn)
  }

  const handleModalClose = () => {
    closeTxnModal()
  }

  const handleClearFilters = () => {
    resetProfileState()
  }

  return (
    <Container maxWidth='md' sx={{ py: 8 }}>
      <Typography variant='h4' component='h2' gutterBottom fontWeight='medium'>
        Placeholder for Transactions Page
      </Typography>
    </Container>
  )
}
