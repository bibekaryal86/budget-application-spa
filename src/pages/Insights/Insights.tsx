import { FULL_MONTHS, FULL_MONTHS_ONLY } from '@constants'
import { TrendingUp, TrendingDown, ArrowForward, TrendingFlat, CalendarMonth } from '@mui/icons-material'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Paper,
  Divider,
  IconButton,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useReadCategorySummaries } from '@queries'
import { useReadCashFlowSummaries } from '@queries'
import { defaultInsightParams, type InsightParams } from '@types'
import { getBeginningOfMonth, getEndOfMonth, getFormattedDate } from '@utils'
import React, { useMemo, useState } from 'react'

import { CashFlowChart } from './CashFlowChart.tsx'
import { InsightsSelectorModal } from './InsightsSelectorModal.tsx'

export const Insights: React.FC = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth)
  const [openModal, setOpenModal] = useState(false)

  const displayText = useMemo(() => {
    if (selectedMonth) {
      const monthName = FULL_MONTHS.find((m) => m.value === selectedMonth)?.label
      return `${monthName} ${selectedYear}`
    }
    return `Year ${selectedYear}`
  }, [selectedMonth, selectedYear])

  const { beginDate, endDate } = useMemo(() => {
    if (selectedMonth) {
      return {
        beginDate: getBeginningOfMonth(new Date(selectedYear, selectedMonth - 1)),
        endDate: getEndOfMonth(new Date(selectedYear, selectedMonth - 1)),
      }
    } else {
      return {
        beginDate: getFormattedDate(new Date(selectedYear, 0, 1)),
        endDate: getFormattedDate(new Date(selectedYear, 11, 31)),
      }
    }
  }, [selectedYear, selectedMonth])

  const insightParams: InsightParams = useMemo(
    () => ({
      ...defaultInsightParams,
      beginDate,
      endDate,
      totalMonths: selectedMonth ? 6 : 0,
    }),
    [beginDate, endDate, selectedMonth],
  )

  const { data: cfsData, isLoading: isCfsLoading } = useReadCashFlowSummaries(insightParams)
  const { data: csData } = useReadCategorySummaries(insightParams)

  const handleMonthYearSelect = (year: number, month: number | null) => {
    setSelectedYear(year)
    setSelectedMonth(month)
  }

  return (
    <>
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Box sx={{ width: '100%' }}>
          <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='h5' component='h2' fontWeight='medium'>
                {displayText} Insights
              </Typography>
              <IconButton size='small' onClick={() => setOpenModal(true)} sx={{ color: 'primary.main' }}>
                <CalendarMonth />
              </IconButton>
            </Box>
          </Box>
          <CashFlowChart isLoading={isCfsLoading} cashFlowSummaries={cfsData?.cfSummaries} />
        </Box>
      </Container>

      <InsightsSelectorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSelect={handleMonthYearSelect}
        initialYear={selectedYear}
        initialMonth={selectedMonth}
      />
    </>
  )
}
