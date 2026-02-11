import { ACTION_TYPE, DEFAULT_PAGE_NUMBER, DEFAULT_PER_PAGE } from '@constants'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Box, Button, Chip, Container, Paper, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useReadTransactions } from '@queries'
import { useTxnStore } from '@stores'
import { type ResponsePageInfo } from '@types'
import React, { useMemo, useState } from 'react'

import { TransactionFilters } from './TransactionFilters.tsx'
import { TransactionModal } from './TransactionModal.tsx'
import { TransactionsTable } from './TransactionTable.tsx'

export const Transactions: React.FC = () => {
  const {
    txnFilterBeginDate,
    txnFilterEndDate,
    txnFilterMerchant,
    txnFilterAccountId,
    txnFilterCategoryId,
    txnFilterCategoryTypeId,
    txnFilterTags,
    openTxnModal,
    selectedTxn,
  } = useTxnStore()

  const [pagination, setPagination] = useState({
    pageNumber: DEFAULT_PAGE_NUMBER,
    perPage: DEFAULT_PER_PAGE,
  })

  const { data, isLoading, error } = useReadTransactions({
    pageNumber: pagination.pageNumber,
    perPage: pagination.perPage,
    beginDate: txnFilterBeginDate,
    endDate: txnFilterEndDate,
    merchants: txnFilterMerchant ? [txnFilterMerchant] : [],
    categoryIds: txnFilterCategoryId ? [txnFilterCategoryId] : [],
    categoryTypeIds: txnFilterCategoryTypeId ? [txnFilterCategoryTypeId] : [],
    accountIds: txnFilterAccountId ? [txnFilterAccountId] : [],
    tags: txnFilterTags ? txnFilterTags : [],
  })

  const transactions = useMemo(() => data?.transactions ?? [], [data?.transactions])
  const pageInfo = useMemo((): ResponsePageInfo => {
    if (!data) {
      return {
        totalItems: 0,
        totalPages: 0,
        pageNumber: pagination.pageNumber,
        perPage: pagination.perPage,
      }
    }

    return {
      totalItems: data.pageInfo.totalItems || 0,
      totalPages: data.pageInfo.totalPages || 0,
      pageNumber: pagination.pageNumber || DEFAULT_PAGE_NUMBER,
      perPage: pagination.perPage || DEFAULT_PER_PAGE,
    }
  }, [data, pagination])

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: page }))
  }

  const handleRowsPerPageChange = (perPage: number) => {
    setPagination((prev) => ({ ...prev, perPage, pageNumber: 1 }))
  }

  const hasActiveFilters =
    txnFilterBeginDate != null ||
    txnFilterEndDate != null ||
    txnFilterMerchant != null ||
    txnFilterAccountId != null ||
    txnFilterCategoryTypeId != null ||
    txnFilterCategoryId != null ||
    (txnFilterTags != null && txnFilterTags.length > 0)

  const getDisplayRange = () => {
    if (pageInfo.totalItems === 0) return '0'
    const start = (pageInfo.pageNumber - 1) * pageInfo.perPage + 1
    const end = Math.min(pageInfo.pageNumber * pageInfo.perPage, pageInfo.totalItems)
    return `${start}-${end}`
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
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
              Manage and view your transactions
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
            {pageInfo.totalItems > 0
              ? `Showing ${getDisplayRange()} of ${pageInfo.totalItems} transactions`
              : 'No transactions found with current filters'}
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

      {!isLoading && !error && transactions.length > 0 && (
        <TransactionsTable
          transactions={transactions}
          pageInfo={pageInfo}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      <TransactionModal key={selectedTxn?.id || 'new'} />
    </Container>
  )
}
