import { ASSET_ACCOUNT_TYPES, DEBT_ACCOUNT_TYPES } from '@constants'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { Collapse, IconButton, TableCell, TableRow, Tooltip, Typography } from '@mui/material'
import type { Account } from '@types'
import { getFormattedCurrency } from '@utils'
import React, { useState } from 'react'

import { AccountBalanceHistoryTable } from './AccountBalanceHistoryTable'

interface AccountTableRowProps {
  account: Account
  isMobile: boolean
  isSuperUser: boolean
  onEdit: (account: Account) => void
  onDelete: (account: Account) => void
}

export const AccountTableRow: React.FC<AccountTableRowProps> = ({
  account,
  isMobile,
  isSuperUser,
  onEdit,
  onDelete,
}) => {
  const [open, setOpen] = useState(false)
  const isCollapsible = ASSET_ACCOUNT_TYPES.includes(account.accountType)

  return (
    <>
      <TableRow
        hover
        sx={{
          '& td': {
            fontWeight: 'medium',
            color: ASSET_ACCOUNT_TYPES.includes(account.accountType)
              ? 'success.main'
              : DEBT_ACCOUNT_TYPES.includes(account.accountType)
                ? 'error.main'
                : 'warning.main',
          },
          ...(open && { '& > td': { borderBottom: 'unset' } }),
        }}
      >
        <TableCell padding='checkbox'>
          {isCollapsible && (
            <IconButton
              size='small'
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? 'Collapse balance history' : 'Expand balance history'}
              aria-expanded={isCollapsible ? open : undefined}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>

        {!isMobile && <TableCell>{account.bankName}</TableCell>}
        <TableCell>{account.name}</TableCell>
        {!isMobile && <TableCell>{account.accountType}</TableCell>}
        {!isMobile && <TableCell>{account.status}</TableCell>}
        <TableCell align='right'>
          <Typography>{getFormattedCurrency(account.accountBalance)}</Typography>
        </TableCell>
        <TableCell align='center'>
          <Tooltip title='Edit'>
            <IconButton size='small' onClick={() => onEdit(account)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          {isSuperUser && (
            <Tooltip title='Delete'>
              <IconButton size='small' color='error' onClick={() => onDelete(account)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>

      {isCollapsible && (
        <TableRow>
          <TableCell sx={{ py: 0, borderBottom: open ? undefined : 'unset' }} colSpan={isMobile ? 4 : 7}>
            <Collapse in={open} timeout='auto' unmountOnExit>
              <AccountBalanceHistoryTable histories={account.accountBalanceHistories} />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
