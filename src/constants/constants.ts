export const INVALID_SESSION = 'Your session has expired. Please log in again.'
export const ACCESS_TOKEN_KEY = 'access_token'

export const TXN_TYPES = {
  WANTS: 'WANTS',
  NEEDS: 'NEEDS',
  INCOME: 'INCOME',
  SAVINGS: 'SAVINGS',
  TRANSFER: 'TRANSFER',
  OTHER: 'OTHER',
} as const

export const TXN_TYPE_LIST = Object.values(TXN_TYPES)

export type TxnTypes =
  | typeof TXN_TYPES.WANTS
  | typeof TXN_TYPES.NEEDS
  | typeof TXN_TYPES.INCOME
  | typeof TXN_TYPES.SAVINGS
  | typeof TXN_TYPES.TRANSFER
  | typeof TXN_TYPES.OTHER

export const ACTION_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const

export type ModalAction = typeof ACTION_TYPE.CREATE | typeof ACTION_TYPE.UPDATE | typeof ACTION_TYPE.DELETE

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
