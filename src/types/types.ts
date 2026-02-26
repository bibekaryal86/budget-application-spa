import { DEFAULT_PAGE_NUMBER, DEFAULT_PER_PAGE } from '@constants'
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
  currentBalance: number
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
  accountId: string
  amount: number | null
  tags: string[] | []
  notes: string | null
}

export interface TransactionItem extends Omit<TransactionItemRequest, 'transactionId' | 'categoryId' | 'accountId'> {
  id: string
  transaction: Transaction | null
  category: Category
  account: Account
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
  totalAmount: number | null
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

// Ref Lists
export interface RefListResponse {
  data: string[]
  metadata: ResponseMetadata
}

// Insights
export interface CashFlowAmounts {
  incomes: number
  expenses: number
  savings: number
  balance: number
}

export interface CashFlowSummary {
  yearMonth: string
  cashFlowAmounts: CashFlowAmounts
}

export interface CashFlowSummaries {
  data: CashFlowSummary[]
  metadata: ResponseMetadata
}

export interface CategoryAmount {
  category: Category
  amount: number
}

export interface CategorySummary {
  yearMonth: string
  categoryAmounts: CategoryAmount[]
}

export interface CategorySummaries {
  data: CategorySummary[]
  metadata: ResponseMetadata
}

// Request Params
export interface CategoryParams {
  catTypeIds: string[] | []
}

export interface TransactionParams {
  pageNumber: number | null
  perPage: number | null
  beginDate: string | null
  endDate: string | null
  merchants: string[] | []
  categoryIds: string[] | []
  categoryTypeIds: string[] | []
  accountIds: string[] | []
  tags: string[] | []
}

export const defaultTransactionParams: TransactionParams = {
  pageNumber: DEFAULT_PAGE_NUMBER,
  perPage: DEFAULT_PER_PAGE,
  beginDate: null,
  endDate: null,
  merchants: [],
  categoryIds: [],
  categoryTypeIds: [],
  accountIds: [],
  tags: [],
}

export interface InsightParams {
  beginDate: string | null
  endDate: string | null
  categoryIds: string[] | []
  categoryTypeIds: string[] | []
  topExpenses: number | null
  totalMonths: number | null
}

export const defaultInsightParams: InsightParams = {
  beginDate: null,
  endDate: null,
  categoryIds: [],
  categoryTypeIds: [],
  topExpenses: null,
  totalMonths: null,
}
