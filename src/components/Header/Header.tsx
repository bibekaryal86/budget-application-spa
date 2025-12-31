import { ANIMATION, COLORS, THEME_MODES } from '@constants'
import { Brightness4, Brightness7, Computer, Logout, Menu as MenuIcon } from '@mui/icons-material'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useThemeStore, useAlertStore, useAuthStore } from '@stores'
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleTheme } = useThemeStore()
  const { showAlert } = useAlertStore()
  const { isAuthenticated, logout } = useAuthStore()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    void (async () => {
      if (isAuthenticated) {
        await logout()
        showAlert('success', 'Logged out successfully!')
        await navigate('/')
      }
    })()
  }

  const navigationItems = [{ path: '/transactions', label: 'Transactions', icon: <Computer /> }]

  return (
    <AppBar position='static' elevation={2}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component={Link}
          to='/'
          fontWeight='bold'
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isMobile ? 'PETS' : 'Personal Expenses Tracking System'}
        </Typography>

        {isAuthenticated && (
          <Stack direction='row' spacing={1} alignItems='center'>
            {!isMobile ? (
              // Desktop navigation
              <>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    color='inherit'
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    variant={location.pathname === item.path ? 'outlined' : 'text'}
                    sx={{
                      borderColor: 'inherit',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                  <Tooltip
                    title={`Switch to ${mode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT} mode`}
                  >
                    <IconButton
                      onClick={toggleTheme}
                      color='inherit'
                      sx={{
                        ml: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'rotate(15deg)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {mode === THEME_MODES.LIGHT ? <Brightness4 /> : <Brightness7 />}
                    </IconButton>
                  </Tooltip>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={mode === THEME_MODES.DARK}
                        onChange={toggleTheme}
                        color='default'
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: COLORS.ACCENT.YELLOW,
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: COLORS.ACCENT.YELLOW,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant='body2' sx={{ color: 'inherit', ml: 1 }}>
                        {mode === THEME_MODES.LIGHT ? 'Light' : 'Dark'}
                      </Typography>
                    }
                    sx={{ ml: 1, color: 'inherit', display: { xs: 'none', md: 'flex' } }}
                  />

                  <Tooltip title='Logout'>
                    <IconButton
                      onClick={handleLogout}
                      color='inherit'
                      sx={{
                        ml: 1,
                        transition: `all ${ANIMATION.DURATION.MEDIUM} ease`,
                        '&:hover': {
                          transform: 'scale(1.1)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Logout />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            ) : (
              // Mobile navigation
              <>
                {/* Mobile menu button */}
                <IconButton
                  color='inherit'
                  onClick={handleMenuOpen}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {/* Transactions menu item */}
                  <MenuItem
                    component={Link}
                    to='/transactions'
                    onClick={handleMenuClose}
                    selected={location.pathname === '/transactions'}
                  >
                    <Computer sx={{ mr: 2 }} />
                    Transactions
                  </MenuItem>

                  {/* Theme toggle menu item */}
                  <MenuItem
                    onClick={() => {
                      toggleTheme()
                      handleMenuClose()
                    }}
                  >
                    <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                      {mode === THEME_MODES.LIGHT ? <Brightness4 /> : <Brightness7 />}
                    </Box>
                    {mode === THEME_MODES.LIGHT ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  </MenuItem>

                  {/* Logout menu item */}
                  <MenuItem
                    onClick={() => {
                      handleLogout()
                      handleMenuClose()
                    }}
                  >
                    <Logout sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>

                {/* Mobile-only: Icon-only navigation for quick access */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Quick access icon for Transactions */}
                  <Tooltip title='Transactions'>
                    <IconButton
                      color='inherit'
                      component={Link}
                      to='/transactions'
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Computer />
                    </IconButton>
                  </Tooltip>

                  {/* Quick access icon for Theme toggle */}
                  <Tooltip title={`${mode === THEME_MODES.LIGHT ? 'Dark' : 'Light'} Mode`}>
                    <IconButton
                      onClick={toggleTheme}
                      color='inherit'
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {mode === THEME_MODES.LIGHT ? <Brightness4 /> : <Brightness7 />}
                    </IconButton>
                  </Tooltip>

                  {/* Quick access icon for Logout */}
                  <Tooltip title='Logout'>
                    <IconButton
                      onClick={handleLogout}
                      color='inherit'
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Logout />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            )}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}
