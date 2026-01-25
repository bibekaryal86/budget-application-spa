import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Select,
  MenuItem,
  Box,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import { useAuthStore } from '@stores'
import type { ResponsePageInfo, Transaction } from '@types'
import React from 'react'

import { TransactionTableRow } from './TransactionTableRow.tsx'

interface TransactionsTableProps {
  transactions: Transaction[]
  pageInfo: ResponsePageInfo
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  pageInfo,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { isSuperUser } = useAuthStore()

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    onRowsPerPageChange(Number(event.target.value))
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page)
  }

  const getDisplayRange = () => {
    const start = (pageInfo.pageNumber - 1) * pageInfo.perPage + 1
    const end = Math.min(pageInfo.pageNumber * pageInfo.perPage, pageInfo.totalItems)
    return { start, end }
  }

  const { start, end } = getDisplayRange()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50} />
              <TableCell>Date</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell>Account</TableCell>
              <TableCell align='right'>Total</TableCell>
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

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          p: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            Rows per page:
          </Typography>
          <Select size='small' value={pageInfo.perPage} onChange={handleRowsPerPageChange} sx={{ minWidth: 80 }}>
            {[10, 25, 50, 100].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Typography variant='body2' color='text.secondary'>
          {pageInfo.totalItems > 0 ? `${start}-${end} of ${pageInfo.totalItems}` : 'No results'}
        </Typography>

        <Pagination
          count={pageInfo.totalPages}
          page={pageInfo.pageNumber}
          onChange={handlePageChange}
          color='primary'
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
          size='medium'
          disabled={pageInfo.totalPages <= 1}
        />
      </Box>
    </Box>
  )
}
