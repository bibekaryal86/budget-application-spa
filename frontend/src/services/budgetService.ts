import type { BudgetRequest, BudgetResponse } from '@types'
import { apiHelperCore } from '@utils'

export const budgetService = {
  createBudget: async (budgetRequest: BudgetRequest): Promise<BudgetResponse> => {
    return await apiHelperCore.post<BudgetResponse>('/v1/budgets', budgetRequest)
  },

  readBudgets: async (budgetMonth: number, budgetYear: number): Promise<BudgetResponse> => {
    return await apiHelperCore.get<BudgetResponse>('/v1/budgets', { budgetMonth, budgetYear })
  },

  updateBudget: async (id: string, budgetRequest: BudgetRequest): Promise<BudgetResponse> => {
    return await apiHelperCore.put<BudgetResponse>(`/v1/budgets/${id}`, budgetRequest)
  },

  deleteBudget: async (id: string): Promise<BudgetResponse> => {
    return await apiHelperCore.delete<BudgetResponse>(`/v1/budgets/${id}`)
  },
}
