import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { useAuthStore } from '@stores'
import type { Transaction } from '@types'
import React from 'react'

import { TransactionTableRow } from './TransactionTableRow.tsx'

export const TransactionsTable: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const { isSuperUser } = useAuthStore()

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={50} />
            <TableCell>Date</TableCell>
            <TableCell>Merchant</TableCell>
            <TableCell align='right'>Total</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell align='right'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TransactionTableRow key={transaction.id} transaction={transaction} isSuperUser={isSuperUser} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
