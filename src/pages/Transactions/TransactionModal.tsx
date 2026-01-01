import { ACTION_TYPE, EXP_TYPES_LIST } from '@constants'
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
import {
  useCreateTransaction,
  useDeleteTransaction,
  useReadAccounts,
  useReadCategories,
  useReadMerchants,
  useUpdateTransaction,
} from '@queries'
import { useAlertStore, useTxnStore } from '@stores'
import type { Transaction, TransactionItem, TransactionItemRequest, TransactionRequest } from '@types'
import { extractAxiosErrorMessage, getAmountColor, getFormattedCurrency, getFormattedDate, getNumber } from '@utils'
import React, { useMemo, useState } from 'react'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// const DefaultTransactionItemRequest: TransactionItemRequest = {
//   id: null,
//   transactionId: null,
//   categoryId: '',
//   label: '',
//   amount: null,
//   expType: '',
// }

const DefaultTransactionRequest: TransactionRequest = {
  txnDate: null,
  merchant: '',
  accountId: '',
  totalAmount: null,
  notes: '',
  items: [],
}

function getDefaultTransactionFormData(txn: Transaction | null): TransactionRequest {
  if (txn) {
    return {
      txnDate: txn.txnDate ? new Date(txn.txnDate) : null,
      merchant: txn.merchant,
      accountId: txn.account.id,
      totalAmount: txn.totalAmount,
      notes: txn.notes,
      items: txn.items.map((i) => ({
        id: i.id,
        transactionId: i.transaction?.id || null,
        categoryId: i.category.id,
        label: i.label,
        amount: i.amount,
        expType: i.expType,
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
      formData.accountId !== txn.account.id ||
      formData.totalAmount !== txn.totalAmount ||
      formData.notes !== txn.notes
    return txnChanges || hasItemsChanged(formData.items, txn.items)
  }

  return (
    formData.txnDate !== null ||
    formData.merchant.trim() !== '' ||
    formData.accountId !== '' ||
    (formData.totalAmount != null && formData.totalAmount !== 0) ||
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
        existing.expType !== req.expType
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
      (req.amount != null && req.amount !== 0) ||
      (req.expType != null && req.expType !== '')
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

  const { data: aData } = useReadAccounts()
  const { data: cData } = useReadCategories()
  const { data: mData } = useReadMerchants()
  const accountsList = useMemo(() => aData?.accounts ?? [], [aData])
  const categoriesList = useMemo(() => cData?.categories ?? [], [cData])
  const merchantsList = useMemo(() => mData?.merchants ?? [], [mData])

  const isLoading = createTxn.isPending || updateTxn.isPending || deleteTxn.isPending

  const [txnFormData, setTxnFormData] = useState<TransactionRequest>({ ...getDefaultTransactionFormData(selectedTxn) })
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false)
  const [merchantSearch, setMerchantSearch] = useState(selectedTxn?.merchant || '')

  const filteredMerchants = useMemo(() => {
    if (!merchantSearch) return merchantsList
    return merchantsList.filter((merchant) => merchant.toLowerCase().includes(merchantSearch.toLowerCase()))
  }, [merchantsList, merchantSearch])

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

    if (!formData.accountId) {
      errors.account = 'AccountId is required'
    }

    const totalAmount = formData.totalAmount
    if (!totalAmount || isNaN(totalAmount)) {
      errors.totalAmount = 'Total Amount is required'
    } else if (totalAmount <= 0) {
      errors.totalAmount = 'Total Amount cannot be zero or negative'
    } else if (Math.abs(totalAmount) > 10000) {
      errors.totalAmount = 'Total Amount cannot exceed $10,000'
    }

    formData.items.forEach((item, index) => {
      const label = item.label.trim()
      if (!label) {
        errors[`item-${index}-label`] = 'Label is required'
      } else if (label.length > 200) {
        errors[`item-${index}-label`] = 'Label cannot exceed 200 characters'
      }

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
    setMerchantSearch('')
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
          label: '',
          amount: null,
          expType: '',
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

  const handleMerchantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMerchantSearch(value)
    setShowMerchantDropdown(true)
  }

  const handleMerchantSelect = (merchant: string) => {
    setTxnFormData((prev) => ({
      ...prev,
      merchant: merchant,
    }))
    setMerchantSearch(merchant)
    setShowMerchantDropdown(false)
  }

  const handleMerchantBlur = () => {
    setTimeout(() => {
      setShowMerchantDropdown(false)
      if (merchantSearch) {
        setTxnFormData((prev) => ({
          ...prev,
          merchant: merchantSearch,
        }))
      }
    }, 200)
  }

  const handleMerchantFocus = () => {
    if (merchantSearch) {
      setShowMerchantDropdown(true)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} maxWidth='lg' fullWidth aria-labelledby='transaction-dialog-title'>
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
                    color={getAmountColor(selectedTxn?.totalAmount || null)}
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
                    <Grid size={{ xs: 12, md: 3 }}>
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
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <div style={{ position: 'relative' }}>
                        <TextField
                          fullWidth
                          label='Merchant'
                          value={merchantSearch}
                          onChange={handleMerchantSearchChange}
                          onFocus={handleMerchantFocus}
                          onBlur={handleMerchantBlur}
                          required
                          error={!!itemErrors.merchant}
                          helperText={itemErrors.merchant}
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
                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormControl fullWidth size='medium' error={!!itemErrors.account}>
                        <InputLabel>Account</InputLabel>
                        <Select
                          size='medium'
                          value={txnFormData.accountId || ''}
                          label='Account'
                          onChange={(e) => {
                            const accountId = e.target.value
                            const selectedAccount = accountsList?.find((acc) => acc.id === accountId)
                            handleInputChange('accountId', selectedAccount?.id || '')
                          }}
                          required
                        >
                          <MenuItem value=''>Select Account</MenuItem>
                          {accountsList?.map((account) => (
                            <MenuItem key={account.id} value={account.id}>
                              {account.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {itemErrors.account && (
                          <Typography color='error' variant='caption' fontSize='small'>
                            {itemErrors.account}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField
                        fullWidth
                        label='Total Amount'
                        type='number'
                        value={selectedTxn?.totalAmount}
                        onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                        error={!!itemErrors.totalAmount}
                        helperText={itemErrors.totalAmount}
                        required
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
                  <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
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
                    <Stack spacing={1}>
                      {' '}
                      {txnFormData.items.map((item, index) => (
                        <Paper
                          key={item.id ?? `new-${index}`}
                          variant='outlined'
                          sx={{
                            p: 1.5,
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

                          <Grid container spacing={1}>
                            {' '}
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <TextField
                                fullWidth
                                size='small'
                                label='Label'
                                value={item.label}
                                onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                                error={!!itemErrors[`item-${index}-label`]}
                                helperText={itemErrors[`item-${index}-label`]}
                                required
                                placeholder='Item description'
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
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <FormControl fullWidth size='small' error={!!itemErrors[`item-${index}-category`]}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                  size='small'
                                  value={item.categoryId || ''}
                                  label='Category'
                                  onChange={(e) => {
                                    const categoryId = e.target.value
                                    const selectedCategory = categoriesList?.find((cat) => cat.id === categoryId)
                                    handleItemChange(index, 'categoryId', selectedCategory?.id || '')
                                  }}
                                  required
                                >
                                  <MenuItem value=''>Select Category</MenuItem>
                                  {categoriesList?.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                      {category.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {itemErrors[`item-${index}-category`] && (
                                  <Typography color='error' variant='caption' fontSize='small'>
                                    {itemErrors[`item-${index}-category`]}
                                  </Typography>
                                )}
                              </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                              <FormControl fullWidth size='small' error={!!itemErrors[`item-${index}-type`]}>
                                <InputLabel>Txn Type</InputLabel>
                                <Select
                                  size='small'
                                  value={item.expType ?? ''}
                                  label='Txn Type'
                                  onChange={(e) => {
                                    handleItemChange(index, 'expType', e.target.value)
                                  }}
                                  required
                                >
                                  <MenuItem value=''>Select Type</MenuItem>
                                  {EXP_TYPES_LIST.map((tt) => (
                                    <MenuItem key={tt} value={tt}>
                                      {tt}
                                    </MenuItem>
                                  ))}
                                </Select>
                                {itemErrors[`item-${index}-expType`] && (
                                  <Typography color='error' variant='caption' fontSize='small'>
                                    {itemErrors[`item-${index}-expType`]}
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
