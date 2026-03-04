import { Box, Paper, Typography, useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { BarChart, LineChart } from '@mui/x-charts'
import { useReadAccountSummaries } from '@queries'
import { defaultInsightParams, type InsightParams } from '@types'
import { getFormattedCurrency } from '@utils'
import React, { useMemo } from 'react'

interface AccountsChartProps {
  beginDate: string
  endDate: string
  selectedMonth: number | null
  title?: string
  showCard?: boolean
  height?: number
}

export const AccountsChart: React.FC<AccountsChartProps> = ({
  beginDate,
  endDate,
  selectedMonth,
  title = 'Monthly Net Worth',
  showCard = true,
  height = 500,
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

  const insightParams: InsightParams = useMemo(
    () => ({
      ...defaultInsightParams,
      beginDate,
      endDate,
      totalMonths: selectedMonth ? 7 : 0,
    }),
    [beginDate, endDate, selectedMonth],
  )
  const { data: accountsSummaries, isLoading } = useReadAccountSummaries(insightParams)

  const dataset =
    accountsSummaries && accountsSummaries.accSummaries
      ? accountsSummaries.accSummaries.data.map((item) => ({
          assets: item.netWorth.ASSETS,
          debts: item.netWorth.DEBTS,
          worths: item.netWorth.WORTH,
          month: item.yearMonth,
        }))
      : []

  const series = [
    {
      type: 'bar', // Specify this as a bar chart
      dataKey: 'assets',
      label: 'Assets',
      valueFormatter,
      color: theme.palette.success.main,
      stack: 'total', // Stack assets and debts
    },
    {
      type: 'bar', // Specify this as a bar chart
      dataKey: 'debts',
      label: 'Debts',
      valueFormatter,
      color: theme.palette.error.main,
      stack: 'total', // Stack assets and debts
    },
    {
      type: 'line', // Specify this as a line chart
      dataKey: 'worths', // This should be 'worths' as in your dataset
      label: 'Net Worth',
      valueFormatter,
      color: theme.palette.info.main,
      showMark: false,
      // You likely don't want to stack the Net Worth line with the bars,
      // so no 'stack' property for this series.
    },
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
              Loading net worth summaries...
            </Typography>
          </Box>
        ) : dataset.length > 0 ? (
          <LineChart
            dataset={dataset}
            xAxis={[
              {
                id: 'Months',
                dataKey: 'month',
                scaleType: 'band',
              },
            ]}
            series={series}
            {...chartSetting}
            height={height - 50}
          />
        ) : (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <Typography variant='body2' color='text.secondary'>
              No accounts data available
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
