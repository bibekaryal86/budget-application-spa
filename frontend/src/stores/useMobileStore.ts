import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface MobileState {
  isMobile: boolean
  setIsMobile: (mobile: boolean) => void
}

export const useMobileStore = create<MobileState>()(
  devtools(
    (set) => ({
      isMobile: false,
      setIsMobile: (mobile: boolean) => set({ isMobile: mobile }, false, 'mobile/setIsMobile'),
    }),
    {
      name: 'MobileStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)

export const useMobileListener = () => {
  const theme = useTheme()
  const mediaQueryMatch = useMediaQuery(theme.breakpoints.down('sm'))
  const setIsMobile = useMobileStore((state) => state.setIsMobile)

  useEffect(() => {
    setIsMobile(mediaQueryMatch)
  }, [mediaQueryMatch, setIsMobile])
}
