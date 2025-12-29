import type { TransactionRequest, TransactionResponse } from '@types'
import { apiHelperCore } from '@utils'

export const txnService = {
  createTransaction: async (txnRequest: TransactionRequest): Promise<TransactionResponse> => {
    return await apiHelperCore.post<TransactionResponse>('/v1/transactions', txnRequest)
  },

  readTransactions: async (): Promise<TransactionResponse> => {
    return await apiHelperCore.get<TransactionResponse>('/v1/transactions')
  },

  updateTransaction: async (id: string, txnRequest: TransactionRequest): Promise<TransactionResponse> => {
    return await apiHelperCore.put<TransactionResponse>(`/v1/transactions/${id}`, txnRequest)
  },

  deleteTransaction: async (id: string): Promise<TransactionResponse> => {
    return await apiHelperCore.delete<TransactionResponse>(`/v1/transactions/${id}`)
  },
}
