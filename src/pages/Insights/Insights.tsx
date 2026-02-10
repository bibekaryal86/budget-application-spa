import { FULL_MONTHS } from '@constants'
import { CalendarMonth } from '@mui/icons-material'
import { Container, Typography, Box, IconButton, Divider } from '@mui/material'
import { getBeginningOfMonth, getEndOfMonth, getFormattedDate } from '@utils'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { CashFlowChart } from './CashFlowChart.tsx'
import { CategoriesChart } from './CategoriesChart.tsx'
import { InsightsSelectorModal } from './InsightsSelectorModal.tsx'

export const Insights: React.FC = () => {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [hash])

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

  const handleMonthYearSelect = (year: number, month: number | null) => {
    setSelectedYear(year)
    setSelectedMonth(month)
  }

  return (
    <>
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Box sx={{ width: '100%' }}>
          <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 4 }}>
            <Box display='flex' alignItems='center' gap={1}>
              <Typography variant='h5' component='h2' fontWeight='medium'>
                {displayText} Insights
              </Typography>
              <IconButton size='small' onClick={() => setOpenModal(true)} sx={{ color: 'primary.main' }}>
                <CalendarMonth />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box id='cash-flow-summary' sx={{ mb: 4 }}>
            <CashFlowChart beginDate={beginDate} endDate={endDate} selectedMonth={selectedMonth} />
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box id='category-summary' sx={{ mb: 4 }}>
            <CategoriesChart beginDate={beginDate} endDate={endDate} selectedMonth={selectedMonth} />
          </Box>

          <Divider sx={{ mt: 4 }} />
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
