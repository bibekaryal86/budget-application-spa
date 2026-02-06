import { FULL_MONTHS } from '@constants'
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
import React, { useState, useMemo, useCallback } from 'react'

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
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const years = useMemo(() => {
    const yearsList = []
    for (let i = 0; i < 5; i++) {
      yearsList.push(currentYear - i)
    }
    return yearsList
  }, [currentYear])

  const getAvailableMonths = useCallback(
    (year: number) => {
      if (year === currentYear) {
        return FULL_MONTHS.filter((month) => month.value <= currentMonth)
      } else {
        return FULL_MONTHS
      }
    },
    [currentMonth, currentYear],
  )

  const [selectedYear, setSelectedYear] = useState(initialYear)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(initialMonth)
  const [yearOnly, setYearOnly] = useState(initialMonth === null)

  const availableMonths = useMemo(() => getAvailableMonths(selectedYear), [getAvailableMonths, selectedYear])

  const handleYearClick = (year: number) => {
    const newAvailableMonths = getAvailableMonths(year)
    setSelectedYear(year)

    if (yearOnly) {
      setSelectedMonth(null)
    } else {
      // If current month selection is not available for new year, adjust it
      if (selectedMonth && !newAvailableMonths.some((m) => m.value === selectedMonth)) {
        // Select the last available month for the new year
        const lastAvailableMonth = newAvailableMonths[newAvailableMonths.length - 1]?.value || null
        setSelectedMonth(lastAvailableMonth)
      }
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
      const defaultMonth = selectedYear === currentYear ? currentMonth : 12
      setSelectedMonth(defaultMonth)
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

  // const getFullMonthName = (monthValue: number | null) => {
  //   if (!monthValue) return null
  //   return FULL_MONTHS_ONLY[monthValue - 1]
  // }

  const isSelectedMonthValid = selectedMonth ? availableMonths.some((m) => m.value === selectedMonth) : true

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
        <Stack spacing={3}>
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
                {availableMonths.map((month) => (
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

          {/*<Box*/}
          {/*  sx={{*/}
          {/*    p: 2,*/}
          {/*    bgcolor: 'action.hover',*/}
          {/*    borderRadius: 1,*/}
          {/*    border: '1px solid',*/}
          {/*    borderColor: isSelectedMonthValid ? 'divider' : 'warning.main',*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <Typography variant='subtitle2' gutterBottom color='text.secondary'>*/}
          {/*    Selected Period*/}
          {/*  </Typography>*/}
          {/*  {!isSelectedMonthValid ? (*/}
          {/*    <Box>*/}
          {/*      <Typography variant='body2' color='warning.main' gutterBottom>*/}
          {/*        ⚠️ Selected month is not available for {selectedYear}*/}
          {/*      </Typography>*/}
          {/*      <Typography variant='h6' color='warning.main'>*/}
          {/*        {getFullMonthName(selectedMonth)} {selectedYear}*/}
          {/*      </Typography>*/}
          {/*      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>*/}
          {/*        Please select a different month or year*/}
          {/*      </Typography>*/}
          {/*    </Box>*/}
          {/*  ) : (*/}
          {/*    <Typography variant='h6'>*/}
          {/*      {yearOnly ? `${selectedYear} (Full Year)` : `${getFullMonthName(selectedMonth)} ${selectedYear}`}*/}
          {/*    </Typography>*/}
          {/*  )}*/}
          {/*</Box>*/}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <Button onClick={handleReset} color='secondary'>
          Reset
        </Button>
        <Button
          onClick={handleApply}
          variant='contained'
          disabled={!yearOnly && (!selectedMonth || !isSelectedMonthValid)}
        >
          Apply Selection
        </Button>
      </DialogActions>
    </Dialog>
  )
}
