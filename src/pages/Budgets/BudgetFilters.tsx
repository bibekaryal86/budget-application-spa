import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Grid, Typography, Paper, Stack } from '@mui/material'
import { useReadCategories } from '@queries'
import { useBudgetStore } from '@stores'
import React from 'react'

export const BudgetFilters: React.FC = () => {
  const { selectedMonth, selectedYear, selectedCategoryId, setBudgetFilters, clearBudgetFilters } = useBudgetStore()

  const { data: categoriesData } = useReadCategories()
  const categories = categoriesData?.categories ?? []

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const handleMonthChange = (month: number | null) => {
    setBudgetFilters({
      selectedMonth: month,
      selectedYear,
      selectedCategoryId,
    })
  }

  const handleYearChange = (year: number | null) => {
    setBudgetFilters({
      selectedMonth,
      selectedYear: year,
      selectedCategoryId,
    })
  }

  const handleCategoryChange = (categoryId: string | null) => {
    setBudgetFilters({
      selectedMonth,
      selectedYear,
      selectedCategoryId: categoryId,
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
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth || ''}
                label='Month'
                onChange={(e) => handleMonthChange(e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value=''>
                  <em>All Months</em>
                </MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear || ''}
                label='Year'
                onChange={(e) => handleYearChange(e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value=''>
                  <em>All Years</em>
                </MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategoryId || ''}
                label='Category'
                onChange={(e) => handleCategoryChange(e.target.value || null)}
              >
                <MenuItem value=''>
                  <em>All Categories</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
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
                onClick={clearBudgetFilters}
                disabled={!selectedCategoryId}
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
