import type { CategorySummaries, SummaryParams, TransactionSummaries } from '@types'
import { apiHelperCore } from '@utils'

export const reportService = {
  readTransactionSummaries: async (): Promise<TransactionSummaries> => {
    return await apiHelperCore.get<TransactionSummaries>('/v1/reports/txn-summaries')
  },

  readCategorySummary: async (params: SummaryParams): Promise<CategorySummaries> => {
    return await apiHelperCore.get<CategorySummaries, SummaryParams>('/v1/reports/cat-summaries', params)
  },
}
