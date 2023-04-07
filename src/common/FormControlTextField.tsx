import React from 'react'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import { InputBaseProps } from '@mui/material/InputBase'
import InputLabel from '@mui/material/InputLabel'
import { createTheme, useTheme, ThemeProvider } from '@mui/material/styles'
import { createStyles, makeStyles } from '@mui/styles'
import { RED } from '../assets/colors'
import { BootstrapInput, redMark } from './Form'
import theme from '../assets/theme/theme'

export interface FormControlTextFieldProps extends InputBaseProps {
  id?: string
  label?: React.ReactNode
  formControlStyle?: React.CSSProperties
  errorMessage?: string
  optional?: boolean
  focused?: boolean
  helpText?: string
  className?: string
  disableError?: boolean
}

const useStyles = makeStyles(() =>
  createStyles({
    margin: {
      marginRight: useTheme().spacing(3.75),
    },
  }),
)


const FormControlTextField: React.FC<FormControlTextFieldProps | any> = (
  props,
) => {
  const classes = useStyles()
  const {
    id,
    label,
    formControlStyle,
    errorMessage,
    optional,
    focused,
    value,
    fullWidth,
    helpText,
    className,
    disableError,
    ...rest
  } = props

  return (
    <ThemeProvider theme={theme}>
      <FormControl
        className={classes.margin}
        style={{ minWidth: 200, ...formControlStyle }}
        fullWidth
      >
        {label && (
          <InputLabel shrink htmlFor={id}>
            {label}
            {!optional && (
              <>
                &nbsp;
                {redMark}
              </>
            )}
          </InputLabel>
        )}
        <BootstrapInput
          className={className}
          id={id}
          value={value || ''}
          {...rest}
          error={focused ? false : !!errorMessage}
        />
        <FormHelperText
          id={id}
          style={{
            minHeight: 20,
            fontSize: helpText ? 12 : 13,
            color: errorMessage ? RED : undefined,
          }}
        >
          {!disableError && (errorMessage || helpText)}
        </FormHelperText>
      </FormControl>
    </ThemeProvider>
  )
}

export default React.memo(FormControlTextField)
