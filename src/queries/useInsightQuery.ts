import { insightService } from '@services'
import { useQuery } from '@tanstack/react-query'
import { type InsightParams } from '@types'

const getSummaryKey = (queryKey: string, params: InsightParams) => [
  queryKey,
  {
    beginDate: params.beginDate,
    endDate: params.endDate,
    categoryIds: params.categoryIds,
    categoryTypeIds: params.categoryTypeIds,
    topExpenses: params.topExpenses,
  },
]

export const useReadCashFlowSummaries = (params: InsightParams) =>
  useQuery({
    queryKey: getSummaryKey('cfSummary', params),
    queryFn: () => insightService.readCashFlowSummaries(params),
    select: (data) => ({
      cfSummaries: data,
    }),
    staleTime: 60_000,
  })

export const useReadCategorySummaries = (params: InsightParams) =>
  useQuery({
    queryKey: getSummaryKey('catSummary', params),
    queryFn: () => insightService.readCategorySummary(params),
    select: (data) => ({
      catSummaries: data,
    }),
    staleTime: 60_000,
  })
