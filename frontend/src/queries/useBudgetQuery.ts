import { budgetService } from '@services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { BudgetRequest } from '@types'

export const useReadBudgets = (budgetMonth: number, budgetYear: number) =>
  useQuery({
    queryKey: ['budgets', budgetYear, budgetMonth],
    queryFn: () => budgetService.readBudgets(budgetMonth, budgetYear),
    select: (data) => ({
      budgets: data.data,
    }),
    staleTime: 60_000,
  })

export const useCreateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: budgetService.createBudget,

    onSuccess: (createdBudget) => {
      void queryClient.invalidateQueries({
        queryKey: ['budgets', createdBudget.data[0].budgetMonth, createdBudget.data[0].budgetYear],
      })
    },
  })
}

export const useUpdateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BudgetRequest }) => budgetService.updateBudget(id, payload),

    onSuccess: (updatedBudget) => {
      void queryClient.invalidateQueries({
        queryKey: ['budgets', updatedBudget.data[0].budgetMonth, updatedBudget.data[0].budgetYear],
      })
    },
  })
}

export const useDeleteBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => budgetService.deleteBudget(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export const useInvalidateBudgetsMerchants = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['budgets'] })
  }
}
