import {
  TrendingUp,
  TrendingDown,
  Savings,
  Receipt,
  CalendarToday,
  PieChart,
  AttachMoney,
  ArrowForward,
  ArrowUpward,
  ArrowDownward,
  Notifications,
  CreditCard,
} from '@mui/icons-material'
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
import { getAmountColor, getFormattedCurrency, getFormattedPercent } from '@utils'
import { format } from 'date-fns'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  // load ref tables after login
  useReadCategoryTypes()
  useReadCategories()
  useReadMerchants()
  useReadTags()
  useReadAccounts()
  const { data } = useReadTransactions()
  const transactions = useMemo(() => data?.transactions ?? [], [data?.transactions])

  const { data: tData } = useReadTransactionSummaries()

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const txnSummaries = tData?.txnSummaries || null
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

    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0
    const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0
    const savingsChange = lastSavings > 0 ? ((currentSavings - lastSavings) / lastSavings) * 100 : 0

    return {
      currentIncome,
      currentExpenses,
      currentSavings,
      incomeChange,
      expenseChange,
      savingsChange,
    }
  }, [tData])

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.txnDate || '').getTime() - new Date(a.txnDate || '').getTime())
      .slice(0, 5)
  }, [transactions])

  // Quick action cards
  const quickActions = [
    {
      title: 'Add Income',
      icon: <ArrowUpward sx={{ fontSize: 30, color: 'success.main' }} />,
      description: 'Record new income',
      path: '/transactions?action=create&type=income',
      color: 'success',
    },
    {
      title: 'Add Expense',
      icon: <ArrowDownward sx={{ fontSize: 30, color: 'error.main' }} />,
      description: 'Record new expense',
      path: '/transactions?action=create&type=expense',
      color: 'error',
    },
    {
      title: 'View Reports',
      icon: <PieChart sx={{ fontSize: 30, color: 'primary.main' }} />,
      description: 'Analyze spending patterns',
      path: '/reports',
      color: 'primary',
    },
    {
      title: 'Set Budget',
      icon: <Savings sx={{ fontSize: 30, color: 'warning.main' }} />,
      description: 'Manage monthly budgets',
      path: '/budgets',
      color: 'warning',
    },
  ]

  return (
    <Container
      maxWidth='xl'
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
          Your Financial Dashboard (DUMMY DATA)
        </Typography>
        <Typography variant='body1' color='text.secondary' paragraph>
          Track your income, expenses, and savings at a glance
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid sx={{ xs: 12, md: 3 }}>
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
                    <TrendingUp fontSize='small' color={financialMetrics.incomeChange >= 0 ? 'success' : 'error'} />
                    <Typography
                      variant='body2'
                      color={financialMetrics.incomeChange >= 0 ? 'success.main' : 'error.main'}
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

        <Grid sx={{ xs: 12, md: 3 }}>
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
                    <TrendingDown fontSize='small' color={financialMetrics.expenseChange <= 0 ? 'success' : 'error'} />
                    <Typography
                      variant='body2'
                      color={financialMetrics.expenseChange <= 0 ? 'success.main' : 'error.main'}
                    >
                      {getFormattedPercent(financialMetrics.expenseChange)}
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

        <Grid sx={{ xs: 12, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Savings (This Month)
                  </Typography>
                  <Typography variant='h4' component='div' fontWeight='bold' color='error.main'>
                    {getFormattedCurrency(financialMetrics.currentSavings)}
                  </Typography>
                  <Box display='flex' alignItems='center' gap={1} sx={{ mt: 1 }}>
                    <TrendingDown fontSize='small' color={financialMetrics.savingsChange <= 0 ? 'success' : 'error'} />
                    <Typography
                      variant='body2'
                      color={financialMetrics.savingsChange <= 0 ? 'success.main' : 'error.main'}
                    >
                      {getFormattedPercent(financialMetrics.savingsChange)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      vs last month
                    </Typography>
                  </Box>
                </Box>
                <Receipt sx={{ fontSize: 48, color: 'warning.main', opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid sx={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='medium'>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid sx={{ xs: 12, sm: 6 }} key={action.title}>
                  <Card
                    variant='outlined'
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                        borderColor: `${action.color}.main`,
                      },
                    }}
                    onClick={() => void navigate(action.path)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        {action.icon}
                        <Box>
                          <Typography variant='subtitle1' fontWeight='medium'>
                            {action.title}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {action.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

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
                  {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
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

          {/* Quick Tips */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom fontWeight='medium'>
              Quick Tips
            </Typography>
            <Stack spacing={2}>
              <Box display='flex' alignItems='flex-start' gap={1}>
                <Notifications color='info' fontSize='small' />
                <Typography variant='body2'>
                  Try to keep your savings rate above 20% for healthy financial growth.
                </Typography>
              </Box>
              <Box display='flex' alignItems='flex-start' gap={1}>
                <CreditCard color='info' fontSize='small' />
                <Typography variant='body2'>Review your transactions weekly to catch any unusual spending.</Typography>
              </Box>
              <Box display='flex' alignItems='flex-start' gap={1}>
                <CalendarToday color='info' fontSize='small' />
                <Typography variant='body2'>
                  Set monthly budgets to track your progress and adjust as needed.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
