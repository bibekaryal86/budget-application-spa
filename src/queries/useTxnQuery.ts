import { txnService } from '@services'
import { useQuery, useMutation } from '@tanstack/react-query'
import type { TransactionRequest } from '@types'

import { useInvalidateTransactionQueryKeys } from './queryClient.ts'

export const useReadTransactions = () =>
  useQuery({
    queryKey: ['transactions'],
    queryFn: () => txnService.readTransactions(),
    select: (data) => ({
      transactions: data.data,
    }),
    staleTime: 60_000,
  })

export const useCreateTransaction = () => {
  const invalidateTransactionQueryKeys = useInvalidateTransactionQueryKeys()
  return useMutation({
    mutationFn: txnService.createTransaction,

    onSuccess: () => {
      invalidateTransactionQueryKeys()
    },
  })
}

export const useUpdateTransaction = () => {
  const invalidateTransactionQueryKeys = useInvalidateTransactionQueryKeys()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransactionRequest }) =>
      txnService.updateTransaction(id, payload),
    onSuccess: () => {
      invalidateTransactionQueryKeys()
    },
  })
}

export const useDeleteTransaction = () => {
  const invalidateTransactionQueryKeys = useInvalidateTransactionQueryKeys()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => txnService.deleteTransaction(id),
    onSuccess: () => {
      invalidateTransactionQueryKeys()
    },
  })
}
