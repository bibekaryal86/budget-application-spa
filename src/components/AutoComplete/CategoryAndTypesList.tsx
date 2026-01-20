import { TextField, Autocomplete, Box } from '@mui/material'
import type { Category, CategoryType } from '@types'
import React, { useMemo } from 'react'

interface CategoryAndTypesListProps {
  selectedCategoryTypeId: string
  selectedCategoryId: string
  setSelectedCategoryTypeId: (categoryTypeId: string) => void
  setSelectedCategoryId: (categoryId: string) => void
  categoryTypesList: CategoryType[]
  categoriesList: Category[]
}

export const CategoryAndTypesList: React.FC<CategoryAndTypesListProps> = ({
  selectedCategoryTypeId,
  selectedCategoryId,
  setSelectedCategoryTypeId,
  setSelectedCategoryId,
  categoryTypesList,
  categoriesList,
}) => {
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
    setSelectedCategoryTypeId(value || '')

    if (value && selectedCategoryId) {
      const selectedCategory = categoriesList?.find((cat) => cat.id === selectedCategoryId)
      if (selectedCategory?.categoryType.id !== value) {
        setSelectedCategoryId('')
      }
    }
  }

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategoryId(value || '')

    if (value && !selectedCategoryTypeId) {
      const selectedCategory = categoriesList?.find((cat) => cat.id === value)
      if (selectedCategory?.categoryType?.id) {
        setSelectedCategoryTypeId(selectedCategory.categoryType.id)
      }
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 0.5,
        width: '100%',
      }}
    >
      <Autocomplete
        fullWidth
        size='small'
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
      <Autocomplete
        fullWidth
        size='small'
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
    </Box>
  )
}
