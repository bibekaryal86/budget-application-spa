import { Login, Home, NotFound, Transactions, Budgets, Insights, Categories, Accounts } from '@pages'
import React from 'react'

interface RouteConfig {
  path: string
  component: React.ComponentType
  isProtected?: boolean
}

export const routes: RouteConfig[] = [
  { path: '/', component: Login },
  { path: '/home', component: Home, isProtected: true },
  { path: '/transactions', component: Transactions, isProtected: true },
  { path: '/insights', component: Insights, isProtected: true },
  { path: '/budgets', component: Budgets, isProtected: true },
  { path: '/categories', component: Categories, isProtected: true },
  { path: '/accounts', component: Accounts, isProtected: true },
  { path: '*', component: NotFound },
]
