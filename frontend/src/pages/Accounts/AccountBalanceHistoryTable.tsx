import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import type { AccountBalanceHistory } from '@types'
import { getFormattedCurrency } from '@utils'
import React from 'react'

export const AccountBalanceHistoryTable: React.FC<{ histories?: AccountBalanceHistory[] }> = ({ histories = [] }) => {
  return (
    <Box sx={{ m: 1, mx: { xs: 0, sm: 4 } }}>
      {histories.length === 0 ? (
        <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
          No balance history yet.
        </Typography>
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell align='right'>Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {histories.map((history, index) => {
              const isBold = index === 0 || index === 1
              return (
                <TableRow key={history.yearMonth}>
                  <TableCell sx={{ fontWeight: isBold ? 'bold' : 'normal' }}>{history.yearMonth}</TableCell>
                  <TableCell align='right' sx={{ fontWeight: isBold ? 'bold' : 'normal' }}>
                    {getFormattedCurrency(history.balance)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Box>
  )
}
