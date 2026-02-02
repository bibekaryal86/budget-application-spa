import { insightsService } from '@services'
import { useQuery } from '@tanstack/react-query'
import { defaultSummaryParams, type SummaryParams } from '@types'

const getSummaryKey = (queryKey: string, params: SummaryParams) => [
  queryKey,
  {
    beginDate: params.beginDate,
    endDate: params.endDate,
    categoryIds: params.categoryIds,
    categoryTypeIds: params.categoryTypeIds,
    topExpenses: params.topExpenses,
  },
]

export const useReadCashFlowSummaries = () =>
  useQuery({
    queryKey: getSummaryKey('cfSummary', { ...defaultSummaryParams }),
    queryFn: () => insightsService.readCashFlowSummaries(),
    select: (data) => ({
      cfSummaries: data,
    }),
    staleTime: 60_000,
  })

export const useReadCategorySummaries = (topExpenses: boolean) =>
  useQuery({
    queryKey: getSummaryKey('catSummary', { ...defaultSummaryParams, topExpenses }),
    queryFn: () => insightsService.readCategorySummary({ ...defaultSummaryParams, topExpenses }),
    select: (data) => ({
      catSummaries: data,
    }),
    staleTime: 60_000,
  })
