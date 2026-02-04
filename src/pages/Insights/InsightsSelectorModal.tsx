import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
} from '@mui/material'
import React, { useState, useMemo } from 'react'

interface InsightsSelectorModalProps {
  open: boolean
  onClose: () => void
  onSelect: (year: number, month: number | null) => void
  initialYear: number
  initialMonth: number | null
}

export const InsightsSelectorModal: React.FC<InsightsSelectorModalProps> = ({
  open,
  onClose,
  onSelect,
  initialYear,
  initialMonth,
}) => {
  const currentYear = new Date().getFullYear()

  const years = useMemo(() => {
    const yearsList = []
    for (let i = 0; i < 5; i++) {
      yearsList.push(currentYear - i)
    }
    return yearsList
  }, [currentYear])

  const months = useMemo(
    () => [
      { value: 1, label: 'Jan' },
      { value: 2, label: 'Feb' },
      { value: 3, label: 'Mar' },
      { value: 4, label: 'Apr' },
      { value: 5, label: 'May' },
      { value: 6, label: 'Jun' },
      { value: 7, label: 'Jul' },
      { value: 8, label: 'Aug' },
      { value: 9, label: 'Sep' },
      { value: 10, label: 'Oct' },
      { value: 11, label: 'Nov' },
      { value: 12, label: 'Dec' },
    ],
    [],
  )

  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(initialMonth)
  const [yearOnly, setYearOnly] = useState(initialMonth === null)

  const handleYearClick = (year: number) => {
    setSelectedYear(year)
    if (yearOnly) {
      setSelectedMonth(null)
    }
  }

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month)
  }

  const handleYearOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isYearOnly = event.target.checked
    setYearOnly(isYearOnly)
    if (isYearOnly) {
      setSelectedMonth(null)
    } else if (!selectedMonth) {
      setSelectedMonth(new Date().getMonth() + 1)
    }
  }

  const handleApply = () => {
    if (yearOnly) {
      onSelect(selectedYear, null)
    } else {
      onSelect(selectedYear, selectedMonth)
    }
    onClose()
  }

  const handleReset = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    setSelectedYear(currentYear)
    setSelectedMonth(currentMonth)
    setYearOnly(false)
  }

  const getFullMonthName = (monthValue: number | null) => {
    if (!monthValue) return null
    const fullMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return fullMonths[monthValue - 1]
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>Select Time Period</Typography>
          <FormControlLabel
            control={<Checkbox checked={yearOnly} onChange={handleYearOnlyChange} size='small' />}
            label={
              <Typography variant='body2' color='text.secondary'>
                View by Year Only
              </Typography>
            }
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ py: 2 }}>
          <Box>
            <Typography variant='subtitle2' gutterBottom color='primary'>
              Select Year
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {years.map((year) => (
                <Chip
                  key={year}
                  label={year}
                  onClick={() => handleYearClick(year)}
                  color={selectedYear === year ? 'primary' : 'default'}
                  variant={selectedYear === year ? 'filled' : 'outlined'}
                  sx={{
                    minWidth: 70,
                    fontWeight: selectedYear === year ? 'bold' : 'normal',
                  }}
                  clickable
                />
              ))}
            </Box>
          </Box>

          <Divider />

          {!yearOnly && (
            <Box>
              <Typography variant='subtitle2' gutterBottom color='primary'>
                Select Month
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {months.map((month) => (
                  <Chip
                    key={month.value}
                    label={month.label}
                    onClick={() => handleMonthClick(month.value)}
                    color={selectedMonth === month.value ? 'primary' : 'default'}
                    variant={selectedMonth === month.value ? 'filled' : 'outlined'}
                    sx={{
                      minWidth: 50,
                      fontWeight: selectedMonth === month.value ? 'bold' : 'normal',
                    }}
                    clickable
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box
            sx={{
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant='subtitle2' gutterBottom color='text.secondary'>
              Selected Period
            </Typography>
            <Typography variant='h6'>
              {yearOnly ? `${selectedYear} (Full Year)` : `${getFullMonthName(selectedMonth)} ${selectedYear}`}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <Button onClick={handleReset} color='secondary'>
          Reset
        </Button>
        <Button onClick={handleApply} variant='contained' disabled={!yearOnly && !selectedMonth}>
          Apply Selection
        </Button>
      </DialogActions>
    </Dialog>
  )
}
