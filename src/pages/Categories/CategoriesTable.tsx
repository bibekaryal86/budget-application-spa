import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import type { Category } from '@types'
import React from 'react'

export const CategoriesTable: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const groupedCategories = categories.reduce(
    (acc, category) => {
      const typeName = category.categoryType.name
      if (!acc[typeName]) {
        acc[typeName] = []
      }
      acc[typeName].push(category)
      return acc
    },
    {} as Record<string, Category[]>,
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category Type</TableCell>
              <TableCell>Categories</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(groupedCategories).map(([typeName, typeCategories]) => (
              <TableRow
                key={typeName}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  '&:last-child td, &:last-child th': { border: 0 },
                  '& > td': { verticalAlign: 'top' },
                }}
              >
                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>{typeName}</TableCell>
                <TableCell sx={{ width: '70%' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {typeCategories.map((category) => (
                      <Chip
                        key={category.id}
                        label={category.name}
                        size='small'
                        sx={{
                          marginBottom: 0.5,
                          marginRight: 0.5,
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
