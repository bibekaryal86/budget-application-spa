import { ACTION_TYPE } from '@constants'
import { Warning as WarningIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useCreateTransaction, useDeleteTransaction, useReadCategories, useUpdateTransaction } from '@queries'
import { useAlertStore, useTxnStore } from '@stores'
import type { Transaction, TransactionItem, TransactionItemRequest, TransactionRequest } from '@types'
import { extractAxiosErrorMessage, getFormattedCurrency, getFormattedDate, getNumber, getString } from '@utils'
import React, { useMemo, useState } from 'react'

// const DefaultTransactionItemRequest: TransactionItemRequest = {
//   id: null,
//   transactionId: null,
//   categoryId: '',
//   label: '',
//   amount: 0.0,
//   txnType: '',
// }

const DefaultTransactionRequest: TransactionRequest = {
  txnDate: null,
  merchant: '',
  totalAmount: 0.0,
  notes: '',
  items: [],
}

function getDefaultTransactionFormData(txn: Transaction | null): TransactionRequest {
  if (txn) {
    return {
      txnDate: txn.txnDate,
      merchant: txn.merchant,
      totalAmount: txn.totalAmount,
      notes: txn.notes,
      items: txn.items.map((i) => ({
        id: i.id,
        transactionId: i.transaction?.id || null,
        categoryId: i.category.id,
        label: i.label,
        amount: i.amount,
        txnType: i.txnType,
      })),
    }
  }
  return DefaultTransactionRequest
}

function checkForChanges(formData: TransactionRequest, txn?: Transaction | null): boolean {
  if (txn) {
    return (
      formData.txnDate !== txn.txnDate ||
      formData.merchant !== txn.merchant ||
      formData.totalAmount !== txn.totalAmount ||
      formData.notes !== txn.notes ||
      hasItemsChanged(formData.items, txn.items)
    )
  }

  return (
    formData.txnDate !== null ||
    formData.merchant.trim() !== '' ||
    formData.totalAmount !== 0.0 ||
    formData.notes?.trim() !== '' ||
    hasItemsChanged(formData.items, [])
  )
}

function hasItemsChanged(request: TransactionItemRequest[], txn: TransactionItem[]): boolean {
  if (txn.length > 0) {
    if (request.length !== txn.length) {
      return true
    }

    const txnMap = new Map<string, TransactionItem>()
    for (const item of txn) {
      txnMap.set(item.id, item)
    }

    for (const req of request) {
      if (!req.id) {
        return true
      }

      const existing = txnMap.get(req.id)
      if (!existing) {
        return true
      }

      if (
        existing.category.id !== req.categoryId ||
        existing.label !== req.label ||
        existing.amount !== req.amount ||
        existing.txnType !== req.txnType
      ) {
        return true
      }
    }

    return false
  }

  // Case 2: No existing txn items
  // Return true if request contains ANY populated field
  for (const req of request) {
    if (
      req.categoryId != null ||
      (req.label != null && req.label.trim() !== '') ||
      req.amount !== null ||
      req.amount !== 0.0
    ) {
      return true
    }
  }

  return false
}

export const TransactionModal: React.FC = () => {
  const { isTxnModalOpen, txnModalAction, selectedTxn, closeTxnModal } = useTxnStore()
  const { showAlert } = useAlertStore()
  const createTxn = useCreateTransaction()
  const updateTxn = useUpdateTransaction()
  const deleteTxn = useDeleteTransaction()

  const { data: cData } = useReadCategories()
  const categoriesList = useMemo(() => cData?.categories ?? [], [cData])

  const isLoading = createTxn.isPending || updateTxn.isPending || deleteTxn.isPending

  const [txnFormData, setTxnFormData] = useState<TransactionRequest>({ ...getDefaultTransactionFormData(selectedTxn) })
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const isCreate = txnModalAction === ACTION_TYPE.CREATE
  const isUpdate = txnModalAction === ACTION_TYPE.CREATE
  const isDelete = txnModalAction === ACTION_TYPE.DELETE
  const isOpen = isTxnModalOpen && (isCreate || ((isUpdate || isDelete) && !!selectedTxn))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedTxn) {
        if (txnModalAction === ACTION_TYPE.CREATE) {
          await createTxn.mutateAsync(txnFormData)
        } else if (txnModalAction === ACTION_TYPE.UPDATE) {
          await updateTxn.mutateAsync({
            id: selectedTxn.id,
            payload: txnFormData,
          })
        } else if (txnModalAction === ACTION_TYPE.DELETE) {
          await deleteTxn.mutateAsync({ id: selectedTxn.id })
        }
      }
    } catch (err) {
      const errorMessage = extractAxiosErrorMessage(err)
      showAlert('error', errorMessage)
    }
  }

  const hasUnsavedChanges = useMemo(() => {
    if (txnModalAction === ACTION_TYPE.CREATE || txnModalAction === ACTION_TYPE.UPDATE) {
      return checkForChanges(txnFormData, selectedTxn)
    }
  }, [selectedTxn, txnFormData, txnModalAction])

  const handleClose = () => {
    if (!isLoading) {
      if ((isCreate || isUpdate) && hasUnsavedChanges) {
        setShowUnsavedWarning(true)
      } else {
        setShowUnsavedWarning(false)
        closeTxnModal()
        setTxnFormData(DefaultTransactionRequest)
        setItemErrors({})
      }
    }
  }

  const handleCancelClose = () => setShowUnsavedWarning(false)

  const handleConfirmClose = () => {
    setShowUnsavedWarning(false)
    closeTxnModal()
    setTxnFormData(DefaultTransactionRequest)
    setItemErrors({})
  }

  const handleInputChange = (field: keyof Omit<TransactionRequest, 'items' | 'txnDate'>, value: string) => {
    setTxnFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateChange = (txnDate: Date | null) => {
    setTxnFormData((prev) => ({
      ...prev,
      txnDate,
    }))
  }

  const handleAddItem = () => {
    setTxnFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: null,
          transactionId: selectedTxn?.id || null,
          categoryId: '',
          label: '',
          amount: 0.0,
          txnType: '',
        },
      ],
    }))
  }

  const handleRemoveItem = (index: number) => {
    setTxnFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
    // Clear errors for removed item
    const newErrors = { ...itemErrors }
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`item-${index}-`)) {
        delete newErrors[key]
      }
    })
    setItemErrors(newErrors)
  }

  const handleItemChange = (index: number, field: keyof TransactionItem, value: string | number) => {
    setTxnFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
    if (itemErrors[`item-${index}-${field}`]) {
      const newErrors = { ...itemErrors }
      delete newErrors[`item-${index}-${field}`]
      setItemErrors(newErrors)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} maxWidth='md' fullWidth aria-labelledby='transaction-dialog-title'>
        <DialogTitle id='transaction-dialog-title' sx={{ pb: 1 }}>
          <Box display='flex' alignItems='center' gap={1}>
            {isDelete ? (
              <>
                <WarningIcon color='error' />
                <Typography variant='h6' component='span'>
                  Delete Transaction
                </Typography>
              </>
            ) : (
              <Typography variant='h6' component='span'>
                {isCreate ? 'Create' : 'Edit'} Transaction
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          {isDelete ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Are you sure you want to delete this transaction? This action cannot be undone.
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
                  Transaction Details
                </Typography>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Merchant:
                  </Typography>
                  <Typography variant='body2' fontWeight='medium'>
                    {selectedTxn?.merchant || 'N/A'}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Date:
                  </Typography>
                  <Typography variant='body2'>{getFormattedDate(selectedTxn?.txnDate || null)}</Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Amount:
                  </Typography>
                  <Typography
                    variant='body2'
                    fontWeight='bold'
                    color={selectedTxn?.totalAmount && selectedTxn.totalAmount < 0 ? 'error.main' : 'success.main'}
                  >
                    {getFormattedCurrency(selectedTxn?.totalAmount || null)}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant='subtitle1' gutterBottom fontWeight='medium'>
                    Transaction Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DatePicker
                        label='Date'
                        value={txnFormData.txnDate}
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!itemErrors.date,
                            helperText: itemErrors.date,
                            required: true,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label='Merchant'
                        value={txnFormData.merchant}
                        onChange={(e) => handleInputChange('merchant', e.target.value)}
                        error={!!itemErrors.merchant}
                        helperText={itemErrors.merchant}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label='Total Amount'
                        type='number'
                        value={selectedTxn?.totalAmount}
                        onChange={(e) => handleInputChange('totalAmount', getString(getNumber(e.target.value)))}
                        error={!!itemErrors.totalAmount}
                        helperText={itemErrors.totalAmount}
                        required
                        InputProps={{
                          startAdornment: (
                            <Typography color='text.secondary' mr={1}>
                              $
                            </Typography>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label='Notes'
                        value={txnFormData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                    <Typography variant='subtitle1' fontWeight='medium'>
                      Items ({txnFormData.items.length})
                    </Typography>
                    <Button startIcon={<AddIcon />} onClick={handleAddItem} variant='outlined' size='small'>
                      Add Item
                    </Button>
                  </Box>

                  {txnFormData.items.length === 0 ? (
                    <Alert severity='info'>No items added. Click &#34;Add Item&#34; to add transaction items.</Alert>
                  ) : (
                    <Stack spacing={2}>
                      {txnFormData.items.map((item, index) => (
                        <Paper key={item.id} variant='outlined' sx={{ p: 2 }}>
                          <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={2}>
                            <Typography variant='subtitle2'>Item {index + 1}</Typography>
                            <IconButton size='small' onClick={() => handleRemoveItem(index)} color='error'>
                              <DeleteIcon />
                            </IconButton>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid sx={{ xs: 12, md: 4 }}>
                              <TextField
                                fullWidth
                                label='Label'
                                value={item.label}
                                onChange={(e) => handleItemChange(index, 'label', getString(e.target.value))}
                                error={!!itemErrors[`item-${index}-label`]}
                                helperText={itemErrors[`item-${index}-label`]}
                                required
                              />
                            </Grid>
                            <Grid sx={{ xs: 12, md: 4 }}>
                              <TextField
                                fullWidth
                                label='Amount'
                                type='number'
                                value={item.amount}
                                onChange={(e) => handleItemChange(index, 'amount', getNumber(e.target.value))}
                                error={!!itemErrors[`item-${index}-amount`]}
                                helperText={itemErrors[`item-${index}-amount`]}
                                required
                                InputProps={{
                                  startAdornment: (
                                    <Typography color='text.secondary' mr={1}>
                                      $
                                    </Typography>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid sx={{ xs: 12, md: 4 }}>
                              <FormControl fullWidth error={!!itemErrors[`item-${index}-category`]}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                  value={item.categoryId}
                                  label='Category'
                                  onChange={(e) => {
                                    const category = { id: e.target.value, name: 'Selected Category' }
                                    handleItemChange(index, 'category', category.id)
                                  }}
                                  required
                                >
                                  <MenuItem value=''>Select Category</MenuItem>
                                  {categoriesList.map((category) => (
                                    <MenuItem
                                      key={category.id}
                                      onClick={() => handleItemChange(index, 'category', category.id)}
                                      sx={{
                                        '&:hover': {
                                          backgroundColor: 'action.hover',
                                        },
                                      }}
                                    >
                                      {category.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {itemErrors[`item-${index}-category`] && (
                                  <Typography color='error' variant='caption'>
                                    {itemErrors[`item-${index}-category`]}
                                  </Typography>
                                )}
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Stack>
                  )}

                  {txnFormData.items.length > 0 && (
                    <Paper
                      variant='outlined'
                      sx={{
                        p: 2,
                        mt: 2,
                        backgroundColor: 'grey.50',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Typography variant='subtitle1' fontWeight='bold'>
                          Total Amount
                        </Typography>
                        <Typography variant='h6' fontWeight='bold' color='primary'>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(txnFormData.items.reduce((sum, item) => sum + (item.amount || 0), 0))}
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </Box>
              </Stack>
            </LocalizationProvider>
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
              {isLoading ? 'Processing...' : 'Delete Transaction'}
            </Button>
          ) : (
            <Button
              onClick={(e) => void handleSubmit(e)}
              disabled={isLoading}
              variant='contained'
              color='primary'
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {isLoading ? 'Saving...' : isCreate ? 'Create Transaction' : 'Update Transaction'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {(isCreate || isUpdate) && (
        <Dialog open={showUnsavedWarning} onClose={handleCancelClose} maxWidth='xs' fullWidth>
          <DialogTitle>
            <Typography variant='h6' fontWeight='bold'>
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
