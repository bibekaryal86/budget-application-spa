export const INVALID_SESSION = 'Your session has expired. Please log in again.'
export const ACCESS_TOKEN_KEY = 'access_token'

export const DEFAULT_PAGE_NUMBER = 1
export const DEFAULT_PER_PAGE = 100

export const NO_EXPENSE_CATEGORY_TYPES = {
  INCOME: 'INCOME',
  SAVINGS: 'SAVINGS',
  TRANSFER: 'TRANSFER',
} as const

export const NO_EXP_CAT_TYPES = Object.values(NO_EXPENSE_CATEGORY_TYPES) as readonly string[]

export const TXN_TYPES = {
  WANTS: 'WANTS',
  NEEDS: 'NEEDS',
} as const

export const EXP_TYPES_LIST = Object.values(TXN_TYPES)

export const ACTION_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const

export type ModalAction = typeof ACTION_TYPE.CREATE | typeof ACTION_TYPE.UPDATE | typeof ACTION_TYPE.DELETE

export const FULL_MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export const FULL_MONTHS_ONLY = FULL_MONTHS.map((month) => month.label)

// Theme Constants
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES]

// Color Constants
export const COLORS = {
  PRIMARY: {
    LIGHT: '#1976d2',
    DARK: '#90caf9',
  },
  SECONDARY: {
    LIGHT: '#dc004e',
    DARK: '#f48fb1',
  },
  BACKGROUND: {
    LIGHT: '#ffffff',
    DARK: '#121212',
    PAPER_LIGHT: '#ffffff',
    PAPER_DARK: '#1e1e1e',
  },
  APP_BAR: {
    LIGHT: '#1976d2',
    DARK: '#0d47a1',
  },
  ACCENT: {
    YELLOW: '#ffeb3b',
  },
} as const

// Storage Constants
export const STORAGE_KEYS = {
  THEME: 'theme-storage',
} as const

// Animation Constants
export const ANIMATION = {
  DURATION: {
    SHORT: '0.3s',
    MEDIUM: '0.5s',
    LONG: '1s',
  },
} as const

// Z-Index Constants
export const Z_INDEX = {
  SPINNER: 5555,
} as const
