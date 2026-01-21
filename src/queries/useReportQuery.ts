import { reportService } from '@services'
import { useQuery } from '@tanstack/react-query'

export const useReadTransactionSummaries = () =>
  useQuery({
    queryKey: ['txnSummary'],
    queryFn: () => reportService.readTransactionSummaries(),
    select: (data) => ({
      txnSummaries: data.txnSummaries,
    }),
    staleTime: 60_000,
  })
