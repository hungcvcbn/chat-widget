import React from 'react'
import NumberFormat from 'react-number-format'
import { Theme } from '@mui/material'
import InputBase from '@mui/material/InputBase'
import { withStyles, createStyles } from '@mui/styles'
import { RED } from '../assets/colors'

export const redMark = <span style={{ color: RED }}>*</span>

export const BootstrapInput = withStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: 40,
      padding: 0,
      border: '1px solid #ced4da',
      borderRadius: 4,
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      overflow: 'hidden',
    },
    input: {
      borderRadius: 4,
      position: 'relative',
      fontSize: theme.typography.body2.fontSize,
      padding: '8px',
    },
    focused: {
      borderColor: theme.palette.primary.main,
    },
    error: {
      borderColor: theme.palette.error.main,
    },
    disabled: {
      backgroundColor: 'inherit',
      color: 'black',
    },
  }),
)(InputBase)

export interface NumberFormatCustomProps {
  inputRef: () => void
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

export function NumberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        })
      }}
      thousandSeparator="."
      decimalSeparator=","
    />
  )
}
export function NumberFormatCustom2(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        })
      }}
    />
  )
}
