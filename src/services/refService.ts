import type { CategoryResponse, CategoryTypeResponse, TransactionItemTags, RefListResponse } from '@types'
import { apiHelperCore } from '@utils'

export const refService = {
  readCategoryTypes: async (): Promise<CategoryTypeResponse> => {
    return apiHelperCore.get<CategoryTypeResponse>('/v1/category-types')
  },

  readCategories: async (): Promise<CategoryResponse> => {
    return apiHelperCore.get<CategoryResponse>('/v1/categories')
  },

  readAccountTypes: async (): Promise<RefListResponse> => {
    return apiHelperCore.get<RefListResponse>('/v1/accounts/types')
  },

  readAccountStatuses: async (): Promise<RefListResponse> => {
    return apiHelperCore.get<RefListResponse>('/v1/accounts/statuses')
  },

  readBanks: async (): Promise<RefListResponse> => {
    return apiHelperCore.get<RefListResponse>('/v1/accounts/banks')
  },

  readMerchants: async (): Promise<RefListResponse> => {
    return apiHelperCore.get<RefListResponse>('/v1/transactions/merchants')
  },

  readTags: async (): Promise<TransactionItemTags> => {
    return apiHelperCore.get<TransactionItemTags>('/v1/transaction-items/tags')
  },
}
