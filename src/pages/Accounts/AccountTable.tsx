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
} from '@mui/material'
import { useAuthStore, useAccountStore } from '@stores'
import type { Account } from '@types'
import { getFormattedCurrency } from '@utils'
import React from 'react'

export const AccountTable: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const { isSuperUser } = useAuthStore()
  const { openAccountModal } = useAccountStore()

  const handleEditClick = (account: Account) => {
    openAccountModal(ACTION_TYPE.UPDATE, account)
  }

  const handleDeleteClick = (account: Account) => {
    openAccountModal(ACTION_TYPE.DELETE, account)
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bank</TableCell>
            <TableCell>Account</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align='right'>Opening Balance</TableCell>
            <TableCell align='right'>Current Balance</TableCell>
            <TableCell align='center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account) => {
            return (
              <TableRow key={account.id} hover>
                <TableCell>{account.bankName}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.accountType}</TableCell>
                <TableCell>{account.status}</TableCell>
                <TableCell align='right'>
                  <Typography fontWeight='medium'>{getFormattedCurrency(account.openingBalance)}</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography fontWeight='medium'>{getFormattedCurrency(account.currentBalance)}</Typography>
                </TableCell>
                <TableCell align='center'>
                  <Tooltip title='Edit'>
                    <IconButton size='small' onClick={() => handleEditClick(account)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {isSuperUser && (
                    <Tooltip title='Delete'>
                      <IconButton size='small' onClick={() => handleDeleteClick(account)} color='error'>
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
