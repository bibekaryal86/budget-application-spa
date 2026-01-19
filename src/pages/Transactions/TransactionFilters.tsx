import { MerchantAutocomplete } from '@components'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Typography, TextField, Button, Paper, Stack, Grid, Box, Autocomplete } from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useReadCategories, useReadCategoryTypes, useReadMerchants, useReadAccounts } from '@queries'
import { useTxnStore } from '@stores'
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

  const filteredCategories = useMemo(() => {
    if (!categoriesList) return []

    if (selectedCategoryTypeId) {
      return categoriesList.filter((category) => category.categoryType.id === selectedCategoryTypeId)
    }

    if (selectedCategoryId) {
      const selectedCategory = categoriesList.find((cat) => cat.id === selectedCategoryId)
      if (selectedCategory) {
        return categoriesList
      }
    }
    return categoriesList
  }, [categoriesList, selectedCategoryTypeId, selectedCategoryId])

  const handleCategoryTypeChange = (value: string | null) => {
    setSelectedCategoryTypeId(value)

    if (value && selectedCategoryId) {
      const selectedCategory = categoriesList?.find((cat) => cat.id === selectedCategoryId)
      if (selectedCategory?.categoryType.id !== value) {
        setSelectedCategoryId(null)
      }
    }
  }

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategoryId(value)

    if (value && !selectedCategoryTypeId) {
      const selectedCategory = categoriesList?.find((cat) => cat.id === value)
      if (selectedCategory?.categoryType?.id) {
        setSelectedCategoryTypeId(selectedCategory.categoryType.id)
      }
    }
  }

  const handleClearFilters = () => {
    resetTxnState()
  }

  return (
    <Paper
      elevation={0}
      variant='outlined'
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: 'background.default',
      }}
    >
      <Typography variant='h6' gutterBottom>
        Filters
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Grid
          container
          spacing={2}
          justifyContent='center'
          sx={{
            margin: '0 auto',
          }}
        >
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Start Date'
                value={selectedBeginDate}
                onChange={(date) => setSelectedBeginDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='End Date'
                value={selectedEndDate}
                onChange={(date) => setSelectedEndDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <MerchantAutocomplete
              value={selectedMerchant || ''}
              onChange={setSelectedMerchant}
              merchants={merchantsList}
              label='Merchant'
              placeholder='Type to search...'
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Autocomplete
              fullWidth
              size='medium'
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
                    size='medium'
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
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Autocomplete
              fullWidth
              size='medium'
              options={categoryTypesList}
              getOptionLabel={(o) => o.name}
              value={categoryTypesList.find((t) => t.id === selectedCategoryTypeId) || null}
              onChange={(_, v) => handleCategoryTypeChange(v?.id || null)}
              renderInput={(params) => {
                const { InputLabelProps, ...rest } = params
                return (
                  <TextField
                    {...rest}
                    label='Category Type'
                    size='medium'
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
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Autocomplete
              fullWidth
              size='medium'
              options={filteredCategories}
              getOptionLabel={(o) => o.name}
              value={filteredCategories.find((c) => c.id === selectedCategoryId) || null}
              onChange={(_, v) => handleCategoryChange(v?.id || null)}
              renderInput={(params) => {
                const { InputLabelProps, ...rest } = params
                return (
                  <TextField
                    {...rest}
                    label='Category'
                    size='medium'
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
