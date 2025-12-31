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
  Box,
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useReadCategories, useReadCategoryTypes, useReadMerchants } from '@queries'
import { useTxnStore } from '@stores'
import React, { useMemo, useState } from 'react'

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
  const { data: mData } = useReadMerchants()

  const merchantsList = useMemo(() => mData?.merchants ?? [], [mData])
  const categoriesList = useMemo(() => cData?.categories ?? [], [cData])
  const categoryTypesList = useMemo(() => ctData?.categoryTypes ?? [], [ctData])
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false)
  const [merchantSearch, setMerchantSearch] = useState(selectedMerchant || '')

  const filteredMerchants = useMemo(() => {
    if (!merchantSearch) return merchantsList
    return merchantsList.filter((merchant) => merchant.toLowerCase().includes(merchantSearch.toLowerCase()))
  }, [merchantsList, merchantSearch])

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

  const handleMerchantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMerchantSearch(value)
    setShowMerchantDropdown(true)
  }

  const handleMerchantSelect = (merchant: string) => {
    setSelectedMerchant(merchant)
    setMerchantSearch(merchant)
    setShowMerchantDropdown(false)
  }

  const handleMerchantBlur = () => {
    setTimeout(() => {
      setShowMerchantDropdown(false)
    }, 200)
  }

  const handleMerchantFocus = () => {
    if (merchantSearch) {
      setShowMerchantDropdown(true)
    }
  }

  const handleClearFilters = () => {
    resetProfileState()
    setMerchantSearch('')
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
            <div style={{ position: 'relative' }}>
              <TextField
                fullWidth
                label='Merchant'
                value={merchantSearch}
                onChange={handleMerchantSearchChange}
                onFocus={handleMerchantFocus}
                onBlur={handleMerchantBlur}
                placeholder='Type to search...'
              />
              {showMerchantDropdown && filteredMerchants.length > 0 && (
                <Paper
                  sx={{
                    position: 'absolute',
                    zIndex: 1300,
                    width: '100%',
                    maxHeight: 300,
                    overflow: 'auto',
                    mt: 0.5,
                    boxShadow: 3,
                  }}
                >
                  {filteredMerchants.map((merchant) => (
                    <MenuItem
                      key={merchant}
                      onClick={() => handleMerchantSelect(merchant)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      {merchant}
                    </MenuItem>
                  ))}
                </Paper>
              )}
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category Type</InputLabel>
              <Select
                value={selectedCategoryTypeId || ''}
                label='Category Type'
                onChange={(e) => handleCategoryTypeChange(e.target.value || null)}
              >
                <MenuItem value=''>All</MenuItem>
                {categoryTypesList.map((type) => (
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
                onChange={(e) => handleCategoryChange(e.target.value || null)}
              >
                <MenuItem value=''>All</MenuItem>
                {filteredCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
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
                onClick={handleClearFilters}
                disabled={
                  !(
                    selectedBeginDate ||
                    selectedEndDate ||
                    selectedMerchant ||
                    merchantSearch ||
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
