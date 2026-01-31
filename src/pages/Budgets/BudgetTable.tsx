import { ACTION_TYPE } from '@constants'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  Box,
} from '@mui/material'
import { useAuthStore, useBudgetStore } from '@stores'
import type { Budget } from '@types'
import { getFormattedCurrency } from '@utils'
import React from 'react'

export const BudgetTable: React.FC<{ budgets: Budget[] }> = ({ budgets }) => {
  const { isSuperUser } = useAuthStore()
  const { openBudgetModal } = useBudgetStore()

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' })
  }

  // Function to calculate spent amount (you'll need to implement this based on your data)
  // For now, I'll assume it's 0 or you'll add it to the Budget interface later
  const getSpentAmount = () => {
    // This should come from your API or be calculated from transactions
    return 0
  }

  const calculateRemaining = (amount: number, spent: number) => amount - spent
  const calculatePercentage = (amount: number, spent: number) => (spent / amount) * 100

  const handleEditClick = (budget: Budget) => {
    openBudgetModal(ACTION_TYPE.UPDATE, budget)
  }

  const handleDeleteClick = (budget: Budget) => {
    openBudgetModal(ACTION_TYPE.DELETE, budget)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'error.main'
    if (percentage >= 75) return 'warning.main'
    return 'success.main'
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Month/Year</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align='right'>Budget Amount</TableCell>
            <TableCell align='right'>Spent</TableCell>
            <TableCell align='right'>Remaining</TableCell>
            <TableCell align='center'>Progress</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell align='center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {budgets.map((budget) => {
            const spent = getSpentAmount()
            const remaining = calculateRemaining(budget.amount, spent)
            const percentage = calculatePercentage(budget.amount, spent)
            const progressColor = getProgressColor(percentage)

            return (
              <TableRow key={budget.id} hover>
                <TableCell>
                  <Typography fontWeight='medium'>
                    {getMonthName(budget.budgetMonth)} {budget.budgetYear}
                  </Typography>
                </TableCell>
                <TableCell>{budget.category.name}</TableCell>
                <TableCell>{budget.category.categoryType.name}</TableCell>
                <TableCell align='right'>
                  <Typography fontWeight='medium'>{getFormattedCurrency(budget.amount)}</Typography>
                </TableCell>
                <TableCell align='right'>{getFormattedCurrency(spent)}</TableCell>
                <TableCell align='right'>
                  <Typography
                    color={remaining < 0 ? 'error.main' : 'text.primary'}
                    fontWeight={remaining < 0 ? 'bold' : 'normal'}
                  >
                    {getFormattedCurrency(remaining)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          height: 8,
                          bgcolor: 'grey.200',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${Math.min(percentage, 100)}%`,
                            bgcolor: progressColor,
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant='body2' color='text.secondary' sx={{ minWidth: 40 }}>
                      {percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {budget.notes || '-'}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Tooltip title='Edit'>
                    <IconButton size='small' onClick={() => handleEditClick(budget)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {isSuperUser && (
                    <Tooltip title='Delete'>
                      <IconButton size='small' onClick={() => handleDeleteClick(budget)} color='error'>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
