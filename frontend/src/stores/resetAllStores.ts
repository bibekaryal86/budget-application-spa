import { query } from '@queries'

import { useAlertStore } from './useAlertStore.ts'
import { useSpinnerStore } from './useSpinnerStore.ts'

export const resetAllStores = () => {
  // also clear Tanstack query cache
  query.clear()

  useAlertStore.getState().resetAlertState()
  useSpinnerStore.getState().resetSpinnerState()
}
