import { Box, Button, Paper, Typography, useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import {
  BarPlot,
  ChartContainer,
  ChartsClipPath,
  ChartsTooltipContainer,
  ChartsXAxis,
  ChartsYAxis,
} from '@mui/x-charts'
import { useReadCategorySummaries } from '@queries'
import { type CategorySummaries, defaultInsightParams, type InsightParams } from '@types'
import React, { useMemo, useState } from 'react'

import { CategoriesTrendTooltip } from './CategoriesTrendTooltip.tsx'

interface CategoriesChartProps {
  beginDate: string
  endDate: string
  selectedMonth: number | null
  title?: string
  showCard?: boolean
  height?: number
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
      const currentAmount = categoryAmount.amount
      const categoryData = categoryMap.get(name)

      const trendPoint: TrendPoint = {
        yearMonth: summary.yearMonth,
        amount: currentAmount,
        status: 'flat',
      }

      if (categoryData) {
        const mostRecentPoint = categoryData.trend[categoryData.trend.length - 1]

        if (mostRecentPoint.amount > currentAmount) {
          mostRecentPoint.status = 'up'
        } else if (mostRecentPoint.amount < currentAmount) {
          mostRecentPoint.status = 'down'
        }

        categoryData.trend.push(trendPoint)
      } else {
        categoryMap.set(name, {
          category: name,
          value: index === 0 ? currentAmount : 0,
          trend: [trendPoint],
        })
      }
    })
  })
  return Array.from(categoryMap.values())
}

export const CategoriesChart: React.FC<CategoriesChartProps> = ({
  beginDate,
  endDate,
  selectedMonth,
  title = 'Monthly Categories Breakdown',
  showCard = true,
  height = 50,
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

  const [topExpenses, setTopExpenses] = useState(1000)

  const insightParams: InsightParams = useMemo(
    () => ({
      ...defaultInsightParams,
      beginDate,
      endDate,
      totalMonths: selectedMonth ? 7 : 0,
      topExpenses: topExpenses,
    }),
    [beginDate, endDate, selectedMonth, topExpenses],
  )

  const { data: categorySummaries, isLoading } = useReadCategorySummaries(insightParams)
  const dataset = getCategorySummaryDataSet(categorySummaries?.catSummaries)
  const chartHeight = dataset.length * height
  const clipPathId = `${React.useId()}-clip-path`

  const chartContent = (
    <Box>
      {title && (
        <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
          <Typography variant='h6' fontWeight='medium'>
            {title}
          </Typography>
          {topExpenses === 1000 ? (
            <Button variant='text' onClick={() => setTopExpenses(1048576)}>
              View All
            </Button>
          ) : topExpenses === 1048576 ? (
            <Button variant='text' onClick={() => setTopExpenses(1000)}>
              View Top
            </Button>
          ) : null}
        </Box>
      )}
      <Box sx={{ height: height, width: '100%' }}>
        {isLoading ? (
          <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100%' gap={2}>
            <CircularProgress size={40} />
            <Typography variant='body2' color='text.secondary'>
              Loading categories breakdown...
            </Typography>
          </Box>
        ) : dataset.length > 0 ? (
          <>
            <ChartContainer
              dataset={dataset}
              yAxis={[
                {
                  scaleType: 'band',
                  dataKey: 'category',
                  width: 175,
                  // Dims the category name if the bar value is 0
                  tickLabelStyle: {
                    fill: theme.palette.text.primary,
                    fontSize: 13,
                  },
                },
              ]}
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
