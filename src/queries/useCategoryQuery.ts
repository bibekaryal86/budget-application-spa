import { categoryService } from '@services'
import { useQuery } from '@tanstack/react-query'

export const useReadCategories = (categoryTypeId: string | null) =>
  useQuery({
    queryKey: ['categories', categoryTypeId],
    queryFn: () => categoryService.readCategories(categoryTypeId),
    select: (data) => ({
      categories: data,
    }),
    staleTime: 60_000,
  })
