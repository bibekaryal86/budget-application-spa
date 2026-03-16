import { Box, Paper, Typography, useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { useReadAccountSummaries } from '@queries'
import { useMobileStore } from '@stores'
import { type AccountSummary, defaultInsightParams, type InsightParams } from '@types'
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

function valueFormatter(value: number | null) {
  return getFormattedCurrency(value)
}

function getAccountsSeries(accountSummaries: AccountSummary[], successColor: string) {
  const distinctAccounts = new Map<string, object>()

  accountSummaries.forEach((summary) => {
    summary.accounts.forEach((account) => {
      if (!distinctAccounts.has(account.name)) {
        distinctAccounts.set(account.name, {
          dataKey: account.name,
          label: account.name,
          stack: 'accounts',
          color: successColor,
          valueFormatter: (v: number | null) => valueFormatter(v),
        })
      }
    })
  })

  return Array.from(distinctAccounts.values())
}

function getAccountsDatasets(accountsSummaries: AccountSummary[]) {
  return accountsSummaries.map((item) => {
    const accountDetails: { [key: string]: number } = {}
    if (item.accounts) {
      item.accounts.forEach((account) => {
        accountDetails[account.name] = account.accountBalance
      })
    }
    return {
      assets: item.netWorth.ASSETS,
      debts: item.netWorth.DEBTS,
      worths: item.netWorth.WORTH,
      month: item.yearMonth,
      ...accountDetails,
    }
  })
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
  const isMobile = useMobileStore()
  const successColor = theme.palette.success.main
  const errorColor = theme.palette.error.main

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
  const barSeries = getAccountsSeries(accountsSummaries?.accSummaries.data || [], successColor)
  const barDataset = getAccountsDatasets(accountsSummaries?.accSummaries.data || [])

  const lineSeries = [
    {
      dataKey: 'worths',
      label: 'Net Worth',
      color: errorColor,
      valueFormatter: (v: number | null) => valueFormatter(v),
      showMark: true,
      curve: 'linear' as const,
    },
  ]

  const lineDataset = barDataset.map((item) => ({
    item,
    worths: item.worths,
    month: item.month,
  }))

  const chartSettings = {
    yAxis: isMobile
      ? [
          {
            width: 50,
            min: Math.min(...barDataset.map((d) => Math.min(d.assets, d.debts, d.worths))),
            max: Math.max(...barDataset.map((d) => Math.max(d.assets, d.debts, d.worths))),
          },
        ]
      : [
          {
            label: 'Amounts ($)',
            width: 75,
            min: Math.min(...barDataset.map((d) => Math.min(d.assets, d.debts, d.worths))),
            max: Math.max(...barDataset.map((d) => Math.max(d.assets, d.debts, d.worths))),
          },
        ],
    height: height,
  }

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
        ) : barDataset.length > 0 ? (
          <Box sx={{ position: 'relative', height: height - 50, width: '100%' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
              <BarChart
                dataset={barDataset}
                xAxis={[
                  {
                    id: 'Months',
                    dataKey: 'month',
                    scaleType: 'band',
                  },
                ]}
                series={barSeries}
                {...chartSettings}
                height={height - 50}
                hideLegend
              />
            </Box>

            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <LineChart
                dataset={lineDataset}
                xAxis={[
                  {
                    id: 'Months',
                    dataKey: 'month',
                    scaleType: 'band',
                  },
                ]}
                series={lineSeries}
                {...chartSettings}
                height={height - 50}
                grid={{ vertical: false, horizontal: false }}
                sx={{
                  '& .MuiChartsAxis-root': {
                    display: 'none',
                  },
                  '& .MuiChartsAxis-line': {
                    display: 'none',
                  },
                  '& .MuiChartsAxis-tick': {
                    display: 'none',
                  },
                  '& .MuiChartsAxis-label': {
                    display: 'none',
                  },
                  '& .MuiChartsGrid-line': {
                    display: 'none',
                  },
                }}
              />
            </Box>
          </Box>
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
