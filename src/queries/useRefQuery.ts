import { refService } from '@services'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export const useReadCategoryTypes = () =>
  useQuery({
    queryKey: ['categoryTypes'],
    queryFn: () => refService.readCategoryTypes(),
    select: (data) => ({
      categoryTypes: data,
    }),
    staleTime: 60_000,
  })

export const useReadCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => refService.readCategories(),
    select: (data) => ({
      categories: data,
    }),
    staleTime: 60_000,
  })

export const useReadMerchants = () =>
  useQuery({
    queryKey: ['merchants'],
    queryFn: () => refService.readMerchants(),
    select: (data) => ({
      merchants: data,
    }),
    staleTime: 60_000,
  })

export const useInvalidateMerchants = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['merchants'] })
  }
}
