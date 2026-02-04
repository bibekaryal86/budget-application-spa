import { useTheme } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import type { CashFlowSummaries } from '@types'
import { getFormattedCurrency } from '@utils'
import React from 'react'

interface CashFlowChartProps {
  cashFlowSummaries: CashFlowSummaries | undefined
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ cashFlowSummaries }) => {
  const theme = useTheme()
  const chartSetting = {
    yAxis: [
      {
        label: 'Amounts ($)',
        width: 75,
      },
    ],
    height: 450,
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

  return <BarChart dataset={dataset} xAxis={[{ dataKey: 'month' }]} series={series} {...chartSetting} />
}
