import { ACTION_TYPE } from '@constants'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Box, Button, Chip, Container, Paper, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useReadTransactions } from '@queries'
import { useTxnStore } from '@stores'
import { getBeginningOfMonth, getEndOfMonth } from '@utils'
import React, { useMemo } from 'react'

import { TransactionFilters } from './TransactionFilters.tsx'
import { TransactionModal } from './TransactionModal.tsx'
import { TransactionsTable } from './TransactionTable.tsx'

export const Transactions: React.FC = () => {
  const {
    selectedBeginDate,
    setSelectedBeginDate,
    selectedEndDate,
    setSelectedEndDate,
    selectedMerchant,
    selectedAccountId,
    selectedCategoryId,
    selectedCategoryTypeId,
    openTxnModal,
    selectedTxn,
  } = useTxnStore()

  const now = new Date()
  const { data, isLoading, error } = useReadTransactions({
    beginDate: selectedBeginDate || getBeginningOfMonth(now),
    endDate: selectedEndDate || getEndOfMonth(now),
    merchants: [selectedMerchant || ''],
    catIds: [selectedCategoryId || ''],
    catTypeIds: [selectedCategoryTypeId || ''],
    accIds: [selectedAccountId || ''],
    tags: [],
  })
  const transactions = useMemo(() => data?.transactions ?? [], [data?.transactions])

  if (!selectedBeginDate) {
    setSelectedBeginDate(getBeginningOfMonth(now))
  }
  if (!selectedEndDate) {
    setSelectedEndDate(getEndOfMonth(now))
  }

  const hasActiveFilters =
    selectedBeginDate != null ||
    selectedEndDate != null ||
    selectedMerchant != null ||
    selectedAccountId != null ||
    selectedCategoryTypeId != null ||
    selectedCategoryId != null

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Box>
            <Typography variant='h4' component='h1' fontWeight='medium'>
              Transactions
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage and view all your transactions
            </Typography>
          </Box>
          <Button
            variant='contained'
            onClick={() => openTxnModal(ACTION_TYPE.CREATE, null)}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1, sm: 0 },
            }}
          >
            Add New Transaction
          </Button>
        </Stack>
      </Box>

      <TransactionFilters />

      {hasActiveFilters && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltOffIcon color='action' />
          <Typography variant='body2' color='text.secondary'>
            Showing {transactions.length} of {transactions.length} transactions
          </Typography>
          <Chip label='Filters Active' size='small' color='primary' variant='outlined' />
        </Box>
      )}

      {isLoading && (
        <Box display='flex' justifyContent='center' my={4}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !error && transactions.length === 0 && (
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

      {!isLoading && !error && transactions.length > 0 && <TransactionsTable transactions={transactions} />}

      {!isLoading && !error && transactions.length > 0 && (
        <Box display='flex' justifyContent='center' mt={3}>
          <Typography variant='body2' color='text.secondary'>
            Showing {transactions.length} transactions
          </Typography>
        </Box>
      )}
      <TransactionModal key={selectedTxn?.id || 'new'} />
    </Container>
  )
}
