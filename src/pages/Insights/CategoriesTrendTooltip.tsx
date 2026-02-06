import { Box, Paper, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {trend.map(({ yearMonth, amount }) => (
              <TableRow key={yearMonth}>
                <TableCell>{yearMonth}</TableCell>
                <TableCell>{getFormattedCurrency(amount)}</TableCell>
              </TableRow>
            ))}
          </TableHead>
        </Table>
      </TableContainer>
    </Box>
  )
}
