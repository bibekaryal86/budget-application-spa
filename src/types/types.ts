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

// Account
export interface AccountRequest {
  name: string
  accountType: string
  bankName: string
  openingBalance: number
  status: string
}

export interface Account extends AccountRequest {
  id: string
}

export interface AccountResponse {
  data: Account[]
  metadata: ResponseMetadata
}

// Budget
export interface BudgetRequest {
  categoryId: string
  budgetMonth: number
  budgetYear: number
  amount: number
  notes: string
}

export interface Budget extends Omit<BudgetRequest, 'categoryId'> {
  id: string
  category: Category
}

export interface BudgetResponse {
  data: Budget[]
  metadata: ResponseMetadata
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
  id: string | null
  transactionId: string | null
  categoryId: string
  amount: number | null
  tags: string[] | []
  notes: string | null
}

export interface TransactionItem extends Omit<TransactionItemRequest, 'transactionId' | 'categoryId'> {
  id: string
  transaction: Transaction | null
  category: Category
}

export interface TransactionItemResponse {
  data: TransactionItem[]
  metadata: ResponseMetadata
}

export interface TransactionItemTags {
  data: string[]
  metadata: ResponseMetadata
}

// Transaction
export interface TransactionRequest {
  txnDate: Date | null
  merchant: string
  accountId: string
  totalAmount: number | null
  items: TransactionItemRequest[]
}

export interface Transaction extends Omit<TransactionRequest, 'accountId' | 'items'> {
  id: string
  account: Account
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

// Reports
export interface TransactionSummary {
  beginDate: Date
  endDate: Date
  incomes: number
  expenses: number
  savings: number
}

export interface TransactionSummaries {
  currentMonth: TransactionSummary
  previousMonth: TransactionSummary
}

export interface TransactionSummaryResponse {
  txnSummaries: TransactionSummaries
  metadata: ResponseMetadata
}

// Request Params
export interface CategoryParams {
  catTypeIds: string[] | []
}

export interface TransactionParams {
  beginDate: string | null
  endDate: string | null
  merchants: string[] | []
  catIds: string[] | []
  catTypeIds: string[] | []
  accIds: string[] | []
  tags: string[] | []
}

export const defaultTransactionParams: TransactionParams = {
  beginDate: null,
  endDate: null,
  merchants: [],
  catIds: [],
  catTypeIds: [],
  accIds: [],
  tags: [],
}

export interface TransactionSummaryParams {
  beginDate: Date | null
  endDate: Date | null
}
