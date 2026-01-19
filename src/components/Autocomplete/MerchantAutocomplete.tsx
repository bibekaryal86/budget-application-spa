import { TextField, Paper, MenuItem, type TextFieldProps } from '@mui/material'
import React, { useMemo, useState } from 'react'

export interface MerchantAutocompleteProps {
  value: string
  onChange: (merchant: string) => void
  merchants: string[]
  label?: string
  placeholder?: string
  fullWidth?: boolean
  TextFieldProps?: Partial<TextFieldProps>
}

export const MerchantAutocomplete: React.FC<MerchantAutocompleteProps> = ({
  value,
  onChange,
  merchants,
  label = 'Merchant',
  placeholder = 'Type to search...',
  fullWidth = true,
  TextFieldProps = {},
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState(value || '')

  const filteredMerchants = useMemo(() => {
    if (!search) return merchants
    return merchants.filter((merchant) => merchant.toLowerCase().includes(search.toLowerCase()))
  }, [merchants, search])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    setShowDropdown(true)
  }

  const handleSelect = (merchant: string) => {
    onChange(merchant)
    setSearch(merchant)
    setShowDropdown(false)
  }

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }

  const handleFocus = () => {
    if (search) {
      setShowDropdown(true)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <TextField
        fullWidth={fullWidth}
        label={label}
        value={search}
        onChange={handleSearchChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...TextFieldProps}
      />
      {showDropdown && filteredMerchants.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            zIndex: 1300,
            width: '100%',
            maxHeight: 300,
            overflow: 'auto',
            mt: 0.5,
            boxShadow: 3,
          }}
        >
          {filteredMerchants.map((merchant) => (
            <MenuItem
              key={merchant}
              onClick={() => handleSelect(merchant)}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {merchant}
            </MenuItem>
          ))}
        </Paper>
      )}
    </div>
  )
}
