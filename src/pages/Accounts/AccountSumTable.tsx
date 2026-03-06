import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material'
import type { Account } from '@types'
import { getFormattedCurrency } from '@utils'
import React from 'react'

export const AccountSumTable: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const accountTypesTotal = accounts.reduce(
    (acc, account) => {
      if ('CHECKING' === account.accountType) {
        acc.checking += account.accountBalance
      } else if ('SAVINGS' === account.accountType) {
        acc.savings += account.accountBalance
      } else if ('CREDIT' === account.accountType) {
        acc.credit += account.accountBalance
      }
      return acc
    },
    {
      checking: 0,
      savings: 0,
      credit: 0,
    },
  )

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Checking</TableCell>
            <TableCell>Savings</TableCell>
            <TableCell>Credit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography sx={{ fontWeight: 'medium', color: 'success.main' }}>
                {getFormattedCurrency(accountTypesTotal.checking)}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 'medium', color: 'success.main' }}>
                {getFormattedCurrency(accountTypesTotal.savings)}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 'medium', color: 'error.main' }}>
                {getFormattedCurrency(accountTypesTotal.credit)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
