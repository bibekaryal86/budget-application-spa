// Budgets.tsx
import { ACTION_TYPE } from '@constants'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Box, Button, Chip, Container, Paper, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useReadBudgets } from '@queries'
import { useBudgetStore } from '@stores'
import React, { useMemo } from 'react'

import { BudgetFilters } from './BudgetFilters.tsx'
import { BudgetModal } from './BudgetModal.tsx'
import { BudgetTable } from './BudgetTable.tsx'

export const Budgets: React.FC = () => {
  const { selectedMonth, selectedYear, selectedCategoryId, openBudgetModal, selectedBudget } = useBudgetStore()

  const { data, isLoading, error } = useReadBudgets(
    selectedMonth || new Date().getMonth() + 1,
    selectedYear || new Date().getFullYear(),
  )

  const budgets = useMemo(() => data?.budgets ?? [], [data?.budgets])

  const hasActiveFilters = selectedMonth != null || selectedYear != null || selectedCategoryId != null

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
              Budgets
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage and track your spending budgets
            </Typography>
          </Box>
          <Button
            variant='contained'
            onClick={() => openBudgetModal(ACTION_TYPE.CREATE, null)}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1, sm: 0 },
            }}
          >
            Create New Budget
          </Button>
        </Stack>
      </Box>

      <BudgetFilters />

      {hasActiveFilters && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltOffIcon color='action' />
          <Typography variant='body2' color='text.secondary'>
            Showing filtered budgets
          </Typography>
          <Chip label='Filters Active' size='small' color='primary' variant='outlined' />
        </Box>
      )}

      {isLoading && (
        <Box display='flex' justifyContent='center' my={4}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !error && budgets.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' gutterBottom>
            No budgets found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {hasActiveFilters
              ? 'Try adjusting your filters or clear them to see all budgets.'
              : 'No budgets available. Create your first budget to track your spending!'}
          </Typography>
        </Paper>
      )}

      {!isLoading && !error && budgets.length > 0 && <BudgetTable budgets={budgets} />}

      {!isLoading && !error && budgets.length > 0 && (
        <Box display='flex' justifyContent='center' mt={3}>
          <Typography variant='body2' color='text.secondary'>
            Showing {budgets.length} budgets
          </Typography>
        </Box>
      )}
      <BudgetModal key={selectedBudget?.id || 'new'} />
    </Container>
  )
}
