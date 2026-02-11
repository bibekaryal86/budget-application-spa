import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Grid, Typography, Paper, Stack } from '@mui/material'
import { useReadAccountStatuses, useReadAccountTypes, useReadBanks } from '@queries'
import { useAccountStore } from '@stores'
import { isNullOrEmpty } from '@utils'
import React, { useMemo } from 'react'

export const AccountFilters: React.FC = () => {
  const { filterAccountType, filterAccountStatus, filterAccountBank, setAccountFilters, clearAccountFilters } =
    useAccountStore()
  const hasActiveFilters =
    !isNullOrEmpty(filterAccountStatus) || !isNullOrEmpty(filterAccountType) || !isNullOrEmpty(filterAccountBank)

  const { data: accountTypesData } = useReadAccountTypes()
  const { data: accountStatusesData } = useReadAccountStatuses()
  const { data: accountBanksData } = useReadBanks()

  const accountTypes = useMemo(() => accountTypesData?.accountTypes ?? [], [accountTypesData?.accountTypes])
  const accountStatuses = useMemo(
    () => accountStatusesData?.accountStatuses ?? [],
    [accountStatusesData?.accountStatuses],
  )
  const accountBanks = useMemo(() => accountBanksData?.banks ?? [], [accountBanksData?.banks])

  const handleAccountTypeChange = (accountType: string | null) => {
    setAccountFilters({
      filterAccountType: accountType,
      filterAccountStatus,
      filterAccountBank,
    })
  }

  const handleAccountStatusChange = (accountStatus: string | null) => {
    setAccountFilters({
      filterAccountType,
      filterAccountStatus: accountStatus,
      filterAccountBank,
    })
  }

  const handleBankChange = (bank: string | null) => {
    setAccountFilters({
      filterAccountType,
      filterAccountStatus,
      filterAccountBank: bank,
    })
  }

  return (
    <Paper
      elevation={0}
      variant='outlined'
      sx={{
        p: 1,
        mb: 3,
        borderRadius: 1,
        backgroundColor: 'background.default',
      }}
    >
      <Typography variant='h6' gutterBottom>
        Filters
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Grid
          container
          spacing={0.5}
          justifyContent='center'
          sx={{
            margin: '0 auto',
          }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterAccountType || ''}
                label='Account Type'
                onChange={(e) => handleAccountTypeChange(e.target.value)}
              >
                {accountTypes.map((accountType) => (
                  <MenuItem key={accountType} value={accountType}>
                    {accountType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterAccountStatus || ''}
                label='Account Status'
                onChange={(e) => handleAccountStatusChange(e.target.value)}
              >
                {accountStatuses.map((accountStatus) => (
                  <MenuItem key={accountStatus} value={accountStatus}>
                    {accountStatus}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Bank</InputLabel>
              <Select value={filterAccountBank || ''} label='Bank' onChange={(e) => handleBankChange(e.target.value)}>
                {accountBanks.map((bank) => (
                  <MenuItem key={bank} value={bank}>
                    {bank}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Stack direction='row' spacing={2} justifyContent='center'>
              <Button
                variant='outlined'
                startIcon={<FilterAltOffIcon />}
                onClick={clearAccountFilters}
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
