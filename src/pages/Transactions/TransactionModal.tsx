import { AutoComplete, AutoCompleteMultiple } from '@components'
import { ACTION_TYPE } from '@constants'
import { Warning as WarningIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import {
  useCreateTransaction,
  useDeleteTransaction,
  useReadAccounts,
  useReadCategories,
  useReadMerchants,
  useReadTags,
  useUpdateTransaction,
} from '@queries'
import { useAlertStore, useTransactionStore } from '@stores'
import type { Transaction, TransactionItem, TransactionItemRequest, TransactionRequest } from '@types'
import { extractAxiosErrorMessage, getTxnAmountColor, getFormattedCurrency, getFormattedDate, getNumber } from '@utils'
import React, { useMemo, useState } from 'react'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// const DefaultTransactionItemRequest: TransactionItemRequest = {
//   id: null,
//   transactionId: null,
//   categoryId: '',
//   amount: null,
//   tags: [],
//   notes: '',
// }

const DefaultTransactionRequest: TransactionRequest = {
  txnDate: null,
  merchant: '',
  totalAmount: null,
  items: [],
}

function getDefaultTransactionFormData(txn: Transaction | null): TransactionRequest {
  if (txn) {
    return {
      txnDate: txn.txnDate ? new Date(txn.txnDate) : null,
      merchant: txn.merchant,
      totalAmount: txn.totalAmount,
      items: txn.items.map((i) => ({
        id: i.id,
        transactionId: i.transaction?.id || null,
        categoryId: i.category.id,
        accountId: i.account.id,
        amount: i.amount,
        tags: i.tags,
        notes: i.notes,
      })),
    }
  }
  return DefaultTransactionRequest
}

function checkForChanges(formData: TransactionRequest, txn?: Transaction | null): boolean {
  if (txn) {
    const txnChanges =
      getFormattedDate(formData.txnDate) !== getFormattedDate(txn.txnDate) ||
      formData.merchant !== txn.merchant ||
      formData.totalAmount !== txn.totalAmount
    return txnChanges || hasItemsChanged(formData.items, txn.items)
  }

  return (
    formData.txnDate !== null ||
    formData.merchant.trim() !== '' ||
    (formData.totalAmount != null && formData.totalAmount !== 0) ||
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
        existing.account.id !== req.accountId ||
        existing.notes !== req.notes ||
        existing.amount !== req.amount ||
        existing.tags !== req.tags
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
      (req.notes != null && req.notes.trim() !== '') ||
      (req.amount != null && req.amount !== 0) ||
      (req.tags != null && req.tags.length > 0)
    ) {
      return true
    }
  }

  return false
}

export const TransactionModal: React.FC = () => {
  const { isTxnModalOpen, txnModalAction, selectedTxn, closeTxnModal } = useTransactionStore()
  const { showAlert } = useAlertStore()
  const createTxn = useCreateTransaction()
  const updateTxn = useUpdateTransaction()
  const deleteTxn = useDeleteTransaction()

  const { data: aData } = useReadAccounts()
  const { data: cData } = useReadCategories()
  const { data: mData } = useReadMerchants()
  const { data: tData } = useReadTags()
  const accountsList = useMemo(() => aData?.accounts ?? [], [aData])
  const categoriesList = useMemo(() => cData?.categories ?? [], [cData])
  const merchantsList = useMemo(() => mData?.merchants ?? [], [mData])
  const tagsList = useMemo(() => tData?.tags ?? [], [tData])

  const isLoading = createTxn.isPending || updateTxn.isPending || deleteTxn.isPending

  const [txnFormData, setTxnFormData] = useState<TransactionRequest>({ ...getDefaultTransactionFormData(selectedTxn) })
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const isCreate = txnModalAction === ACTION_TYPE.CREATE
  const isUpdate = txnModalAction === ACTION_TYPE.UPDATE
  const isDelete = txnModalAction === ACTION_TYPE.DELETE
  const isOpen = isTxnModalOpen && (isCreate || ((isUpdate || isDelete) && !!selectedTxn))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let successMsg = ''
    try {
      if (isUpdate || isCreate) {
        const { isValid, errors } = validateTransactionForm(txnFormData)
        if (!isValid) {
          setItemErrors(errors)
          return
        }
      }

      if (selectedTxn) {
        if (isUpdate) {
          await updateTxn.mutateAsync({
            id: selectedTxn.id,
            payload: txnFormData,
          })
          successMsg = 'Successfully Updated Transaction...'
        } else if (isDelete) {
          await deleteTxn.mutateAsync({ id: selectedTxn.id })
          successMsg = 'Successfully Deleted Transaction...'
        }
      } else if (isCreate) {
        await createTxn.mutateAsync(txnFormData)
        successMsg = 'Successfully Created Transaction...'
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

  const validateTransactionForm = (formData: TransactionRequest): ValidationResult => {
    const errors: Record<string, string> = {}

    if (!formData.txnDate) {
      errors.txnDate = 'Date is required'
    } else if (formData.txnDate > new Date()) {
      errors.txnDate = 'Date cannot be in the future'
    }

    const merchant = formData.merchant.trim()
    if (!merchant) {
      errors.merchant = 'Merchant is required'
    } else if (merchant.length > 200) {
      errors.merchant = 'Merchant cannot exceed 200 characters'
    }

    const totalAmount = formData.totalAmount
    if (!totalAmount || isNaN(totalAmount)) {
      errors.totalAmount = 'Total Amount is required'
    } else if (totalAmount <= 0) {
      errors.totalAmount = 'Total Amount cannot be zero or negative'
    } else if (Math.abs(totalAmount) > 25000) {
      errors.totalAmount = 'Total Amount cannot exceed $25,000'
    }

    formData.items.forEach((item, index) => {
      if (!item.amount || isNaN(item.amount)) {
        errors[`item-${index}-amount`] = 'Amount is required'
      } else if (item.amount <= 0) {
        errors[`item-${index}-amount`] = 'Amount cannot be zero or negative'
      } else if (Math.abs(item.amount) > 10000) {
        errors[`item-${index}-amount`] = 'Amount cannot exceed $10,000'
      }

      if (!item.categoryId) {
        errors[`item-${index}-category`] = 'Category is required'
      }

      if (!item.accountId) {
        errors[`item-${index}-account`] = 'Account is required'
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      const hasUnsavedChanges = (isCreate || isUpdate) && checkForChanges(txnFormData, selectedTxn)
      if ((isCreate || isUpdate) && hasUnsavedChanges) {
        setShowUnsavedWarning(true)
      } else {
        handleConfirmClose()
      }
    }
  }

  const handleCancelClose = () => setShowUnsavedWarning(false)

  const handleConfirmClose = () => {
    setTxnFormData(DefaultTransactionRequest)
    setShowUnsavedWarning(false)
    setItemErrors({})
    closeTxnModal()
  }

  const handleInputChange = (field: keyof Omit<TransactionRequest, 'items' | 'txnDate'>, value: string | number) => {
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
          accountId: '',
          amount: null,
          expType: '',
          tags: [],
          notes: '',
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

  const handleItemChange = (index: number, field: keyof TransactionItemRequest, value: string | number) => {
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

  const handleTagsChange = (index: number, value: string[]) => {
    setTxnFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, tags: value } : item)),
    }))

    const errorKey = `item-${index}-tags`
    if (itemErrors[errorKey]) {
      const newErrors = { ...itemErrors }
      delete newErrors[errorKey]
      setItemErrors(newErrors)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth={isDelete ? 'sm' : 'md'}
        fullWidth
        aria-labelledby='transaction-dialog-title'
      >
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
                  <Typography variant='body2' fontWeight='bold' color={getTxnAmountColor(selectedTxn || null)}>
                    {getFormattedCurrency(selectedTxn?.totalAmount || null)}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack spacing={1}>
                <Box>
                  <Typography variant='subtitle1' gutterBottom fontWeight='medium'>
                    Transaction Details
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <DatePicker
                        label='Date'
                        value={txnFormData.txnDate}
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!itemErrors.txnDate,
                            helperText: itemErrors.txnDate,
                            required: true,
                            size: 'small',
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                      <AutoComplete
                        value={txnFormData.merchant || ''}
                        onChange={(event) => handleInputChange('merchant', event)}
                        dataList={merchantsList}
                        label='Merchant'
                        TextFieldProps={{
                          error: !!itemErrors.merchant,
                          helperText: itemErrors.merchant,
                          size: 'small',
                          required: true,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        fullWidth
                        label='Total Amount'
                        type='number'
                        value={txnFormData?.totalAmount}
                        onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                        error={!!itemErrors.totalAmount}
                        helperText={itemErrors.totalAmount}
                        required
                        size='small'
                        slotProps={{
                          input: {
                            startAdornment: (
                              <Typography color='text.secondary' mr={1}>
                                $
                              </Typography>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Box display='flex' justifyContent='space-between' alignItems='center' mb={0.5}>
                    {' '}
                    <Typography variant='subtitle1' fontWeight='medium'>
                      Items ({txnFormData.items.length})
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddItem}
                      variant='outlined'
                      size='small'
                      sx={{ py: 0.5 }}
                    >
                      Add Item
                    </Button>
                  </Box>

                  {txnFormData.items.length === 0 ? (
                    <Alert severity='info' sx={{ py: 1 }}>
                      {' '}
                      No items added. Click &quot;Add Item&quot; to add transaction items.
                    </Alert>
                  ) : (
                    <Stack spacing={0.5}>
                      {' '}
                      {txnFormData.items.map((item, index) => (
                        <Paper
                          key={item.id ?? `new-${index}`}
                          variant='outlined'
                          sx={{
                            p: 0.5,
                            '&:hover': { backgroundColor: 'action.hover' },
                          }}
                        >
                          <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
                            {' '}
                            <Typography variant='subtitle2' sx={{ fontSize: '0.9rem' }}>
                              {' '}
                              Item {index + 1}
                            </Typography>
                            <IconButton
                              size='small'
                              onClick={() => handleRemoveItem(index)}
                              color='error'
                              sx={{ width: 30, height: 30 }}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </Box>

                          <Grid container spacing={0.5}>
                            {' '}
                            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                              <Autocomplete
                                fullWidth
                                size='small'
                                options={categoriesList || []}
                                getOptionLabel={(option) => option.name || ''}
                                value={categoriesList?.find((cat) => cat.id === item.categoryId) || null}
                                onChange={(_, newValue) => {
                                  handleItemChange(index, 'categoryId', newValue?.id || '')
                                }}
                                renderInput={(params) => {
                                  const { InputLabelProps, ...rest } = params

                                  return (
                                    <TextField
                                      {...rest}
                                      label='Category'
                                      required
                                      error={!!itemErrors[`item-${index}-category`]}
                                      helperText={itemErrors[`item-${index}-category`]}
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
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                              <Autocomplete
                                fullWidth
                                size='small'
                                options={accountsList || []}
                                getOptionLabel={(option) => option.name || ''}
                                value={accountsList?.find((acc) => acc.id === item.accountId) || null}
                                onChange={(_, newValue) => {
                                  handleItemChange(index, 'accountId', newValue?.id || '')
                                }}
                                renderInput={(params) => {
                                  const { InputLabelProps, ...rest } = params

                                  return (
                                    <TextField
                                      {...rest}
                                      label='Account'
                                      required
                                      error={!!itemErrors[`item-${index}-account`]}
                                      helperText={itemErrors[`item-${index}-account`]}
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
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                              <TextField
                                fullWidth
                                size='small'
                                label='Amount'
                                type='number'
                                value={item.amount}
                                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                error={!!itemErrors[`item-${index}-amount`]}
                                helperText={itemErrors[`item-${index}-amount`]}
                                required
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <Typography color='text.secondary' mr={1} fontSize='small'>
                                        $
                                      </Typography>
                                    ),
                                  },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                              <AutoCompleteMultiple
                                value={item.tags || []}
                                onChange={(tags: string[]) => handleTagsChange(index, tags)}
                                options={tagsList || []}
                                label='Tags'
                                placeholder='Hit Enter to Add Tags...'
                                size='small'
                                error={!!itemErrors[`item-${index}-tags`]}
                                helperText={itemErrors[`item-${index}-tags`]}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                              <TextField
                                fullWidth
                                size='small'
                                label='Notes'
                                value={item.notes}
                                onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                error={!!itemErrors[`item-${index}-notes`]}
                                helperText={itemErrors[`item-${index}-notes`]}
                              />
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
                        p: 1,
                        mt: 1,
                        backgroundColor: 'grey.50',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Typography variant='subtitle2' fontWeight='bold'>
                          {' '}
                          Total Amount
                        </Typography>
                        <Typography variant='h6' fontWeight='bold' color='primary' fontSize='1rem'>
                          {' '}
                          {getFormattedCurrency(
                            txnFormData.items.length > 0
                              ? txnFormData.items.reduce((sum, item) => sum + getNumber(item.amount), 0)
                              : 0,
                          )}
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
