import { AutoComplete } from '@components'
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
import {
  useCreateAccount,
  useDeleteAccount,
  useReadAccountStatuses,
  useReadAccountTypes,
  useReadBanks,
  useUpdateAccount,
} from '@queries'
import { useAlertStore, useAccountStore } from '@stores'
import type { Account, AccountRequest } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import React, { useMemo, useState } from 'react'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

const DefaultAccountRequest: AccountRequest = {
  name: '',
  accountType: '',
  bankName: '',
  openingBalance: 0,
  status: '',
}

function getDefaultAccountFormData(account: Account | null): AccountRequest {
  if (account) {
    return {
      name: account.name,
      accountType: account.accountType,
      bankName: account.bankName,
      openingBalance: account.openingBalance,
      status: account.status,
    }
  }
  return DefaultAccountRequest
}

function checkForChanges(formData: AccountRequest, account?: Account | null): boolean {
  if (account) {
    return (
      formData.name !== account.name ||
      formData.accountType !== account.accountType ||
      formData.bankName !== account.bankName ||
      formData.openingBalance !== account.openingBalance ||
      formData.status !== account.status
    )
  }

  return (
    formData.name.trim() !== '' ||
    formData.accountType.trim() != '' ||
    formData.bankName.trim() != '' ||
    (formData.openingBalance != null && formData.openingBalance != 0) ||
    formData.status.trim() != ''
  )
}

export const AccountModal: React.FC = () => {
  const { isAccountModalOpen, accountModalAction, selectedAccount, closeAccountModal } = useAccountStore()
  const { showAlert } = useAlertStore()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: accountTypesData } = useReadAccountTypes()
  const { data: accountStatusesData } = useReadAccountStatuses()
  const { data: accountBanksData } = useReadBanks()

  const accountTypes = useMemo(() => accountTypesData?.accountTypes ?? [], [accountTypesData?.accountTypes])
  const accountStatuses = useMemo(
    () => accountStatusesData?.accountStatuses ?? [],
    [accountStatusesData?.accountStatuses],
  )
  const accountBanks = useMemo(() => accountBanksData?.banks ?? [], [accountBanksData?.banks])

  const isLoading = createAccount.isPending || updateAccount.isPending || deleteAccount.isPending

  const [accountFormData, setAccountFormData] = useState<AccountRequest>({
    ...getDefaultAccountFormData(selectedAccount),
  })
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  const isCreate = accountModalAction === ACTION_TYPE.CREATE
  const isUpdate = accountModalAction === ACTION_TYPE.UPDATE
  const isDelete = accountModalAction === ACTION_TYPE.DELETE
  const isOpen = isAccountModalOpen && (isCreate || ((isUpdate || isDelete) && !!selectedAccount))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let successMsg = ''
    try {
      if (isUpdate || isCreate) {
        const { isValid, errors } = validateAccountForm(accountFormData)
        if (!isValid) {
          setErrors(errors)
          return
        }
      }

      if (selectedAccount) {
        if (isUpdate) {
          await updateAccount.mutateAsync({
            id: selectedAccount.id,
            payload: accountFormData,
          })
          successMsg = 'Successfully Updated Account...'
        } else if (isDelete) {
          await deleteAccount.mutateAsync({ id: selectedAccount.id })
          successMsg = 'Successfully Deleted Account...'
        }
      } else if (isCreate) {
        await createAccount.mutateAsync(accountFormData)
        successMsg = 'Successfully Created Account...'
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

  const validateAccountForm = (formData: AccountRequest): ValidationResult => {
    const errors: Record<string, string> = {}

    if (!formData.name) {
      errors.name = 'Name is required'
    }
    if (!formData.accountType) {
      errors.accountType = 'Type is required'
    }
    if (!formData.bankName) {
      errors.bankName = 'Bank is required'
    }
    if (formData.openingBalance == null) {
      errors.openingBalance = 'Opening Balance is required'
    }
    if (!formData.status) {
      errors.status = 'Status is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      const hasUnsavedChanges = (isCreate || isUpdate) && checkForChanges(accountFormData, selectedAccount)
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
    setAccountFormData(DefaultAccountRequest)
    setErrors({})
    setShowUnsavedWarning(false)
    closeAccountModal()
  }

  const handleInputChange = (field: keyof AccountRequest, value: string | number) => {
    setAccountFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} maxWidth='sm' fullWidth aria-labelledby='account-dialog-title'>
        <DialogTitle id='account-dialog-title' sx={{ pb: 1 }}>
          <Box display='flex' alignItems='center' gap={1}>
            {isDelete ? (
              <>
                <WarningIcon color='error' />
                <Typography variant='h6' component='span'>
                  Delete Account
                </Typography>
              </>
            ) : (
              <Typography variant='h6' component='span'>
                {isCreate ? 'Create' : 'Edit'} Account
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          {isDelete ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Are you sure you want to delete this account? This action cannot be undone.
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
                  Account Details
                </Typography>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Name:
                  </Typography>
                  <Typography variant='body2' fontWeight='medium'>
                    {selectedAccount?.name || 'N/A'}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' mb={1}>
                  <Typography variant='body2' color='text.secondary'>
                    Bank:
                  </Typography>
                  <Typography variant='body2'>{selectedAccount?.bankName || 'N/A'}</Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    label='Name'
                    value={accountFormData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth error={!!errors.accountType} required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={accountFormData.accountType}
                      label='Type'
                      onChange={(e) => handleInputChange('accountType', e.target.value)}
                    >
                      {accountTypes.map((at) => (
                        <MenuItem key={at} value={at}>
                          {at}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.accountType && (
                      <Typography variant='caption' color='error'>
                        {errors.accountType}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControl fullWidth error={!!errors.status} required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={accountFormData.status}
                      label='Status'
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      {accountStatuses.map((as) => (
                        <MenuItem key={as} value={as}>
                          {as}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && (
                      <Typography variant='caption' color='error'>
                        {errors.status}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <AutoComplete
                    value={accountFormData.bankName}
                    onChange={(event) => handleInputChange('bankName', event)}
                    dataList={accountBanks}
                    label='Bank'
                    TextFieldProps={{
                      error: !!errors.bankName,
                      helperText: errors.bankName,
                      required: true,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label='Opening Balance'
                    type='number'
                    value={accountFormData.openingBalance}
                    onChange={(e) => handleInputChange('openingBalance', e.target.value)}
                    error={!!errors.openingBalance}
                    helperText={errors.openingBalance}
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
              {isLoading ? 'Processing...' : 'Delete Account'}
            </Button>
          ) : (
            <Button
              onClick={(e) => void handleSubmit(e)}
              disabled={isLoading}
              variant='contained'
              color='primary'
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {isLoading ? 'Saving...' : isCreate ? 'Create Account' : 'Update Account'}
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
