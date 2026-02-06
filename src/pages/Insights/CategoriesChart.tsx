import { Box, Paper, Typography, useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import {
  BarPlot,
  ChartContainer,
  ChartsClipPath,
  ChartsTooltipContainer,
  ChartsXAxis,
  ChartsYAxis,
} from '@mui/x-charts'
import type { CategorySummaries } from '@types'
import React from 'react'

import { CategoriesTrendTooltip } from './CategoriesTrendTooltip.tsx'

interface CategoriesChartProps {
  categorySummaries: CategorySummaries | undefined
  title?: string
  showCard?: boolean
  height?: number
  isLoading?: boolean
  loadingText?: string
}

interface TrendPoint {
  yearMonth: string
  amount: number
  status: string
}

interface CategoryData {
  category: string
  value: number
  trend: TrendPoint[]
  [key: string]: string | number | TrendPoint[] | undefined
}

function getCategorySummaryDataSet(categorySummaries: CategorySummaries | undefined): CategoryData[] {
  const categoryMap = new Map<string, CategoryData>()

  categorySummaries?.data.forEach((summary, index) => {
    summary.categoryAmounts.forEach((categoryAmount) => {
      const { name } = categoryAmount.category
      const categoryData = categoryMap.get(name)
      const currentAmount = categoryAmount.amount

      let status = 'flat'
      if (categoryData && categoryData.trend.length > 0) {
        const lastAmount = categoryData.trend[categoryData.trend.length - 1].amount
        if (currentAmount > lastAmount) status = 'up'
        else if (currentAmount < lastAmount) status = 'down'
      }

      const trendPoint: TrendPoint = {
        yearMonth: summary.yearMonth,
        amount: categoryAmount.amount,
        status: status,
      }

      if (categoryData) {
        categoryData.trend.push(trendPoint)
      } else if (index === 0 && categoryAmount.amount > 0) {
        categoryMap.set(name, {
          category: name,
          value: categoryAmount.amount,
          trend: [trendPoint],
        })
      }
    })
  })
  return Array.from(categoryMap.values())
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({
  categorySummaries,
  title = 'Monthly Categories Breakdown',
  showCard = true,
  height = 50,
  isLoading = false,
  loadingText = 'Loading categories breakdown...',
}) => {
  const theme = useTheme()
  const chartSetting = {
    xAxis: [
      {
        label: 'Amounts ($)',
      },
    ],
    margin: { left: 0 },
  }

  const dataset = getCategorySummaryDataSet(categorySummaries)
  const chartHeight = dataset.length * height
  const clipPathId = `${React.useId()}-clip-path`

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
          <>
            <ChartContainer
              dataset={dataset}
              yAxis={[{ scaleType: 'band', dataKey: 'category', width: 175 }]}
              series={[
                {
                  type: 'bar',
                  layout: 'horizontal',
                  dataKey: 'value',
                  color: theme.palette.error.main,
                  minBarSize: 10,
                  //barLabel: 'value',
                  //barLabelPlacement: 'outside',
                },
              ]}
              {...chartSetting}
              height={chartHeight - 50}
            >
              <ChartsClipPath id={clipPathId} />
              <g clipPath={`url(#${clipPathId})`}>
                <BarPlot />
              </g>
              <ChartsXAxis />
              <ChartsYAxis />
              <ChartsTooltipContainer trigger='axis'>
                <CategoriesTrendTooltip dataset={dataset} />
              </ChartsTooltipContainer>
            </ChartContainer>
          </>
        ) : (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <Typography variant='body2' color='text.secondary'>
              No categories data available
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )

  if (showCard) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: chartHeight + 50 }}>
        {chartContent}
      </Paper>
    )
  }

  return chartContent
}
