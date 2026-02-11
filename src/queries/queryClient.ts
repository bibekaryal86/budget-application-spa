import { QueryClient, useQueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const useInvalidateTransactionQueryKeys = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['transactions'] })
    void queryClient.invalidateQueries({ queryKey: ['merchants'] })
    void queryClient.invalidateQueries({ queryKey: ['tags'] })
    void queryClient.invalidateQueries({ queryKey: ['cfSummary'] })
    void queryClient.invalidateQueries({ queryKey: ['catSummary'] })
  }
}

export const useInvalidateAccountQueryKeys = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['accounts'] })
    void queryClient.invalidateQueries({ queryKey: ['banks'] })
  }
}
