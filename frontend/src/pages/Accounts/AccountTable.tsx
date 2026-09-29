import { ACTION_TYPE } from '@constants'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { useAuthStore, useAccountStore, useMobileStore } from '@stores'
import type { Account } from '@types'
import React from 'react'

import { AccountTableRow } from './AccountTableRow.tsx'

export const AccountTable: React.FC<{ accounts: Account[] }> = ({ accounts }) => {
  const { isSuperUser } = useAuthStore()
  const { isMobile } = useMobileStore()
  const { openAccountModal } = useAccountStore()

  const handleEditClick = (account: Account) => {
    openAccountModal(ACTION_TYPE.UPDATE, account)
  }

  const handleDeleteClick = (account: Account) => {
    openAccountModal(ACTION_TYPE.DELETE, account)
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding='checkbox' />
            {!isMobile && <TableCell>Bank</TableCell>}
            <TableCell>Account</TableCell>
            {!isMobile && <TableCell>Type</TableCell>}
            {!isMobile && <TableCell>Status</TableCell>}
            <TableCell align='right'>Account Balance</TableCell>
            <TableCell align='center'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account) => (
            <AccountTableRow
              key={account.id}
              account={account}
              isMobile={isMobile}
              isSuperUser={isSuperUser}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
