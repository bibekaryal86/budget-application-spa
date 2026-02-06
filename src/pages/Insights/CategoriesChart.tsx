import { Box, Paper, Typography, useTheme } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { BarChart } from '@mui/x-charts/BarChart'
import type { CategorySummaries } from '@types'
import { getFormattedCurrency } from '@utils'
import React from 'react'

interface CategoriesChartProps {
  categorySummaries: CategorySummaries | undefined
  title?: string
  showCard?: boolean
  height?: number
  isLoading?: boolean
  loadingText?: string
}

function getCategorySummaryDataSet(
  categorySummaries: CategorySummaries | undefined,
): { category: string; value: number; trend: number[] }[] {
  const categoryMap = new Map<string, { category: string; value: number; trend: number[] }>()

  categorySummaries?.data.forEach((summary, index) => {
    summary.categoryAmounts.forEach((categoryAmount) => {
      const category = categoryAmount.category
      const categoryData = categoryMap.get(category.name)
      if (categoryData) {
        categoryData.trend.push(categoryAmount.amount)
      } else if (index === 0 && categoryAmount.amount > 0) {
        categoryMap.set(category.name, {
          category: category.name,
          value: categoryAmount.amount,
          trend: [categoryAmount.amount],
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

  const valueFormatter = (value: number | null) => getFormattedCurrency(value)

  const dataset = getCategorySummaryDataSet(categorySummaries)

  const chartHeight = dataset.length * height

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
            yAxis={[{ scaleType: 'band', dataKey: 'category', width: 200 }]}
            series={[{ dataKey: 'value', valueFormatter, color: theme.palette.error.main }]}
            layout='horizontal'
            grid={{ vertical: true }}
            {...chartSetting}
            height={chartHeight - 50}
          />
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
