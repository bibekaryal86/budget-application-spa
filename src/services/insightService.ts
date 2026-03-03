import type { CategorySummaries, InsightParams, CashFlowSummaries, AccountSummaries } from '@types'
import { apiHelperCore } from '@utils'

export const insightService = {
  readCashFlowSummaries: async (params: InsightParams): Promise<CashFlowSummaries> => {
    return await apiHelperCore.get<CashFlowSummaries, InsightParams>('/v1/insights/cf-summaries', params)
  },

  readCategorySummary: async (params: InsightParams): Promise<CategorySummaries> => {
    return await apiHelperCore.get<CategorySummaries, InsightParams>('/v1/insights/cat-summaries', params)
  },

  readAccountSummary: async (params: InsightParams): Promise<AccountSummaries> => {
    return await apiHelperCore.get<AccountSummaries, InsightParams>('/v1/insights/acc-summaries', params)
  },
}
