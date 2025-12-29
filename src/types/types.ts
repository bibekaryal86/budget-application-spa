import { type AxiosRequestConfig } from 'axios'

// Utils
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

// Auth Service
export interface ProfilePasswordRequest {
  email: string
  password: string
}

export interface ProfilePasswordTokenResponse {
  accessToken: string | null
  authToken: AuthToken | null
  responseMetadata: ResponseMetadata

  // available only in non-prod envs
  refreshToken: string | null
  csrfToken: string | null
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

export interface Category extends Omit<CategoryRequest, 'categoryTypeId'> {
  id: string
  categoryType: CategoryType
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

export interface TransactionItem extends Omit<TransactionItemRequest, 'transactionId' | 'categoryId'> {
  id: string
  transaction: TransactionItem | null
  category: Category | null
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
  items: TransactionItemRequest[]
}

export interface Transaction extends Omit<TransactionRequest, 'items'> {
  id: string
  items: TransactionItem[]
}

export interface TransactionResponse {
  data: Transaction[]
  metadata: ResponseMetadata
}

export interface TransactionMerchants {
  data: string[]
  metadata: ResponseMetadata
}

// Request Params
export interface TransactionItemParams {
  txnIds: string[] | []
  catIds: string[] | []
  txnTypes: string[] | []
}

export interface CategoryParams {
  catTypeIds: string[] | []
}

export interface TransactionParams {
  beginDate: Date | null
  endDate: Date | null
  merchants: string[] | []
  catIds: string[] | []
  catTypeIds: string[] | []
  txnTypes: string[] | []
}
