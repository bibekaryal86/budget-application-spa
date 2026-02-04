import { BarChart } from '@mui/x-charts/BarChart'
import type { CashFlowSummaries } from '@types'
import React from 'react'

interface CashFlowChartProps {
  cashFlowSummaries: CashFlowSummaries
}

const chartSetting = {
  yAxis: [
    {
      label: 'rainfall (mm)',
      width: 60,
    },
  ],
  height: 300,
}
export const CashFlowChart: React.FC<CashFlowChartProps> = ({ cashFlowSummaries }) => {
  return (
    <BarChart
      dataset={dataset}
      xAxis={[{ dataKey: 'month' }]}
      series={[
        { dataKey: 'london', label: 'London', valueFormatter },
        { dataKey: 'paris', label: 'Paris', valueFormatter },
        { dataKey: 'newYork', label: 'New York', valueFormatter },
        { dataKey: 'seoul', label: 'Seoul', valueFormatter },
      ]}
      {...chartSetting}
    />
  )
}
