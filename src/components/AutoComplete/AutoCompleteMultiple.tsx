import ClearIcon from '@mui/icons-material/Clear'
import { Autocomplete, TextField, Chip, type ChipProps } from '@mui/material'
import React from 'react'

interface AutoCompleteMultipleProps {
  value: string[]
  onChange: (tags: string[]) => void
  options: string[]
  label: string
  placeholder?: string
  helperText?: string
  error?: boolean
  fullWidth?: boolean
  disabled?: boolean
  size?: 'small' | 'medium'
  freeSolo?: boolean
  limitTags?: number
  chipVariant?: 'filled' | 'outlined'
  chipColor?: ChipProps['color']
  disableClearable?: boolean
  loading?: boolean
  onInputChange?: (value: string) => void
  filterSelectedOptions?: boolean
  autoHighlight?: boolean
  autoSelect?: boolean
}

export const AutoCompleteMultiple: React.FC<AutoCompleteMultipleProps> = ({
  value = [],
  onChange,
  options = [],
  label,
  placeholder = 'Type to search...',
  helperText,
  error = false,
  fullWidth = true,
  disabled = false,
  size = 'medium',
  freeSolo = true,
  limitTags = 7,
  chipVariant = 'outlined',
  chipColor = 'default',
  disableClearable = false,
  loading = false,
  onInputChange,
  filterSelectedOptions = true,
  autoHighlight = false,
  autoSelect = false,
}) => {
  return (
    <Autocomplete
      multiple
      freeSolo={freeSolo}
      options={options}
      value={value}
      onChange={(_, newValue) => {
        onChange(newValue)
      }}
      onInputChange={(_, newInputValue) => {
        onInputChange?.(newInputValue)
      }}
      renderInput={(params) => {
        const { InputLabelProps, ...rest } = params
        return (
          <TextField
            {...rest}
            label={label}
            placeholder={placeholder}
            helperText={helperText}
            error={error}
            size={size}
            fullWidth={fullWidth}
            disabled={disabled}
            slotProps={{
              inputLabel: {
                className: InputLabelProps?.className ?? '',
              },
            }}
          />
        )
      }}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      loading={loading}
      limitTags={limitTags ?? 5}
      disableClearable={disableClearable}
      filterSelectedOptions={filterSelectedOptions}
      autoHighlight={autoHighlight}
      autoSelect={autoSelect}
      sx={{
        '& .MuiOutlinedInput-root': {
          p: size === 'small' ? 0.5 : 1,
          gap: 0.5,
        },
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 0.5,
          },
        },
      }}
      renderValue={(selected) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {selected.map((option, index) => (
            <Chip
              key={option}
              label={option}
              variant={chipVariant}
              color={chipColor}
              size={size === 'small' ? 'small' : 'medium'}
              deleteIcon={<ClearIcon />}
              disabled={disabled}
              onDelete={() => {
                const newValue = [...value]
                newValue.splice(index, 1)
                onChange(newValue)
              }}
            />
          ))}
        </div>
      )}
    />
  )
}
