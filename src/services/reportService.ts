import type { TransactionSummaryResponse } from '@types'
import { apiHelperCore } from '@utils'

export const reportService = {
  readTransactionSummaries: async (): Promise<TransactionSummaryResponse> => {
    return await apiHelperCore.get<TransactionSummaryResponse>('/v1/reports/txn-summaries')
  },
}
