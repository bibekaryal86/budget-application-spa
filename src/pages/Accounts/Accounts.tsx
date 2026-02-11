import { ACTION_TYPE } from '@constants'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Box, Button, Chip, Container, Paper, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useReadAccounts } from '@queries'
import { useAccountStore } from '@stores'
import { isNullOrEmpty } from '@utils'
import React, { useMemo } from 'react'

import { AccountFilters } from './AccountFilters.tsx'
import { AccountModal } from './AccountModal.tsx'
import { AccountTable } from './AccountTable.tsx'

export const Accounts: React.FC = () => {
  const { filterAccountStatus, filterAccountType, filterAccountBank, openAccountModal, selectedAccount } =
    useAccountStore()

  const { data, isLoading, error } = useReadAccounts()

  const accounts = useMemo(() => data?.accounts ?? [], [data?.accounts])

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const statusOk = isNullOrEmpty(filterAccountStatus) || acc.status === filterAccountStatus
      const typeOk = isNullOrEmpty(filterAccountType) || acc.accountType === filterAccountType
      const bankOk = isNullOrEmpty(filterAccountBank) || acc.bankName === filterAccountBank
      return statusOk && typeOk && bankOk
    })
  }, [accounts, filterAccountStatus, filterAccountType, filterAccountBank])

  const hasActiveFilters =
    !isNullOrEmpty(filterAccountStatus) || !isNullOrEmpty(filterAccountType) || !isNullOrEmpty(filterAccountBank)

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Box>
            <Typography variant='h4' component='h1' fontWeight='medium'>
              Accounts
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage your accounts
            </Typography>
          </Box>
          <Button
            variant='contained'
            onClick={() => openAccountModal(ACTION_TYPE.CREATE, null)}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              mt: { xs: 1, sm: 0 },
            }}
          >
            Create New Account
          </Button>
        </Stack>
      </Box>

      <AccountFilters />

      {hasActiveFilters && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterAltOffIcon color='action' />
          <Typography variant='body2' color='text.secondary'>
            Showing filtered accounts
          </Typography>
          <Chip label='Filters Active' size='small' color='primary' variant='outlined' />
        </Box>
      )}

      {isLoading && (
        <Box display='flex' justifyContent='center' my={4}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !error && filteredAccounts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' gutterBottom>
            No accounts found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {hasActiveFilters
              ? 'Try adjusting your filters or clear them to see all accounts.'
              : 'No accounts available. Create your first account to manage your finances!'}
          </Typography>
        </Paper>
      )}

      {!isLoading && !error && filteredAccounts.length > 0 && <AccountTable accounts={filteredAccounts} />}

      {!isLoading && !error && accounts.length > 0 && (
        <Box display='flex' justifyContent='center' mt={3}>
          <Typography variant='body2' color='text.secondary'>
            Showing {filteredAccounts.length} accounts
          </Typography>
        </Box>
      )}
      <AccountModal key={selectedAccount?.id || 'new'} />
    </Container>
  )
}
