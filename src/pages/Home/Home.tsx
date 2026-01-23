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
  Divider,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  useReadAccounts,
  useReadCategories,
  useReadCategorySummaries,
  useReadCategoryTypes,
  useReadMerchants,
  useReadTags,
  useReadTransactions,
} from '@queries'
import { useReadTransactionSummaries } from '@queries'
import { defaultTransactionParams } from '@types'
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
  const { data: tData } = useReadTransactions({
    ...defaultTransactionParams,
    beginDate: getBeginningOfMonth(now),
    endDate: getEndOfMonth(now),
  })
  const { data: tsData } = useReadTransactionSummaries()
  const { data: csData } = useReadCategorySummaries(true)

  const transactions = useMemo(() => tData?.transactions ?? [], [tData?.transactions])
  const categories = useMemo(() => csData?.catSummaries.cData ?? [], [csData?.catSummaries.cData])
  const categoryTypes = useMemo(() => csData?.catSummaries.ctData ?? [], [csData?.catSummaries.ctData])

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
    <Container maxWidth='md' sx={{ py: 4 }}>
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
              width: '100%',
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
              width: '100%',
            }}
          >
            <Grid sx={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                  <Typography variant='body1' fontWeight='bold'>
                    Top Expense Categories (This Month)
                  </Typography>
                </Box>

                {categories.length === 0 ? (
                  <Typography variant='body2' sx={{ py: 3, textAlign: 'center' }}>
                    No category data available
                  </Typography>
                ) : (
                  <List disablePadding>
                    {categories.map((category, index) => (
                      <React.Fragment key={category.category.id || index}>
                        {<Divider />}
                        <ListItem disablePadding sx={{ py: 1.5 }}>
                          <ListItemIcon sx={{ minWidth: 25 }}>
                            <Typography variant='body2' color='text.secondary'>
                              {index + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant='body2'>{category.category.name || 'Uncategorized'}</Typography>
                            }
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {getFormattedCurrency(category.amount)}
                          </Typography>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>

            <Grid sx={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
                  <Typography variant='body1' fontWeight='bold'>
                    Top Expense Category Types (This Month)
                  </Typography>
                </Box>

                {categoryTypes.length === 0 ? (
                  <Typography variant='body2' color='text.secondary' sx={{ py: 3, textAlign: 'center' }}>
                    No category type data available
                  </Typography>
                ) : (
                  <List disablePadding>
                    {categoryTypes.map((categoryType, index) => (
                      <React.Fragment key={categoryType.categoryType.id || index}>
                        {<Divider />}
                        <ListItem disablePadding sx={{ py: 1.5 }}>
                          <ListItemIcon sx={{ minWidth: 25 }}>
                            <Typography variant='body2' color='text.secondary'>
                              {index + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant='body2'>
                                {categoryType.categoryType.name || 'Uncategorized'}
                              </Typography>
                            }
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {getFormattedCurrency(categoryType.amount)}
                          </Typography>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

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
