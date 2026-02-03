import { TrendingUp, TrendingDown, ArrowForward, TrendingFlat } from '@mui/icons-material'
import { Container, Typography, Box, Grid, Card, CardContent, Button, Stack, Paper, Divider } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import {
  useReadAccounts,
  useReadCategories,
  useReadCategorySummaries,
  useReadCategoryTypes,
  useReadMerchants,
  useReadTags,
  useReadTransactions,
} from '@queries'
import { useReadCashFlowSummaries } from '@queries'
import { defaultInsightParams, defaultTransactionParams, type InsightParams } from '@types'
import { getBeginningOfMonth, getEndOfMonth, getFormattedCurrency, getTxnAmountColor } from '@utils'
import { format } from 'date-fns'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  // load ref tables on login
  useReadCategoryTypes()
  useReadCategories()
  useReadMerchants()
  useReadTags()
  useReadAccounts()

  const now = new Date()
  const currentMonth = format(now, 'MMMM')

  const { data: tData, isLoading: isTxnLoading } = useReadTransactions({
    ...defaultTransactionParams,
    beginDate: getBeginningOfMonth(now),
    endDate: getEndOfMonth(now),
  })
  const insightParams: InsightParams = {
    ...defaultInsightParams,
    beginDate: getBeginningOfMonth(now),
    endDate: getEndOfMonth(now),
    totalMonths: 2,
    topExpenses: 7,
  }
  const { data: cfsData, isLoading: isCfsLoading } = useReadCashFlowSummaries(insightParams)
  const { data: csData, isLoading: isCsLoading } = useReadCategorySummaries(insightParams)

  const cashFlowMetrics = useMemo(() => {
    const cfSummaries = cfsData?.cfSummaries || null
    if (!cfSummaries)
      return {
        currentIncome: 0,
        currentExpenses: 0,
        currentSavings: 0,
        currentBalance: 0,
        incomeChange: 0,
        expenseChange: 0,
        savingsChange: 0,
        balanceChange: 0,
      }

    const currentIncome = cfSummaries.data[0].cashFlowAmounts.incomes || 0
    const currentExpenses = cfSummaries.data[0].cashFlowAmounts.expenses || 0
    const currentSavings = cfSummaries.data[0].cashFlowAmounts.savings || 0
    const currentBalance = cfSummaries.data[0].cashFlowAmounts.balance || 0

    const lastIncome = cfSummaries.data[1].cashFlowAmounts.incomes || 0
    const lastExpenses = cfSummaries.data[1].cashFlowAmounts.expenses || 0
    const lastInvestments = cfSummaries.data[1].cashFlowAmounts.savings || 0
    const lastSavings = cfSummaries.data[1].cashFlowAmounts.balance || 0

    const incomeChange = currentIncome - lastIncome
    const expenseChange = currentExpenses - lastExpenses
    const savingsChange = currentSavings - lastInvestments
    const balanceChange = currentBalance - lastSavings

    return {
      currentIncome,
      currentExpenses,
      currentSavings,
      currentBalance,
      incomeChange,
      expenseChange,
      savingsChange,
      balanceChange,
    }
  }, [cfsData])

  const categoryMetrics = useMemo(() => {
    const cSummaries = csData?.catSummaries || null
    if (!cSummaries) return []

    const currentMonth = cSummaries.data.length > 0 ? cSummaries.data[0] : null
    const previousMonth = cSummaries.data.length > 1 ? cSummaries.data[1] : null
    if (!currentMonth) return []

    const previousMonthMap = new Map(previousMonth?.categoryAmounts?.map((ca) => [ca.category.id, ca.amount]) || [])

    return currentMonth.categoryAmounts.map((ca) => ({
      category: ca.category,
      currentMonth: ca.amount,
      previousMonth: previousMonthMap.get(ca.category.id) || 0,
    }))
  }, [csData])

  const recentTransactions = useMemo(() => {
    const transactions = tData?.transactions || []
    if (!transactions.length) return []

    const result = []
    const usedDates = new Set()

    for (const tx of transactions) {
      if (!tx.txnDate) continue
      const dateKey = new Date(tx.txnDate).toDateString()
      usedDates.add(dateKey)

      result.push(tx)

      if (result.length >= 7 && usedDates.size >= 3) {
        break
      }
    }

    return result
  }, [tData])

  const getTrendingIcon = (isExpense: boolean, change: number) => {
    if (change === 0) {
      return <TrendingFlat fontSize='small' color='action' />
    }
    const isUp = change > 0
    const isGood = (isExpense && !isUp) || (!isExpense && isUp)
    const color = isGood ? 'success' : 'error'

    return isUp ? <TrendingUp fontSize='small' color={color} /> : <TrendingDown fontSize='small' color={color} />
  }

  return (
    <Container maxWidth='sm' sx={{ py: 4 }}>
      <Box sx={{ width: '100%' }}>
        <Typography variant='h5' component='h2' fontWeight='medium' sx={{ mb: 1 }}>
          {currentMonth} Cash Flows
        </Typography>

        {isCfsLoading ? (
          <Box display='flex' justifyContent='center' my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Grid
              container
              spacing={1}
              justifyContent='center'
              sx={{
                margin: '0 auto',
                width: '100%',
              }}
            >
              <Grid sx={{ xs: 12, md: 3 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                      <Box>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Income
                        </Typography>
                        <Typography variant='h6' component='div' fontWeight='bold' color='success.main'>
                          {getFormattedCurrency(cashFlowMetrics.currentIncome)}
                        </Typography>
                        <Box display='flex' alignItems='center' gap={1} sx={{ mt: 1 }}>
                          {getTrendingIcon(false, cashFlowMetrics.incomeChange)}
                          <Typography
                            variant='body2'
                            color={cashFlowMetrics.incomeChange > 0 ? 'success.main' : 'error.main'}
                          >
                            {getFormattedCurrency(cashFlowMetrics.incomeChange)}
                          </Typography>
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          vs last month
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid sx={{ xs: 12, md: 3 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                      <Box>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Expenses
                        </Typography>
                        <Typography variant='h6' component='div' fontWeight='bold' color='error.main'>
                          {getFormattedCurrency(cashFlowMetrics.currentExpenses)}
                        </Typography>
                        <Box display='flex' alignItems='center' gap={1} sx={{ mt: 1 }}>
                          {getTrendingIcon(true, cashFlowMetrics.expenseChange)}
                          <Typography
                            variant='body2'
                            color={cashFlowMetrics.expenseChange < 0 ? 'success.main' : 'error.main'}
                          >
                            {getFormattedCurrency(cashFlowMetrics.expenseChange)}
                          </Typography>
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          vs last month
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid sx={{ xs: 12, md: 3 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                      <Box>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Savings
                        </Typography>
                        <Typography variant='h6' component='div' fontWeight='bold' color='warning.main'>
                          {getFormattedCurrency(cashFlowMetrics.currentSavings)}
                        </Typography>
                        <Box display='flex' alignItems='center' gap={1} sx={{ mt: 1 }}>
                          {getTrendingIcon(false, cashFlowMetrics.savingsChange)}
                          <Typography
                            variant='body2'
                            color={cashFlowMetrics.savingsChange > 0 ? 'success.main' : 'error.main'}
                          >
                            {getFormattedCurrency(cashFlowMetrics.savingsChange)}
                          </Typography>
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          vs last month
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid sx={{ xs: 12, md: 3 }}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display='flex' alignItems='center' justifyContent='space-between'>
                      <Box>
                        <Typography variant='body2' color='text.secondary' gutterBottom>
                          Balance
                        </Typography>
                        <Typography
                          variant='h6'
                          component='div'
                          fontWeight='bold'
                          color={cashFlowMetrics.currentBalance > 0 ? 'success.main' : 'error.main'}
                        >
                          {getFormattedCurrency(cashFlowMetrics.currentBalance)}
                        </Typography>
                        <Box display='flex' alignItems='center' gap={1} sx={{ mt: 1 }}>
                          {getTrendingIcon(false, cashFlowMetrics.balanceChange)}
                          <Typography
                            variant='body2'
                            color={cashFlowMetrics.balanceChange > 0 ? 'success.main' : 'error.main'}
                          >
                            {getFormattedCurrency(cashFlowMetrics.balanceChange)}
                          </Typography>
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          vs last month
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Grid
            container
            spacing={1}
            justifyContent='center'
            sx={{
              margin: '0 auto',
              width: '100%',
            }}
          >
            <Grid sx={{ xs: 12, md: 12, width: '100%' }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                  <Typography variant='h6' fontWeight='medium'>
                    {currentMonth} Top Spending Categories
                  </Typography>
                  <Button variant='text' endIcon={<ArrowForward />} onClick={() => void navigate('/transactions')}>
                    View All
                  </Button>
                </Box>

                {categoryMetrics.length === 0 ? (
                  <Typography variant='body2' color='text.secondary' sx={{ py: 3, textAlign: 'center' }}>
                    No categories data available...
                  </Typography>
                ) : isCsLoading ? (
                  <Box display='flex' justifyContent='center' my={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {categoryMetrics.map((category) => {
                      const change = category.currentMonth - category.previousMonth
                      const isIncrease = change > 0
                      const hasChange = change !== 0

                      return (
                        <Paper
                          key={category.category.id}
                          variant='outlined'
                          sx={{
                            p: 2,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Box>
                              <Typography variant='body1' fontWeight='medium'>
                                {category.category.name}
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                {category.category.categoryType.name}
                              </Typography>
                            </Box>
                            <Box display='flex' flexDirection='column' alignItems='flex-end' gap={0.5}>
                              <Typography variant='body1' fontWeight='bold' color='error.main'>
                                {getFormattedCurrency(category.currentMonth)}
                              </Typography>
                              <Box display='flex' alignItems='center' gap={0.5}>
                                {hasChange && (
                                  <Box
                                    component='span'
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      color: isIncrease ? 'error.main' : 'success.main',
                                    }}
                                  >
                                    {isIncrease ? '↑' : '↓'}
                                  </Box>
                                )}
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  {getFormattedCurrency(category.previousMonth)}
                                  {hasChange && (
                                    <Box
                                      component='span'
                                      sx={{
                                        color: isIncrease ? 'error.main' : 'success.main',
                                        fontWeight: 'medium',
                                      }}
                                    >
                                      ({isIncrease ? '+' : ''}
                                      {getFormattedCurrency(Math.abs(change))})
                                    </Box>
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      )
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Grid
            container
            spacing={1}
            justifyContent='center'
            sx={{
              margin: '0 auto',
              width: '100%',
            }}
          >
            <Grid sx={{ xs: 12, md: 12, width: '100%' }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                  <Typography variant='h6' fontWeight='medium'>
                    Recent Transactions
                  </Typography>
                  <Button variant='text' endIcon={<ArrowForward />} onClick={() => void navigate('/transactions')}>
                    View All
                  </Button>
                </Box>

                {recentTransactions.length === 0 ? (
                  <Typography variant='body2' color='text.secondary' sx={{ py: 3, textAlign: 'center' }}>
                    No transactions data available...
                  </Typography>
                ) : isTxnLoading ? (
                  <Box display='flex' justifyContent='center' my={4}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {recentTransactions.map((transaction) => (
                      <Paper
                        key={transaction.id}
                        variant='outlined'
                        sx={{
                          p: 2,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                          <Box>
                            <Typography variant='body1' fontWeight='medium'>
                              {transaction.merchant}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {transaction.txnDate ? format(new Date(transaction.txnDate), 'MMM dd, yyyy') : 'No date'}
                            </Typography>
                          </Box>
                          <Typography variant='body1' fontWeight='bold' color={getTxnAmountColor(transaction)}>
                            {getFormattedCurrency(transaction.totalAmount)}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}
