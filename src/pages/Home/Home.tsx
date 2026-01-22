import { TrendingUp, TrendingDown, Receipt, AttachMoney, ArrowForward, TrendingFlat } from '@mui/icons-material'
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
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material'
import {
  useReadAccounts,
  useReadCategories,
  useReadCategoryTypes,
  useReadMerchants,
  useReadTags,
  useReadTransactions,
} from '@queries'
import { useReadTransactionSummaries } from '@queries'
import { defaultTransactionParams } from '@types'
import { getAmountColor, getBeginningOfMonth, getEndOfMonth, getFormattedCurrency } from '@utils'
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
  const { data: tData } = useReadTransactions({
    ...defaultTransactionParams,
    beginDate: getBeginningOfMonth(now),
    endDate: getEndOfMonth(now),
  })
  const transactions = useMemo(() => tData?.transactions ?? [], [tData?.transactions])

  const { data: tsData } = useReadTransactionSummaries()

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const txnSummaries = tsData?.txnSummaries || null
    if (!txnSummaries)
      return {
        currentIncome: 0,
        currentExpenses: 0,
        currentSavings: 0,
        incomeChange: 0,
        expenseChange: 0,
        savingsChange: 0,
      }

    const currentIncome = txnSummaries.currentMonth.incomes || 0
    const currentExpenses = txnSummaries.currentMonth.expenses || 0
    const currentSavings = txnSummaries.currentMonth.savings || 0

    const lastIncome = txnSummaries.previousMonth.incomes || 0
    const lastExpenses = txnSummaries.previousMonth.expenses || 0
    const lastSavings = txnSummaries.previousMonth.savings || 0

    const incomeChange = currentIncome - lastIncome
    const expenseChange = currentExpenses - lastExpenses
    const savingsChange = currentSavings - lastSavings

    return {
      currentIncome,
      currentExpenses,
      currentSavings,
      incomeChange,
      expenseChange,
      savingsChange,
    }
  }, [tsData])

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 7)
  }, [transactions])

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
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Box>
            <Typography variant='h4' component='h1' fontWeight='medium'>
              Financial Dashboard
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Track income, expenses, and savings at a glance
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Grid
            container
            spacing={3}
            justifyContent='center'
            sx={{
              margin: '0 auto',
            }}
          >
            <Grid sx={{ xs: 12, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box display='flex' alignItems='center' justifyContent='space-between'>
                    <Box>
                      <Typography variant='body2' color='text.secondary' gutterBottom>
                        Income (This Month)
                      </Typography>
                      <Typography variant='h4' component='div' fontWeight='bold' color='success.main'>
                        {getFormattedCurrency(financialMetrics.currentIncome)}
                      </Typography>
                      <Box display='flex' alignItems='center' gap={1} sx={{ mt: 1 }}>
                        {getTrendingIcon(false, financialMetrics.incomeChange)}
                        <Typography
                          variant='body2'
                          color={financialMetrics.incomeChange > 0 ? 'success.main' : 'error.main'}
                        >
                          {getFormattedCurrency(financialMetrics.incomeChange)}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          vs last month
                        </Typography>
                      </Box>
                    </Box>
                    <AttachMoney sx={{ fontSize: 48, color: 'success.main', opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ xs: 12, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box display='flex' alignItems='center' justifyContent='space-between'>
                    <Box>
                      <Typography variant='body2' color='text.secondary' gutterBottom>
                        Expenses (This Month)
                      </Typography>
                      <Typography variant='h4' component='div' fontWeight='bold' color='error.main'>
                        {getFormattedCurrency(financialMetrics.currentExpenses)}
                      </Typography>
                      <Box display='flex' alignItems='center' gap={1} sx={{ mt: 1 }}>
                        {getTrendingIcon(true, financialMetrics.expenseChange)}
                        <Typography
                          variant='body2'
                          color={financialMetrics.expenseChange < 0 ? 'success.main' : 'error.main'}
                        >
                          {getFormattedCurrency(financialMetrics.expenseChange)}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          vs last month
                        </Typography>
                      </Box>
                    </Box>
                    <Receipt sx={{ fontSize: 48, color: 'error.main', opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ xs: 12, md: 4 }}>
              <Card elevation={2}>
                <CardContent>
                  <Box display='flex' alignItems='center' justifyContent='space-between'>
                    <Box>
                      <Typography variant='body2' color='text.secondary' gutterBottom>
                        Savings (This Month)
                      </Typography>
                      <Typography variant='h4' component='div' fontWeight='bold' color='warning.main'>
                        {getFormattedCurrency(financialMetrics.currentSavings)}
                      </Typography>
                      <Box display='flex' alignItems='center' gap={1} sx={{ mt: 1 }}>
                        {getTrendingIcon(false, financialMetrics.savingsChange)}
                        <Typography
                          variant='body2'
                          color={financialMetrics.savingsChange > 0 ? 'success.main' : 'error.main'}
                        >
                          {getFormattedCurrency(financialMetrics.savingsChange)}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          vs last month
                        </Typography>
                      </Box>
                    </Box>
                    <AttachMoney sx={{ fontSize: 48, color: 'warning.main', opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Grid
            container
            spacing={2}
            justifyContent='center'
            sx={{
              margin: '0 auto',
            }}
          >
            <Grid sx={{ xs: 12, md: 8 }}>
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
                    No transactions yet. Add your first transaction!
                  </Typography>
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
                          <Typography variant='body1' fontWeight='bold' color={getAmountColor(transaction.totalAmount)}>
                            {getFormattedCurrency(transaction.totalAmount)}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid sx={{ xs: 12, md: 4 }}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant='h6' gutterBottom fontWeight='medium'>
                  Monthly Summary
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Transactions this month
                    </Typography>
                    <Typography variant='h5' fontWeight='bold'>
                      {0}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Average daily spend
                    </Typography>
                    <Typography variant='h5' fontWeight='bold'>
                      {getFormattedCurrency(financialMetrics.currentExpenses / 30)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Days until next month
                    </Typography>
                    <Typography variant='h5' fontWeight='bold'>
                      {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() -
                        new Date().getDate()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                  <Typography variant='h6' fontWeight='medium'>
                    Budget Progress
                  </Typography>
                  <Chip label='Monthly' size='small' />
                </Box>

                <Stack spacing={3}>
                  <Box>
                    <Box display='flex' justifyContent='space-between' sx={{ mb: 0.5 }}>
                      <Typography variant='body2'>Food & Dining</Typography>
                      <Typography variant='body2' fontWeight='medium'>
                        $320 / $500
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(320 / 500) * 100}
                      color='warning'
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  <Box>
                    <Box display='flex' justifyContent='space-between' sx={{ mb: 0.5 }}>
                      <Typography variant='body2'>Shopping</Typography>
                      <Typography variant='body2' fontWeight='medium'>
                        $150 / $300
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(150 / 300) * 100}
                      color='success'
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  <Box>
                    <Box display='flex' justifyContent='space-between' sx={{ mb: 0.5 }}>
                      <Typography variant='body2'>Entertainment</Typography>
                      <Typography variant='body2' fontWeight='medium'>
                        $75 / $200
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={(75 / 200) * 100}
                      color='primary'
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Stack>

                <Button fullWidth variant='outlined' sx={{ mt: 2 }} onClick={() => void navigate('/budgets')}>
                  Manage Budgets
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}
