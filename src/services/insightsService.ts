import type { CategorySummaries, SummaryParams, CashFlowSummaries } from '@types'
import { apiHelperCore } from '@utils'

export const insightsService = {
  readCashFlowSummaries: async (): Promise<CashFlowSummaries> => {
    return await apiHelperCore.get<CashFlowSummaries>('/v1/insights/cf-summaries')
  },

  readCategorySummary: async (params: SummaryParams): Promise<CategorySummaries> => {
    return await apiHelperCore.get<CategorySummaries, SummaryParams>('/v1/insights/cat-summaries', params)
  },
}
