import { DEFAULT_TOP_EXPENSES, MAX_CONTENT_LENGTH } from '@constants'
import { Box, Button, Paper, Typography, useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import {
  BarPlot,
  ChartContainer,
  ChartsClipPath,
  ChartsGrid,
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
  const currentMonthName = categorySummaries?.data[0]?.yearMonth || ''

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
        if (mostRecentPoint.amount > currentAmount) mostRecentPoint.status = 'up'
        else if (mostRecentPoint.amount < currentAmount) mostRecentPoint.status = 'down'

        categoryData.trend.push(trendPoint)
      } else {
        const newEntry: CategoryData = {
          category: name,
          value: index === 0 ? currentAmount : 0,
          trend: [],
        }

        if (index > 0) {
          newEntry.trend.push({
            yearMonth: currentMonthName,
            amount: 0,
            status: currentAmount < 0 ? 'up' : currentAmount > 0 ? 'down' : 'flat',
          })
        }

        newEntry.trend.push(trendPoint)
        categoryMap.set(name, newEntry)
      }
    })
  })

  return Array.from(categoryMap.values()).filter((item) => item.value > 0 || item.trend.some((t) => t.amount > 0))
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

  const [topExpenses, setTopExpenses] = useState(DEFAULT_TOP_EXPENSES)

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
          {topExpenses === DEFAULT_TOP_EXPENSES ? (
            <Button variant='text' onClick={() => setTopExpenses(MAX_CONTENT_LENGTH)}>
              View All
            </Button>
          ) : topExpenses === MAX_CONTENT_LENGTH ? (
            <Button variant='text' onClick={() => setTopExpenses(DEFAULT_TOP_EXPENSES)}>
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
              <ChartsGrid horizontal />
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
