import { refService } from '@services'
import { useQuery } from '@tanstack/react-query'

export const useReadCategoryTypes = () =>
  useQuery({
    queryKey: ['categoryTypes'],
    queryFn: () => refService.readCategoryTypes(),
    select: (data) => ({
      categoryTypes: data.data,
    }),
    staleTime: 60_000,
  })

export const useReadCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: () => refService.readCategories(),
    select: (data) => ({
      categories: data.data,
    }),
    staleTime: 60_000,
  })

export const useReadAccountTypes = () =>
  useQuery({
    queryKey: ['accountTypes'],
    queryFn: () => refService.readAccountTypes(),
    select: (data) => ({
      accounts: data.data,
    }),
    staleTime: 60_000,
  })

export const useReadAccountStatuses = () =>
  useQuery({
    queryKey: ['accountStatuses'],
    queryFn: () => refService.readAccountStatuses(),
    select: (data) => ({
      accounts: data.data,
    }),
    staleTime: 60_000,
  })

export const useReadBanks = () =>
  useQuery({
    queryKey: ['banks'],
    queryFn: () => refService.readBanks(),
    select: (data) => ({
      accounts: data.data,
    }),
    staleTime: 60_000,
  })

export const useReadMerchants = () =>
  useQuery({
    queryKey: ['merchants'],
    queryFn: () => refService.readMerchants(),
    select: (data) => ({
      merchants: data.data,
    }),
    staleTime: 60_000,
  })

export const useReadTags = () =>
  useQuery({
    queryKey: ['tags'],
    queryFn: () => refService.readTags(),
    select: (data) => ({
      tags: data.data,
    }),
    staleTime: 60_000,
  })
