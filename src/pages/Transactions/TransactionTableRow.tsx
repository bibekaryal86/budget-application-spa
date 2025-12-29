import { ACTION_TYPE } from '@constants'
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Collapse,
  Box,
  Chip,
  Stack,
} from '@mui/material'
import { useTxnStore } from '@stores'
import type { Transaction } from '@types'
import { format } from 'date-fns'
import React, { useState } from 'react'

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

interface TransactionTableRowProps {
  transaction: Transaction
  isSuperUser: boolean
}

export const TransactionTableRow: React.FC<TransactionTableRowProps> = ({ transaction, isSuperUser }) => {
  const [expanded, setExpanded] = useState(false)
  const { openTxnModal } = useTxnStore()

  const handleEditClick = () => {
    console.log('Edit transaction:', transaction.id)
    openTxnModal(ACTION_TYPE.UPDATE, transaction)
  }

  const handleDeleteClick = () => {
    console.log('Delete transaction:', transaction.id)
    openTxnModal(ACTION_TYPE.DELETE, transaction)
  }

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label='expand row'
            size='small'
            onClick={() => setExpanded(!expanded)}
            disabled={!transaction.items || transaction.items.length === 0}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>

        <TableCell>{format(new Date(transaction.txnDate), 'yyyy-MM-dd')}</TableCell>

        <TableCell>
          <Typography variant='body2' fontWeight='medium'>
            {transaction.merchant}
          </Typography>
        </TableCell>

        <TableCell align='right'>
          <Typography
            variant='body2'
            sx={{
              color: transaction.totalAmount < 0 ? 'error.main' : 'success.main',
              fontWeight: 'bold',
            }}
          >
            {formatCurrency(transaction.totalAmount)}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant='body2' color='text.secondary' noWrap sx={{ maxWidth: 200 }}>
            {transaction.notes || '-'}
          </Typography>
        </TableCell>

        <TableCell align='right'>
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <IconButton size='small' onClick={handleEditClick} title='Edit Transaction' color='primary'>
              <EditIcon fontSize='small' />
            </IconButton>
            {isSuperUser && (
              <IconButton size='small' onClick={handleDeleteClick} title='Delete Transaction' color='error'>
                <DeleteIcon fontSize='small' />
              </IconButton>
            )}
          </Stack>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expanded} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant='subtitle2' gutterBottom fontWeight='medium'>
                Transaction Items
              </Typography>
              {!transaction.items || transaction.items.length === 0 ? (
                <Typography variant='body2' color='text.secondary' sx={{ py: 2 }}>
                  No items found for this transaction
                </Typography>
              ) : (
                <Table size='small' sx={{ backgroundColor: 'grey.50' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Label</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align='right'>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transaction.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Chip
                            label={item.category.name || 'Uncategorized'}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{item.label || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{item.txnType || '-'}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography
                            variant='body2'
                            sx={{
                              color: item.amount < 0 ? 'error.main' : 'success.main',
                              fontWeight: 'medium',
                            }}
                          >
                            {formatCurrency(item.amount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
