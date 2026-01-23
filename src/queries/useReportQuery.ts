import { reportService } from '@services'
import { useQuery } from '@tanstack/react-query'

export const useReadTransactionSummaries = () =>
  useQuery({
    queryKey: ['txnSummary'],
    queryFn: () => reportService.readTransactionSummaries(),
    select: (data) => ({
      txnSummaries: data,
    }),
    staleTime: 60_000,
  })

export const useReadCategorySummaries = () =>
  useQuery({
    queryKey: ['catSummary'],
    queryFn: () => reportService.readCategorySummary(),
    select: (data) => ({
      catSummaries: data,
    }),
    staleTime: 60_000,
  })
