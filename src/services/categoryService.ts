import type { CategoryCompositeResponse, CompositeRequest, CompositeResponse } from '@types'
import { apiHelperCore } from '@utils'

export const categoryService = {
  readCategories: async (categoryTypeId: string | null): Promise<CategoryCompositeResponse[]> => {
    const request: CompositeRequest = { transactionComposite: null, categoryComposite: { categoryTypeId } }
    const compositeResponse: CompositeResponse = await apiHelperCore.post<CompositeResponse>(
      '/api/v1/composites/categories',
      request,
    )
    return compositeResponse.cats
  },
}
