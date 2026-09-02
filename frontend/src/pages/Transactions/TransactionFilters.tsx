import { AutoCompleteMultiple, CategoryAndTypesList } from '@components'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Typography, TextField, Button, Paper, Stack, Autocomplete } from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useReadCategories, useReadCategoryTypes, useReadMerchants, useReadAccounts, useReadTags } from '@queries'
import { useTransactionStore } from '@stores'
import { getFormattedDate } from '@utils'
import React, { useMemo } from 'react'

export const TransactionFilters: React.FC = () => {
  const {
    txnFilterBeginDate,
    setTxnFilterBeginDate,
    txnFilterEndDate,
    setTxnFilterEndDate,
    txnFilterMerchant,
    setTxnFilterMerchant,
    txnFilterAccountId,
    setTxnFilterAccountId,
    txnFilterCategoryId,
    setTxnFilterCategoryId,
    txnFilterCategoryTypeId,
    setTxnFilterCategoryTypeId,
    txnFilterTags,
    setTxnFilterTags,
    resetTxnState,
  } = useTransactionStore()

  const { data: ctData } = useReadCategoryTypes()
  const { data: cData } = useReadCategories()
  const { data: mData } = useReadMerchants()
  const { data: tData } = useReadTags()
  const { data: aData } = useReadAccounts()

  const accountsList = useMemo(() => aData?.accounts ?? [], [aData])
  const merchantsList = useMemo(() => mData?.merchants ?? [], [mData])
  const tagsList = useMemo(() => tData?.tags ?? [], [tData])
  const categoriesList = useMemo(() => cData?.categories ?? [], [cData])
  const categoryTypesList = useMemo(() => ctData?.categoryTypes ?? [], [ctData])

  const handleClearFilters = () => {
    resetTxnState()
  }

  const hasActiveFilters = Boolean(
    txnFilterBeginDate ||
    txnFilterEndDate ||
    txnFilterMerchant ||
    txnFilterAccountId ||
    txnFilterCategoryTypeId ||
    txnFilterCategoryId ||
    (txnFilterTags && txnFilterTags.length > 0),
  )

  return (
    <Paper
      elevation={0}
      variant='outlined'
      sx={{
        p: 2,
        borderRadius: 1,
        backgroundColor: 'background.default',
      }}
    >
      <Typography variant='h6' gutterBottom>
        Filters
      </Typography>
      <Stack spacing={2}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label='Start Date'
            value={txnFilterBeginDate ? new Date(txnFilterBeginDate + 'T00:00:00') : null}
            onChange={(date) => setTxnFilterBeginDate(getFormattedDate(date))}
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label='End Date'
            value={txnFilterEndDate ? new Date(txnFilterEndDate) : null}
            onChange={(date) => setTxnFilterEndDate(getFormattedDate(date) || null)}
            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          />
        </LocalizationProvider>

        <Autocomplete
          fullWidth
          size='small'
          options={accountsList}
          getOptionLabel={(o) => o.name}
          value={accountsList.find((a) => a.id === txnFilterAccountId) || null}
          onChange={(_, v) => setTxnFilterAccountId(v?.id || '')}
          renderInput={(params) => <TextField {...params} label='Account' size='small' />}
        />

        <CategoryAndTypesList
          selectedCategoryTypeId={txnFilterCategoryTypeId || ''}
          selectedCategoryId={txnFilterCategoryId || ''}
          setSelectedCategoryTypeId={setTxnFilterCategoryTypeId}
          setSelectedCategoryId={setTxnFilterCategoryId}
          categoryTypesList={categoryTypesList}
          categoriesList={categoriesList}
          size='small'
          stacked={true}
        />

        <Autocomplete
          fullWidth
          size='small'
          options={merchantsList}
          getOptionLabel={(o) => o}
          value={merchantsList.find((m) => m === txnFilterMerchant) || null}
          onChange={(_, v) => setTxnFilterMerchant(v || '')}
          renderInput={(params) => <TextField {...params} label='Merchant' size='small' />}
        />

        <AutoCompleteMultiple
          value={txnFilterTags || []}
          onChange={(tags: string[]) => setTxnFilterTags(tags)}
          options={tagsList || []}
          label='Tags'
          placeholder='Hit Enter to Add Tags...'
          size='small'
        />

        <Button
          fullWidth
          variant='outlined'
          startIcon={<FilterAltOffIcon />}
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
        >
          Clear Filters
        </Button>
      </Stack>
    </Paper>
  )
}
