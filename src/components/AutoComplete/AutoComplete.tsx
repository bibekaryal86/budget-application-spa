import { TextField, Paper, MenuItem, type TextFieldProps } from '@mui/material'
import React, { useMemo, useState } from 'react'

interface AutoCompleteProps {
  value: string
  onChange: (merchant: string) => void
  dataList: string[]
  label: string
  placeholder?: string
  fullWidth?: boolean
  TextFieldProps?: Partial<TextFieldProps>
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({
  value,
  onChange,
  dataList: dataList,
  label,
  placeholder = 'Type to search...',
  fullWidth = true,
  TextFieldProps = {},
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState(value || '')

  const filteredDataList = useMemo(() => {
    if (!search) return dataList
    return dataList.filter((merchant) => merchant.toLowerCase().includes(search.toLowerCase()))
  }, [dataList, search])

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
      {showDropdown && filteredDataList.length > 0 && (
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
          {filteredDataList.map((value) => (
            <MenuItem
              key={value}
              onClick={() => handleSelect(value)}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {value}
            </MenuItem>
          ))}
        </Paper>
      )}
    </div>
  )
}
