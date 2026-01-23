import type { CategorySummaries, TransactionSummaries } from '@types'
import { apiHelperCore } from '@utils'

export const reportService = {
  readTransactionSummaries: async (): Promise<TransactionSummaries> => {
    return await apiHelperCore.get<TransactionSummaries>('/v1/reports/txn-summaries')
  },

  readCategorySummary: async (): Promise<CategorySummaries> => {
    return await apiHelperCore.get<CategorySummaries>('/v1/reports/cat-summaries')
  },
}
