import { TrendingUp, TrendingDown, HorizontalRule } from '@mui/icons-material'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useAxesTooltip } from '@mui/x-charts'
import { getFormattedCurrency } from '@utils'
import React from 'react'

export const CategoriesTrendTooltip: React.FC<{
  dataset: {
    category: string
    value: number
    trend: {
      yearMonth: string
      amount: number
      status: string
    }[]
  }[]
}> = ({ dataset }) => {
  const tooltipData = useAxesTooltip()

  if (
    !tooltipData ||
    tooltipData.length === 0 ||
    tooltipData[0].dataIndex === null ||
    tooltipData[0].dataIndex === undefined
  ) {
    return null
  }

  const activeIndex = tooltipData[0].dataIndex
  const trend = dataset[activeIndex].trend
  const category = dataset[activeIndex].category

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={3} align='center' sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
                {category}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Year/Month</TableCell>
              <TableCell align='right'>Amount</TableCell>
              <TableCell align='right'>Trend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trend.map(({ yearMonth, amount, status }) => (
              <TableRow
                key={yearMonth}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{yearMonth}</TableCell>
                <TableCell align='right'>{getFormattedCurrency(amount)}</TableCell>
                <TableCell align='right'>
                  {status === 'up' && <TrendingUp sx={{ color: 'error.main' }} fontSize='small' />}
                  {status === 'down' && <TrendingDown sx={{ color: 'success.main' }} fontSize='small' />}
                  {status === 'flat' && <HorizontalRule sx={{ color: 'info.main' }} fontSize='small' />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
