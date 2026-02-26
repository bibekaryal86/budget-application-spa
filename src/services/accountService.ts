import type { AccountRequest, AccountResponse } from '@types'
import { apiHelperCore } from '@utils'

export const accountService = {
  createAccount: async (accountRequest: AccountRequest): Promise<AccountResponse> => {
    return apiHelperCore.post<AccountResponse>('/v1/accounts', accountRequest)
  },

  readAccounts: async (): Promise<AccountResponse> => {
    return apiHelperCore.get<AccountResponse>('/v1/accounts')
  },

  updateAccount: async (id: string, accountRequest: AccountRequest): Promise<AccountResponse> => {
    return apiHelperCore.put<AccountResponse>(`/v1/accounts/${id}`, accountRequest)
  },

  deleteAccount: async (id: string): Promise<AccountResponse> => {
    return apiHelperCore.delete<AccountResponse>(`/v1/accounts/${id}`)
  },
}
