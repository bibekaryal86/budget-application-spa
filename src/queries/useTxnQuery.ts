import { txnService } from '@services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TransactionRequest } from '@types'

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: txnService.createTransaction,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions', 'merchants'] })
    },
  })
}

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransactionRequest }) =>
      txnService.updateTransaction(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions', 'merchants'] })
    },
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => txnService.deleteTransaction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions', 'merchants'] })
    },
  })
}

export const useInvalidatePlatforms = (id?: number | null) => {
  const queryClient = useQueryClient()
  return () => {
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['platform', id] })
    } else {
      void queryClient.invalidateQueries({ queryKey: ['platforms'] })
    }
  }
}
