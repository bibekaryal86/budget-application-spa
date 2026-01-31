import { txnService } from '@services'
import { useQuery, useMutation } from '@tanstack/react-query'
import { defaultTransactionParams, type TransactionParams, type TransactionRequest } from '@types'

import { useInvalidateTransactionQueryKeys } from './queryClient.ts'

const getTransactionsKey = (params: TransactionParams) => [
  'transactions',
  {
    pageNumber: params.pageNumber,
    perPage: params.perPage,
    beginDate: params.beginDate,
    endDate: params.endDate,
    merchants: params.merchants,
    catIds: params.catIds,
    catTypeIds: params.catTypeIds,
    accIds: params.accIds,
    tags: params.tags,
  },
]

export const useReadTransactions = (params: TransactionParams = defaultTransactionParams) =>
  useQuery({
    queryKey: getTransactionsKey(params),
    queryFn: () => txnService.readTransactions(params),
    select: (data) => ({
      transactions: data.data,
      pageInfo: data.metadata.responsePageInfo,
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
