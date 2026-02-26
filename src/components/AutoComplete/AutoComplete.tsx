import { TextField, Paper, MenuItem, type TextFieldProps, Portal } from '@mui/material'
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'

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
  dataList,
  label,
  placeholder = 'Type to search...',
  fullWidth = true,
  TextFieldProps = {},
}) => {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })

  useLayoutEffect(() => {
    if (showDropdown && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [showDropdown])

  const filteredDataList = useMemo(() => {
    if (!value) return dataList
    return dataList.filter((merchant) => merchant.toLowerCase().includes(value.toLowerCase()))
  }, [dataList, value])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onChange(value)
    setShowDropdown(true)
  }

  const handleSelect = (merchant: string) => {
    onChange(merchant)
    setShowDropdown(false)
  }

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }

  const handleFocus = () => {
    if (value) {
      setShowDropdown(true)
    }
  }

  return (
    <div ref={anchorRef} style={{ position: 'relative' }}>
      <TextField
        fullWidth={fullWidth}
        label={label}
        value={value}
        onChange={handleSearchChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...TextFieldProps}
      />
      {showDropdown && filteredDataList.length > 0 && (
        <Portal>
          <Paper
            sx={{
              position: 'absolute',
              zIndex: 2000,
              width: dropdownPos.width,
              top: dropdownPos.top,
              left: dropdownPos.left,
              maxHeight: 300,
              overflow: 'auto',
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
        </Portal>
      )}
    </div>
  )
}
