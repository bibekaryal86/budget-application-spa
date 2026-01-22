import { AutoComplete, CategoryAndTypesList } from '@components'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Typography, TextField, Button, Paper, Stack, Grid, Box, Autocomplete } from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useReadCategories, useReadCategoryTypes, useReadMerchants, useReadAccounts } from '@queries'
import { useTxnStore } from '@stores'
import { getFormattedDate } from '@utils'
import React, { useMemo } from 'react'

export const TransactionFilters: React.FC = () => {
  const {
    selectedBeginDate,
    setSelectedBeginDate,
    selectedEndDate,
    setSelectedEndDate,
    selectedMerchant,
    setSelectedMerchant,
    selectedAccountId,
    setSelectedAccountId,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedCategoryTypeId,
    setSelectedCategoryTypeId,
    resetTxnState,
  } = useTxnStore()

  const { data: ctData } = useReadCategoryTypes()
  const { data: cData } = useReadCategories()
  const { data: mData } = useReadMerchants()
  const { data: aData } = useReadAccounts()

  const accountsList = useMemo(() => aData?.accounts ?? [], [aData])
  const merchantsList = useMemo(() => mData?.merchants ?? [], [mData])
  const categoriesList = useMemo(() => cData?.categories ?? [], [cData])
  const categoryTypesList = useMemo(() => ctData?.categoryTypes ?? [], [ctData])

  const handleClearFilters = () => {
    resetTxnState()
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
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Start Date'
                value={selectedBeginDate ? new Date(selectedBeginDate + 'T00:00:00') : null}
                onChange={(date) => setSelectedBeginDate(getFormattedDate(date))}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 1.5 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='End Date'
                value={selectedEndDate ? new Date(selectedEndDate) : null}
                onChange={(date) => setSelectedEndDate(getFormattedDate(date) || null)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AutoComplete
              value={selectedMerchant || ''}
              onChange={setSelectedMerchant}
              dataList={merchantsList}
              label='Merchant'
              TextFieldProps={{
                size: 'small',
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Autocomplete
              fullWidth
              size='small'
              options={accountsList}
              getOptionLabel={(o) => o.name}
              value={accountsList.find((a) => a.id === selectedAccountId) || null}
              onChange={(_, v) => setSelectedAccountId(v?.id || '')}
              renderInput={(params) => {
                const { InputLabelProps, ...rest } = params
                return (
                  <TextField
                    {...rest}
                    label='Account'
                    size='small'
                    slotProps={{
                      inputLabel: {
                        className: InputLabelProps?.className ?? '',
                      },
                    }}
                  />
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CategoryAndTypesList
              selectedCategoryTypeId={selectedCategoryTypeId || ''}
              selectedCategoryId={selectedCategoryId || ''}
              setSelectedCategoryTypeId={setSelectedCategoryTypeId}
              setSelectedCategoryId={setSelectedCategoryId}
              categoryTypesList={categoryTypesList}
              categoriesList={categoriesList}
              size='small'
            />
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Stack direction='row' spacing={2} justifyContent='center'>
              <Button
                variant='outlined'
                startIcon={<FilterAltOffIcon />}
                onClick={handleClearFilters}
                disabled={
                  !(
                    selectedBeginDate ||
                    selectedEndDate ||
                    selectedMerchant ||
                    selectedAccountId ||
                    selectedMerchant ||
                    selectedCategoryTypeId ||
                    selectedCategoryId
                  )
                }
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
