import { query } from '@queries'

import { useAlertStore } from './useAlertStore'
import { useSpinnerStore } from './useSpinnerStore'

export const resetAllStores = () => {
  // also clear Tanstack query cache
  query.clear()

  useAlertStore.getState().resetAlertState()
  useSpinnerStore.getState().resetSpinnerState()
}
