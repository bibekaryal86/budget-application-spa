import { Box, Paper, Typography, useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { BarChart } from '@mui/x-charts/BarChart'
import { useReadAccountSummaries } from '@queries'
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

function getAccountsSeries(accountSummaries: AccountSummary[], successColor: string, errorColor: string) {
  const distinctAccounts = new Map<string, object>()

  accountSummaries.forEach((summary) => {
    summary.accounts.forEach((account) => {
      if (!distinctAccounts.has(account.name)) {
        distinctAccounts.set(account.name, {
          dataKey: account.name,
          label: account.name,
          stack: account.accountType === 'CREDIT' ? 'debts' : 'assets',
          color: account.accountType === 'CREDIT' ? errorColor : successColor,
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
  const successColor = theme.palette.success.main
  const errorColor = theme.palette.error.main

  const chartSetting = {
    yAxis: [
      {
        label: 'Amounts ($)',
        width: 75,
      },
    ],
    height: height,
  }

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
  const series = getAccountsSeries(accountsSummaries?.accSummaries.data || [], successColor, errorColor)
  const dataset = getAccountsDatasets(accountsSummaries?.accSummaries.data || [])

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
          <BarChart
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
