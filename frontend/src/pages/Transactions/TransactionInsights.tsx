import { Box, Paper, Stack, Typography, useTheme } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import type { AccountAmount, CashFlowAmounts, CategoryAmount } from '@types'
import React, { useMemo } from 'react'

interface TransactionInsightsProps {
  cashFlowAmounts: CashFlowAmounts
  categoryAmounts: CategoryAmount[]
  accountAmounts: AccountAmount[]
  isLoading?: boolean
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const TransactionInsights: React.FC<TransactionInsightsProps> = ({
  cashFlowAmounts,
  categoryAmounts,
  accountAmounts,
}) => {
  const theme = useTheme()

  const cashFlowData = useMemo(
    () => [
      { id: 'income', label: 'Income', value: cashFlowAmounts?.incomes ?? 0, color: theme.palette.success.main },
      { id: 'expenses', label: 'Expenses', value: cashFlowAmounts?.expenses ?? 0, color: theme.palette.error.main },
      { id: 'savings', label: 'Savings', value: cashFlowAmounts?.savings ?? 0, color: theme.palette.info.main },
    ],
    [cashFlowAmounts, theme],
  )

  const sortedCategoryAmounts = useMemo(
    () => [...(categoryAmounts ?? [])].sort((a, b) => b.amount - a.amount).slice(0, 8),
    [categoryAmounts],
  )

  const sortedAccountAmounts = useMemo(
    () => [...(accountAmounts ?? [])].sort((a, b) => b.amount - a.amount),
    [accountAmounts],
  )

  const hasCashFlow = cashFlowData.some((d) => d.value > 0)
  const hasCategoryData = sortedCategoryAmounts.length > 0
  const hasAccountData = sortedAccountAmounts.length > 0

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* Cash flow: income / expenses / savings */}
        <Paper variant='outlined' sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Cash Flow
          </Typography>
          {hasCashFlow ? (
            <PieChart
              series={[
                {
                  data: cashFlowData,
                  innerRadius: 40,
                  outerRadius: 80,
                  paddingAngle: 2,
                  cornerRadius: 2,
                  valueFormatter: (item) => currencyFormatter.format(item.value),
                },
              ]}
              height={220}
              slotProps={{
                legend: { direction: 'horizontal', position: { vertical: 'bottom', horizontal: 'center' } },
              }}
            />
          ) : (
            <EmptyState />
          )}
        </Paper>

        {/* Spending by category */}
        <Paper variant='outlined' sx={{ p: 2, flex: 1.3, minWidth: 0 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Spending by Category
          </Typography>
          {hasCategoryData ? (
            <BarChart
              dataset={sortedCategoryAmounts.map((c) => ({
                category: c.category.name,
                amount: c.amount,
              }))}
              xAxis={[{ scaleType: 'band', dataKey: 'category', tickLabelStyle: { fontSize: 11 } }]}
              series={[
                {
                  dataKey: 'amount',
                  color: theme.palette.primary.main,
                  valueFormatter: (v) => currencyFormatter.format(v ?? 0),
                },
              ]}
              height={220}
              margin={{ top: 10, bottom: 40, left: 40, right: 10 }}
            />
          ) : (
            <EmptyState />
          )}
        </Paper>

        {/* Net amount by account */}
        <Paper variant='outlined' sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            By Account
          </Typography>
          {hasAccountData ? (
            <BarChart
              dataset={sortedAccountAmounts.map((a) => ({
                account: a.account.name,
                amount: a.amount,
              }))}
              yAxis={[{ scaleType: 'band', dataKey: 'account', tickLabelStyle: { fontSize: 11 } }]}
              xAxis={[{ valueFormatter: (v: number) => currencyFormatter.format(v) }]}
              series={[
                {
                  dataKey: 'amount',
                  valueFormatter: (v) => currencyFormatter.format(v ?? 0),
                },
              ]}
              layout='horizontal'
              height={220}
              margin={{ top: 10, bottom: 20, left: 90, right: 10 }}
              colors={sortedAccountAmounts.map((a) =>
                a.amount >= 0 ? theme.palette.success.main : theme.palette.error.main,
              )}
            />
          ) : (
            <EmptyState />
          )}
        </Paper>
      </Stack>
    </Box>
  )
}

const EmptyState: React.FC = () => (
  <Box
    sx={{
      height: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Typography variant='body2' color='text.secondary'>
      No data for current filters
    </Typography>
  </Box>
)
