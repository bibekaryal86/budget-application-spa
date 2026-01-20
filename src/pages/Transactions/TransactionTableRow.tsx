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
import { getTxnAmountColor, getTxnItemAmountColor, getFormattedCurrency, getFormattedDate } from '@utils'
import React, { useState } from 'react'

interface TransactionTableRowProps {
  transaction: Transaction
  isSuperUser: boolean
}

export const TransactionTableRow: React.FC<TransactionTableRowProps> = ({ transaction, isSuperUser }) => {
  const [expanded, setExpanded] = useState(false)
  const { openTxnModal } = useTxnStore()

  const handleEditClick = () => {
    openTxnModal(ACTION_TYPE.UPDATE, transaction)
  }

  const handleDeleteClick = () => {
    openTxnModal(ACTION_TYPE.DELETE, transaction)
  }

  return (
    <>
      <TableRow
        hover
        sx={{
          '& > *': { borderBottom: 'unset' },
          cursor: transaction.items && transaction.items.length > 0 ? 'pointer' : 'default',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: transaction.items && transaction.items.length > 0 ? 'action.hover' : undefined,
          },
          '&:active': {
            backgroundColor: transaction.items && transaction.items.length > 0 ? 'action.selected' : undefined,
          },
        }}
        onClick={(e) => {
          // Only trigger if we didn't click on the icon button or action buttons
          const target = e.target as HTMLElement
          const isIconButton = target.closest('.expand-icon-button') || target.closest('.MuiIconButton-root')
          const isActionButton = target.closest('.action-button') || target.closest('.MuiButton-root')

          if (!isIconButton && !isActionButton && transaction.items && transaction.items.length > 0) {
            setExpanded(!expanded)
          }
        }}
      >
        <TableCell
          sx={{
            // Prevent click on this cell from triggering row click twice
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              pointerEvents: 'auto',
              display: 'inline-block',
            }}
          >
            <IconButton
              className='expand-icon-button'
              aria-label='expand row'
              size='small'
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              disabled={!transaction.items || transaction.items.length === 0}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                '&.Mui-disabled': {
                  pointerEvents: 'none',
                  opacity: 0.5,
                },
              }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </TableCell>

        <TableCell>{getFormattedDate(transaction.txnDate)}</TableCell>

        <TableCell>
          <Typography variant='body2' fontWeight='medium'>
            {transaction.merchant}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant='body2' fontWeight='medium'>
            {transaction.account.name}
          </Typography>
        </TableCell>

        <TableCell align='right'>
          <Typography
            variant='body2'
            sx={{
              color: getTxnAmountColor(transaction),
              fontWeight: 'bold',
            }}
          >
            {getFormattedCurrency(transaction.totalAmount)}
          </Typography>
        </TableCell>

        <TableCell
          align='right'
          sx={{
            // Prevent click on actions cell from triggering row expansion
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              pointerEvents: 'auto',
              display: 'inline-block',
            }}
          >
            <Stack direction='row' spacing={1} justifyContent='flex-end'>
              <IconButton
                className='action-button'
                size='small'
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditClick()
                }}
                title='Edit Transaction'
                color='primary'
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: 'primary.light',
                    color: 'white',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <EditIcon fontSize='small' />
              </IconButton>
              {isSuperUser && (
                <IconButton
                  className='action-button'
                  size='small'
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick()
                  }}
                  title='Delete Transaction'
                  color='error'
                  sx={{
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'error.light',
                      color: 'white',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              )}
            </Stack>
          </Box>
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
                      <TableCell>Tags</TableCell>
                      <TableCell>Label</TableCell>
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
                          {item.tags?.length ? (
                            item.tags.map((tag, index) => (
                              <Chip key={index} label={tag} size='small' sx={{ mr: 0.5 }} />
                            ))
                          ) : (
                            <Typography variant='body2'>-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{item.label || '-'}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography
                            variant='body2'
                            sx={{
                              color: getTxnItemAmountColor(item),
                              fontWeight: 'medium',
                            }}
                          >
                            {getFormattedCurrency(item.amount)}
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
