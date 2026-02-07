import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import type { Category } from '@types'
import React from 'react'
import { useState } from 'react'

export const CategoriesTable: React.FC<{
  categories: Category[]
  onUpdateCategory?: (categoryId: string, data: { name?: string; categoryTypeId?: string }) => Promise<void>
}> = ({ categories, onUpdateCategory }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [originalCategoryName, setOriginalCategoryName] = useState('')
  const [categoryTypeName, setCategoryTypeName] = useState('')
  const [originalTypeName, setOriginalTypeName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const groupedCategories = categories.reduce(
    (acc, category) => {
      const typeId = category.categoryType.id
      if (!acc[typeId]) {
        acc[typeId] = {
          type: category.categoryType,
          categories: [],
        }
      }
      acc[typeId].categories.push(category)
      return acc
    },
    {} as Record<string, { type: Category['categoryType']; categories: Category[] }>,
  )

  const handleStartEditCategory = (categoryId: string, currentName: string) => {
    setEditingCategory(categoryId)
    setCategoryName(currentName)
    setOriginalCategoryName(currentName)
  }

  const handleStartEditType = (typeId: string, currentName: string) => {
    setEditingType(typeId)
    setCategoryTypeName(currentName)
    setOriginalTypeName(currentName)
  }

  const handleSaveCategory = async (categoryId: string) => {
    if (!onUpdateCategory || categoryName.trim() === originalCategoryName) return

    setIsSubmitting(true)
    try {
      await onUpdateCategory(categoryId, { name: categoryName.trim() })
      setEditingCategory(null)
    } catch (error) {
      console.error('Failed to update category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveType = async (categoryId: string) => {
    if (!onUpdateCategory || categoryTypeName.trim() === originalTypeName) return

    setIsSubmitting(true)
    try {
      await onUpdateCategory(categoryId, { categoryTypeId: categoryTypeName.trim() })
      setEditingType(null)
    } catch (error) {
      console.error('Failed to update category type:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingType(null)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell sx={{ width: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groupedCategories).map(([typeId, { type, categories: typeCategories }]) =>
              typeCategories.map((category, index) => (
                <TableRow
                  key={category.id}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell sx={{ width: '30%' }}>
                    {editingType === typeId && index === 0 ? (
                      <TextField
                        value={categoryTypeName}
                        onChange={(e) => setCategoryTypeName(e.target.value)}
                        size='small'
                        fullWidth
                        disabled={isSubmitting}
                      />
                    ) : (
                      <Box
                        onClick={() => index === 0 && handleStartEditType(typeId, type.name)}
                        sx={{
                          cursor: index === 0 ? 'pointer' : 'default',
                          padding: 1,
                          borderRadius: 1,
                          '&:hover': index === 0 ? { backgroundColor: 'action.hover' } : {},
                        }}
                      >
                        {type.name}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ width: '50%' }}>
                    {editingCategory === category.id ? (
                      <TextField
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        size='small'
                        fullWidth
                        disabled={isSubmitting}
                      />
                    ) : (
                      <Box
                        onClick={() => handleStartEditCategory(category.id, category.name)}
                        sx={{
                          cursor: 'pointer',
                          padding: 1,
                          borderRadius: 1,
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                      >
                        {category.name}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ width: '20%' }}>
                    {(editingCategory === category.id || (editingType === typeId && index === 0)) && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size='small'
                          variant='contained'
                          disabled={
                            isSubmitting ||
                            (editingCategory === category.id && categoryName.trim() === originalCategoryName) ||
                            (editingType === typeId && index === 0 && categoryTypeName.trim() === originalTypeName)
                          }
                          onClick={() =>
                            editingCategory === category.id
                              ? void handleSaveCategory(category.id)
                              : void handleSaveType(category.id)
                          }
                        >
                          Save
                        </Button>
                        <Button size='small' variant='outlined' onClick={handleCancelEdit} disabled={isSubmitting}>
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
