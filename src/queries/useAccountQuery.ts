import { accountService } from '@services'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { AccountRequest } from '@types'

import { useInvalidateAccountQueryKeys } from './queryClient.ts'

export const useReadAccounts = () =>
  useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.readAccounts(),
    select: (data) => ({
      accounts: data.data,
    }),
    staleTime: 60_000,
  })

export const useCreateAccount = () => {
  const invalidateAccountQueryKeys = useInvalidateAccountQueryKeys()
  return useMutation({
    mutationFn: accountService.createAccount,

    onSuccess: () => {
      invalidateAccountQueryKeys()
    },
  })
}

export const useUpdateAccount = () => {
  const invalidateAccountQueryKeys = useInvalidateAccountQueryKeys()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountRequest }) => accountService.updateAccount(id, payload),

    onSuccess: () => {
      invalidateAccountQueryKeys()
    },
  })
}

export const useDeleteAccount = () => {
  const invalidateAccountQueryKeys = useInvalidateAccountQueryKeys()

  return useMutation({
    mutationFn: ({ id }: { id: string }) => accountService.deleteAccount(id),
    onSuccess: () => {
      invalidateAccountQueryKeys()
    },
  })
}
