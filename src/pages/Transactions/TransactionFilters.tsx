import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import {
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Stack,
  Grid,
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useReadCategories, useReadCategoryTypes } from '@queries'
import { useTxnStore } from '@stores'
import React from 'react'

export const TransactionFilters: React.FC = () => {
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
    resetProfileState,
  } = useTxnStore()

  const { data: ctData } = useReadCategoryTypes()
  const { data: cData } = useReadCategories()

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant='h6' gutterBottom>
        Filters
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label='Start Date'
              value={selectedBeginDate}
              onChange={(date) => setSelectedBeginDate(date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <TextField
            fullWidth
            label='Merchant'
            value={selectedMerchant || ''}
            onChange={(e) => setSelectedMerchant(e.target.value || null)}
            placeholder='Search merchant...'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Category Type</InputLabel>
            <Select
              value={selectedCategoryTypeId || ''}
              label='Category Type'
              onChange={(e) => setSelectedCategoryTypeId(e.target.value || null)}
            >
              <MenuItem value=''>All</MenuItem>
              {ctData?.categoryTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategoryId || ''}
              label='Category'
              onChange={(e) => setSelectedCategoryId(e.target.value || null)}
              disabled={!selectedCategoryTypeId}
            >
              <MenuItem value=''>All</MenuItem>
              {cData?.categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button
              variant='outlined'
              startIcon={<FilterAltOffIcon />}
              onClick={resetProfileState}
              disabled={
                !(
                  selectedBeginDate ||
                  selectedEndDate ||
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
    </Paper>
  )
}
