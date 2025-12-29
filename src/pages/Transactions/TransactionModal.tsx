import { ACTION_TYPE } from '@constants'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '@queries'
import { useAlertStore, useTxnStore } from '@stores'
import { extractAxiosErrorMessage, getFormattedCurrency, getFormattedDate } from '@utils'
import React from 'react'

export const TransactionModal: React.FC = () => {
  const { isTxnModalOpen, txnModalAction, selectedTxn, closeTxnModal } = useTxnStore()
  const { showAlert } = useAlertStore()
  const createTxn = useCreateTransaction()
  const updateTxn = useUpdateTransaction()
  const deleteTxn = useDeleteTransaction()

  const isLoading = createTxn.isPending || updateTxn.isPending || deleteTxn.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedTxn) {
        if (txnModalAction === ACTION_TYPE.CREATE) {
          await createTxn.mutateAsync(null)
        } else if (txnModalAction === ACTION_TYPE.UPDATE) {
          await updateTxn.mutateAsync({
            id: selectedTxn.id,
            payload: null,
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

  if (!isTxnModalOpen && txnModalAction !== ACTION_TYPE.DELETE) return null

  return (
    <Dialog
      open={isTxnModalOpen}
      onClose={closeTxnModal}
      maxWidth='sm'
      fullWidth
      aria-labelledby='delete-transaction-dialog-title'
    >
      <DialogTitle id='delete-transaction-dialog-title' sx={{ pb: 1 }}>
        <Box display='flex' alignItems='center' gap={1}>
          <WarningIcon color='error' />
          <Typography variant='h6' component='span'>
            Delete Transaction
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={closeTxnModal} disabled={isLoading} variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={(e) => void handleSubmit(e)}
          disabled={isLoading}
          variant='contained'
          color='error'
          startIcon={isLoading ? <CircularProgress size={16} /> : <WarningIcon />}
        >
          {isLoading ? 'Processing' : 'Delete Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
