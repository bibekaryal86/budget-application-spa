import type { CategorySummaries, InsightParams, CashFlowSummaries } from '@types'
import { apiHelperCore } from '@utils'

export const insightsService = {
  readCashFlowSummaries: async (params: InsightParams): Promise<CashFlowSummaries> => {
    return await apiHelperCore.get<CashFlowSummaries, InsightParams>('/v1/insights/cf-summaries', params)
  },

  readCategorySummary: async (params: InsightParams): Promise<CategorySummaries> => {
    return await apiHelperCore.get<CategorySummaries, InsightParams>('/v1/insights/cat-summaries', params)
  },
}
