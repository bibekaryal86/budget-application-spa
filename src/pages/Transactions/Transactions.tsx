import { ACTION_TYPE } from '@constants'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Box, Button, Chip, Container, Paper, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useReadTransactions } from '@queries'
import { useTxnStore } from '@stores'
import React, { useMemo } from 'react'

import { TransactionFilters } from './TransactionFilters.tsx'
import { TransactionsTable } from './TransactionTable.tsx'

export const Transactions: React.FC = () => {
  const {
    selectedBeginDate,
    selectedEndDate,
    selectedMerchant,
    selectedCategoryId,
    selectedCategoryTypeId,
    openTxnModal,
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
      if (selectedBeginDate && txn.txnDate) {
        const txnDate = new Date(txn.txnDate)
        if (txnDate < selectedBeginDate) return false
      }
      if (selectedEndDate && txn.txnDate) {
        const txnDate = new Date(txn.txnDate)
        if (txnDate > selectedEndDate) return false
      }

      if (selectedMerchant && !txn.merchant?.toLowerCase().includes(selectedMerchant.toLowerCase())) {
        return false
      }

      if (!selectedCategoryTypeId && !selectedCategoryId) {
        return true
      }

      const hasMatchingItem = txn.items?.some((item) => {
        const category = item.category
        const categoryTypeId = category?.categoryType?.id
        const categoryId = category?.id

        if (selectedCategoryTypeId && selectedCategoryId) {
          return categoryTypeId === selectedCategoryTypeId && categoryId === selectedCategoryId
        }

        if (selectedCategoryTypeId && !selectedCategoryId) {
          return categoryTypeId === selectedCategoryTypeId
        }

        if (!selectedCategoryTypeId && selectedCategoryId) {
          return categoryId === selectedCategoryId
        }

        return false
      })

      return hasMatchingItem || false
    })
  }, [transactions, selectedBeginDate, selectedEndDate, selectedMerchant, selectedCategoryTypeId, selectedCategoryId])

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h4' component='h1' fontWeight='medium'>
            Transactions
          </Typography>
          <Button variant='contained' onClick={() => openTxnModal(ACTION_TYPE.CREATE, null)}>
            Add New Transaction
          </Button>
        </Stack>
        <Typography variant='body1' color='text.secondary'>
          Manage and view all your transactions
        </Typography>
      </Box>

      <TransactionFilters />

      {hasActiveFilters && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltOffIcon color='action' />
          <Typography variant='body2' color='text.secondary'>
            Showing {filteredTxns.length} of {transactions.length} transactions
          </Typography>
          <Chip label='Filters Active' size='small' color='primary' variant='outlined' />
        </Box>
      )}

      {isLoading && (
        <Box display='flex' justifyContent='center' my={4}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !error && filteredTxns.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' gutterBottom>
            No transactions found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {hasActiveFilters
              ? 'Try adjusting your filters or clear them to see all transactions.'
              : 'No transactions available. Create your first transaction!'}
          </Typography>
        </Paper>
      )}

      {!isLoading && !error && filteredTxns.length > 0 && <TransactionsTable transactions={filteredTxns} />}

      {!isLoading && !error && filteredTxns.length > 0 && (
        <Box display='flex' justifyContent='center' mt={3}>
          <Typography variant='body2' color='text.secondary'>
            Showing {filteredTxns.length} transactions
          </Typography>
        </Box>
      )}
    </Container>
  )
}
