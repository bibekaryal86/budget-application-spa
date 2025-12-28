import { type AxiosRequestConfig } from 'axios'

// UTILS

export interface RequestConfig extends AxiosRequestConfig {
  showSpinner?: boolean
  showError?: boolean
  noAuth?: boolean
  withCredentials?: boolean
  _retryCount?: number
}

export interface ResponseStatusInfo {
  errMsg: string | null
}

export interface ResponseCrudInfo {
  insertedRowsCount: number
  updatedRowsCount: number
  deletedRowsCount: number
  restoredRowsCount: number
}

export interface ResponsePageInfo {
  totalItems: number
  totalPages: number
  pageNumber: number
  perPage: number
}

export interface ResponseMetadata {
  responseStatusInfo: ResponseStatusInfo
  responseCrudInfo: ResponseCrudInfo
  responsePageInfo: ResponsePageInfo
}

export interface ResponseWithMetadata {
  responseMetadata: ResponseMetadata
}

// Auth Token
export interface AuthToken {
  platform: AuthTokenPlatform
  profile: AuthTokenProfile
  roles: AuthTokenRole[]
  permissions: AuthTokenPermission[]
  isSuperUser: boolean
}

export interface AuthTokenPlatform {
  id: number
  platformName: string
}

export interface AuthTokenProfile {
  id: number
  email: string
}

export interface AuthTokenRole {
  id: number
  roleName: string
}

export interface AuthTokenPermission {
  id: number
  permissionName: string
}

// Category Type
export interface CategoryTypeRequest {
  name: string
}

export interface CategoryType extends CategoryTypeRequest {
  id: string
}

export interface CategoryTypeResponse {
  data: CategoryType[]
  metadata: ResponseMetadata
}

// Category
export interface CategoryRequest {
  categoryTypeId: string
  name: string
}

export interface Category extends CategoryRequest {
  id: string
}

export interface CategoryResponse {
  data: Category[]
  metadata: ResponseMetadata
}

// Transaction Item
export interface TransactionItemRequest {
  transactionId: string | null
  categoryId: string
  label: string
  amount: number
  txnType: string
}

export interface TransactionItem extends TransactionItemRequest {
  id: string
}

export interface TransactionItemResponse {
  data: TransactionItem[]
  metadata: ResponseMetadata
}

// Transaction
export interface TransactionRequest {
  txnDate: Date
  merchant: string
  totalAmount: number
  notes: string | null
  items: TransactionItemResponse[]
}

export interface Transaction extends Omit<TransactionRequest, 'items'> {
  id: string
}

export interface TransactionWithItems {
  transaction: Transaction
  items: TransactionItem[]
}

export interface TransactionResponse {
  data: TransactionWithItems[]
  metadata: ResponseMetadata
}

// Composite
export interface CategoryCompositeRequest {
  categoryTypeId: string | null
}

export interface TransactionCompositeRequest {
  beginDate: Date | null
  endDate: Date | null
  merchant: string | null
  categoryId: string | null
  categoryTypeId: string | null
}

export interface CompositeRequest {
  transactionComposite: TransactionCompositeRequest | null
  categoryComposite: CategoryCompositeRequest | null
}

export interface CategoryTypeCompositeResponse {
  id: string
  name: string
}

export interface CategoryCompositeResponse {
  id: string
  name: string
  categoryType: CategoryTypeCompositeResponse
}

export interface TransactionItemCompositeResponse {
  id: string
  amount: number
  category: CategoryCompositeResponse
}

export interface TransactionCompositeResponse {
  id: string
  txnDate: Date
  merchant: string
  totalAmount: number
  notes: string | null
  items: TransactionItemCompositeResponse[]
}

export interface CompositeResponse {
  txns: TransactionCompositeResponse[]
  cats: CategoryCompositeResponse[]
  metadata: ResponseMetadata
}
