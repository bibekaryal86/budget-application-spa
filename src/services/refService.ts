import type { AccountResponse, CategoryResponse, CategoryTypeResponse, TransactionMerchants } from '@types'
import { apiHelperCore } from '@utils'

export const refService = {
  readCategoryTypes: async (): Promise<CategoryTypeResponse> => {
    return await apiHelperCore.get<CategoryTypeResponse>('/v1/category-types')
  },

  readCategories: async (): Promise<CategoryResponse> => {
    return await apiHelperCore.get<CategoryResponse>('/v1/categories')
  },

  readAccounts: async (): Promise<AccountResponse> => {
    return await apiHelperCore.get<AccountResponse>('/v1/accounts')
  },

  readMerchants: async (): Promise<TransactionMerchants> => {
    return await apiHelperCore.get<TransactionMerchants>('/v1/transactions/merchants')
  },
}
