import { ACTION_TYPE } from '@constants'
import { Warning as WarningIcon } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useCreateBudget, useDeleteBudget, useReadCategories, useUpdateBudget } from '@queries'
import { useAlertStore, useBudgetStore } from '@stores'
import type { Budget, BudgetRequest } from '@types'
import { extractAxiosErrorMessage, getAmountColor, getFormattedCurrency } from '@utils'
import React, { useMemo, useState } from 'react'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

const DefaultBudgetRequest: BudgetRequest = {
  categoryId: '',
  budgetMonth: new Date().getMonth() + 1,
  budgetYear: new Date().getFullYear(),
  amount: 0,
  notes: '',
}

function getDefaultBudgetFormData(budget: Budget | null): BudgetRequest {
  if (budget) {
    return {
      categoryId: budget.category.id,
      budgetMonth: budget.budgetMonth,
      budgetYear: budget.budgetYear,
      amount: budget.amount,
      notes: budget.notes,
    }
  }
  return DefaultBudgetRequest
}

function checkForChanges(formData: BudgetRequest, budget?: Budget | null): boolean {
  if (budget) {
    return (
      formData.categoryId !== budget.category.id ||
      formData.budgetMonth !== budget.budgetMonth ||
      formData.budgetYear !== budget.budgetYear ||
      formData.amount !== budget.amount ||
      formData.notes !== budget.notes
    )
  }

  return (
    formData.categoryId.trim() !== '' ||
    formData.budgetMonth != null ||
    formData.budgetMonth != new Date().getMonth() + 1 ||
    formData.budgetYear != null ||
    formData.budgetYear != new Date().getFullYear() ||
    formData.amount != null ||
    formData.notes.trim() !== ''
  )
}

export const BudgetModal: React.FC = () => {
  const { isBudgetModalOpen, budgetModalAction, selectedBudget, closeBudgetModal } = useBudgetStore()
  const { showAlert } = useAlertStore()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: cData } = useReadCategories()
  const categoriesList = useMemo(() => cData?.categories ?? [], [cData])
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const isLoading = createBudget.isPending || updateBudget.isPending || deleteBudget.isPending

  const [budgetFormData, setBudgetFormData] = useState<BudgetRequest>({ ...getDefaultBudgetFormData(selectedBudget) })
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const isCreate = budgetModalAction === ACTION_TYPE.CREATE
  const isUpdate = budgetModalAction === ACTION_TYPE.UPDATE
  const isDelete = budgetModalAction === ACTION_TYPE.DELETE
  const isOpen = isBudgetModalOpen && (isCreate || ((isUpdate || isDelete) && !!selectedBudget))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let successMsg = ''
    try {
      if (isUpdate || isCreate) {
        const { isValid, errors } = validateBudgetForm(budgetFormData)
        if (!isValid) {
          setErrors(errors)
          return
        }
      }

      if (selectedBudget) {
        if (isUpdate) {
          await updateBudget.mutateAsync({
            id: selectedBudget.id,
            payload: budgetFormData,
          })
          successMsg = 'Successfully Updated Budget...'
        } else if (isDelete) {
          await deleteBudget.mutateAsync({ id: selectedBudget.id })
          successMsg = 'Successfully Deleted Budget...'
        }
      } else if (isCreate) {
        await createBudget.mutateAsync(budgetFormData)
        successMsg = 'Successfully Created Budget...'
      }

      if (successMsg) {
        showAlert('success', successMsg)
        handleConfirmClose()
      }
    } catch (err) {
      const errorMessage = extractAxiosErrorMessage(err)
      showAlert('error', errorMessage)
    }
  }

  const validateBudgetForm = (formData: BudgetRequest): ValidationResult => {
    const errors: Record<string, string> = {}

    if (!formData.categoryId) {
      errors.categoryId = 'Category is required'
    }
    if (!formData.budgetMonth) {
      errors.budgetMonth = 'BudgetMonth is required'
    }
    if (!formData.budgetYear) {
      errors.budgetYear = 'BudgetYear is required'
    }
    if (!formData.amount || formData.amount === 0) {
      errors.amount = 'Amount is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      const hasUnsavedChanges = (isCreate || isUpdate) && checkForChanges(budgetFormData, selectedBudget)
      if ((isCreate || isUpdate) && hasUnsavedChanges) {
        setShowUnsavedWarning(true)
      } else {
        setErrors({})
        handleConfirmClose()
      }
    }
  }

  const handleCancelClose = () => setShowUnsavedWarning(false)

  const handleConfirmClose = () => {
    setBudgetFormData(DefaultBudgetRequest)
    setErrors({})
    setShowUnsavedWarning(false)
    closeBudgetModal()
  }

  const handleInputChange = (field: keyof BudgetRequest, value: string | number) => {
    setBudgetFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} maxWidth='sm' fullWidth aria-labelledby='budget-dialog-title'>
        <DialogTitle id='budget-dialog-title' sx={{ pb: 1 }}>
          <Box display='flex' alignItems='center' gap={1}>
            {isDelete ? (
              <>
                <WarningIcon color='error' />
                <Typography variant='h6' component='span'>
                  Delete Budget
                </Typography>
              </>
            ) : (
              <Typography variant='h6' component='span'>
                {isCreate ? 'Create' : 'Edit'} Budget
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          {isDelete ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Are you sure you want to delete this budget? This action cannot be undone.
              </DialogContentText>

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'grey.200',
                  mb: 2,
                }}
              >
                <Typography variant='subtitle2' gutterBottom>
                  Budget Details
                </Typography>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Category:
                  </Typography>
                  <Typography variant='body2' fontWeight='medium'>
                    {selectedBudget?.category.name || 'N/A'}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Year/Month:
                  </Typography>
                  <Typography variant='body2'>
                    {selectedBudget?.budgetYear || '-'} / {selectedBudget?.budgetMonth || '-'} /{' '}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Amount:
                  </Typography>
                  <Typography variant='body2' fontWeight='bold' color={getAmountColor(selectedBudget?.amount || null)}>
                    {getFormattedCurrency(selectedBudget?.amount || null)}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <FormControl fullWidth error={!!errors.categoryId} required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={budgetFormData.categoryId}
                      label='Category'
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    >
                      {categoriesList.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.categoryId && (
                      <Typography variant='caption' color='error'>
                        {errors.categoryId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label='Budget Amount'
                    type='number'
                    value={budgetFormData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    error={!!errors.amount}
                    helperText={errors.amount}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      inputProps: {
                        min: 0.01,
                        max: 1000000000,
                        step: 0.01,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.budgetMonth} required>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={budgetFormData.budgetMonth}
                      label='Month'
                      onChange={(e) => handleInputChange('budgetMonth', e.target.value)}
                    >
                      {months.map((month) => (
                        <MenuItem key={month.value} value={month.value}>
                          {month.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.budgetMonth && (
                      <Typography variant='caption' color='error'>
                        {errors.budgetMonth}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.budgetYear} required>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={budgetFormData.budgetYear}
                      label='Year'
                      onChange={(e) => handleInputChange('budgetYear', e.target.value)}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.budgetYear && (
                      <Typography variant='caption' color='error'>
                        {errors.budgetYear}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              <TextField
                label='Notes'
                value={budgetFormData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder='Add any notes about this budget (optional)'
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={isLoading} variant='outlined'>
            Cancel
          </Button>

          {isDelete ? (
            <Button
              onClick={(e) => void handleSubmit(e)}
              disabled={isLoading}
              variant='contained'
              color='error'
              startIcon={isLoading ? <CircularProgress size={20} /> : <WarningIcon />}
            >
              {isLoading ? 'Processing...' : 'Delete Budget'}
            </Button>
          ) : (
            <Button
              onClick={(e) => void handleSubmit(e)}
              disabled={isLoading}
              variant='contained'
              color='primary'
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {isLoading ? 'Saving...' : isCreate ? 'Create Budget' : 'Update Budget'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {(isCreate || isUpdate) && (
        <Dialog open={showUnsavedWarning} onClose={handleCancelClose} maxWidth='xs' fullWidth>
          <DialogTitle>
            <Typography variant='h6' component='div' fontWeight='bold'>
              Unsaved Changes
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>You have unsaved changes. Are you sure you want to close? All changes will be lost.</Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCancelClose}>Cancel</Button>
            <Button onClick={handleConfirmClose} variant='contained' color='error'>
              Discard Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
