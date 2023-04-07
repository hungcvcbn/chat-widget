import React from 'react'
import { PropTypes } from '@mui/material'
import Button, { ButtonProps } from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

interface Props extends ButtonProps {
  loading?: boolean
  loadingColor?: PropTypes.Color
}

const LoadingButton: React.FC<Props> = (props) => {
  const {
    children,
    loading,
    loadingColor,
    onClick,
    disableRipple,
    ...rest
  } = props

  return (
    <Button
      {...rest}
      disabled={rest.disabled || loading}
      onClick={!loading ? onClick : undefined}
      disableRipple={loading ? true : disableRipple}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ opacity: loading ? 0.5 : 1 }}>{children}</div>
        {loading && (
          <CircularProgress
            size={24}
            color={loadingColor ? 'primary' : rest.color}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </div>
    </Button>
  )
}
export default LoadingButton
