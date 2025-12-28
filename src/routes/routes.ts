import { Login, Home, NotFound, Transactions } from '@pages'
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
  { path: '*', component: NotFound },
]
