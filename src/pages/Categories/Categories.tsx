import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import {
  Typography,
  Paper,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Container,
  Chip,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useReadCategories } from '@queries'
import { useCategoryStore } from '@stores'
import type { CategoryType } from '@types'
import React, { useMemo } from 'react'

import { CategoriesTable } from './CategoriesTable.tsx'

export const Categories: React.FC = () => {
  const { selectedCategoryTypeId, setCategoryFilters, clearCategoryFilters } = useCategoryStore()

  const { data, isLoading, error } = useReadCategories()
  const categories = useMemo(() => data?.categories ?? [], [data?.categories])

  const categoryTypes = useMemo(() => {
    const map = new Map<string, CategoryType>()

    categories.forEach(({ categoryType }) => {
      map.set(categoryType.id, categoryType)
    })

    return Array.from(map.values())
  }, [categories])

  const filteredCategories = useMemo(
    () =>
      selectedCategoryTypeId ? categories.filter((cat) => cat.categoryType.id === selectedCategoryTypeId) : categories,
    [categories, selectedCategoryTypeId],
  )

  const hasActiveFilters = selectedCategoryTypeId != null
  const handleCategoryTypeFilterChange = (categoryTypeId: string | null) => {
    setCategoryFilters({
      selectedCategoryTypeId: categoryTypeId,
    })
  }

  console.log(selectedCategoryTypeId)
  console.log(hasActiveFilters)

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
              Categories
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              View available category and category types to organize your spending...
            </Typography>
          </Box>
        </Stack>
      </Box>
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
        <Box sx={{ width: '100%' }}>
          <Grid
            container
            spacing={0.5}
            justifyContent='center'
            sx={{
              margin: '0 auto',
            }}
          >
            <Grid alignSelf='center' size={{ xs: 12, sm: 4, md: 1 }}>
              <Typography variant='h6'>Filters</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 9 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Category Type</InputLabel>
                <Select
                  value={selectedCategoryTypeId || ''}
                  label='Category Type'
                  onChange={(e) => handleCategoryTypeFilterChange(e.target.value)}
                >
                  {categoryTypes.map((catType) => (
                    <MenuItem key={catType.id} value={catType.id}>
                      {catType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <Button
                variant='outlined'
                startIcon={<FilterAltOffIcon />}
                onClick={clearCategoryFilters}
                disabled={!hasActiveFilters}
              >
                Clear
              </Button>
            </Grid>
            {hasActiveFilters && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterAltOffIcon color='action' />
                <Typography variant='body2' color='text.secondary'>
                  Showing filtered categories
                </Typography>
                <Chip label='Filters Active' size='small' color='primary' variant='outlined' />
              </Box>
            )}
          </Grid>
        </Box>
      </Paper>
      {isLoading && (
        <Box display='flex' justifyContent='center' my={4}>
          <CircularProgress />
        </Box>
      )}
      {!isLoading && !error && categories.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' gutterBottom>
            No categories found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {hasActiveFilters
              ? 'Try adjusting your filters or clear them to see all categories.'
              : 'No categories available. Create your first category to manage your spending!'}
          </Typography>
        </Paper>
      )}
      <CategoriesTable categories={filteredCategories} />
      {!isLoading && !error && categories.length > 0 && (
        <Box display='flex' justifyContent='center' mt={3}>
          <Typography variant='body2' color='text.secondary'>
            Showing {filteredCategories.length} categories
          </Typography>
        </Box>
      )}
    </Container>
  )
}
