import { Box, Paper, Typography, useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { BarChart } from '@mui/x-charts/BarChart'
import type { CashFlowSummaries } from '@types'
import { getFormattedCurrency } from '@utils'
import React from 'react'

interface CashFlowChartProps {
  cashFlowSummaries: CashFlowSummaries | undefined
  title?: string
  showCard?: boolean
  height?: number
  isLoading?: boolean
  loadingText?: string
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  cashFlowSummaries,
  title = 'Monthly Cash FLows',
  showCard = true,
  height = 450,
  isLoading = false,
  loadingText = 'Loading cash flow summaries...',
}) => {
  const theme = useTheme()
  const chartSetting = {
    yAxis: [
      {
        label: 'Amounts ($)',
        width: 75,
      },
    ],
    height: height,
  }

  const valueFormatter = (value: number | null) => getFormattedCurrency(value)

  const dataset = cashFlowSummaries
    ? cashFlowSummaries.data.map((item) => ({
        incomes: item.cashFlowAmounts.incomes,
        expenses: item.cashFlowAmounts.expenses,
        savings: item.cashFlowAmounts.savings,
        balance: item.cashFlowAmounts.balance,
        month: item.yearMonth,
      }))
    : []

  const series = [
    { dataKey: 'incomes', label: 'Income', valueFormatter, color: theme.palette.success.main },
    { dataKey: 'expenses', label: 'Expense', valueFormatter, color: theme.palette.error.main },
    { dataKey: 'savings', label: 'Savings', valueFormatter, color: theme.palette.warning.main },
    { dataKey: 'balance', label: 'Balance', valueFormatter, color: theme.palette.info.main },
  ]

  const chartContent = (
    <Box>
      {title && (
        <Typography variant='h6' fontWeight='medium' sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: height, width: '100%' }}>
        {isLoading ? (
          <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100%' gap={2}>
            <CircularProgress size={40} />
            <Typography variant='body2' color='text.secondary'>
              {loadingText}
            </Typography>
          </Box>
        ) : dataset.length > 0 ? (
          <BarChart
            dataset={dataset}
            xAxis={[{ dataKey: 'month' }]}
            series={series}
            {...chartSetting}
            height={height - 50}
          />
        ) : (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <Typography variant='body2' color='text.secondary'>
              No cash flow data available
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )

  if (showCard) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        {chartContent}
      </Paper>
    )
  }

  return chartContent
}
