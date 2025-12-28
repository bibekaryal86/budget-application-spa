import type { CategoryResponse, CategoryTypeResponse, TransactionResponse } from '@types'
import { apiHelperCore } from '@utils'

export const refService = {
  readCategoryTypes: async (): Promise<CategoryTypeResponse> => {
    return await apiHelperCore.get<CategoryTypeResponse>('/api/v1/category-types')
  },

  readCategories: async (): Promise<CategoryResponse> => {
    return await apiHelperCore.get<CategoryResponse>('/api/v1/categories')
  },

  readMerchants: async (): Promise<string[]> => {
    const txnResponse = await apiHelperCore.get<TransactionResponse>('/api/v1/transactions/merchants')
    return txnResponse.data.map((txn) => txn.transaction.merchant)
  },
}
