import { reportService } from '@services'
import { useQuery } from '@tanstack/react-query'
import { defaultSummaryParams, type SummaryParams } from '@types'

const getSummaryKey = (queryKey: string, params: SummaryParams) => [
  queryKey,
  {
    beginDate: params.beginDate,
    endDate: params.endDate,
    catIds: params.catIds,
    catTypeIds: params.catTypeIds,
    topExpenses: params.topExpenses,
  },
]

export const useReadTransactionSummaries = () =>
  useQuery({
    queryKey: getSummaryKey('txnSummary', { ...defaultSummaryParams }),
    queryFn: () => reportService.readTransactionSummaries(),
    select: (data) => ({
      txnSummaries: data,
    }),
    staleTime: 60_000,
  })

export const useReadCategorySummaries = (topExpenses: boolean) =>
  useQuery({
    queryKey: getSummaryKey('catSummary', { ...defaultSummaryParams, topExpenses }),
    queryFn: () => reportService.readCategorySummary({ ...defaultSummaryParams, topExpenses }),
    select: (data) => ({
      catSummaries: data,
    }),
    staleTime: 60_000,
  })
