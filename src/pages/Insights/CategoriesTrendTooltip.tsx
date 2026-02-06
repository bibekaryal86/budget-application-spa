import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useItemTooltip } from '@mui/x-charts/ChartsTooltip'
import { getFormattedCurrency } from '@utils'
import React from 'react'

export const CategoriesTrendTooltip: React.FC<{
  dataset: {
    category: string
    value: number
    trend: {
      yearMonth: string
      amount: number
    }[]
  }[]
}> = ({ dataset }) => {
  const tooltipData = useItemTooltip()

  if (!tooltipData) {
    return null
  }

  const activeIndex = tooltipData.identifier
  if (!activeIndex || activeIndex.dataIndex === undefined || activeIndex.dataIndex === null) {
    return null
  }

  const trend = dataset[activeIndex.dataIndex].trend

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Year/Month</TableCell>
              <TableCell align='right'>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trend.map(({ yearMonth, amount }) => (
              <TableRow
                key={yearMonth}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{yearMonth}</TableCell>
                <TableCell align='right'>{getFormattedCurrency(amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
